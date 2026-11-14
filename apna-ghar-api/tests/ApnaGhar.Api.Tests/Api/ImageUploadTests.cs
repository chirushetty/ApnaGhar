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

/// <summary>
/// Dedicated factory for image-upload tests. Registers <see cref="StubImageStorage"/> so
/// tests never touch the real disk-storage implementation.
/// </summary>
public class ImageUploadApiFactory : ApiFactory
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureServices(services =>
        {
            var storageDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IImageStorage));
            if (storageDescriptor is not null) services.Remove(storageDescriptor);
            services.AddSingleton<IImageStorage, StubImageStorage>();
        });
    }
}

public class ImageUploadTests : IClassFixture<ImageUploadApiFactory>
{
    private readonly HttpClient _client;

    public ImageUploadTests(ImageUploadApiFactory factory)
    {
        _client = factory.CreateClient();
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
