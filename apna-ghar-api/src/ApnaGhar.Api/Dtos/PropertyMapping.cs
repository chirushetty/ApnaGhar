using ApnaGhar.Api.Entities;

namespace ApnaGhar.Api.Dtos;

public static class PropertyMapping
{
    public static PropertyResponse ToResponse(this Property p) => new(
        p.Id, p.Title, p.Description,
        p.ListingType.ToString(), p.PropertyType.ToString(),
        p.Price, p.AreaSqft, p.Bedrooms, p.Bathrooms,
        p.IsFurnished, p.ParkingAvailable, p.VastuCompliant,
        p.Locality, p.City, p.State,
        p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
        p.Amenities.Select(a => a.Name).ToList(),
        p.IsFeatured, p.PostedAt,
        new OwnerDto(p.OwnerName, p.OwnerType.ToString(), p.OwnerPhone));

    public static UserDto ToDto(this User u) => new(u.Id, u.Email, u.DisplayName);
}
