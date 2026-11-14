using ApnaGhar.Api.Dtos;

namespace ApnaGhar.Api.Services;

public enum AuthResult { Success, EmailTaken, InvalidCredentials }

public record AuthOutcome(AuthResult Result, AuthResponse? Response);

public interface IAuthService
{
    Task<AuthOutcome> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthOutcome> LoginAsync(LoginRequest request, CancellationToken ct = default);
}
