using MongoDB.Bson.Serialization.Attributes;

namespace Iimst.Api.Data;

public class ExamAttempt
{
    [BsonId]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string Id { get; set; } = "";
    public string StudentId { get; set; } = "";
    public string SubjectExamId { get; set; } = "";
    public decimal MarksObtained { get; set; }
    public bool IsPassed { get; set; }
    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
}
