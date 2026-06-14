using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ApnaGhar.Api.Auth;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApnaGhar.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly ICurrentUser _currentUser;

    public AuthController(IAuthService auth, ICurrentUser currentUser)
    {
        _auth = auth;
        _currentUser = currentUser;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken ct)
    {
        var outcome = await _auth.RegisterAsync(request, ct);
        return outcome.Result switch
        {
            AuthResult.Success => Ok(outcome.Response),
            AuthResult.EmailTaken => Conflict(new { message = "Email already registered." }),
            _ => BadRequest()
        };
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var outcome = await _auth.LoginAsync(request, ct);
        return outcome.Result switch
        {
            AuthResult.Success => Ok(outcome.Response),
            _ => Unauthorized(new { message = "Invalid email or password." })
        };
    }

    // Reconstructs the current user from JWT claims (sub/email/name set by TokenService).
    [HttpGet("me")]
    [Authorize]
    public ActionResult<UserDto> Me()
    {
        if (_currentUser.Id is not { } id) return Unauthorized();
        var email = User.FindFirstValue(JwtRegisteredClaimNames.Email)
                    ?? User.FindFirstValue(ClaimTypes.Email) ?? "";
        var name = User.FindFirstValue(JwtRegisteredClaimNames.Name) ?? "";
        return Ok(new UserDto(id, email, name));
    }
}
