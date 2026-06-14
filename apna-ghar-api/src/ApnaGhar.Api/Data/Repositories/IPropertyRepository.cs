using ApnaGhar.Api.Entities;

namespace ApnaGhar.Api.Data.Repositories;

public interface IPropertyRepository
{
    Task<PagedResult<Property>> QueryAsync(PropertyQuery query, CancellationToken ct = default);
    Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Property?> GetByIdTrackedAsync(Guid id, CancellationToken ct = default);
    Task ReplaceChildrenAsync(Guid propertyId,
        IReadOnlyList<PropertyImage> newImages,
        IReadOnlyList<PropertyAmenity> newAmenities,
        CancellationToken ct = default);
    Task<IReadOnlyList<Property>> GetFeaturedAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Property>> GetSimilarAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Property property, CancellationToken ct = default);
    Task UpdateAsync(Property property, CancellationToken ct = default);
    Task DeleteAsync(Property property, CancellationToken ct = default);
    Task AppendImageAsync(Guid propertyId, PropertyImage image, CancellationToken ct = default);
}
