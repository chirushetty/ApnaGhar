using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace ApnaGhar.Api.Auth;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _accessor;
    public CurrentUser(IHttpContextAccessor accessor) => _accessor = accessor;

    public Guid? Id
    {
        get
        {
            var sub = _accessor.HttpContext?.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                      ?? _accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }
}
