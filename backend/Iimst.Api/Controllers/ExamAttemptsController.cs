using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Services;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExamAttemptsController : ControllerBase
{
    private readonly MongoDbService _db;

    public ExamAttemptsController(MongoDbService db) => _db = db;

    [HttpGet("student/{studentId}")]
    [Authorize]
    public async Task<ActionResult<List<ExamAttemptDto>>> GetByStudent(string studentId)
    {
        var student = await _db.Students.Find(s => s.Id == studentId).FirstOrDefaultAsync();
        if (student == null) return NotFound();
        if (User.IsInRole("Student"))
        {
            var uid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (student.UserId != uid) return Forbid();
        }
        var list = await _db.ExamAttempts.Find(a => a.StudentId == studentId).SortByDescending(a => a.AttemptedAt).ToListAsync();
        var examIds = list.Select(a => a.SubjectExamId).Distinct().ToList();
        var exams = await _db.SubjectExams.Find(e => examIds.Contains(e.Id)).ToListAsync();
        var subjectIds = exams.Select(e => e.SubjectId).Distinct().ToList();
        var subjects = await _db.Subjects.Find(s => subjectIds.Contains(s.Id)).ToListAsync();
        var subjectMap = subjects.ToDictionary(s => s.Id);
        var dtos = list.Select(a =>
        {
            var exam = exams.FirstOrDefault(e => e.Id == a.SubjectExamId);
            var sub = exam != null ? subjectMap.GetValueOrDefault(exam.SubjectId) : null;
            return new ExamAttemptDto
            {
                Id = a.Id,
                StudentId = a.StudentId,
                SubjectExamId = a.SubjectExamId,
                SubjectName = sub?.Name,
                SubjectCode = sub?.Code,
                MarksObtained = a.MarksObtained,
                MinPassingMarks = exam?.MinPassingMarks ?? 0,
                MaxMarks = exam?.MaxMarks ?? 0,
                IsPassed = a.IsPassed,
                AttemptedAt = a.AttemptedAt
            };
        }).ToList();
        return Ok(dtos);
    }

    [HttpPost("submit")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<ExamAttemptDto>> Submit([FromBody] ExamSubmitDto dto)
    {
        var uid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(uid)) return Unauthorized();
        var student = await _db.Students.Find(s => s.UserId == uid).FirstOrDefaultAsync();
        if (student == null) return BadRequest("Student profile not found");
        var exam = await _db.SubjectExams.Find(e => e.Id == dto.SubjectExamId).FirstOrDefaultAsync();
        if (exam == null) return BadRequest("Exam not found");
        if (!exam.IsActive) return BadRequest("Exam is not active");
        var subject = await _db.Subjects.Find(s => s.Id == exam.SubjectId).FirstOrDefaultAsync();
        var isPassed = dto.MarksObtained >= exam.MinPassingMarks;
        var attempt = new ExamAttempt
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            StudentId = student.Id,
            SubjectExamId = exam.Id,
            MarksObtained = dto.MarksObtained,
            IsPassed = isPassed,
            AttemptedAt = DateTime.UtcNow
        };
        await _db.ExamAttempts.InsertOneAsync(attempt);
        return Ok(new ExamAttemptDto
        {
            Id = attempt.Id,
            StudentId = attempt.StudentId,
            SubjectExamId = attempt.SubjectExamId,
            SubjectName = subject?.Name,
            SubjectCode = subject?.Code,
            MarksObtained = attempt.MarksObtained,
            MinPassingMarks = exam.MinPassingMarks,
            MaxMarks = exam.MaxMarks,
            IsPassed = attempt.IsPassed,
            AttemptedAt = attempt.AttemptedAt
        });
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<ExamAttemptDto>>> GetAll([FromQuery] string? studentId, [FromQuery] string? subjectExamId)
    {
        var builder = Builders<ExamAttempt>.Filter;
        var filter = builder.Empty;
        if (!string.IsNullOrEmpty(studentId)) filter &= builder.Eq(a => a.StudentId, studentId);
        if (!string.IsNullOrEmpty(subjectExamId)) filter &= builder.Eq(a => a.SubjectExamId, subjectExamId);
        var list = await _db.ExamAttempts.Find(filter).SortByDescending(a => a.AttemptedAt).ToListAsync();
        var examIds = list.Select(a => a.SubjectExamId).Distinct().ToList();
        var exams = await _db.SubjectExams.Find(e => examIds.Contains(e.Id)).ToListAsync();
        var subjectIds = exams.Select(e => e.SubjectId).Distinct().ToList();
        var subjects = await _db.Subjects.Find(s => subjectIds.Contains(s.Id)).ToListAsync();
        var subjectMap = subjects.ToDictionary(s => s.Id);
        var dtos = list.Select(a =>
        {
            var exam = exams.FirstOrDefault(e => e.Id == a.SubjectExamId);
            var sub = exam != null ? subjectMap.GetValueOrDefault(exam.SubjectId) : null;
            return new ExamAttemptDto
            {
                Id = a.Id,
                StudentId = a.StudentId,
                SubjectExamId = a.SubjectExamId,
                SubjectName = sub?.Name,
                SubjectCode = sub?.Code,
                MarksObtained = a.MarksObtained,
                MinPassingMarks = exam?.MinPassingMarks ?? 0,
                MaxMarks = exam?.MaxMarks ?? 0,
                IsPassed = a.IsPassed,
                AttemptedAt = a.AttemptedAt
            };
        }).ToList();
        return Ok(dtos);
    }
}

public class ExamAttemptDto
{
    public string Id { get; set; } = "";
    public string StudentId { get; set; } = "";
    public string SubjectExamId { get; set; } = "";
    public string? SubjectName { get; set; }
    public string? SubjectCode { get; set; }
    public decimal MarksObtained { get; set; }
    public decimal MinPassingMarks { get; set; }
    public decimal MaxMarks { get; set; }
    public bool IsPassed { get; set; }
    public DateTime AttemptedAt { get; set; }
}

public class ExamSubmitDto
{
    public string SubjectExamId { get; set; } = "";
    public decimal MarksObtained { get; set; }
}
