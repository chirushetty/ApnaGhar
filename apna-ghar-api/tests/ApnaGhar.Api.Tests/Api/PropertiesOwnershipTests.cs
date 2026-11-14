using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class PropertiesOwnershipTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public PropertiesOwnershipTests(ApiFactory factory) => _factory = factory;

    private async Task<(HttpClient client, Guid propertyId)> CreateOwnedProperty()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var res = await client.PostAsJsonAsync("/api/properties", AuthHelper.SampleProperty());
        var created = await res.Content.ReadFromJsonAsync<PropertyResponse>();
        return (client, created!.Id);
    }

    [Fact]
    public async Task Owner_CanUpdate()
    {
        var (client, id) = await CreateOwnedProperty();
        var update = AuthHelper.SampleProperty() with { Title = "Updated Title" };
        var res = await client.PutAsJsonAsync($"/api/properties/{id}", update);
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var dto = await res.Content.ReadFromJsonAsync<PropertyResponse>();
        dto!.Title.Should().Be("Updated Title");
    }

    [Fact]
    public async Task NonOwner_CannotUpdate_Returns403()
    {
        var (_, id) = await CreateOwnedProperty();
        var otherClient = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var res = await otherClient.PutAsJsonAsync($"/api/properties/{id}",
            AuthHelper.SampleProperty() with { Title = "Hacked" });
        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task NonOwner_CannotDelete_Returns403()
    {
        var (_, id) = await CreateOwnedProperty();
        var otherClient = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var res = await otherClient.DeleteAsync($"/api/properties/{id}");
        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Owner_CanDelete_ThenGone()
    {
        var (client, id) = await CreateOwnedProperty();
        var del = await client.DeleteAsync($"/api/properties/{id}");
        del.StatusCode.Should().Be(HttpStatusCode.NoContent);
        var get = await client.GetAsync($"/api/properties/{id}");
        get.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Update_UnknownId_Returns404()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var res = await client.PutAsJsonAsync($"/api/properties/{Guid.NewGuid()}", AuthHelper.SampleProperty());
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
