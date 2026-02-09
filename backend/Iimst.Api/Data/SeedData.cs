using MongoDB.Driver;
using Iimst.Api.Services;

namespace Iimst.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(MongoDbService db)
    {
        var admin = await db.Users.Find(u => u.UserName == "admin").FirstOrDefaultAsync();
        if (admin != null) return;

        await db.Users.InsertOneAsync(new User
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            UserName = "admin",
            Email = "admin@iimst.co.in",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin@123"),
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        });

        await CreateIndexesAsync(db);
        await SeedDefaultCourseAsync(db);
    }

    static async Task SeedDefaultCourseAsync(MongoDbService db)
    {
        var existing = await db.Courses.Find(FilterDefinition<Course>.Empty).FirstOrDefaultAsync();
        if (existing != null) return;
        await db.Courses.InsertOneAsync(new Course
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            Name = "Bachelor Programme in Business Administration",
            MaxSemester = 8,
            CreatedAt = DateTime.UtcNow
        });
    }

    static async Task CreateIndexesAsync(MongoDbService db)
    {
        await db.Users.Indexes.CreateOneAsync(new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.UserName), new CreateIndexOptions { Unique = true }));
        await db.Users.Indexes.CreateOneAsync(new CreateIndexModel<User>(Builders<User>.IndexKeys.Ascending(u => u.Email)));
        await db.Students.Indexes.CreateOneAsync(new CreateIndexModel<Student>(Builders<Student>.IndexKeys.Ascending(s => s.EnrollmentNo), new CreateIndexOptions { Unique = true }));
    }
}
