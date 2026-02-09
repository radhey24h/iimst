using Iimst.Api.Data;

namespace Iimst.Api.Services;

public interface IAuthService
{
    Task<User?> ValidateUserAsync(string userNameOrEmail, string password);
}
