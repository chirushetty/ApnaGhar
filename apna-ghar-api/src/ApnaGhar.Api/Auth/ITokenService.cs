using ApnaGhar.Api.Entities;

namespace ApnaGhar.Api.Auth;

public interface ITokenService
{
    string CreateToken(User user);
}
