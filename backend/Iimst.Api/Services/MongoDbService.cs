using MongoDB.Driver;
using Iimst.Api.Data;

namespace Iimst.Api.Services;

public class MongoDbService
{
    public IMongoDatabase Database { get; }
    public IMongoCollection<User> Users => Database.GetCollection<User>("users");
    public IMongoCollection<Student> Students => Database.GetCollection<Student>("students");
    public IMongoCollection<Course> Courses => Database.GetCollection<Course>("courses");
    public IMongoCollection<Branch> Branches => Database.GetCollection<Branch>("branches");
    public IMongoCollection<Subject> Subjects => Database.GetCollection<Subject>("subjects");
    public IMongoCollection<Result> Results => Database.GetCollection<Result>("results");
    public IMongoCollection<SemesterResult> SemesterResults => Database.GetCollection<SemesterResult>("semesterResults");
    public IMongoCollection<SubjectExam> SubjectExams => Database.GetCollection<SubjectExam>("subjectExams");
    public IMongoCollection<ExamAttempt> ExamAttempts => Database.GetCollection<ExamAttempt>("examAttempts");

    public MongoDbService(IConfiguration config)
    {
        var conn = config["MongoDb:ConnectionString"] ?? "mongodb://localhost:27017";
        var dbName = config["MongoDb:DatabaseName"] ?? "iimst";
        var client = new MongoClient(conn);
        Database = client.GetDatabase(dbName);
    }
}
