using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Helpers;
using Iimst.Api.Models;

namespace Iimst.Api.Services;

public class SubjectService : ISubjectService
{
    private readonly MongoDbService _db;

    public SubjectService(MongoDbService db) => _db = db;

    public async Task<List<SubjectForResultDto>> GetByCourseBranchSemesterAsync(string courseId, string branchId, int semester)
    {
        var filter = Builders<Subject>.Filter.And(
            Builders<Subject>.Filter.Eq(s => s.CourseId, courseId),
            Builders<Subject>.Filter.Eq(s => s.BranchId, branchId),
            Builders<Subject>.Filter.Eq(s => s.Semester, semester),
            Builders<Subject>.Filter.Eq(s => s.IsActive, true));
        var list = await _db.Subjects.Find(filter).SortBy(s => s.Code).ToListAsync();
        return list.Select(s => new SubjectForResultDto
        {
            SubjectId = s.Id,
            Code = s.Code,
            Name = s.Name,
            Semester = s.Semester,
            SemesterRoman = RomanHelper.ToRoman(s.Semester),
            MaxMarks = s.MaxMarks,
            MinPassMarks = s.MinPassMarks
        }).ToList();
    }
}
