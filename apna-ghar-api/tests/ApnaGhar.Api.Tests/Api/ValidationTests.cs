using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class ValidationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public ValidationTests(ApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Create_WithBlankTitle_Returns400()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var bad = AuthHelper.SampleProperty() with { Title = "" };
        var res = await client.PostAsJsonAsync("/api/properties", bad);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Create_WithNegativePrice_Returns400()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var bad = AuthHelper.SampleProperty() with { Price = -5m };
        var res = await client.PostAsJsonAsync("/api/properties", bad);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Create_WithInvalidListingType_Returns400()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var bad = AuthHelper.SampleProperty() with { ListingType = "Lease" };
        var res = await client.PostAsJsonAsync("/api/properties", bad);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithShortPassword_Returns400()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/auth/register",
            new RegisterRequest($"u{Guid.NewGuid():N}@b.com", "x", "Name"));
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
