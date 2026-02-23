using MongoDB.Bson.Serialization.Attributes;

namespace Iimst.Api.Data;

public class Student
{
    [BsonId]
    [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
    public string Id { get; set; } = "";
    public string UserId { get; set; } = "";
    public string EnrollmentNo { get; set; } = "";
    public string FullName { get; set; } = "";
    public string? FatherName { get; set; }
    public string? MotherName { get; set; }
    public string? CourseId { get; set; }
    public string? BranchId { get; set; }
    public int? AdmissionYear { get; set; }
    public DateTime? DOB { get; set; }
    public string? EmailId { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? PhotoUrl { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
