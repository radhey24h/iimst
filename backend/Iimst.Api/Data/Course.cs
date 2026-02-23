using MongoDB.Bson.Serialization.Attributes;

namespace Iimst.Api.Data;

public class Course
{
    [BsonId]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Code { get; set; } = "";
    public int MaxSemester { get; set; }
    public int DurationYears { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
