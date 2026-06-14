using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class PropertiesWriteTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public PropertiesWriteTests(ApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Create_WithoutAuth_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/properties", AuthHelper.SampleProperty());
        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Create_WithAuth_Returns201AndPersists()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var res = await client.PostAsJsonAsync("/api/properties", AuthHelper.SampleProperty());
        res.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await res.Content.ReadFromJsonAsync<PropertyResponse>();
        created!.Title.Should().Be("New Test Listing");
        created.Amenities.Should().Contain("Gym");

        var fetched = await client.GetFromJsonAsync<PropertyResponse>($"/api/properties/{created.Id}");
        fetched!.Id.Should().Be(created.Id);
    }
}
