using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Dtos;

namespace ApnaGhar.Api.Services;

public class PropertyService : IPropertyService
{
    private readonly IPropertyRepository _repo;
    public PropertyService(IPropertyRepository repo) => _repo = repo;

    public async Task<PropertyListResponse> ListAsync(PropertyQuery query, CancellationToken ct = default)
    {
        var paged = await _repo.QueryAsync(query, ct);
        return new PropertyListResponse(
            paged.Items.Select(p => p.ToResponse()).ToList(),
            paged.Total, paged.Page, paged.PageSize);
    }

    public async Task<PropertyResponse?> GetAsync(Guid id, CancellationToken ct = default)
    {
        var p = await _repo.GetByIdAsync(id, ct);
        return p?.ToResponse();
    }

    public async Task<IReadOnlyList<PropertyResponse>> GetFeaturedAsync(CancellationToken ct = default) =>
        (await _repo.GetFeaturedAsync(ct)).Select(p => p.ToResponse()).ToList();

    public async Task<IReadOnlyList<PropertyResponse>> GetSimilarAsync(Guid id, CancellationToken ct = default) =>
        (await _repo.GetSimilarAsync(id, ct)).Select(p => p.ToResponse()).ToList();
}
