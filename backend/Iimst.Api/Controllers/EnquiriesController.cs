using Microsoft.AspNetCore.Mvc;
using Iimst.Api.Data;
using Iimst.Api.Services;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnquiriesController : ControllerBase
{
    private readonly MongoDbService _db;

    public EnquiriesController(MongoDbService db) => _db = db;

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
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public string? Message { get; set; }
    public string? CourseInterest { get; set; }
}
