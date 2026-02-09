namespace Iimst.Api.Models;

public class AuthRequest
{
    public string UserNameOrEmail { get; set; } = "";
    public string Password { get; set; } = "";
}
