using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Dtos;

namespace ApnaGhar.Api.Services;

public enum WriteOutcome { Updated, Deleted, NotFound, Forbidden }

public interface IPropertyService
{
    Task<PropertyListResponse> ListAsync(PropertyQuery query, CancellationToken ct = default);
    Task<PropertyResponse?> GetAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<PropertyResponse>> GetFeaturedAsync(CancellationToken ct = default);
    Task<IReadOnlyList<PropertyResponse>> GetSimilarAsync(Guid id, CancellationToken ct = default);
    Task<PropertyResponse> CreateAsync(CreatePropertyRequest request, Guid userId, CancellationToken ct = default);
    Task<(WriteOutcome Outcome, PropertyResponse? Property)> UpdateAsync(
        Guid id, UpdatePropertyRequest request, Guid userId, CancellationToken ct = default);
    Task<WriteOutcome> DeleteAsync(Guid id, Guid userId, CancellationToken ct = default);
}
