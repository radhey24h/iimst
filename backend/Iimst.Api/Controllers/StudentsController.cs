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
        var branchIds = list.Select(s => s.BranchId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
        var users = await _db.Users.Find(u => userIds.Contains(u.Id)).ToListAsync();
        var courses = courseIds.Count > 0 ? await _db.Courses.Find(c => courseIds.Contains(c.Id)).ToListAsync() : new List<Course>();
        var branches = branchIds.Count > 0 ? await _db.Branches.Find(b => branchIds.Contains(b.Id)).ToListAsync() : new List<Branch>();
        var userMap = users.ToDictionary(u => u.Id);
        var courseMap = courses.ToDictionary(c => c.Id);
        var branchMap = branches.ToDictionary(b => b.Id);
        var dtos = list.Select(s => ToDto(s, userMap.GetValueOrDefault(s.UserId), courseMap.GetValueOrDefault(s.CourseId ?? ""), branchMap.GetValueOrDefault(s.BranchId ?? ""))).ToList();
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
        Branch? branch = null;
        if (!string.IsNullOrEmpty(student.CourseId))
            course = await _db.Courses.Find(c => c.Id == student.CourseId).FirstOrDefaultAsync();
        if (!string.IsNullOrEmpty(student.BranchId))
            branch = await _db.Branches.Find(b => b.Id == student.BranchId).FirstOrDefaultAsync();
        return Ok(ToDto(student, user, course, branch));
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
        Branch? branch = null;
        if (!string.IsNullOrEmpty(student.CourseId))
            course = await _db.Courses.Find(c => c.Id == student.CourseId).FirstOrDefaultAsync();
        if (!string.IsNullOrEmpty(student.BranchId))
            branch = await _db.Branches.Find(b => b.Id == student.BranchId).FirstOrDefaultAsync();
        return Ok(ToDto(student, user, course, branch));
    }

    [HttpGet("by-course")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<StudentDto>>> GetByCourse([FromQuery] string courseId)
    {
        if (string.IsNullOrWhiteSpace(courseId)) return BadRequest("courseId required");
        var list = await _db.Students.Find(s => s.CourseId == courseId).SortBy(s => s.EnrollmentNo).ToListAsync();
        var userIds = list.Select(s => s.UserId).Distinct().ToList();
        var branchIds = list.Select(s => s.BranchId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
        var users = await _db.Users.Find(u => userIds.Contains(u.Id)).ToListAsync();
        var branches = branchIds.Count > 0 ? await _db.Branches.Find(b => branchIds.Contains(b.Id)).ToListAsync() : new List<Branch>();
        var userMap = users.ToDictionary(u => u.Id);
        var course = await _db.Courses.Find(c => c.Id == courseId).FirstOrDefaultAsync();
        var branchMap = branches.ToDictionary(b => b.Id);
        var dtos = list.Select(s => ToDto(s, userMap.GetValueOrDefault(s.UserId), course, branchMap.GetValueOrDefault(s.BranchId ?? ""))).ToList();
        return Ok(dtos);
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

        var email = !string.IsNullOrWhiteSpace(dto.EmailId) ? dto.EmailId.Trim() : (enrollmentNo + "@iimst.co.in");
        var user = new User
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            UserName = enrollmentNo,
            Email = email,
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
            FatherName = dto.FatherName?.Trim().NullIfEmpty(),
            CourseId = dto.CourseId?.Trim().NullIfEmpty(),
            BranchId = dto.BranchId?.Trim().NullIfEmpty(),
            AdmissionYear = dto.AdmissionYear,
            DOB = dto.DOB,
            EmailId = dto.EmailId?.Trim().NullIfEmpty(),
            PhoneNumber = dto.PhoneNumber?.Trim().NullIfEmpty(),
            Address = dto.Address?.Trim().NullIfEmpty(),
            PhotoUrl = dto.PhotoUrl?.Trim().NullIfEmpty(),
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "Active" : dto.Status.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        await _db.Students.InsertOneAsync(student);
        Course? course = null;
        Branch? branch = null;
        if (!string.IsNullOrEmpty(student.CourseId))
            course = await _db.Courses.Find(c => c.Id == student.CourseId).FirstOrDefaultAsync();
        if (!string.IsNullOrEmpty(student.BranchId))
            branch = await _db.Branches.Find(b => b.Id == student.BranchId).FirstOrDefaultAsync();
        return CreatedAtAction(nameof(GetById), new { id = student.Id }, ToDto(student, user, course, branch));
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
        if (dto.FatherName != null) student.FatherName = dto.FatherName.NullIfEmpty();
        if (dto.CourseId != null) student.CourseId = dto.CourseId.NullIfEmpty();
        if (dto.BranchId != null) student.BranchId = dto.BranchId.NullIfEmpty();
        if (dto.AdmissionYear.HasValue) student.AdmissionYear = dto.AdmissionYear;
        if (dto.DOB.HasValue) student.DOB = dto.DOB;
        if (dto.EmailId != null) student.EmailId = dto.EmailId.NullIfEmpty();
        if (dto.PhoneNumber != null) student.PhoneNumber = dto.PhoneNumber.NullIfEmpty();
        if (dto.Address != null) student.Address = dto.Address.NullIfEmpty();
        if (dto.PhotoUrl != null) student.PhotoUrl = dto.PhotoUrl.NullIfEmpty();
        if (dto.Status != null) student.Status = dto.Status;
        student.UpdatedAt = DateTime.UtcNow;
        await _db.Students.ReplaceOneAsync(s => s.Id == id, student);
        var user = await _db.Users.Find(u => u.Id == student.UserId).FirstOrDefaultAsync();
        Course? course = null;
        Branch? branch = null;
        if (!string.IsNullOrEmpty(student.CourseId))
            course = await _db.Courses.Find(c => c.Id == student.CourseId).FirstOrDefaultAsync();
        if (!string.IsNullOrEmpty(student.BranchId))
            branch = await _db.Branches.Find(b => b.Id == student.BranchId).FirstOrDefaultAsync();
        return Ok(ToDto(student, user, course, branch));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        var student = await _db.Students.Find(s => s.Id == id).FirstOrDefaultAsync();
        if (student == null) return NotFound();
        await _db.Results.DeleteManyAsync(r => r.StudentId == id);
        await _db.SemesterResults.DeleteManyAsync(r => r.StudentId == id);
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

    static StudentDto ToDto(Student s, User? user, Course? course, Branch? branch) => new StudentDto
    {
        Id = s.Id,
        UserId = s.UserId,
        UserName = user?.UserName,
        EnrollmentNo = s.EnrollmentNo,
        FullName = s.FullName,
        FatherName = s.FatherName,
        CourseId = s.CourseId,
        CourseName = course?.Name,
        BranchId = s.BranchId,
        BranchName = branch?.Name,
        AdmissionYear = s.AdmissionYear,
        DOB = s.DOB,
        DateOfBirth = s.DOB,
        EmailId = s.EmailId,
        Email = s.EmailId,
        PhoneNumber = s.PhoneNumber,
        Phone = s.PhoneNumber,
        Address = s.Address,
        PhotoUrl = s.PhotoUrl,
        Status = s.Status,
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
    public string? CourseId { get; set; }
    public string? CourseName { get; set; }
    public string? BranchId { get; set; }
    public string? BranchName { get; set; }
    public int? AdmissionYear { get; set; }
    public DateTime? DOB { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? EmailId { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? PhotoUrl { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; }
}

public class StudentCreateDto
{
    public string? EnrollmentNo { get; set; }
    public string FullName { get; set; } = "";
    public string? FatherName { get; set; }
    public string? CourseId { get; set; }
    public string? BranchId { get; set; }
    public int? AdmissionYear { get; set; }
    public DateTime? DOB { get; set; }
    public string? EmailId { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Status { get; set; }
}

public class StudentUpdateDto
{
    public string? FullName { get; set; }
    public string? FatherName { get; set; }
    public string? CourseId { get; set; }
    public string? BranchId { get; set; }
    public int? AdmissionYear { get; set; }
    public DateTime? DOB { get; set; }
    public string? EmailId { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Status { get; set; }
}
