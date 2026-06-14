namespace ApnaGhar.Api.Storage;

public interface IImageStorage
{
    Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default);
    Task DeleteAsync(string url, CancellationToken ct = default);
}
