using MongoDB.Driver;
using Iimst.Api.Services;

namespace Iimst.Api.Data;

public static class SeedData
{
    /// <summary>Seed only default admin user (userId + password). No courses, branches, or subjects.</summary>
    public static async Task InitializeAsync(MongoDbService db)
    {
        var admin = await db.Users.Find(u => u.UserName == "admin").FirstOrDefaultAsync();
        if (admin != null) return;

        await db.Users.InsertOneAsync(new User
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            UserName = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin@123"),
            Role = "Admin",
            Email = "",
            CreatedAt = DateTime.UtcNow
        });

        await CreateIndexesAsync(db);
    }

    static async Task CreateIndexesAsync(MongoDbService db)
    {
        await db.Users.Indexes.CreateOneAsync(new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.UserName), new CreateIndexOptions { Unique = true }));
        await db.Users.Indexes.CreateOneAsync(new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.Email)));
        await db.Students.Indexes.CreateOneAsync(new CreateIndexModel<Student>(Builders<Student>.IndexKeys.Ascending(s => s.EnrollmentNo), new CreateIndexOptions { Unique = true }));
        await db.Subjects.Indexes.CreateOneAsync(new CreateIndexModel<Subject>(Builders<Subject>.IndexKeys.Ascending(s => s.CourseId).Ascending(s => s.BranchId).Ascending(s => s.Semester).Ascending(s => s.Code), new CreateIndexOptions { Unique = true }));
    }
}
