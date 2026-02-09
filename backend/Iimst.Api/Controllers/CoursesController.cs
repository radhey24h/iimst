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
        return Ok(list.Select(c => new CourseDto { Id = c.Id, Name = c.Name, MaxSemester = c.MaxSemester }).ToList());
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<CourseDto>> GetById(string id)
    {
        var c = await _db.Courses.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (c == null) return NotFound();
        return Ok(new CourseDto { Id = c.Id, Name = c.Name, MaxSemester = c.MaxSemester });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CourseDto>> Create([FromBody] CourseCreateDto dto)
    {
        var c = new Course
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            Name = dto.Name.Trim(),
            MaxSemester = dto.MaxSemester is >= 1 and <= 8 ? dto.MaxSemester : 8,
            CreatedAt = DateTime.UtcNow
        };
        await _db.Courses.InsertOneAsync(c);
        return CreatedAtAction(nameof(GetById), new { id = c.Id }, new CourseDto { Id = c.Id, Name = c.Name, MaxSemester = c.MaxSemester });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CourseDto>> Update(string id, [FromBody] CourseCreateDto dto)
    {
        var c = await _db.Courses.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (c == null) return NotFound();
        c.Name = dto.Name.Trim();
        c.MaxSemester = dto.MaxSemester is >= 1 and <= 8 ? dto.MaxSemester : 8;
        await _db.Courses.ReplaceOneAsync(x => x.Id == id, c);
        return Ok(new CourseDto { Id = c.Id, Name = c.Name, MaxSemester = c.MaxSemester });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _db.Courses.DeleteOneAsync(x => x.Id == id);
        if (result.DeletedCount == 0) return NotFound();
        return NoContent();
    }
}

public class CourseDto
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public int MaxSemester { get; set; }
}

public class CourseCreateDto
{
    public string Name { get; set; } = "";
    /// <summary>6 for Diploma, 8 for Bachelor.</summary>
    public int MaxSemester { get; set; } = 8;
}
