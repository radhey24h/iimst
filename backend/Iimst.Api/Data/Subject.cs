using MongoDB.Bson.Serialization.Attributes;

namespace Iimst.Api.Data;

public class Subject
{
    [BsonId]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string Id { get; set; } = "";
    public string? CourseId { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    /// <summary>Semester number (1–8) this subject belongs to.</summary>
    public int? Semester { get; set; }
    public decimal MinPassMarks { get; set; }
    public decimal MaxMarks { get; set; } = 100;
    /// <summary>Exam link URL for this subject.</summary>
    public string? ExamLink { get; set; }
    public int Credits { get; set; }
    public string? Program { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
