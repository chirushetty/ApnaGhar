using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Entities;

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

    public async Task<PropertyResponse> CreateAsync(CreatePropertyRequest r, Guid userId, CancellationToken ct = default)
    {
        var property = new Property
        {
            Id = Guid.NewGuid(),
            Title = r.Title,
            Description = r.Description,
            ListingType = Enum.Parse<ListingType>(r.ListingType, true),
            PropertyType = Enum.Parse<PropertyType>(r.PropertyType, true),
            Price = r.Price,
            AreaSqft = r.AreaSqft,
            Bedrooms = r.Bedrooms,
            Bathrooms = r.Bathrooms,
            IsFurnished = r.IsFurnished,
            ParkingAvailable = r.ParkingAvailable,
            VastuCompliant = r.VastuCompliant,
            Locality = r.Locality,
            City = r.City,
            State = r.State,
            IsFeatured = r.IsFeatured,
            PostedAt = DateTime.UtcNow,
            OwnerName = r.OwnerName,
            OwnerType = Enum.Parse<OwnerType>(r.OwnerType, true),
            OwnerPhone = r.OwnerPhone,
            CreatedByUserId = userId,
            Images = r.Images.Select((u, i) => new PropertyImage { Id = Guid.NewGuid(), Url = u, SortOrder = i }).ToList(),
            Amenities = r.Amenities.Select(a => new PropertyAmenity { Id = Guid.NewGuid(), Name = a }).ToList()
        };
        await _repo.AddAsync(property, ct);
        return property.ToResponse();
    }

    public async Task<(WriteOutcome Outcome, PropertyResponse? Property)> UpdateAsync(
        Guid id, UpdatePropertyRequest r, Guid userId, CancellationToken ct = default)
    {
        var p = await _repo.GetByIdTrackedAsync(id, ct);
        if (p is null) return (WriteOutcome.NotFound, null);
        if (p.CreatedByUserId != userId) return (WriteOutcome.Forbidden, null);

        p.Title = r.Title;
        p.Description = r.Description;
        p.ListingType = Enum.Parse<ListingType>(r.ListingType, true);
        p.PropertyType = Enum.Parse<PropertyType>(r.PropertyType, true);
        p.Price = r.Price;
        p.AreaSqft = r.AreaSqft;
        p.Bedrooms = r.Bedrooms;
        p.Bathrooms = r.Bathrooms;
        p.IsFurnished = r.IsFurnished;
        p.ParkingAvailable = r.ParkingAvailable;
        p.VastuCompliant = r.VastuCompliant;
        p.Locality = r.Locality;
        p.City = r.City;
        p.State = r.State;
        p.IsFeatured = r.IsFeatured;
        p.OwnerName = r.OwnerName;
        p.OwnerType = Enum.Parse<OwnerType>(r.OwnerType, true);
        p.OwnerPhone = r.OwnerPhone;

        var newImages = r.Images
            .Select((u, i) => new PropertyImage { Id = Guid.NewGuid(), Url = u, SortOrder = i, PropertyId = p.Id })
            .ToList();
        var newAmenities = r.Amenities
            .Select(a => new PropertyAmenity { Id = Guid.NewGuid(), Name = a, PropertyId = p.Id })
            .ToList();

        await _repo.UpdateAsync(p, ct);
        await _repo.ReplaceChildrenAsync(p.Id, newImages, newAmenities, ct);

        // Refresh the response with updated children.
        p.Images = newImages;
        p.Amenities = newAmenities;
        return (WriteOutcome.Updated, p.ToResponse());
    }

    public async Task<WriteOutcome> DeleteAsync(Guid id, Guid userId, CancellationToken ct = default)
    {
        var p = await _repo.GetByIdTrackedAsync(id, ct);
        if (p is null) return WriteOutcome.NotFound;
        if (p.CreatedByUserId != userId) return WriteOutcome.Forbidden;
        await _repo.DeleteAsync(p, ct);
        return WriteOutcome.Deleted;
    }

    public async Task<(WriteOutcome Outcome, PropertyResponse? Property)> AddImageAsync(
        Guid id, string url, Guid userId, CancellationToken ct = default)
    {
        // Load read-only snapshot to check ownership and compute sort order.
        var p = await _repo.GetByIdAsync(id, ct);
        if (p is null) return (WriteOutcome.NotFound, null);
        if (p.CreatedByUserId != userId) return (WriteOutcome.Forbidden, null);

        var nextOrder = p.Images.Count == 0 ? 0 : p.Images.Max(i => i.SortOrder) + 1;
        var image = new PropertyImage { Id = Guid.NewGuid(), Url = url, SortOrder = nextOrder, PropertyId = id };
        await _repo.AppendImageAsync(id, image, ct);

        // Reload to return the up-to-date property with all images.
        var updated = (await _repo.GetByIdAsync(id, ct))!;
        return (WriteOutcome.Updated, updated.ToResponse());
    }
}
