using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Dtos;

namespace ApnaGhar.Api.Services;

public interface IPropertyService
{
    Task<PropertyListResponse> ListAsync(PropertyQuery query, CancellationToken ct = default);
    Task<PropertyResponse?> GetAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<PropertyResponse>> GetFeaturedAsync(CancellationToken ct = default);
    Task<IReadOnlyList<PropertyResponse>> GetSimilarAsync(Guid id, CancellationToken ct = default);
}
