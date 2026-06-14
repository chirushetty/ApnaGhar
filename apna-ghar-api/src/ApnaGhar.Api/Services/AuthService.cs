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
        var email = request.Email.Trim().ToLowerInvariant();
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

        try
        {
            await _users.AddAsync(user, ct);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            return new AuthOutcome(AuthResult.EmailTaken, null);
        }

        return new AuthOutcome(AuthResult.Success,
            new AuthResponse(_tokens.CreateToken(user), user.ToDto()));
    }

    public async Task<AuthOutcome> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _users.GetByEmailAsync(email, ct);
        if (user is null)
            return new AuthOutcome(AuthResult.InvalidCredentials, null);

        var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        // Treat Success and NeedsRehash as valid; NeedsRehash (older hash params) is not re-hashed here
        // because the repository has no Update yet — revisit when UpdateAsync exists.
        if (verify == PasswordVerificationResult.Failed)
            return new AuthOutcome(AuthResult.InvalidCredentials, null);

        return new AuthOutcome(AuthResult.Success,
            new AuthResponse(_tokens.CreateToken(user), user.ToDto()));
    }

    private static bool IsUniqueConstraintViolation(Microsoft.EntityFrameworkCore.DbUpdateException ex) =>
        ex.InnerException?.Message.Contains("UNIQUE constraint", StringComparison.OrdinalIgnoreCase) == true;
}
