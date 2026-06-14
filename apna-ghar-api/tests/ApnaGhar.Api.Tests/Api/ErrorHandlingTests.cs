using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class ErrorHandlingTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    public ErrorHandlingTests(ApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Validation400_ReturnsProblemDetailsContentType()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_client);
        var bad = AuthHelper.SampleProperty() with { Title = "" };
        var res = await client.PostAsJsonAsync("/api/properties", bad);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        res.Content.Headers.ContentType!.MediaType.Should().Be("application/problem+json");
    }
}
