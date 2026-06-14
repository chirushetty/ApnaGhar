using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class AuthTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    public AuthTests(ApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Register_ThenLogin_ReturnsToken()
    {
        var email = $"u{Guid.NewGuid():N}@b.com";
        var reg = await _client.PostAsJsonAsync("/api/auth/register",
            new RegisterRequest(email, "Passw0rd!", "Test User"));
        reg.StatusCode.Should().Be(HttpStatusCode.OK);
        var regBody = await reg.Content.ReadFromJsonAsync<AuthResponse>();
        regBody!.Token.Should().NotBeNullOrWhiteSpace();
        regBody.User.Email.Should().Be(email);

        var login = await _client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest(email, "Passw0rd!"));
        login.StatusCode.Should().Be(HttpStatusCode.OK);
        var loginBody = await login.Content.ReadFromJsonAsync<AuthResponse>();
        loginBody!.Token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns409()
    {
        var email = $"u{Guid.NewGuid():N}@b.com";
        await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Passw0rd!", "A"));
        var second = await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Passw0rd!", "B"));
        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var email = $"u{Guid.NewGuid():N}@b.com";
        await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Passw0rd!", "A"));
        var login = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "wrong"));
        login.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
