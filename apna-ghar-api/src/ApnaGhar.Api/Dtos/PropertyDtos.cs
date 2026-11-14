namespace ApnaGhar.Api.Dtos;

public record OwnerDto(string Name, string Type, string Phone);

public record PropertyResponse(
    Guid Id,
    string Title,
    string Description,
    string ListingType,
    string PropertyType,
    decimal Price,
    int AreaSqft,
    int Bedrooms,
    int Bathrooms,
    bool IsFurnished,
    bool ParkingAvailable,
    bool VastuCompliant,
    string Locality,
    string City,
    string State,
    IReadOnlyList<string> Images,
    IReadOnlyList<string> Amenities,
    bool IsFeatured,
    DateTime PostedAt,
    OwnerDto Owner);

public record PropertyListResponse(
    IReadOnlyList<PropertyResponse> Items,
    int Total,
    int Page,
    int PageSize);

public record CreatePropertyRequest(
    string Title,
    string Description,
    string ListingType,
    string PropertyType,
    decimal Price,
    int AreaSqft,
    int Bedrooms,
    int Bathrooms,
    bool IsFurnished,
    bool ParkingAvailable,
    bool VastuCompliant,
    string Locality,
    string City,
    string State,
    bool IsFeatured,
    string OwnerName,
    string OwnerType,
    string OwnerPhone,
    List<string> Amenities,
    List<string> Images);

public record UpdatePropertyRequest(
    string Title,
    string Description,
    string ListingType,
    string PropertyType,
    decimal Price,
    int AreaSqft,
    int Bedrooms,
    int Bathrooms,
    bool IsFurnished,
    bool ParkingAvailable,
    bool VastuCompliant,
    string Locality,
    string City,
    string State,
    bool IsFeatured,
    string OwnerName,
    string OwnerType,
    string OwnerPhone,
    List<string> Amenities,
    List<string> Images);
