using MongoDB.Bson.Serialization.Attributes;

namespace Iimst.Api.Data;

public class Result
{
    [BsonId]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string Id { get; set; } = "";
    public string StudentId { get; set; } = "";
    public string SubjectId { get; set; } = "";
    public int Semester { get; set; }
    public int Year { get; set; } = DateTime.UtcNow.Year;
    public decimal MarksObtained { get; set; }
    public string? Grade { get; set; }
    public bool IsPassed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
