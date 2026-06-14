using System.Net;
using System.Net.Http.Json;
using System.Text;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Storage;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class StubImageStorage : IImageStorage
{
    public Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default) =>
        Task.FromResult($"/uploads/stub-{fileName}");
    public Task DeleteAsync(string url, CancellationToken ct = default) => Task.CompletedTask;
}

public class ImageUploadTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    private readonly ApiFactory _factory;

    public ImageUploadTests(ApiFactory factory)
    {
        _factory = factory.WithStubImageStorage();
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Owner_CanUploadImage()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_client);
        var createRes = await client.PostAsJsonAsync("/api/properties", AuthHelper.SampleProperty());
        var created = await createRes.Content.ReadFromJsonAsync<PropertyResponse>();

        using var form = new MultipartFormDataContent();
        var bytes = Encoding.UTF8.GetBytes("fake-image-bytes");
        var fileContent = new ByteArrayContent(bytes);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
        form.Add(fileContent, "file", "photo.jpg");

        var res = await client.PostAsync($"/api/properties/{created!.Id}/images", form);
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await res.Content.ReadFromJsonAsync<PropertyResponse>();
        updated!.Images.Should().Contain(u => u.Contains("stub-photo.jpg"));
    }
}
