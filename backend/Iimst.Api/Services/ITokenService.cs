using Iimst.Api.Data;

namespace Iimst.Api.Services;

public interface ITokenService
{
    string GenerateToken(User user);
}
