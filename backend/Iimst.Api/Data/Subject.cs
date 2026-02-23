using MongoDB.Bson.Serialization.Attributes;

namespace Iimst.Api.Data;

public class Subject
{
    [BsonId]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string Id { get; set; } = "";
    public string CourseId { get; set; } = "";
    public string BranchId { get; set; } = "";
    public int Semester { get; set; }
    public string Code { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal MinPassMarks { get; set; }
    public decimal MaxMarks { get; set; } = 100;
    public string? ExamLink { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
