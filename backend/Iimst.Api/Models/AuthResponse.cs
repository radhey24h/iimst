namespace Iimst.Api.Models;

public class AuthResponse
{
    public string Token { get; set; } = "";
    public string UserName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
    public string? StudentId { get; set; }
}
