using MongoDB.Bson.Serialization.Attributes;

namespace Iimst.Api.Data;

public class Enquiry
{
    [BsonId]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public string? Message { get; set; }
    public string? CourseInterest { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
