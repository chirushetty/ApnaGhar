using ApnaGhar.Api.Data;
using ApnaGhar.Api.Entities;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ApnaGhar.Api.Tests.Data;

public class DbContextTests
{
    private static ApnaGharDbContext NewContext(SqliteConnection conn)
    {
        var options = new DbContextOptionsBuilder<ApnaGharDbContext>()
            .UseSqlite(conn)
            .Options;
        return new ApnaGharDbContext(options);
    }

    [Fact]
    public void CanRoundTripPropertyWithChildrenAndEnumsAndPrice()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();
        using (var ctx = NewContext(conn))
        {
            ctx.Database.EnsureCreated();
            var user = new User { Id = Guid.NewGuid(), Email = "a@b.com", DisplayName = "A", CreatedAt = DateTime.UtcNow };
            ctx.Users.Add(user);
            ctx.Properties.Add(new Property
            {
                Id = Guid.NewGuid(),
                Title = "Test Villa",
                ListingType = ListingType.Buy,
                PropertyType = PropertyType.Villa,
                OwnerType = OwnerType.Builder,
                Price = 35000000.50m,
                City = "Bangalore",
                CreatedByUserId = user.Id,
                PostedAt = DateTime.UtcNow,
                Images = { new PropertyImage { Id = Guid.NewGuid(), Url = "/u/1.jpg", SortOrder = 0 } },
                Amenities = { new PropertyAmenity { Id = Guid.NewGuid(), Name = "Gym" } }
            });
            ctx.SaveChanges();
        }

        using (var ctx = NewContext(conn))
        {
            var p = ctx.Properties
                .Include(x => x.Images)
                .Include(x => x.Amenities)
                .Single();
            p.ListingType.Should().Be(ListingType.Buy);
            p.PropertyType.Should().Be(PropertyType.Villa);
            p.OwnerType.Should().Be(OwnerType.Builder);
            p.Price.Should().Be(35000000.50m);
            p.Images.Should().ContainSingle();
            p.Amenities.Should().ContainSingle();
        }
    }

    [Fact]
    public void EnumsAreStoredAsStrings()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();
        using var ctx = NewContext(conn);
        ctx.Database.EnsureCreated();
        var user = new User { Id = Guid.NewGuid(), Email = "a@b.com", DisplayName = "A", CreatedAt = DateTime.UtcNow };
        ctx.Users.Add(user);
        ctx.Properties.Add(new Property
        {
            Id = Guid.NewGuid(), Title = "X", City = "Pune",
            ListingType = ListingType.Rent, PropertyType = PropertyType.Apartment, OwnerType = OwnerType.Owner,
            CreatedByUserId = user.Id, PostedAt = DateTime.UtcNow
        });
        ctx.SaveChanges();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT ListingType FROM Properties LIMIT 1";
        var value = (string)cmd.ExecuteScalar()!;
        value.Should().Be("Rent");
    }
}
