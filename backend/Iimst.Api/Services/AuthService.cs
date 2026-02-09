using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Services;

namespace Iimst.Api.Services;

public class AuthService : IAuthService
{
    private readonly MongoDbService _db;

    public AuthService(MongoDbService db) => _db = db;

    public async Task<User?> ValidateUserAsync(string userNameOrEmail, string password)
    {
        var user = await _db.Users
            .Find(u => u.UserName == userNameOrEmail || u.Email == userNameOrEmail)
            .FirstOrDefaultAsync();
        if (user == null) return null;
        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash) ? user : null;
    }
}
