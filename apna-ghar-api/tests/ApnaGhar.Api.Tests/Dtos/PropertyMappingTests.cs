using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Entities;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Dtos;

public class PropertyMappingTests
{
    [Fact]
    public void ToResponseMapsAllFieldsAndOrdersImagesAndAmenities()
    {
        var p = new Property
        {
            Id = Guid.NewGuid(), Title = "T", Description = "D",
            ListingType = ListingType.Buy, PropertyType = PropertyType.Villa,
            Price = 100m, AreaSqft = 10, Bedrooms = 2, Bathrooms = 1,
            City = "Pune", OwnerName = "O", OwnerType = OwnerType.Builder, OwnerPhone = "p",
            PostedAt = DateTime.UtcNow,
            Images =
            {
                new PropertyImage { Url = "/b.jpg", SortOrder = 1 },
                new PropertyImage { Url = "/a.jpg", SortOrder = 0 }
            },
            Amenities = { new PropertyAmenity { Name = "Gym" } }
        };

        var dto = p.ToResponse();

        dto.Id.Should().Be(p.Id);
        dto.ListingType.Should().Be("Buy");
        dto.PropertyType.Should().Be("Villa");
        dto.Owner.Type.Should().Be("Builder");
        dto.Images.Should().Equal("/a.jpg", "/b.jpg"); // ordered by SortOrder
        dto.Amenities.Should().Equal("Gym");
    }
}
