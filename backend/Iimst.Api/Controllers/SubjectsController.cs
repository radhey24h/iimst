using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Helpers;
using Iimst.Api.Models;
using Iimst.Api.Services;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubjectsController : ControllerBase
{
    private readonly MongoDbService _db;
    private readonly ISubjectService _subjectService;

    public SubjectsController(MongoDbService db, ISubjectService subjectService)
    {
        _db = db;
        _subjectService = subjectService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<SubjectDto>>> GetAll([FromQuery] int? semester, [FromQuery] string? courseId, [FromQuery] string? branchId)
    {
        var builder = Builders<Subject>.Filter;
        var filter = builder.Empty;
        if (semester.HasValue) filter &= builder.Eq(s => s.Semester, semester.Value);
        if (!string.IsNullOrWhiteSpace(courseId)) filter &= builder.Eq(s => s.CourseId, courseId);
        if (!string.IsNullOrWhiteSpace(branchId)) filter &= builder.Eq(s => s.BranchId, branchId);
        var list = await _db.Subjects.Find(filter).SortBy(s => s.Semester).ThenBy(s => s.Code).ThenBy(s => s.Name).ToListAsync();
        var courseIds = list.Select(s => s.CourseId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
        var branchIds = list.Select(s => s.BranchId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
        var courses = courseIds.Count > 0 ? await _db.Courses.Find(c => courseIds.Contains(c.Id)).ToListAsync() : new List<Course>();
        var branches = branchIds.Count > 0 ? await _db.Branches.Find(b => branchIds.Contains(b.Id)).ToListAsync() : new List<Branch>();
        var courseMap = courses.ToDictionary(c => c.Id);
        var branchMap = branches.ToDictionary(b => b.Id);
        return Ok(list.Select(s => new SubjectDto
        {
            Id = s.Id,
            CourseId = s.CourseId ?? "",
            CourseName = courseMap.GetValueOrDefault(s.CourseId ?? "")?.Name,
            BranchId = s.BranchId ?? "",
            BranchName = branchMap.GetValueOrDefault(s.BranchId ?? "")?.Name,
            Code = s.Code,
            Name = s.Name,
            Semester = s.Semester,
            MinPassMarks = s.MinPassMarks,
            MaxMarks = s.MaxMarks,
            ExamLink = s.ExamLink,
            IsActive = s.IsActive
        }).ToList());
    }

    [HttpGet("by-course-branch-semester")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<SubjectForResultDto>>> GetByCourseBranchSemester([FromQuery] string courseId, [FromQuery] string branchId, [FromQuery] int semester)
    {
        if (string.IsNullOrWhiteSpace(courseId) || string.IsNullOrWhiteSpace(branchId))
            return BadRequest("courseId and branchId are required");
        var list = await _subjectService.GetByCourseBranchSemesterAsync(courseId, branchId, semester);
        return Ok(list);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<SubjectDto>> GetById(string id)
    {
        var s = await _db.Subjects.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (s == null) return NotFound();
        Course? course = null;
        Branch? branch = null;
        if (!string.IsNullOrEmpty(s.CourseId))
            course = await _db.Courses.Find(c => c.Id == s.CourseId).FirstOrDefaultAsync();
        if (!string.IsNullOrEmpty(s.BranchId))
            branch = await _db.Branches.Find(b => b.Id == s.BranchId).FirstOrDefaultAsync();
        return Ok(new SubjectDto
        {
            Id = s.Id,
            CourseId = s.CourseId ?? "",
            CourseName = course?.Name,
            BranchId = s.BranchId ?? "",
            BranchName = branch?.Name,
            Code = s.Code,
            Name = s.Name,
            Semester = s.Semester,
            MinPassMarks = s.MinPassMarks,
            MaxMarks = s.MaxMarks,
            ExamLink = s.ExamLink,
            IsActive = s.IsActive
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubjectDto>> Create([FromBody] SubjectCreateDto dto)
    {
        var courseId = dto.CourseId?.Trim() ?? "";
        var branchId = dto.BranchId?.Trim() ?? "";
        var code = dto.Code?.Trim() ?? "";
        var existing = await _db.Subjects.Find(x =>
            x.CourseId == courseId && x.BranchId == branchId && x.Semester == dto.Semester && x.Code == code).FirstOrDefaultAsync();
        if (existing != null) return BadRequest("A subject with this code already exists for this course, branch and semester.");

        var s = new Subject
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            CourseId = courseId,
            BranchId = branchId,
            Code = code,
            Name = dto.Name.Trim(),
            Semester = dto.Semester,
            MinPassMarks = dto.MinPassMarks,
            MaxMarks = dto.MaxMarks > 0 ? dto.MaxMarks : 100,
            ExamLink = dto.ExamLink?.Trim().NullIfEmpty(),
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };
        await _db.Subjects.InsertOneAsync(s);
        Course? course = null;
        Branch? branch = null;
        if (!string.IsNullOrEmpty(s.CourseId))
            course = await _db.Courses.Find(c => c.Id == s.CourseId).FirstOrDefaultAsync();
        if (!string.IsNullOrEmpty(s.BranchId))
            branch = await _db.Branches.Find(b => b.Id == s.BranchId).FirstOrDefaultAsync();
        return CreatedAtAction(nameof(GetById), new { id = s.Id }, new SubjectDto
        {
            Id = s.Id,
            CourseId = s.CourseId ?? "",
            CourseName = course?.Name,
            BranchId = s.BranchId ?? "",
            BranchName = branch?.Name,
            Code = s.Code,
            Name = s.Name,
            Semester = s.Semester,
            MinPassMarks = s.MinPassMarks,
            MaxMarks = s.MaxMarks,
            ExamLink = s.ExamLink,
            IsActive = s.IsActive
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubjectDto>> Update(string id, [FromBody] SubjectCreateDto dto)
    {
        var s = await _db.Subjects.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (s == null) return NotFound();
        var courseId = dto.CourseId?.Trim() ?? "";
        var branchId = dto.BranchId?.Trim() ?? "";
        var code = dto.Code?.Trim() ?? "";
        var existing = await _db.Subjects.Find(x =>
            x.CourseId == courseId && x.BranchId == branchId && x.Semester == dto.Semester && x.Code == code && x.Id != id).FirstOrDefaultAsync();
        if (existing != null) return BadRequest("A subject with this code already exists for this course, branch and semester.");
        s.CourseId = courseId;
        s.BranchId = branchId;
        s.Code = code;
        s.Name = dto.Name.Trim();
        s.Semester = dto.Semester;
        s.MinPassMarks = dto.MinPassMarks;
        s.MaxMarks = dto.MaxMarks > 0 ? dto.MaxMarks : 100;
        s.ExamLink = dto.ExamLink?.Trim().NullIfEmpty();
        s.IsActive = dto.IsActive;
        await _db.Subjects.ReplaceOneAsync(x => x.Id == id, s);
        Course? course = null;
        Branch? branch = null;
        if (!string.IsNullOrEmpty(s.CourseId))
            course = await _db.Courses.Find(c => c.Id == s.CourseId).FirstOrDefaultAsync();
        if (!string.IsNullOrEmpty(s.BranchId))
            branch = await _db.Branches.Find(b => b.Id == s.BranchId).FirstOrDefaultAsync();
        return Ok(new SubjectDto
        {
            Id = s.Id,
            CourseId = s.CourseId ?? "",
            CourseName = course?.Name,
            BranchId = s.BranchId ?? "",
            BranchName = branch?.Name,
            Code = s.Code,
            Name = s.Name,
            Semester = s.Semester,
            MinPassMarks = s.MinPassMarks,
            MaxMarks = s.MaxMarks,
            ExamLink = s.ExamLink,
            IsActive = s.IsActive
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _db.Subjects.DeleteOneAsync(x => x.Id == id);
        if (result.DeletedCount == 0) return NotFound();
        return NoContent();
    }
}

public class SubjectDto
{
    public string Id { get; set; } = "";
    public string CourseId { get; set; } = "";
    public string? CourseName { get; set; }
    public string BranchId { get; set; } = "";
    public string? BranchName { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public int Semester { get; set; }
    public decimal MinPassMarks { get; set; }
    public decimal MaxMarks { get; set; }
    public string? ExamLink { get; set; }
    public bool IsActive { get; set; }
}

public class SubjectCreateDto
{
    public string CourseId { get; set; } = "";
    public string BranchId { get; set; } = "";
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public int Semester { get; set; }
    public decimal MinPassMarks { get; set; } = 40;
    public decimal MaxMarks { get; set; } = 100;
    public string? ExamLink { get; set; }
    public bool IsActive { get; set; } = true;
}
