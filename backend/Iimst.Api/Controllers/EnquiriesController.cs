using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Services;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnquiriesController : ControllerBase
{
    private readonly MongoDbService _db;

    public EnquiriesController(MongoDbService db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<EnquiryDto>>> GetAll()
    {
        var list = await _db.Enquiries.Find(FilterDefinition<Enquiry>.Empty)
            .SortByDescending(e => e.CreatedAt)
            .ToListAsync();
        return Ok(list.Select(e => new EnquiryDto
        {
            Id = e.Id,
            Name = e.Name,
            Email = e.Email,
            Phone = e.Phone,
            Message = e.Message,
            CourseInterest = e.CourseInterest,
            CreatedAt = e.CreatedAt
        }).ToList());
    }

    [HttpPost]
    public async Task<ActionResult> Submit([FromBody] EnquiryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Name and Email are required.");
        var enquiry = new Enquiry
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim(),
            Phone = dto.Phone?.Trim(),
            Message = dto.Message?.Trim(),
            CourseInterest = dto.CourseInterest?.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        await _db.Enquiries.InsertOneAsync(enquiry);
        return Ok(new { message = "Enquiry submitted successfully.", id = enquiry.Id });
    }
}

public class EnquiryDto
{
    public string? Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public string? Message { get; set; }
    public string? CourseInterest { get; set; }
    public DateTime? CreatedAt { get; set; }
}
