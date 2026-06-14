using ApnaGhar.Api.Auth;
using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Entities;
using Microsoft.AspNetCore.Identity;

namespace ApnaGhar.Api.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly ITokenService _tokens;
    private readonly IPasswordHasher<User> _hasher;

    public AuthService(IUserRepository users, ITokenService tokens, IPasswordHasher<User> hasher)
    {
        _users = users;
        _tokens = tokens;
        _hasher = hasher;
    }

    public async Task<AuthOutcome> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLower();
        if (await _users.EmailExistsAsync(email, ct))
            return new AuthOutcome(AuthResult.EmailTaken, null);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = request.DisplayName.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = _hasher.HashPassword(user, request.Password);
        await _users.AddAsync(user, ct);

        return new AuthOutcome(AuthResult.Success,
            new AuthResponse(_tokens.CreateToken(user), user.ToDto()));
    }

    public async Task<AuthOutcome> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLower();
        var user = await _users.GetByEmailAsync(email, ct);
        if (user is null)
            return new AuthOutcome(AuthResult.InvalidCredentials, null);

        var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verify == PasswordVerificationResult.Failed)
            return new AuthOutcome(AuthResult.InvalidCredentials, null);

        return new AuthOutcome(AuthResult.Success,
            new AuthResponse(_tokens.CreateToken(user), user.ToDto()));
    }
}
