using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Helpers;
using Iimst.Api.Services;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly MongoDbService _db;

    public StudentsController(MongoDbService db) => _db = db;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<StudentDto>>> GetAll([FromQuery] string? search, [FromQuery] string? courseId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var filter = Builders<Student>.Filter.Empty;
        if (!string.IsNullOrWhiteSpace(search))
            filter = Builders<Student>.Filter.Or(
                Builders<Student>.Filter.Regex(s => s.FullName, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                Builders<Student>.Filter.Regex(s => s.EnrollmentNo, new MongoDB.Bson.BsonRegularExpression(search, "i")));
        if (!string.IsNullOrWhiteSpace(courseId))
            filter &= Builders<Student>.Filter.Eq(s => s.CourseId, courseId);
        var total = await _db.Students.CountDocumentsAsync(filter);
        var list = await _db.Students.Find(filter)
            .SortByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Limit(pageSize)
            .ToListAsync();
        var userIds = list.Select(s => s.UserId).Distinct().ToList();
        var courseIds = list.Select(s => s.CourseId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
        var users = await _db.Users.Find(u => userIds.Contains(u.Id)).ToListAsync();
        var courses = courseIds.Count > 0 ? await _db.Courses.Find(c => courseIds.Contains(c.Id)).ToListAsync() : new List<Course>();
        var userMap = users.ToDictionary(u => u.Id);
        var courseMap = courses.ToDictionary(c => c.Id);
        var dtos = list.Select(s => ToDto(s, userMap.GetValueOrDefault(s.UserId), courseMap.GetValueOrDefault(s.CourseId ?? ""))).ToList();
        Response.Headers.Append("X-Total-Count", total.ToString());
        return Ok(dtos);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<StudentDto>> GetById(string id)
    {
        var student = await _db.Students.Find(s => s.Id == id).FirstOrDefaultAsync();
        if (student == null) return NotFound();
        if (User.IsInRole("Student"))
        {
            var uid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (student.UserId != uid) return Forbid();
        }
        var user = await _db.Users.Find(u => u.Id == student.UserId).FirstOrDefaultAsync();
        Course? course = null;
        if (!string.IsNullOrEmpty(student.CourseId))
            course = await _db.Courses.Find(c => c.Id == student.CourseId).FirstOrDefaultAsync();
        return Ok(ToDto(student, user, course));
    }

    [HttpGet("by-user")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<StudentDto>> GetByCurrentUser()
    {
        var uid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(uid)) return Unauthorized();
        var student = await _db.Students.Find(s => s.UserId == uid).FirstOrDefaultAsync();
        if (student == null) return NotFound("Student profile not found");
        var user = await _db.Users.Find(u => u.Id == uid).FirstOrDefaultAsync();
        Course? course = null;
        if (!string.IsNullOrEmpty(student.CourseId))
            course = await _db.Courses.Find(c => c.Id == student.CourseId).FirstOrDefaultAsync();
        return Ok(ToDto(student, user, course));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StudentDto>> Create([FromBody] StudentCreateDto dto)
    {
        var enrollmentNo = dto.EnrollmentNo?.Trim();
        if (string.IsNullOrEmpty(enrollmentNo))
        {
            enrollmentNo = GenerateEnrollmentNo();
            for (int i = 0; i < 10; i++)
            {
                var exists = await _db.Students.Find(s => s.EnrollmentNo == enrollmentNo).FirstOrDefaultAsync();
                if (exists == null) break;
                enrollmentNo = GenerateEnrollmentNo();
            }
            var finalCheck = await _db.Students.Find(s => s.EnrollmentNo == enrollmentNo).FirstOrDefaultAsync();
            if (finalCheck != null) return BadRequest("Could not generate unique enrollment number. Please try again or supply one.");
        }
        var existing = await _db.Students.Find(s => s.EnrollmentNo == enrollmentNo).FirstOrDefaultAsync();
        if (existing != null) return BadRequest("Enrollment number already exists");
        var existingUser = await _db.Users.Find(u => u.UserName == enrollmentNo).FirstOrDefaultAsync();
        if (existingUser != null) return BadRequest("Enrollment number already used as login");

        var user = new User
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            UserName = enrollmentNo,
            Email = !string.IsNullOrWhiteSpace(dto.Email) ? dto.Email.Trim() : (enrollmentNo + "@iimst.co.in"),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(enrollmentNo),
            Role = "Student",
            CreatedAt = DateTime.UtcNow
        };
        await _db.Users.InsertOneAsync(user);

        var student = new Student
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            UserId = user.Id,
            EnrollmentNo = enrollmentNo,
            FullName = dto.FullName.Trim(),
            FatherName = dto.FatherName?.Trim(),
            MotherName = dto.MotherName?.Trim(),
            DateOfBirth = dto.DateOfBirth,
            Email = dto.Email?.Trim(),
            Address = dto.Address?.Trim(),
            Phone = dto.Phone?.Trim(),
            CourseId = dto.CourseId?.Trim().NullIfEmpty(),
            Program = dto.Program?.Trim().NullIfEmpty(),
            Branch = dto.Branch?.Trim().NullIfEmpty(),
            CurrentSemester = dto.CurrentSemester,
            PhotoUrl = dto.PhotoUrl?.Trim().NullIfEmpty(),
            BloodGroup = dto.BloodGroup?.Trim().NullIfEmpty(),
            CreatedAt = DateTime.UtcNow
        };
        await _db.Students.InsertOneAsync(student);
        var course = !string.IsNullOrEmpty(student.CourseId) ? await _db.Courses.Find(c => c.Id == student.CourseId).FirstOrDefaultAsync() : null;
        return CreatedAtAction(nameof(GetById), new { id = student.Id }, ToDto(student, user, course));
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<StudentDto>> Update(string id, [FromBody] StudentUpdateDto dto)
    {
        var student = await _db.Students.Find(s => s.Id == id).FirstOrDefaultAsync();
        if (student == null) return NotFound();
        if (User.IsInRole("Student"))
        {
            var uid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (student.UserId != uid) return Forbid();
        }
        if (dto.FullName != null) student.FullName = dto.FullName;
        if (dto.FatherName != null) student.FatherName = dto.FatherName;
        if (dto.MotherName != null) student.MotherName = dto.MotherName;
        if (dto.DateOfBirth.HasValue) student.DateOfBirth = dto.DateOfBirth;
        if (dto.Email != null) student.Email = dto.Email;
        if (dto.Address != null) student.Address = dto.Address;
        if (dto.Phone != null) student.Phone = dto.Phone;
        if (dto.CourseId != null) student.CourseId = dto.CourseId.NullIfEmpty();
        if (dto.Program != null) student.Program = dto.Program.NullIfEmpty();
        if (dto.Branch != null) student.Branch = dto.Branch;
        if (dto.CurrentSemester.HasValue) student.CurrentSemester = dto.CurrentSemester;
        if (dto.PhotoUrl != null) student.PhotoUrl = dto.PhotoUrl.NullIfEmpty();
        if (dto.BloodGroup != null) student.BloodGroup = dto.BloodGroup.NullIfEmpty();
        student.UpdatedAt = DateTime.UtcNow;
        await _db.Students.ReplaceOneAsync(s => s.Id == id, student);
        var user = await _db.Users.Find(u => u.Id == student.UserId).FirstOrDefaultAsync();
        Course? course = null;
        if (!string.IsNullOrEmpty(student.CourseId))
            course = await _db.Courses.Find(c => c.Id == student.CourseId).FirstOrDefaultAsync();
        return Ok(ToDto(student, user, course));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        var student = await _db.Students.Find(s => s.Id == id).FirstOrDefaultAsync();
        if (student == null) return NotFound();
        await _db.Students.DeleteOneAsync(s => s.Id == id);
        await _db.Users.DeleteOneAsync(u => u.Id == student.UserId);
        return NoContent();
    }

    static string GenerateEnrollmentNo()
    {
        var yyyymmdd = DateTime.UtcNow.ToString("yyyyMMdd");
        var rnd = new Random();
        var three = rnd.Next(100, 1000);
        return yyyymmdd + three;
    }

    static StudentDto ToDto(Student s, User? user, Course? course) => new StudentDto
    {
        Id = s.Id,
        UserId = s.UserId,
        UserName = user?.UserName,
        EnrollmentNo = s.EnrollmentNo,
        FullName = s.FullName,
        FatherName = s.FatherName,
        MotherName = s.MotherName,
        DateOfBirth = s.DateOfBirth,
        Email = s.Email,
        Address = s.Address,
        Phone = s.Phone,
        CourseId = s.CourseId,
        CourseName = course?.Name,
        Program = s.Program,
        Branch = s.Branch,
        CurrentSemester = s.CurrentSemester,
        PhotoUrl = s.PhotoUrl,
        BloodGroup = s.BloodGroup,
        CreatedAt = s.CreatedAt
    };
}

public class StudentDto
{
    public string Id { get; set; } = "";
    public string UserId { get; set; } = "";
    public string? UserName { get; set; }
    public string EnrollmentNo { get; set; } = "";
    public string FullName { get; set; } = "";
    public string? FatherName { get; set; }
    public string? MotherName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? CourseId { get; set; }
    public string? CourseName { get; set; }
    public string? Program { get; set; }
    public string? Branch { get; set; }
    public int? CurrentSemester { get; set; }
    public string? PhotoUrl { get; set; }
    public string? BloodGroup { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class StudentCreateDto
{
    /// <summary>Optional. If empty, autogenerated as YYYYMMDD + 3-digit random.</summary>
    public string? EnrollmentNo { get; set; }
    public string FullName { get; set; } = "";
    public string? FatherName { get; set; }
    public string? MotherName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? CourseId { get; set; }
    public string? Program { get; set; }
    public string? Branch { get; set; }
    public int? CurrentSemester { get; set; }
    public string? PhotoUrl { get; set; }
    public string? BloodGroup { get; set; }
}

public class StudentUpdateDto
{
    public string? FullName { get; set; }
    public string? FatherName { get; set; }
    public string? MotherName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? CourseId { get; set; }
    public string? Program { get; set; }
    public string? Branch { get; set; }
    public int? CurrentSemester { get; set; }
    public string? PhotoUrl { get; set; }
    public string? BloodGroup { get; set; }
}
