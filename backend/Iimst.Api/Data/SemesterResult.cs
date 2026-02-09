using MongoDB.Bson.Serialization.Attributes;

namespace Iimst.Api.Data;

public class SemesterResult
{
    [BsonId]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string Id { get; set; } = "";
    public string StudentId { get; set; } = "";
    public string? CourseId { get; set; }
    public string SubjectId { get; set; } = "";
    /// <summary>Semester number 1–8 (display as Roman I–VIII).</summary>
    public int Semester { get; set; }
    public decimal MarksObtained { get; set; }
    public decimal MaxMarks { get; set; }
    public string? Grade { get; set; }
    public bool IsPassed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
