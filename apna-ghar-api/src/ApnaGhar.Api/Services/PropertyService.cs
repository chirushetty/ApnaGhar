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
}
