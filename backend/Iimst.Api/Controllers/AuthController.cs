using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using Iimst.Api.Data;
using Iimst.Api.Models;
using Iimst.Api.Services;

namespace Iimst.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly ITokenService _token;
    private readonly MongoDbService _db;

    public AuthController(IAuthService auth, ITokenService token, MongoDbService db)
    {
        _auth = auth;
        _token = token;
        _db = db;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] AuthRequest request)
    {
        var user = await _auth.ValidateUserAsync(request.UserNameOrEmail, request.Password);
        if (user == null) return Unauthorized("Invalid credentials");
        var student = await _db.Students.Find(s => s.UserId == user.Id).FirstOrDefaultAsync();
        return Ok(new AuthResponse
        {
            Token = _token.GenerateToken(user),
            UserName = user.UserName,
            Email = user.Email,
            Role = user.Role,
            StudentId = student?.Id
        });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null) return NotFound("User not found");
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return BadRequest("Current password is incorrect");
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _db.Users.ReplaceOneAsync(u => u.Id == userId, user);
        return Ok(new { message = "Password changed successfully." });
    }
}
