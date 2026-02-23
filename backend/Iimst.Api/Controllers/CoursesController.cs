using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Services;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly MongoDbService _db;

    public CoursesController(MongoDbService db) => _db = db;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<List<CourseDto>>> GetAll()
    {
        var list = await _db.Courses.Find(FilterDefinition<Course>.Empty).SortBy(c => c.Name).ToListAsync();
        return Ok(list.Select(ToCourseDto).ToList());
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<CourseDto>> GetById(string id)
    {
        var c = await _db.Courses.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (c == null) return NotFound();
        return Ok(ToCourseDto(c));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CourseDto>> Create([FromBody] CourseCreateDto dto)
    {
        var name = dto.Name.Trim();
        var code = dto.Code?.Trim() ?? "";
        var existingByCode = !string.IsNullOrEmpty(code) && await _db.Courses.Find(c => c.Code == code).AnyAsync();
        if (existingByCode) return BadRequest("A course with this code already exists.");
        var existingByName = await _db.Courses.Find(c => c.Name == name).AnyAsync();
        if (existingByName) return BadRequest("A course with this name already exists.");

        var c = new Course
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            Name = name,
            Code = code,
            MaxSemester = dto.MaxSemester is >= 1 and <= 20 ? dto.MaxSemester : 8,
            DurationYears = dto.DurationYears is >= 1 and <= 10 ? dto.DurationYears : 3,
            CreatedAt = DateTime.UtcNow
        };
        await _db.Courses.InsertOneAsync(c);
        return CreatedAtAction(nameof(GetById), new { id = c.Id }, ToCourseDto(c));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CourseDto>> Update(string id, [FromBody] CourseCreateDto dto)
    {
        var c = await _db.Courses.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (c == null) return NotFound();
        var name = dto.Name.Trim();
        var code = dto.Code?.Trim() ?? "";
        var existingByCode = !string.IsNullOrEmpty(code) && await _db.Courses.Find(x => x.Code == code && x.Id != id).AnyAsync();
        if (existingByCode) return BadRequest("A course with this code already exists.");
        var existingByName = await _db.Courses.Find(x => x.Name == name && x.Id != id).AnyAsync();
        if (existingByName) return BadRequest("A course with this name already exists.");
        c.Name = name;
        c.Code = code;
        c.MaxSemester = dto.MaxSemester is >= 1 and <= 20 ? dto.MaxSemester : 8;
        c.DurationYears = dto.DurationYears is >= 1 and <= 10 ? dto.DurationYears : 3;
        await _db.Courses.ReplaceOneAsync(x => x.Id == id, c);
        return Ok(ToCourseDto(c));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _db.Courses.DeleteOneAsync(x => x.Id == id);
        if (result.DeletedCount == 0) return NotFound();
        return NoContent();
    }
    static CourseDto ToCourseDto(Course c) => new CourseDto
    {
        Id = c.Id,
        Name = c.Name,
        Code = c.Code,
        MaxSemester = c.MaxSemester,
        DurationYears = c.DurationYears
    };
}

public class CourseDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
    public int MaxSemester { get; set; }
    public int DurationYears { get; set; }
}

public class CourseCreateDto
{
    public string Name { get; set; } = "";
    public string? Code { get; set; }
    public int MaxSemester { get; set; } = 8;
    public int DurationYears { get; set; } = 3;
}
