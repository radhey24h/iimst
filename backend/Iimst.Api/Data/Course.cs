using MongoDB.Bson.Serialization.Attributes;

namespace Iimst.Api.Data;

public class Course
{
    [BsonId]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    /// <summary>Max semester for this course: 6 for Diploma, 8 for Bachelor.</summary>
    public int MaxSemester { get; set; } = 8;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
