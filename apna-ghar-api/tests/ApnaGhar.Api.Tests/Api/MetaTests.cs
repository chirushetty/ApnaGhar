using System.Net.Http.Json;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class MetaTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    public MetaTests(ApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task GetAmenities_ReturnsList()
    {
        var res = await _client.GetFromJsonAsync<List<string>>("/api/meta/amenities");
        res.Should().Contain("Gym").And.Contain("Lift");
    }

    [Fact]
    public async Task GetCities_ReturnsList()
    {
        var res = await _client.GetFromJsonAsync<List<string>>("/api/meta/cities");
        res.Should().Contain("Mumbai").And.Contain("Bangalore");
    }
}
