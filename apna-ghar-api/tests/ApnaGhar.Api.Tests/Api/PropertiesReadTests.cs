using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class PropertiesReadTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    public PropertiesReadTests(ApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task GetProperties_ReturnsSeededPagedList()
    {
        var res = await _client.GetFromJsonAsync<PropertyListResponse>("/api/properties");
        res.Should().NotBeNull();
        res!.Total.Should().Be(9);
        res.Items.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetProperties_FiltersByCity()
    {
        var res = await _client.GetFromJsonAsync<PropertyListResponse>("/api/properties?city=Bangalore");
        res!.Items.Should().OnlyContain(p => p.City == "Bangalore");
    }

    [Fact]
    public async Task GetFeatured_ReturnsOnlyFeatured()
    {
        var res = await _client.GetFromJsonAsync<List<PropertyResponse>>("/api/properties/featured");
        res.Should().OnlyContain(p => p.IsFeatured);
    }

    [Fact]
    public async Task GetById_ReturnsProperty()
    {
        var list = await _client.GetFromJsonAsync<PropertyListResponse>("/api/properties");
        var id = list!.Items.First().Id;
        var res = await _client.GetAsync($"/api/properties/{id}");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var dto = await res.Content.ReadFromJsonAsync<PropertyResponse>();
        dto!.Id.Should().Be(id);
    }

    [Fact]
    public async Task GetById_Returns404ForUnknownId()
    {
        var res = await _client.GetAsync($"/api/properties/{Guid.NewGuid()}");
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetSimilar_ReturnsSameCity()
    {
        var list = await _client.GetFromJsonAsync<PropertyListResponse>("/api/properties?city=Mumbai");
        var id = list!.Items.First().Id;
        var res = await _client.GetFromJsonAsync<List<PropertyResponse>>($"/api/properties/{id}/similar");
        res.Should().OnlyContain(p => p.City == "Mumbai" && p.Id != id);
    }
}
