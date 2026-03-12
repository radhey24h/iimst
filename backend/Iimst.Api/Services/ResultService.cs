using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Helpers;
using Iimst.Api.Models;

namespace Iimst.Api.Services;

public class ResultService : IResultService
{
    private readonly MongoDbService _db;

    public ResultService(MongoDbService db) => _db = db;

    public async Task<List<ResultDto>> BulkInsertResultsAsync(string studentId, int semester, int year, List<(string SubjectId, decimal MarksObtained)> marksList)
    {
        var student = await _db.Students.Find(s => s.Id == studentId).FirstOrDefaultAsync();
        if (student == null) throw new InvalidOperationException("Student not found");

        var courseId = student.CourseId ?? "";
        var branchId = student.BranchId ?? "";
        if (string.IsNullOrEmpty(courseId) || string.IsNullOrEmpty(branchId))
            throw new InvalidOperationException("Student must have Course and Branch assigned");

        var subjectIds = marksList.Select(m => m.SubjectId).Distinct().ToList();
        var subjects = await _db.Subjects.Find(s => subjectIds.Contains(s.Id)).ToListAsync();
        var subjectMap = subjects.ToDictionary(s => s.Id);

        var existingFilter = Builders<Result>.Filter.And(
            Builders<Result>.Filter.Eq(r => r.StudentId, studentId),
            Builders<Result>.Filter.Eq(r => r.Semester, semester));
        var existingCount = await _db.Results.CountDocumentsAsync(existingFilter);
        if (existingCount > 0)
            await _db.Results.DeleteManyAsync(existingFilter);

        var results = new List<Result>();
        var resultDtos = new List<ResultDto>();

        foreach (var (subjId, marksObtained) in marksList)
        {
            if (!subjectMap.TryGetValue(subjId, out var subject))
                throw new InvalidOperationException($"Subject {subjId} not found");
            if (subject.CourseId != courseId || subject.BranchId != branchId)
                throw new InvalidOperationException($"Subject {subject.Code} does not belong to student's course/branch");

            var minPass = subject.MinPassMarks;
            var maxMarks = subject.MaxMarks;
            if (marksObtained > maxMarks)
                throw new InvalidOperationException($"Marks for {subject.Name} cannot exceed {maxMarks}");

            var grade = GetGrade(marksObtained, maxMarks, minPass);
            var isPassed = marksObtained >= minPass;

            var r = new Result
            {
                Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
                StudentId = studentId,
                SubjectId = subjId,
                Semester = semester,
                Year = year,
                MarksObtained = marksObtained,
                Grade = grade,
                IsPassed = isPassed,
                CreatedAt = DateTime.UtcNow
            };
            results.Add(r);
            resultDtos.Add(new ResultDto
            {
                SubjectName = subject.Name,
                Semester = semester,
                SemesterRoman = RomanHelper.ToRoman(semester),
                Year = year,
                MarksObtained = marksObtained,
                Grade = grade,
                IsPassed = isPassed
            });
        }

        if (results.Count > 0)
            await _db.Results.InsertManyAsync(results);

        return resultDtos;
    }

    static string GetGrade(decimal marks, decimal maxMarks, decimal minPass)
    {
        if (maxMarks <= 0) return "F";
        var pct = (double)(marks / maxMarks * 100);
        if (pct >= 75) return "A";
        if (pct >= 60) return "B";
        if (pct >= 50) return "C";
        if (marks >= minPass) return "D";
        return "F";
    }
}
