using Microsoft.AspNetCore.Hosting;

namespace ApnaGhar.Api.Storage;

public class LocalDiskImageStorage : IImageStorage
{
    private readonly string _uploadsRoot;

    public LocalDiskImageStorage(IWebHostEnvironment env)
    {
        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        _uploadsRoot = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(_uploadsRoot);
    }

    public async Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default)
    {
        var ext = Path.GetExtension(fileName);
        var safeName = $"{Guid.NewGuid():N}{ext}";
        var path = Path.Combine(_uploadsRoot, safeName);
        await using var fs = File.Create(path);
        await content.CopyToAsync(fs, ct);
        return $"/uploads/{safeName}";
    }

    public Task DeleteAsync(string url, CancellationToken ct = default)
    {
        var name = Path.GetFileName(url);
        var path = Path.Combine(_uploadsRoot, name);
        if (File.Exists(path)) File.Delete(path);
        return Task.CompletedTask;
    }
}
