using ApnaGhar.Api.Entities;

namespace ApnaGhar.Api.Data.Seed;

public static class DbSeeder
{
    private static readonly Guid SystemUserId = new("00000000-0000-0000-0000-000000000001");

    private static string Img(string id) =>
        $"https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=1200&q=70";

    public static void Seed(ApnaGharDbContext ctx)
    {
        if (ctx.Properties.Any()) return;

        var system = ctx.Users.FirstOrDefault(u => u.Id == SystemUserId);
        if (system is null)
        {
            system = new User
            {
                Id = SystemUserId,
                Email = "seed@apnaghar.local",
                // Not a login account; placeholder hash, never matches a real password.
                PasswordHash = "SEED-NO-LOGIN",
                DisplayName = "ApnaGhar",
                CreatedAt = DateTime.UtcNow
            };
            ctx.Users.Add(system);
        }

        var now = DateTime.UtcNow;
        Property P(int n, string title, string description, ListingType lt, PropertyType pt,
            decimal price, int area, int bed, int bath, bool furnished, bool parking, bool vastu,
            string locality, string city, string state, bool featured, int daysAgo,
            string ownerName, OwnerType ownerType, string ownerPhone,
            string[] images, string[] amenities) => new()
        {
            Id = new Guid($"00000000-0000-0000-0000-0000000001{n:D2}"),
            Title = title, Description = description, ListingType = lt, PropertyType = pt,
            Price = price, AreaSqft = area, Bedrooms = bed, Bathrooms = bath,
            IsFurnished = furnished, ParkingAvailable = parking, VastuCompliant = vastu,
            Locality = locality, City = city, State = state, IsFeatured = featured,
            PostedAt = now.AddDays(-daysAgo),
            OwnerName = ownerName, OwnerType = ownerType, OwnerPhone = ownerPhone,
            CreatedByUserId = SystemUserId,
            Images = images.Select((u, i) => new PropertyImage { Id = Guid.NewGuid(), Url = u, SortOrder = i }).ToList(),
            Amenities = amenities.Select(a => new PropertyAmenity { Id = Guid.NewGuid(), Name = a }).ToList()
        };

        ctx.Properties.AddRange(
            P(1, "Spacious 4BHK Villa with Private Garden",
                "An elegant east-facing villa in a gated community, featuring a private garden, modular kitchen, and premium Italian-marble flooring. Walking distance to top schools and tech parks. The home enjoys abundant natural light and cross-ventilation throughout the day.",
                ListingType.Buy, PropertyType.Villa, 35000000m, 3200, 4, 4, true, true, true,
                "Whitefield", "Bangalore", "Karnataka", true, 2, "Rohan Mehta", OwnerType.Owner, "+91 98xxxxxx21",
                new[] { Img("1568605114967-8130f3a36994"), Img("1570129477492-45c003edd2be"), Img("1600585154340-be6161a56a0c"), Img("1631679706909-1844bbd07221") },
                new[] { "Swimming Pool", "Clubhouse", "24x7 Security", "Covered Parking", "Landscaped Park", "Gym" }),
            P(2, "Modern 2BHK Apartment near Metro Station",
                "A well-maintained 2BHK in a prime location, just 400m from the metro. Comes semi-furnished with wardrobes and modular kitchen. Ideal for working professionals and small families. Society offers a gym, power backup and round-the-clock security.",
                ListingType.Rent, PropertyType.Apartment, 65000m, 1050, 2, 2, false, true, true,
                "Andheri West", "Mumbai", "Maharashtra", true, 1, "Priya Nair", OwnerType.Owner, "+91 99xxxxxx08",
                new[] { Img("1502672260266-1c1ef2d93688"), Img("1512917774080-9991f1c4c750"), Img("1600607687939-ce8a6c25118c") },
                new[] { "Lift", "Power Backup", "Gym", "24x7 Security", "Covered Parking" }),
            P(3, "Premium 3BHK Apartment in IT Corridor",
                "Brand-new 3BHK in a RERA-approved tower, surrounded by leading IT companies. High-rise unit on the 14th floor with a panoramic city view. Includes covered parking, gas pipeline and a sprawling clubhouse with infinity pool.",
                ListingType.Buy, PropertyType.Apartment, 9500000m, 1480, 3, 3, false, true, true,
                "Hinjewadi", "Pune", "Maharashtra", true, 4, "Suhas Realtors", OwnerType.Builder, "+91 98xxxxxx55",
                new[] { Img("1545324418-cc1a3fa10c00"), Img("1512915922686-57c11dde9b6b"), Img("1493809842364-78817add7ffb") },
                new[] { "Swimming Pool", "Clubhouse", "Gym", "Gas Pipeline", "Children's Play Area", "CCTV Surveillance" }),
            P(4, "Independent 3BHK House with Terrace",
                "A fully furnished independent house in an upscale neighbourhood. Spacious rooms, a private terrace garden and dedicated parking for two cars. Quiet, green street close to malls, hospitals and international schools.",
                ListingType.Rent, PropertyType.House, 85000m, 2100, 3, 3, true, true, false,
                "DLF Phase 3", "Gurugram", "Haryana", false, 6, "Anil Kapoor", OwnerType.Agent, "+91 97xxxxxx12",
                new[] { Img("1605276374104-dee2a0ed3cd6"), Img("1600596542815-ffad4c1539a9"), Img("1600566753190-17f0baa2a6c3") },
                new[] { "Power Backup", "Covered Parking", "24x7 Security", "Landscaped Park" }),
            P(5, "Luxury 4BHK House in Gated Layout",
                "Contemporary 4BHK house with double-height living room, home-office space and a landscaped backyard. Located in a secure layout with parks and a community hall. Vaastu-compliant and ready to move in.",
                ListingType.Buy, PropertyType.House, 18500000m, 2750, 4, 4, false, true, true,
                "Gachibowli", "Hyderabad", "Telangana", true, 9, "Lakshmi Reddy", OwnerType.Owner, "+91 90xxxxxx77",
                new[] { Img("1580587771525-78b9dba3b914"), Img("1564013799919-ab600027ffc6"), Img("1600047509807-ba8f99d2cdde") },
                new[] { "Clubhouse", "24x7 Security", "Covered Parking", "Landscaped Park", "Children's Play Area" }),
            P(6, "Cozy 1BHK Apartment for Bachelors",
                "Compact and affordable 1BHK in the heart of the startup hub. Walkable to cafes, co-working spaces and pubs. Semi-furnished with a fridge, bed and wardrobe. Great for a single professional or a couple.",
                ListingType.Rent, PropertyType.Apartment, 28000m, 620, 1, 1, false, false, false,
                "Koramangala", "Bangalore", "Karnataka", false, 3, "Karthik Rao", OwnerType.Owner, "+91 96xxxxxx34",
                new[] { Img("1605146769289-440113cc3d00"), Img("1502005229762-cf1b2da7c5d6"), Img("1586023492125-27b2c045efd7") },
                new[] { "Lift", "Power Backup", "Wi-Fi Ready", "CCTV Surveillance" }),
            P(7, "Residential Plot in Fast-Growing Suburb",
                "A clear-title, gated residential plot ready for construction. Located in a rapidly developing corridor with wide internal roads, underground drainage and a proposed ring-road connection. Solid long-term investment.",
                ListingType.Buy, PropertyType.Plot, 5500000m, 2400, 0, 0, false, false, true,
                "Wagholi", "Pune", "Maharashtra", false, 14, "Greenfield Estates", OwnerType.Builder, "+91 95xxxxxx90",
                new[] { Img("1502082553048-f009c37129b9"), Img("1486406146926-c627a92ad1ab") },
                new[] { "24x7 Security", "Landscaped Park" }),
            P(8, "Premium Office Space in Business District",
                "A Grade-A commercial office on a high-visibility floor, ideal for corporate headquarters. Fully air-conditioned with dedicated parking, high-speed lifts and 100% power backup. Surrounded by banks, hotels and metro connectivity.",
                ListingType.Rent, PropertyType.Commercial, 250000m, 3500, 0, 2, true, true, true,
                "Bandra Kurla Complex", "Mumbai", "Maharashtra", false, 5, "Metro Commercial LLP", OwnerType.Agent, "+91 93xxxxxx41",
                new[] { Img("1497366754035-f200968a6e72"), Img("1497366811353-6870744d04b2") },
                new[] { "Lift", "Power Backup", "24x7 Security", "Covered Parking", "CCTV Surveillance" }),
            P(9, "Well-Lit 3BHK Apartment with Park View",
                "A sunny 3BHK facing a central park, in a well-established society. Recently repainted with new modular kitchen fittings. Excellent connectivity to the airport and expressway. Family-friendly community with ample green space.",
                ListingType.Buy, PropertyType.Apartment, 12500000m, 1620, 3, 2, false, true, true,
                "Dwarka", "Delhi", "Delhi", true, 7, "Meera Sharma", OwnerType.Owner, "+91 98xxxxxx63",
                new[] { Img("1600585154340-be6161a56a0c"), Img("1600607687939-ce8a6c25118c"), Img("1600566753190-17f0baa2a6c3") },
                new[] { "Lift", "Power Backup", "Gym", "Landscaped Park", "Children's Play Area", "24x7 Security" })
        );

        ctx.SaveChanges();
    }
}
