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
public class ResultsController : ControllerBase
{
    private readonly MongoDbService _db;
    private readonly IResultService _resultService;

    public ResultsController(MongoDbService db, IResultService resultService)
    {
        _db = db;
        _resultService = resultService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<LegacyResultDto>>> GetAll([FromQuery] string? studentId, [FromQuery] string? courseId, [FromQuery] int? semester)
    {
        var builder = Builders<SemesterResult>.Filter;
        var filter = builder.Empty;
        if (!string.IsNullOrEmpty(studentId)) filter &= builder.Eq(r => r.StudentId, studentId);
        if (!string.IsNullOrEmpty(courseId)) filter &= builder.Eq(r => r.CourseId, courseId);
        if (semester.HasValue) filter &= builder.Eq(r => r.Semester, semester.Value);
        var list = await _db.SemesterResults.Find(filter).SortBy(r => r.Semester).ThenBy(r => r.SubjectId).ToListAsync();
        var studentIds = list.Select(r => r.StudentId).Distinct().ToList();
        var subjectIds = list.Select(r => r.SubjectId).Distinct().ToList();
        var courseIds = list.Select(r => r.CourseId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
        var students = await _db.Students.Find(s => studentIds.Contains(s.Id)).ToListAsync();
        var subjects = await _db.Subjects.Find(s => subjectIds.Contains(s.Id)).ToListAsync();
        var courses = courseIds.Count > 0 ? await _db.Courses.Find(c => courseIds.Contains(c.Id)).ToListAsync() : new List<Course>();
        var studentMap = students.ToDictionary(s => s.Id);
        var subjectMap = subjects.ToDictionary(s => s.Id);
        var courseMap = courses.ToDictionary(c => c.Id);
        var dtos = list.Select(r => ToLegacyDto(r,
            studentMap.GetValueOrDefault(r.StudentId),
            subjectMap.GetValueOrDefault(r.SubjectId),
            courseMap.GetValueOrDefault(r.CourseId ?? ""))).ToList();
        return Ok(dtos);
    }

    [HttpGet("student/{studentId}")]
    [Authorize]
    public async Task<ActionResult<List<ResultDto>>> GetByStudent(string studentId, [FromQuery] int? semester)
    {
        var student = await _db.Students.Find(s => s.Id == studentId).FirstOrDefaultAsync();
        if (student == null) return NotFound();
        if (User.IsInRole("Student"))
        {
            var uid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (student.UserId != uid) return Forbid();
        }
        var builder = Builders<Result>.Filter;
        var filter = builder.Eq(r => r.StudentId, studentId);
        if (semester.HasValue) filter &= builder.Eq(r => r.Semester, semester.Value);
        var list = await _db.Results.Find(filter).SortBy(r => r.Semester).ThenBy(r => r.SubjectId).ToListAsync();
        var subjectIds = list.Select(r => r.SubjectId).Distinct().ToList();
        var subjects = subjectIds.Count > 0 ? await _db.Subjects.Find(s => subjectIds.Contains(s.Id)).ToListAsync() : new List<Subject>();
        var subjectMap = subjects.ToDictionary(s => s.Id);
        var dtos = list.Select(r => new ResultDto
        {
            SubjectId = r.SubjectId,
            SubjectName = subjectMap.GetValueOrDefault(r.SubjectId)?.Name ?? r.SubjectId,
            Semester = r.Semester,
            SemesterRoman = RomanHelper.ToRoman(r.Semester),
            MarksObtained = r.MarksObtained,
            Grade = r.Grade,
            IsPassed = r.IsPassed
        }).ToList();
        return Ok(dtos);
    }

    /// <summary>Returns list of semester numbers for which the student has results (from Results or SemesterResults). Dynamic: no cache.</summary>
    [HttpGet("student/{studentId}/semesters")]
    [Authorize]
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public async Task<ActionResult<int[]>> GetSemestersWithResults(string studentId)
    {
        var student = await _db.Students.Find(s => s.Id == studentId).FirstOrDefaultAsync();
        if (student == null) return NotFound();
        if (User.IsInRole("Student"))
        {
            var uid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (student.UserId != uid) return Forbid();
        }
        if (string.Equals(student.Status, "Inactive", StringComparison.OrdinalIgnoreCase))
            return Ok(Array.Empty<int>());
        var fromResults = (await _db.Results.Find(r => r.StudentId == studentId).Project(r => r.Semester).ToListAsync()).Distinct();
        var fromSemesterResults = (await _db.SemesterResults.Find(r => r.StudentId == studentId).Project(r => r.Semester).ToListAsync()).Distinct();
        var combined = fromResults.Union(fromSemesterResults).OrderBy(s => s).ToArray();
        return Ok(combined);
    }

    [HttpGet("student/{studentId}/has-results")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<object>> HasResultsForSemester(string studentId, [FromQuery] int semester)
    {
        var count = await _db.Results.CountDocumentsAsync(
            Builders<Result>.Filter.And(
                Builders<Result>.Filter.Eq(r => r.StudentId, studentId),
                Builders<Result>.Filter.Eq(r => r.Semester, semester)));
        return Ok(new { hasResults = count > 0 });
    }

    [HttpPost("bulk")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<ResultDto>>> BulkInsert([FromBody] ResultBulkRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.StudentId) || dto.Marks == null || dto.Marks.Count == 0)
            return BadRequest("StudentId and Marks list are required");
        try
        {
            var marksList = dto.Marks.Select(m => (m.SubjectId, m.MarksObtained)).ToList();
            var result = await _resultService.BulkInsertResultsAsync(dto.StudentId, dto.Semester, marksList);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("student/{studentId}/legacy")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<LegacyResultDto>>> GetByStudentLegacy(string studentId)
    {
        var student = await _db.Students.Find(s => s.Id == studentId).FirstOrDefaultAsync();
        if (student == null) return NotFound();
        var list = await _db.SemesterResults.Find(r => r.StudentId == studentId).SortBy(r => r.Semester).ToListAsync();
        var subjectIds = list.Select(r => r.SubjectId).Distinct().ToList();
        var subjects = await _db.Subjects.Find(s => subjectIds.Contains(s.Id)).ToListAsync();
        var subjectMap = subjects.ToDictionary(s => s.Id);
        Course? course = null;
        if (!string.IsNullOrEmpty(student.CourseId))
            course = await _db.Courses.Find(c => c.Id == student.CourseId).FirstOrDefaultAsync();
        return Ok(list.Select(r => ToLegacyDto(r, student, subjectMap.GetValueOrDefault(r.SubjectId), course)).ToList());
    }

    /// <summary>Result-cum-Detailed Marks Card for one semester. Prefers Results (admin bulk entry) so all subjects entered by admin are returned; falls back to SemesterResults (legacy) when Results is empty. No cache.</summary>
    [HttpGet("student/{studentId}/marks-card")]
    [Authorize]
    [ResponseCache(Location = ResponseCacheLocation.None, NoStore = true)]
    public async Task<ActionResult<MarksCardDto>> GetMarksCard(string studentId, [FromQuery] int semester)
    {
        var student = await _db.Students.Find(s => s.Id == studentId).FirstOrDefaultAsync();
        if (student == null) return NotFound();
        if (User.IsInRole("Student"))
        {
            var uid = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (student.UserId != uid) return Forbid();
        }
        if (string.Equals(student.Status, "Inactive", StringComparison.OrdinalIgnoreCase))
            return StatusCode(403, new { message = "Results are only available for active student accounts." });
        // Prefer Results (admin bulk entry) so student sees all subjects entered by admin. Fall back to SemesterResults (legacy) only when Results is empty.
        var results = await _db.Results.Find(r => r.StudentId == studentId && r.Semester == semester)
            .SortBy(r => r.SubjectId).ToListAsync();
        List<MarksCardRowDto> rows;
        decimal totalMax, totalPass, totalSecured;
        bool allPassed;
        string? courseIdForName = null;
        if (results.Count > 0)
        {
            courseIdForName = student.CourseId;
            var subjectIds = results.Select(r => r.SubjectId).Distinct().ToList();
            var subjects = await _db.Subjects.Find(s => subjectIds.Contains(s.Id)).ToListAsync();
            var subjectMap = subjects.ToDictionary(s => s.Id);
            totalMax = 0; totalPass = 0; totalSecured = 0;
            rows = new List<MarksCardRowDto>();
            foreach (var r in results)
            {
                var sub = subjectMap.GetValueOrDefault(r.SubjectId);
                var maxMarks = sub?.MaxMarks ?? 100;
                var passMarks = sub?.MinPassMarks ?? (maxMarks * 0.4m);
                totalMax += maxMarks; totalPass += passMarks; totalSecured += r.MarksObtained;
                rows.Add(new MarksCardRowDto
                {
                    SubjectName = sub?.Name ?? r.SubjectId,
                    MaximumMarks = maxMarks,
                    PassMarks = passMarks,
                    MarksSecured = r.MarksObtained,
                    IsPassed = r.IsPassed
                });
            }
            allPassed = results.All(r => r.IsPassed);
        }
        else
        {
            var semesterResults = await _db.SemesterResults.Find(r => r.StudentId == studentId && r.Semester == semester)
                .SortBy(r => r.SubjectId).ToListAsync();
            if (semesterResults.Count == 0) return NotFound("No results for this semester.");
            var subjectIds = semesterResults.Select(r => r.SubjectId).Distinct().ToList();
            var subjects = await _db.Subjects.Find(s => subjectIds.Contains(s.Id)).ToListAsync();
            var subjectMap = subjects.ToDictionary(s => s.Id);
            courseIdForName = semesterResults.First().CourseId;
            totalMax = 0; totalPass = 0; totalSecured = 0;
            rows = new List<MarksCardRowDto>();
            foreach (var r in semesterResults)
            {
                var sub = subjectMap.GetValueOrDefault(r.SubjectId);
                var maxMarks = r.MaxMarks;
                var passMarks = sub?.MinPassMarks ?? (maxMarks * 0.4m);
                totalMax += maxMarks; totalPass += passMarks; totalSecured += r.MarksObtained;
                rows.Add(new MarksCardRowDto
                {
                    SubjectName = sub?.Name ?? r.SubjectId,
                    MaximumMarks = maxMarks,
                    PassMarks = passMarks,
                    MarksSecured = r.MarksObtained,
                    IsPassed = r.IsPassed
                });
            }
            allPassed = semesterResults.All(r => r.IsPassed);
        }
        Course? course = null;
        Branch? branch = null;
        if (!string.IsNullOrEmpty(courseIdForName))
            course = await _db.Courses.Find(c => c.Id == courseIdForName).FirstOrDefaultAsync();
        if (!string.IsNullOrEmpty(student.BranchId))
            branch = await _db.Branches.Find(b => b.Id == student.BranchId).FirstOrDefaultAsync();
        return Ok(new MarksCardDto
        {
            StudentName = student.FullName,
            FatherName = student.FatherName,
            DateOfBirth = student.DOB,
            EnrollmentNo = student.EnrollmentNo,
            CourseName = course?.Name,
            BranchName = branch?.Name,
            Semester = semester,
            SemesterRoman = RomanNumerals.ToRoman(semester),
            Rows = rows,
            TotalMaximumMarks = totalMax,
            TotalPassMarks = totalPass,
            TotalMarksSecured = totalSecured,
            ResultStatus = allPassed ? "PASS" : "FAIL"
        });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ResultDto>> Create([FromBody] ResultCreateDto dto)
    {
        var student = await _db.Students.Find(s => s.Id == dto.StudentId).FirstOrDefaultAsync();
        var subject = await _db.Subjects.Find(s => s.Id == dto.SubjectId).FirstOrDefaultAsync();
        if (student == null || subject == null) return BadRequest("Student or Subject not found");
        var maxMarks = dto.MaxMarks > 0 ? dto.MaxMarks : subject.MaxMarks;
        var minPass = subject.MinPassMarks;
        var isPassed = dto.MarksObtained >= minPass;
        var r = new SemesterResult
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            StudentId = dto.StudentId,
            CourseId = subject.CourseId ?? "",
            SubjectId = dto.SubjectId,
            Semester = dto.Semester,
            MarksObtained = dto.MarksObtained,
            MaxMarks = maxMarks,
            Grade = dto.Grade,
            IsPassed = isPassed,
            CreatedAt = DateTime.UtcNow
        };
        await _db.SemesterResults.InsertOneAsync(r);
        Course? course = null;
        if (!string.IsNullOrEmpty(r.CourseId))
            course = await _db.Courses.Find(c => c.Id == r.CourseId).FirstOrDefaultAsync();
        return CreatedAtAction(nameof(GetAll), null, ToLegacyDto(r, student, subject, course));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ResultDto>> Update(string id, [FromBody] ResultUpdateDto dto)
    {
        var r = await _db.SemesterResults.Find(x => x.Id == id).FirstOrDefaultAsync();
        if (r == null) return NotFound();
        var subject = await _db.Subjects.Find(s => s.Id == r.SubjectId).FirstOrDefaultAsync();
        var minPass = subject?.MinPassMarks ?? (r.MaxMarks * 0.4m);
        r.MarksObtained = dto.MarksObtained;
        r.MaxMarks = dto.MaxMarks;
        r.Grade = dto.Grade ?? r.Grade;
        r.IsPassed = dto.MarksObtained >= minPass;
        await _db.SemesterResults.ReplaceOneAsync(x => x.Id == id, r);
        var student = await _db.Students.Find(s => s.Id == r.StudentId).FirstOrDefaultAsync();
        Course? course = null;
        if (!string.IsNullOrEmpty(r.CourseId))
            course = await _db.Courses.Find(c => c.Id == r.CourseId).FirstOrDefaultAsync();
        return Ok(ToLegacyDto(r, student, subject, course));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> Delete(string id)
    {
        var result = await _db.SemesterResults.DeleteOneAsync(x => x.Id == id);
        if (result.DeletedCount == 0) return NotFound();
        return NoContent();
    }

    static LegacyResultDto ToLegacyDto(SemesterResult r, Student? student, Subject? subject, Course? course) => new LegacyResultDto
    {
        Id = r.Id,
        StudentId = r.StudentId,
        StudentName = student?.FullName,
        EnrollmentNo = student?.EnrollmentNo,
        CourseId = r.CourseId,
        CourseName = course?.Name,
        SubjectId = r.SubjectId,
        SubjectCode = subject?.Code,
        SubjectName = subject?.Name,
        Semester = r.Semester,
        SemesterRoman = RomanNumerals.ToRoman(r.Semester),
        MarksObtained = r.MarksObtained,
        MaxMarks = r.MaxMarks,
        MinPassMarks = subject?.MinPassMarks ?? 0,
        Grade = r.Grade,
        IsPassed = r.IsPassed
    };
}

public class LegacyResultDto
{
    public string Id { get; set; } = "";
    public string StudentId { get; set; } = "";
    public string? StudentName { get; set; }
    public string? EnrollmentNo { get; set; }
    public string? CourseId { get; set; }
    public string? CourseName { get; set; }
    public string SubjectId { get; set; } = "";
    public string? SubjectCode { get; set; }
    public string? SubjectName { get; set; }
    public int Semester { get; set; }
    public string SemesterRoman { get; set; } = "";
    public decimal MarksObtained { get; set; }
    public decimal MaxMarks { get; set; }
    public decimal MinPassMarks { get; set; }
    public string? Grade { get; set; }
    public bool IsPassed { get; set; }
}

public class ResultCreateDto
{
    public string StudentId { get; set; } = "";
    public string SubjectId { get; set; } = "";
    public int Semester { get; set; }
    public decimal MarksObtained { get; set; }
    public decimal MaxMarks { get; set; }
    public string? Grade { get; set; }
}

public class ResultUpdateDto
{
    public decimal MarksObtained { get; set; }
    public decimal MaxMarks { get; set; }
    public string? Grade { get; set; }
}

public class MarksCardDto
{
    public string StudentName { get; set; } = "";
    public string? FatherName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string EnrollmentNo { get; set; } = "";
    public string? CourseName { get; set; }
    public string? BranchName { get; set; }
    public int Semester { get; set; }
    public string SemesterRoman { get; set; } = "";
    public List<MarksCardRowDto> Rows { get; set; } = new();
    public decimal TotalMaximumMarks { get; set; }
    public decimal TotalPassMarks { get; set; }
    public decimal TotalMarksSecured { get; set; }
    public string ResultStatus { get; set; } = "";
}

public class MarksCardRowDto
{
    public string SubjectName { get; set; } = "";
    public decimal MaximumMarks { get; set; }
    public decimal PassMarks { get; set; }
    public decimal MarksSecured { get; set; }
    public bool IsPassed { get; set; }
}
