using MongoDB.Bson.Serialization.Attributes;

namespace Iimst.Api.Data;

public class SubjectExam
{
    [BsonId]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string Id { get; set; } = "";
    public string SubjectId { get; set; } = "";
    public string ExamLink { get; set; } = "";
    public decimal MinPassingMarks { get; set; }
    public decimal MaxMarks { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
