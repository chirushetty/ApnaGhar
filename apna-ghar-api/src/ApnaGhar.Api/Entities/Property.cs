namespace ApnaGhar.Api.Entities;

public class Property
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ListingType ListingType { get; set; }
    public PropertyType PropertyType { get; set; }
    public decimal Price { get; set; }
    public int AreaSqft { get; set; }
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public bool IsFurnished { get; set; }
    public bool ParkingAvailable { get; set; }
    public bool VastuCompliant { get; set; }
    public string Locality { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public bool IsFeatured { get; set; }
    public DateTime PostedAt { get; set; }

    // Descriptive lister info (shown to browsers, not a security role)
    public string OwnerName { get; set; } = string.Empty;
    public OwnerType OwnerType { get; set; }
    public string OwnerPhone { get; set; } = string.Empty;

    // Authorization link: who created the listing
    public Guid CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    public ICollection<PropertyImage> Images { get; set; } = new List<PropertyImage>();
    public ICollection<PropertyAmenity> Amenities { get; set; } = new List<PropertyAmenity>();
}
