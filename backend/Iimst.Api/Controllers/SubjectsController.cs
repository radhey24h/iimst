using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Helpers;
using Iimst.Api.Services;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubjectsController : ControllerBase
{
    private readonly MongoDbService _db;

    public SubjectsController(MongoDbService db) => _db = db;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<SubjectDto>>> GetAll([FromQuery] int? semester, [FromQuery] string? courseId, [FromQuery] string? program)
    {
        var builder = Builders<Subject>.Filter;
        var filter = builder.Empty;
        if (semester.HasValue) filter &= builder.Eq(s => s.Semester, semester.Value);
        if (!string.IsNullOrWhiteSpace(courseId)) filter &= builder.Eq(s => s.CourseId, courseId);
        if (!string.IsNullOrWhiteSpace(program)) filter &= builder.Eq(s => s.Program, program);
        var list = await _db.Subjects.Find(filter).SortBy(s => s.Semester).ThenBy(s => s.Code).ThenBy(s => s.Name).ToListAsync();
        var courseIds = list.Select(s => s.CourseId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
        var courses = courseIds.Count > 0 ? await _db.Courses.Find(c => courseIds.Contains(c.Id)).ToListAsync() : new List<Course>();
        var courseMap = courses.ToDictionary(c => c.Id);
        return Ok(list.Select(s => new SubjectDto
        {
            Id = s.Id,
            CourseId = s.CourseId ?? "",
            CourseName = courseMap.GetValueOrDefault(s.CourseId ?? "")?.Name,
            Code = s.Code,
            Name = s.Name,
            Semester = s.Semester,
            Program = s.Program,
            MinPassMarks = s.MinPassMarks,
            MaxMarks = s.MaxMarks,
            ExamLink = s.ExamLink,
            Credits = s.Credits
        }).ToList());
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<SubjectDto>> GetById(string id)
    {
        var s = await _db.Subjects.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (s == null) return NotFound();
        Course? course = null;
        if (!string.IsNullOrEmpty(s.CourseId))
            course = await _db.Courses.Find(c => c.Id == s.CourseId).FirstOrDefaultAsync();
        return Ok(new SubjectDto
        {
            Id = s.Id,
            CourseId = s.CourseId ?? "",
            CourseName = course?.Name,
            Code = s.Code,
            Name = s.Name,
            Semester = s.Semester,
            Program = s.Program,
            MinPassMarks = s.MinPassMarks,
            MaxMarks = s.MaxMarks,
            ExamLink = s.ExamLink,
            Credits = s.Credits
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubjectDto>> Create([FromBody] SubjectCreateDto dto)
    {
        var s = new Subject
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            CourseId = dto.CourseId?.Trim() ?? "",
            Code = dto.Code?.Trim() ?? "",
            Name = dto.Name.Trim(),
            Semester = dto.Semester,
            Program = dto.Program?.Trim().NullIfEmpty(),
            MinPassMarks = dto.MinPassMarks,
            MaxMarks = dto.MaxMarks > 0 ? dto.MaxMarks : 100,
            ExamLink = dto.ExamLink?.Trim().NullIfEmpty(),
            Credits = dto.Credits,
            CreatedAt = DateTime.UtcNow
        };
        await _db.Subjects.InsertOneAsync(s);
        Course? course = null;
        if (!string.IsNullOrEmpty(s.CourseId))
            course = await _db.Courses.Find(c => c.Id == s.CourseId).FirstOrDefaultAsync();
        return CreatedAtAction(nameof(GetById), new { id = s.Id }, new SubjectDto
        {
            Id = s.Id,
            CourseId = s.CourseId ?? "",
            CourseName = course?.Name,
            Code = s.Code,
            Name = s.Name,
            Semester = s.Semester,
            Program = s.Program,
            MinPassMarks = s.MinPassMarks,
            MaxMarks = s.MaxMarks,
            ExamLink = s.ExamLink,
            Credits = s.Credits
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubjectDto>> Update(string id, [FromBody] SubjectCreateDto dto)
    {
        var s = await _db.Subjects.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (s == null) return NotFound();
        s.CourseId = dto.CourseId?.Trim() ?? "";
        s.Code = dto.Code?.Trim() ?? "";
        s.Name = dto.Name.Trim();
        s.Semester = dto.Semester;
        s.Program = dto.Program?.Trim().NullIfEmpty();
        s.MinPassMarks = dto.MinPassMarks;
        s.MaxMarks = dto.MaxMarks > 0 ? dto.MaxMarks : 100;
        s.ExamLink = dto.ExamLink?.Trim().NullIfEmpty();
        s.Credits = dto.Credits;
        await _db.Subjects.ReplaceOneAsync(x => x.Id == id, s);
        Course? course = null;
        if (!string.IsNullOrEmpty(s.CourseId))
            course = await _db.Courses.Find(c => c.Id == s.CourseId).FirstOrDefaultAsync();
        return Ok(new SubjectDto
        {
            Id = s.Id,
            CourseId = s.CourseId ?? "",
            CourseName = course?.Name,
            Code = s.Code,
            Name = s.Name,
            Semester = s.Semester,
            Program = s.Program,
            MinPassMarks = s.MinPassMarks,
            MaxMarks = s.MaxMarks,
            ExamLink = s.ExamLink,
            Credits = s.Credits
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
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public int? Semester { get; set; }
    public string? Program { get; set; }
    public decimal MinPassMarks { get; set; }
    public decimal MaxMarks { get; set; }
    public string? ExamLink { get; set; }
    public int Credits { get; set; }
}

public class SubjectCreateDto
{
    public string CourseId { get; set; } = "";
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public int? Semester { get; set; }
    public string? Program { get; set; }
    public decimal MinPassMarks { get; set; } = 40;
    public decimal MaxMarks { get; set; } = 100;
    public string? ExamLink { get; set; }
    public int Credits { get; set; } = 4;
}
