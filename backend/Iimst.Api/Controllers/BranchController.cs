using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Services;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/branches")]
[Authorize(Roles = "Admin")]
public class BranchController : ControllerBase
{
    private readonly MongoDbService _db;

    public BranchController(MongoDbService db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<BranchDto>>> GetAll([FromQuery] string? courseId)
    {
        var filter = Builders<Branch>.Filter.Empty;
        if (!string.IsNullOrWhiteSpace(courseId))
            filter = Builders<Branch>.Filter.Eq(b => b.CourseId, courseId);
        var list = await _db.Branches.Find(filter).SortBy(b => b.Name).ToListAsync();
        var courseIds = list.Select(b => b.CourseId).Distinct().ToList();
        var courses = courseIds.Count > 0 ? await _db.Courses.Find(c => courseIds.Contains(c.Id)).ToListAsync() : new List<Course>();
        var courseMap = courses.ToDictionary(c => c.Id);
        return Ok(list.Select(b => new BranchDto
        {
            Id = b.Id,
            CourseId = b.CourseId,
            CourseName = courseMap.GetValueOrDefault(b.CourseId)?.Name,
            Name = b.Name,
            Code = b.Code,
            CreatedAt = b.CreatedAt
        }).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BranchDto>> GetById(string id)
    {
        var b = await _db.Branches.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (b == null) return NotFound();
        Course? course = null;
        if (!string.IsNullOrEmpty(b.CourseId))
            course = await _db.Courses.Find(c => c.Id == b.CourseId).FirstOrDefaultAsync();
        return Ok(new BranchDto
        {
            Id = b.Id,
            CourseId = b.CourseId,
            CourseName = course?.Name,
            Name = b.Name,
            Code = b.Code,
            CreatedAt = b.CreatedAt
        });
    }

    [HttpPost]
    public async Task<ActionResult<BranchDto>> Create([FromBody] BranchCreateDto dto)
    {
        var courseId = dto.CourseId?.Trim() ?? "";
        var code = dto.Code?.Trim() ?? "";
        var name = dto.Name?.Trim() ?? "";
        if (string.IsNullOrEmpty(courseId)) return BadRequest("Course is required.");
        if (string.IsNullOrEmpty(name)) return BadRequest("Branch name is required.");
        if (string.IsNullOrEmpty(code)) return BadRequest("Branch code is required.");
        var existing = await _db.Branches.Find(x => x.CourseId == courseId && (x.Code == code || x.Name == name)).FirstOrDefaultAsync();
        if (existing != null)
            return BadRequest(existing.Code == code ? "A branch with this code already exists for this course." : "A branch with this name already exists for this course.");

        var b = new Branch
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            CourseId = courseId,
            Name = name,
            Code = code,
            CreatedAt = DateTime.UtcNow
        };
        await _db.Branches.InsertOneAsync(b);
        Course? course = null;
        if (!string.IsNullOrEmpty(b.CourseId))
            course = await _db.Courses.Find(c => c.Id == b.CourseId).FirstOrDefaultAsync();
        return CreatedAtAction(nameof(GetById), new { id = b.Id }, new BranchDto
        {
            Id = b.Id,
            CourseId = b.CourseId,
            CourseName = course?.Name,
            Name = b.Name,
            Code = b.Code,
            CreatedAt = b.CreatedAt
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BranchDto>> Update(string id, [FromBody] BranchCreateDto dto)
    {
        var b = await _db.Branches.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (b == null) return NotFound();
        var courseId = dto.CourseId?.Trim() ?? "";
        var code = dto.Code?.Trim() ?? "";
        var name = dto.Name.Trim();
        var existingCode = await _db.Branches.Find(x => x.CourseId == courseId && x.Code == code && x.Id != id).FirstOrDefaultAsync();
        if (existingCode != null) return BadRequest("A branch with this code already exists for this course.");
        var existingName = await _db.Branches.Find(x => x.CourseId == courseId && x.Name == name && x.Id != id).FirstOrDefaultAsync();
        if (existingName != null) return BadRequest("A branch with this name already exists for this course.");
        b.CourseId = courseId;
        b.Name = name;
        b.Code = code;
        await _db.Branches.ReplaceOneAsync(x => x.Id == id, b);
        Course? course = null;
        if (!string.IsNullOrEmpty(b.CourseId))
            course = await _db.Courses.Find(c => c.Id == b.CourseId).FirstOrDefaultAsync();
        return Ok(new BranchDto
        {
            Id = b.Id,
            CourseId = b.CourseId,
            CourseName = course?.Name,
            Name = b.Name,
            Code = b.Code,
            CreatedAt = b.CreatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _db.Branches.DeleteOneAsync(x => x.Id == id);
        if (result.DeletedCount == 0) return NotFound();
        return NoContent();
    }
}

public class BranchDto
{
    public string Id { get; set; } = "";
    public string CourseId { get; set; } = "";
    public string? CourseName { get; set; }
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class BranchCreateDto
{
    public string CourseId { get; set; } = "";
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
}
