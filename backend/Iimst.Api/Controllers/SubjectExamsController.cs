using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Services;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubjectExamsController : ControllerBase
{
    private readonly MongoDbService _db;

    public SubjectExamsController(MongoDbService db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<SubjectExamDto>>> GetAll([FromQuery] string? subjectId, [FromQuery] bool? activeOnly)
    {
        var builder = Builders<SubjectExam>.Filter;
        var filter = builder.Empty;
        if (!string.IsNullOrEmpty(subjectId)) filter &= builder.Eq(e => e.SubjectId, subjectId);
        if (activeOnly == true) filter &= builder.Eq(e => e.IsActive, true);
        var list = await _db.SubjectExams.Find(filter).ToListAsync();
        var subjectIds = list.Select(e => e.SubjectId).Distinct().ToList();
        var subjects = await _db.Subjects.Find(s => subjectIds.Contains(s.Id)).ToListAsync();
        var subjectMap = subjects.ToDictionary(s => s.Id);
        var dtos = list.Select(e => ToDto(e, subjectMap.GetValueOrDefault(e.SubjectId))).ToList();
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SubjectExamDto>> GetById(string id)
    {
        var e = await _db.SubjectExams.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (e == null) return NotFound();
        var subject = await _db.Subjects.Find(s => s.Id == e.SubjectId).FirstOrDefaultAsync();
        return Ok(ToDto(e, subject));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubjectExamDto>> Create([FromBody] SubjectExamCreateDto dto)
    {
        var subject = await _db.Subjects.Find(s => s.Id == dto.SubjectId).FirstOrDefaultAsync();
        if (subject == null) return BadRequest("Subject not found");
        var e = new SubjectExam
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            SubjectId = dto.SubjectId,
            ExamLink = dto.ExamLink,
            MinPassingMarks = dto.MinPassingMarks,
            MaxMarks = dto.MaxMarks,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };
        await _db.SubjectExams.InsertOneAsync(e);
        return CreatedAtAction(nameof(GetById), new { id = e.Id }, ToDto(e, subject));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubjectExamDto>> Update(string id, [FromBody] SubjectExamCreateDto dto)
    {
        var e = await _db.SubjectExams.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (e == null) return NotFound();
        e.ExamLink = dto.ExamLink;
        e.MinPassingMarks = dto.MinPassingMarks;
        e.MaxMarks = dto.MaxMarks;
        e.IsActive = dto.IsActive;
        await _db.SubjectExams.ReplaceOneAsync(x => x.Id == id, e);
        var subject = await _db.Subjects.Find(s => s.Id == e.SubjectId).FirstOrDefaultAsync();
        return Ok(ToDto(e, subject));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _db.SubjectExams.DeleteOneAsync(x => x.Id == id);
        if (result.DeletedCount == 0) return NotFound();
        return NoContent();
    }

    static SubjectExamDto ToDto(SubjectExam e, Subject? subject) => new SubjectExamDto
    {
        Id = e.Id,
        SubjectId = e.SubjectId,
        SubjectCode = subject?.Code,
        SubjectName = subject?.Name,
        ExamLink = e.ExamLink ?? "",
        MinPassingMarks = e.MinPassingMarks,
        MaxMarks = e.MaxMarks,
        IsActive = e.IsActive
    };
}

public class SubjectExamDto
{
    public string Id { get; set; } = "";
    public string SubjectId { get; set; } = "";
    public string? SubjectCode { get; set; }
    public string? SubjectName { get; set; }
    public string ExamLink { get; set; } = "";
    public decimal MinPassingMarks { get; set; }
    public decimal MaxMarks { get; set; }
    public bool IsActive { get; set; }
}

public class SubjectExamCreateDto
{
    public string SubjectId { get; set; } = "";
    public string ExamLink { get; set; } = "";
    public decimal MinPassingMarks { get; set; }
    public decimal MaxMarks { get; set; }
    public bool IsActive { get; set; } = true;
}
