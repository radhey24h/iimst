using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Services;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly MongoDbService _db;

    public UsersController(MongoDbService db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll([FromQuery] string? role, [FromQuery] string? search)
    {
        var builder = Builders<User>.Filter;
        var filter = builder.Empty;
        if (!string.IsNullOrWhiteSpace(role)) filter &= builder.Eq(u => u.Role, role);
        if (!string.IsNullOrWhiteSpace(search))
            filter &= builder.Or(
                builder.Regex(u => u.UserName, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                builder.Regex(u => u.Email, new MongoDB.Bson.BsonRegularExpression(search, "i")));
        var list = await _db.Users.Find(filter).SortBy(u => u.UserName).ToListAsync();
        return Ok(list.Select(u => new UserDto { Id = u.Id, UserName = u.UserName, Email = u.Email, Role = u.Role, CreatedAt = u.CreatedAt }).ToList());
    }
}

public class UserDto
{
    public string Id { get; set; } = "";
    public string UserName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
