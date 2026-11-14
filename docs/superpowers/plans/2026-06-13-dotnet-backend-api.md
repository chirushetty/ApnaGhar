# ApnaGhar .NET API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an ASP.NET Core (.NET 10 LTS) Web API for ApnaGhar with full property CRUD, JWT ownership-based auth, and local-disk image uploads, backed by EF Core + SQLite behind a repository abstraction.

**Architecture:** Single Web API project (Approach A) layered by folder: `Controllers → Services → Repositories → EF Core/SQLite`. Controllers and services depend only on repository interfaces, never on `DbContext`, so the storage engine is swappable by config. A sibling xUnit project drives **component tests** through the real HTTP surface via `WebApplicationFactory` against in-memory SQLite.

**Tech Stack:** .NET 10 (LTS), ASP.NET Core, EF Core 10 (SQLite), JWT bearer auth, FluentValidation, Swashbuckle (Swagger), xUnit + `Microsoft.AspNetCore.Mvc.Testing` + FluentAssertions.

**Prerequisite:** The .NET 10 SDK must be installed (the machine currently has only 9.x). Task 0 covers installing and verifying it; all `dotnet` commands below assume the 10.x SDK is active.

**Scope note:** This plan covers the backend API only. Wiring the Next.js frontend to this API is a separate follow-up plan. The API is independently testable (component tests + Swagger).

**Conventions used throughout this plan:**
- All commands run from `C:/AI Projects/project/Apna Ghar/` unless a `cd` is shown.
- Solution lives in `apna-ghar-api/`, sibling to `apna-ghar-frontend/`.
- Money is stored as an integer number of paise (rupees × 100) via an EF value converter, so price filtering/sorting is correct on SQLite (which stores `decimal` as text and sorts it lexicographically). The domain type stays `decimal`.

---

### Task 0: Install and verify the .NET 10 SDK

**Files:** none (environment setup)

- [ ] **Step 1: Install the .NET 10 SDK**

The machine currently has only .NET 9.x. Install the .NET 10 SDK from
<https://dotnet.microsoft.com/download/dotnet/10.0> (or `winget install Microsoft.DotNet.SDK.10`).
This is an interactive/manual step — if running in a session, suggest the user run it
themselves (e.g. type `! winget install Microsoft.DotNet.SDK.10` in the prompt).

- [ ] **Step 2: Verify the SDK is active**

Run: `dotnet --list-sdks`
Expected: a `10.0.xxx` entry appears alongside the 9.x entries.

Run: `dotnet --version`
Expected: reports a `10.0.xxx` version. If it still reports `9.x`, the 10 SDK isn't on
PATH or a `global.json` is pinning 9 — resolve before continuing (no `global.json` should
exist in this repo yet).

---

### Task 1: Scaffold solution, projects, and packages

**Files:**
- Create: `apna-ghar-api/ApnaGhar.sln`
- Create: `apna-ghar-api/src/ApnaGhar.Api/ApnaGhar.Api.csproj`
- Create: `apna-ghar-api/tests/ApnaGhar.Api.Tests/ApnaGhar.Api.Tests.csproj`
- Create: `apna-ghar-api/.gitignore`

- [ ] **Step 1: Create the solution and projects**

Run:
```bash
cd "C:/AI Projects/project/Apna Ghar"
mkdir -p apna-ghar-api && cd apna-ghar-api
dotnet new sln -n ApnaGhar
dotnet new webapi --use-controllers -n ApnaGhar.Api -o src/ApnaGhar.Api
dotnet new xunit -n ApnaGhar.Api.Tests -o tests/ApnaGhar.Api.Tests
dotnet sln add src/ApnaGhar.Api/ApnaGhar.Api.csproj
dotnet sln add tests/ApnaGhar.Api.Tests/ApnaGhar.Api.Tests.csproj
dotnet add tests/ApnaGhar.Api.Tests/ApnaGhar.Api.Tests.csproj reference src/ApnaGhar.Api/ApnaGhar.Api.csproj
```

- [ ] **Step 2: Add API packages**

Run:
```bash
cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api"
dotnet add src/ApnaGhar.Api package Microsoft.EntityFrameworkCore.Sqlite
dotnet add src/ApnaGhar.Api package Microsoft.EntityFrameworkCore.Design
dotnet add src/ApnaGhar.Api package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add src/ApnaGhar.Api package FluentValidation.AspNetCore
dotnet add src/ApnaGhar.Api package Swashbuckle.AspNetCore
```

- [ ] **Step 3: Add test packages**

Run:
```bash
cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api"
dotnet add tests/ApnaGhar.Api.Tests package Microsoft.AspNetCore.Mvc.Testing
dotnet add tests/ApnaGhar.Api.Tests package Microsoft.EntityFrameworkCore.Sqlite
dotnet add tests/ApnaGhar.Api.Tests package FluentAssertions
```

- [ ] **Step 4: Create `.gitignore`**

Create `apna-ghar-api/.gitignore`:
```gitignore
bin/
obj/
*.db
*.db-shm
*.db-wal
appsettings.Development.json
.vs/
```

- [ ] **Step 5: Build and verify the target framework is net10.0**

With the .NET 10 SDK active, `dotnet new` scaffolds `net10.0` by default. Confirm both
`.csproj` files contain `<TargetFramework>net10.0</TargetFramework>`; if either shows
`net9.0`, edit it to `net10.0`.

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet build`
Expected: `Build succeeded` with 0 errors. The `dotnet add package` commands in Steps 2–3
resolve EF Core / JWT / FluentValidation to their latest 10.x lines automatically.

- [ ] **Step 6: Remove the template's WeatherForecast files**

Delete `src/ApnaGhar.Api/Controllers/WeatherForecastController.cs` and `src/ApnaGhar.Api/WeatherForecast.cs` if present.

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet build`
Expected: `Build succeeded`.

- [ ] **Step 7: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "chore: scaffold ApnaGhar .NET API solution"
```

---

### Task 2: Domain entities and enums

**Files:**
- Create: `src/ApnaGhar.Api/Entities/Enums.cs`
- Create: `src/ApnaGhar.Api/Entities/User.cs`
- Create: `src/ApnaGhar.Api/Entities/Property.cs`
- Create: `src/ApnaGhar.Api/Entities/PropertyImage.cs`
- Create: `src/ApnaGhar.Api/Entities/PropertyAmenity.cs`

These are plain POCOs — no test of their own; they are exercised by the DbContext test in Task 3.

- [ ] **Step 1: Create the enums**

Create `src/ApnaGhar.Api/Entities/Enums.cs`:
```csharp
namespace ApnaGhar.Api.Entities;

public enum ListingType
{
    Rent,
    Buy
}

public enum PropertyType
{
    Apartment,
    House,
    Villa,
    Plot,
    Commercial
}

public enum OwnerType
{
    Owner,
    Agent,
    Builder
}
```

- [ ] **Step 2: Create the `User` entity**

Create `src/ApnaGhar.Api/Entities/User.cs`:
```csharp
namespace ApnaGhar.Api.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public ICollection<Property> Properties { get; set; } = new List<Property>();
}
```

- [ ] **Step 3: Create the `Property` entity**

Create `src/ApnaGhar.Api/Entities/Property.cs`:
```csharp
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
```

- [ ] **Step 4: Create the child entities**

Create `src/ApnaGhar.Api/Entities/PropertyImage.cs`:
```csharp
namespace ApnaGhar.Api.Entities;

public class PropertyImage
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public Property? Property { get; set; }
    public string Url { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
```

Create `src/ApnaGhar.Api/Entities/PropertyAmenity.cs`:
```csharp
namespace ApnaGhar.Api.Entities;

public class PropertyAmenity
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public Property? Property { get; set; }
    public string Name { get; set; } = string.Empty;
}
```

- [ ] **Step 5: Build**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet build`
Expected: `Build succeeded`.

- [ ] **Step 6: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api/src/ApnaGhar.Api/Entities
git commit -m "feat: add domain entities and enums"
```

---

### Task 3: DbContext with model configuration

**Files:**
- Create: `src/ApnaGhar.Api/Data/ApnaGharDbContext.cs`
- Test: `tests/ApnaGhar.Api.Tests/Data/DbContextTests.cs`

- [ ] **Step 1: Write the failing test**

Create `tests/ApnaGhar.Api.Tests/Data/DbContextTests.cs`:
```csharp
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter DbContextTests`
Expected: FAIL — `ApnaGharDbContext` does not exist (compile error).

- [ ] **Step 3: Implement the DbContext**

Create `src/ApnaGhar.Api/Data/ApnaGharDbContext.cs`:
```csharp
using ApnaGhar.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ApnaGhar.Api.Data;

public class ApnaGharDbContext : DbContext
{
    public ApnaGharDbContext(DbContextOptions<ApnaGharDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<PropertyImage> PropertyImages => Set<PropertyImage>();
    public DbSet<PropertyAmenity> PropertyAmenities => Set<PropertyAmenity>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).IsRequired().HasMaxLength(256);
            e.Property(u => u.DisplayName).IsRequired().HasMaxLength(120);
            e.Property(u => u.PasswordHash).IsRequired();
        });

        b.Entity<Property>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Title).IsRequired().HasMaxLength(200);
            e.Property(p => p.ListingType).HasConversion<string>().HasMaxLength(20);
            e.Property(p => p.PropertyType).HasConversion<string>().HasMaxLength(20);
            e.Property(p => p.OwnerType).HasConversion<string>().HasMaxLength(20);

            // Store money as integer paise so SQLite sorts/compares correctly.
            e.Property(p => p.Price)
                .HasConversion(v => (long)Math.Round(v * 100m), v => v / 100m);

            e.HasOne(p => p.CreatedByUser)
                .WithMany(u => u.Properties)
                .HasForeignKey(p => p.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(p => p.Images)
                .WithOne(i => i.Property!)
                .HasForeignKey(i => i.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(p => p.Amenities)
                .WithOne(a => a.Property!)
                .HasForeignKey(a => a.PropertyId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter DbContextTests`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add ApnaGharDbContext with enum/price configuration"
```

---

### Task 4: Seed data (system user + 9 properties + reference lists)

**Files:**
- Create: `src/ApnaGhar.Api/Data/Seed/ReferenceData.cs`
- Create: `src/ApnaGhar.Api/Data/Seed/DbSeeder.cs`
- Test: `tests/ApnaGhar.Api.Tests/Data/DbSeederTests.cs`

The 9 properties are ported from `apna-ghar-frontend/src/lib/mock-data.ts`. Image URLs are the same Unsplash URLs.

- [ ] **Step 1: Write the failing test**

Create `tests/ApnaGhar.Api.Tests/Data/DbSeederTests.cs`:
```csharp
using ApnaGhar.Api.Data;
using ApnaGhar.Api.Data.Seed;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ApnaGhar.Api.Tests.Data;

public class DbSeederTests
{
    private static ApnaGharDbContext NewContext(SqliteConnection conn) =>
        new(new DbContextOptionsBuilder<ApnaGharDbContext>().UseSqlite(conn).Options);

    [Fact]
    public void SeedPopulatesNinePropertiesAndIsIdempotent()
    {
        using var conn = new SqliteConnection("DataSource=:memory:");
        conn.Open();
        using var ctx = NewContext(conn);
        ctx.Database.EnsureCreated();

        DbSeeder.Seed(ctx);
        DbSeeder.Seed(ctx); // second call must not duplicate

        ctx.Properties.Count().Should().Be(9);
        ctx.Users.Count().Should().Be(1);
        ctx.Properties.Where(p => p.IsFeatured).Should().HaveCountGreaterThan(0);
        ctx.PropertyImages.Count().Should().BeGreaterThan(9);
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter DbSeederTests`
Expected: FAIL — `DbSeeder` does not exist.

- [ ] **Step 3: Create the reference data**

Create `src/ApnaGhar.Api/Data/Seed/ReferenceData.cs`:
```csharp
namespace ApnaGhar.Api.Data.Seed;

public static class ReferenceData
{
    public static readonly string[] Amenities =
    {
        "Lift", "Power Backup", "Gym", "Swimming Pool", "Clubhouse", "24x7 Security",
        "Covered Parking", "Landscaped Park", "Gas Pipeline", "Children's Play Area",
        "CCTV Surveillance", "Wi-Fi Ready"
    };

    public static readonly string[] PopularCities =
    {
        "Mumbai", "Bangalore", "Pune", "Gurugram", "Hyderabad", "Delhi"
    };
}
```

- [ ] **Step 4: Implement the seeder**

Create `src/ApnaGhar.Api/Data/Seed/DbSeeder.cs`. Port all 9 properties from `apna-ghar-frontend/src/lib/mock-data.ts`. `PostedAt` is derived from the mock `postedDaysAgo` relative to now. Use deterministic GUIDs so re-seeding is stable.
```csharp
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter DbSeederTests`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add idempotent seed data ported from frontend mock-data"
```

---

### Task 5: DTOs and mapping

**Files:**
- Create: `src/ApnaGhar.Api/Dtos/PropertyDtos.cs`
- Create: `src/ApnaGhar.Api/Dtos/AuthDtos.cs`
- Create: `src/ApnaGhar.Api/Dtos/PropertyMapping.cs`
- Test: `tests/ApnaGhar.Api.Tests/Dtos/PropertyMappingTests.cs`

- [ ] **Step 1: Write the failing test**

Create `tests/ApnaGhar.Api.Tests/Dtos/PropertyMappingTests.cs`:
```csharp
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter PropertyMappingTests`
Expected: FAIL — DTO types do not exist.

- [ ] **Step 3: Create the DTOs**

Create `src/ApnaGhar.Api/Dtos/PropertyDtos.cs`:
```csharp
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
```

Create `src/ApnaGhar.Api/Dtos/AuthDtos.cs`:
```csharp
namespace ApnaGhar.Api.Dtos;

public record RegisterRequest(string Email, string Password, string DisplayName);
public record LoginRequest(string Email, string Password);
public record UserDto(Guid Id, string Email, string DisplayName);
public record AuthResponse(string Token, UserDto User);
```

- [ ] **Step 4: Create the mapping helpers**

Create `src/ApnaGhar.Api/Dtos/PropertyMapping.cs`:
```csharp
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter PropertyMappingTests`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add request/response DTOs and entity mapping"
```

---

### Task 6: Property query model and repository

**Files:**
- Create: `src/ApnaGhar.Api/Data/Repositories/PropertyQuery.cs`
- Create: `src/ApnaGhar.Api/Data/Repositories/IPropertyRepository.cs`
- Create: `src/ApnaGhar.Api/Data/Repositories/EfPropertyRepository.cs`
- Create: `src/ApnaGhar.Api/Data/Repositories/IUserRepository.cs`
- Create: `src/ApnaGhar.Api/Data/Repositories/EfUserRepository.cs`
- Test: `tests/ApnaGhar.Api.Tests/Data/PropertyRepositoryTests.cs`

The repository holds all filtering/sorting/paging. Search uses lowercase normalization so it behaves identically across engines (the SQLite-vs-Postgres `LIKE` casing gotcha from the spec).

- [ ] **Step 1: Write the failing test**

Create `tests/ApnaGhar.Api.Tests/Data/PropertyRepositoryTests.cs`:
```csharp
using ApnaGhar.Api.Data;
using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Data.Seed;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ApnaGhar.Api.Tests.Data;

public class PropertyRepositoryTests : IDisposable
{
    private readonly SqliteConnection _conn;
    private readonly ApnaGharDbContext _ctx;
    private readonly EfPropertyRepository _repo;

    public PropertyRepositoryTests()
    {
        _conn = new SqliteConnection("DataSource=:memory:");
        _conn.Open();
        _ctx = new ApnaGharDbContext(
            new DbContextOptionsBuilder<ApnaGharDbContext>().UseSqlite(_conn).Options);
        _ctx.Database.EnsureCreated();
        DbSeeder.Seed(_ctx);
        _repo = new EfPropertyRepository(_ctx);
    }

    public void Dispose() { _ctx.Dispose(); _conn.Dispose(); }

    [Fact]
    public async Task FiltersByCityCaseInsensitively()
    {
        var result = await _repo.QueryAsync(new PropertyQuery { City = "bangalore" });
        result.Total.Should().Be(2);
        result.Items.Should().OnlyContain(p => p.City == "Bangalore");
    }

    [Fact]
    public async Task FiltersByPriceRangeCorrectlyOnSqlite()
    {
        var result = await _repo.QueryAsync(new PropertyQuery { MaxPrice = 100000m });
        result.Items.Should().OnlyContain(p => p.Price <= 100000m);
        result.Items.Should().NotBeEmpty();
    }

    [Fact]
    public async Task SortsByPriceAscending()
    {
        var result = await _repo.QueryAsync(new PropertyQuery { Sort = "price_asc", PageSize = 100 });
        var prices = result.Items.Select(p => p.Price).ToList();
        prices.Should().BeInAscendingOrder();
    }

    [Fact]
    public async Task SearchMatchesTitleOrLocality()
    {
        var result = await _repo.QueryAsync(new PropertyQuery { Search = "villa" });
        result.Items.Should().Contain(p => p.Title.Contains("Villa"));
    }

    [Fact]
    public async Task PagesResults()
    {
        var result = await _repo.QueryAsync(new PropertyQuery { Page = 1, PageSize = 4 });
        result.Items.Should().HaveCount(4);
        result.Total.Should().Be(9);
    }

    [Fact]
    public async Task GetByIdIncludesImagesAndAmenities()
    {
        var first = (await _repo.QueryAsync(new PropertyQuery())).Items.First();
        var loaded = await _repo.GetByIdAsync(first.Id);
        loaded!.Images.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetSimilarReturnsSameCityExcludingSelfCappedAtThree()
    {
        var all = (await _repo.QueryAsync(new PropertyQuery { City = "Mumbai", PageSize = 100 })).Items;
        var seed = all.First();
        var similar = await _repo.GetSimilarAsync(seed.Id);
        similar.Should().OnlyContain(p => p.City == "Mumbai" && p.Id != seed.Id);
        similar.Count.Should().BeLessThanOrEqualTo(3);
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter PropertyRepositoryTests`
Expected: FAIL — repository types do not exist.

- [ ] **Step 3: Create the query model**

Create `src/ApnaGhar.Api/Data/Repositories/PropertyQuery.cs`:
```csharp
namespace ApnaGhar.Api.Data.Repositories;

public class PropertyQuery
{
    public string? ListingType { get; set; }
    public string? City { get; set; }
    public string? PropertyType { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? Bedrooms { get; set; }
    public bool? Furnished { get; set; }
    public string? Search { get; set; }
    public string? Sort { get; set; } // price_asc | price_desc | newest (default)
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
    public int Total { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
}
```

- [ ] **Step 4: Create the repository interfaces**

Create `src/ApnaGhar.Api/Data/Repositories/IPropertyRepository.cs`:
```csharp
using ApnaGhar.Api.Entities;

namespace ApnaGhar.Api.Data.Repositories;

public interface IPropertyRepository
{
    Task<PagedResult<Property>> QueryAsync(PropertyQuery query, CancellationToken ct = default);
    Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Property>> GetFeaturedAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Property>> GetSimilarAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Property property, CancellationToken ct = default);
    Task UpdateAsync(Property property, CancellationToken ct = default);
    Task DeleteAsync(Property property, CancellationToken ct = default);
}
```

Create `src/ApnaGhar.Api/Data/Repositories/IUserRepository.cs`:
```csharp
using ApnaGhar.Api.Entities;

namespace ApnaGhar.Api.Data.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
}
```

- [ ] **Step 5: Implement the EF repositories**

Create `src/ApnaGhar.Api/Data/Repositories/EfPropertyRepository.cs`:
```csharp
using ApnaGhar.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ApnaGhar.Api.Data.Repositories;

public class EfPropertyRepository : IPropertyRepository
{
    private readonly ApnaGharDbContext _ctx;
    public EfPropertyRepository(ApnaGharDbContext ctx) => _ctx = ctx;

    public async Task<PagedResult<Property>> QueryAsync(PropertyQuery q, CancellationToken ct = default)
    {
        IQueryable<Property> query = _ctx.Properties
            .Include(p => p.Images)
            .Include(p => p.Amenities)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q.ListingType) &&
            Enum.TryParse<ListingType>(q.ListingType, true, out var lt))
            query = query.Where(p => p.ListingType == lt);

        if (!string.IsNullOrWhiteSpace(q.PropertyType) &&
            Enum.TryParse<PropertyType>(q.PropertyType, true, out var pt))
            query = query.Where(p => p.PropertyType == pt);

        if (!string.IsNullOrWhiteSpace(q.City))
        {
            var city = q.City.ToLower();
            query = query.Where(p => p.City.ToLower() == city);
        }

        if (q.MinPrice is { } min) query = query.Where(p => p.Price >= min);
        if (q.MaxPrice is { } max) query = query.Where(p => p.Price <= max);
        if (q.Bedrooms is { } beds) query = query.Where(p => p.Bedrooms >= beds);
        if (q.Furnished is { } furnished) query = query.Where(p => p.IsFurnished == furnished);

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.ToLower();
            query = query.Where(p =>
                p.Title.ToLower().Contains(s) || p.Locality.ToLower().Contains(s));
        }

        query = q.Sort switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            _ => query.OrderByDescending(p => p.PostedAt)
        };

        var total = await query.CountAsync(ct);
        var page = q.Page < 1 ? 1 : q.Page;
        var size = q.PageSize is < 1 or > 100 ? 12 : q.PageSize;

        var items = await query
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(ct);

        return new PagedResult<Property>
        {
            Items = items, Total = total, Page = page, PageSize = size
        };
    }

    public Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _ctx.Properties
            .Include(p => p.Images)
            .Include(p => p.Amenities)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IReadOnlyList<Property>> GetFeaturedAsync(CancellationToken ct = default) =>
        await _ctx.Properties
            .Include(p => p.Images)
            .Include(p => p.Amenities)
            .AsNoTracking()
            .Where(p => p.IsFeatured)
            .OrderByDescending(p => p.PostedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Property>> GetSimilarAsync(Guid id, CancellationToken ct = default)
    {
        var current = await _ctx.Properties.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, ct);
        if (current is null) return Array.Empty<Property>();
        return await _ctx.Properties
            .Include(p => p.Images)
            .Include(p => p.Amenities)
            .AsNoTracking()
            .Where(p => p.City == current.City && p.Id != id)
            .Take(3)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Property property, CancellationToken ct = default)
    {
        _ctx.Properties.Add(property);
        await _ctx.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Property property, CancellationToken ct = default)
    {
        _ctx.Properties.Update(property);
        await _ctx.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Property property, CancellationToken ct = default)
    {
        _ctx.Properties.Remove(property);
        await _ctx.SaveChangesAsync(ct);
    }
}
```

Create `src/ApnaGhar.Api/Data/Repositories/EfUserRepository.cs`:
```csharp
using ApnaGhar.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ApnaGhar.Api.Data.Repositories;

public class EfUserRepository : IUserRepository
{
    private readonly ApnaGharDbContext _ctx;
    public EfUserRepository(ApnaGharDbContext ctx) => _ctx = ctx;

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        _ctx.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower(), ct);

    public Task<bool> EmailExistsAsync(string email, CancellationToken ct = default) =>
        _ctx.Users.AnyAsync(u => u.Email == email.ToLower(), ct);

    public async Task AddAsync(User user, CancellationToken ct = default)
    {
        _ctx.Users.Add(user);
        await _ctx.SaveChangesAsync(ct);
    }
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter PropertyRepositoryTests`
Expected: PASS (7 tests).

- [ ] **Step 7: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add property/user repositories with filtering, sorting, paging"
```

---

### Task 7: Wire up Program.cs (EF, DI, Swagger, static files, seeding)

**Files:**
- Modify: `src/ApnaGhar.Api/Program.cs`
- Modify: `src/ApnaGhar.Api/appsettings.json`

This task makes the app bootable with the DB and DI registered. Auth wiring is added in Task 9. No automated test here; verified by running.

- [ ] **Step 1: Replace `appsettings.json`**

Replace `src/ApnaGhar.Api/appsettings.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "DatabaseProvider": "Sqlite",
  "ConnectionStrings": {
    "Default": "Data Source=apnaghar.db"
  },
  "Cors": {
    "AllowedOrigins": [ "http://localhost:3000", "http://localhost:3001" ]
  },
  "Jwt": {
    "Issuer": "ApnaGhar",
    "Audience": "ApnaGharClient",
    "ExpiryMinutes": 1440
  }
}
```

(The JWT signing key is supplied via user-secrets in Task 8, not committed.)

- [ ] **Step 2: Replace `Program.cs`**

Replace `src/ApnaGhar.Api/Program.cs`:
```csharp
using ApnaGhar.Api.Data;
using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Data.Seed;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var provider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
var connectionString = builder.Configuration.GetConnectionString("Default");

builder.Services.AddDbContext<ApnaGharDbContext>(options =>
{
    switch (provider)
    {
        case "Sqlite":
            options.UseSqlite(connectionString);
            break;
        default:
            throw new InvalidOperationException($"Unsupported DatabaseProvider '{provider}'.");
    }
});

builder.Services.AddScoped<IPropertyRepository, EfPropertyRepository>();
builder.Services.AddScoped<IUserRepository, EfUserRepository>();

var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                  ?? Array.Empty<string>();
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply migrations + seed on startup.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApnaGharDbContext>();
    db.Database.Migrate();
    DbSeeder.Seed(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(); // serves wwwroot/uploads
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { } // exposed for WebApplicationFactory in tests
```

- [ ] **Step 3: Create the initial migration**

Run:
```bash
cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api"
dotnet ef migrations add InitialCreate --project src/ApnaGhar.Api --startup-project src/ApnaGhar.Api
```
Expected: a `Migrations/` folder is created under `src/ApnaGhar.Api`.

- [ ] **Step 4: Run the app to verify it boots and seeds**

Run (background, then stop after checking): `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet run --project src/ApnaGhar.Api`
Expected: app starts, logs show it listening on a localhost port, no exceptions. An `apnaghar.db` file is created. Stop the app.

- [ ] **Step 5: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: wire up EF, DI, CORS, Swagger, startup migration + seeding"
```

---

### Task 8: Component-test harness + read endpoints

**Files:**
- Create: `src/ApnaGhar.Api/Services/IPropertyService.cs`
- Create: `src/ApnaGhar.Api/Services/PropertyService.cs`
- Create: `src/ApnaGhar.Api/Controllers/PropertiesController.cs`
- Modify: `src/ApnaGhar.Api/Program.cs` (register `IPropertyService`)
- Create: `tests/ApnaGhar.Api.Tests/Infrastructure/ApiFactory.cs`
- Test: `tests/ApnaGhar.Api.Tests/Api/PropertiesReadTests.cs`

- [ ] **Step 1: Create the component-test factory**

This factory swaps the real SQLite file for a shared in-memory SQLite connection that lives for the factory's lifetime, then ensures schema + seed.

Create `tests/ApnaGhar.Api.Tests/Infrastructure/ApiFactory.cs`:
```csharp
using ApnaGhar.Api.Data;
using ApnaGhar.Api.Data.Seed;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ApnaGhar.Api.Tests.Infrastructure;

public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _conn = new("DataSource=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        _conn.Open();

        builder.ConfigureServices(services =>
        {
            // Remove the app's DbContext registration and replace with in-memory SQLite.
            var descriptor = services.Single(
                d => d.ServiceType == typeof(DbContextOptions<ApnaGharDbContext>));
            services.Remove(descriptor);

            services.AddDbContext<ApnaGharDbContext>(o => o.UseSqlite(_conn));
        });

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "test-signing-key-at-least-32-bytes-long-xx"
            });
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _conn.Dispose();
    }
}
```

Note on schema creation in tests: `Program.cs` calls `db.Database.Migrate()` on startup,
which runs against the shared in-memory connection and creates the schema. Because the
factory holds `_conn` open for its whole lifetime, that schema persists across requests
within a test class (`IClassFixture<ApiFactory>` shares one factory instance). No
`EnsureCreated()` is needed in the test classes. If a future change makes startup skip
`Migrate()`, add an `EnsureCreated()` call in a factory bootstrap scope instead.

- [ ] **Step 2: Write the failing read tests**

Create `tests/ApnaGhar.Api.Tests/Api/PropertiesReadTests.cs`:
```csharp
using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class PropertiesReadTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    public PropertiesReadTests(ApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task GetProperties_ReturnsSeededPagedList()
    {
        var res = await _client.GetFromJsonAsync<PropertyListResponse>("/api/properties");
        res.Should().NotBeNull();
        res!.Total.Should().Be(9);
        res.Items.Should().NotBeEmpty();
    }

    [Fact]
    public async Task GetProperties_FiltersByCity()
    {
        var res = await _client.GetFromJsonAsync<PropertyListResponse>("/api/properties?city=Bangalore");
        res!.Items.Should().OnlyContain(p => p.City == "Bangalore");
    }

    [Fact]
    public async Task GetFeatured_ReturnsOnlyFeatured()
    {
        var res = await _client.GetFromJsonAsync<List<PropertyResponse>>("/api/properties/featured");
        res.Should().OnlyContain(p => p.IsFeatured);
    }

    [Fact]
    public async Task GetById_ReturnsProperty()
    {
        var list = await _client.GetFromJsonAsync<PropertyListResponse>("/api/properties");
        var id = list!.Items.First().Id;
        var res = await _client.GetAsync($"/api/properties/{id}");
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var dto = await res.Content.ReadFromJsonAsync<PropertyResponse>();
        dto!.Id.Should().Be(id);
    }

    [Fact]
    public async Task GetById_Returns404ForUnknownId()
    {
        var res = await _client.GetAsync($"/api/properties/{Guid.NewGuid()}");
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetSimilar_ReturnsSameCity()
    {
        var list = await _client.GetFromJsonAsync<PropertyListResponse>("/api/properties?city=Mumbai");
        var id = list!.Items.First().Id;
        var res = await _client.GetFromJsonAsync<List<PropertyResponse>>($"/api/properties/{id}/similar");
        res.Should().OnlyContain(p => p.City == "Mumbai" && p.Id != id);
    }
}
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter PropertiesReadTests`
Expected: FAIL — controller/service do not exist (404s or compile error).

- [ ] **Step 4: Create the service**

Create `src/ApnaGhar.Api/Services/IPropertyService.cs`:
```csharp
using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Dtos;

namespace ApnaGhar.Api.Services;

public interface IPropertyService
{
    Task<PropertyListResponse> ListAsync(PropertyQuery query, CancellationToken ct = default);
    Task<PropertyResponse?> GetAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<PropertyResponse>> GetFeaturedAsync(CancellationToken ct = default);
    Task<IReadOnlyList<PropertyResponse>> GetSimilarAsync(Guid id, CancellationToken ct = default);
}
```

Create `src/ApnaGhar.Api/Services/PropertyService.cs`:
```csharp
using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Dtos;

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
}
```

- [ ] **Step 5: Create the read controller**

Create `src/ApnaGhar.Api/Controllers/PropertiesController.cs`:
```csharp
using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApnaGhar.Api.Controllers;

[ApiController]
[Route("api/properties")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService _service;
    public PropertiesController(IPropertyService service) => _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PropertyListResponse>> List(
        [FromQuery] PropertyQuery query, CancellationToken ct) =>
        Ok(await _service.ListAsync(query, ct));

    [HttpGet("featured")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<PropertyResponse>>> Featured(CancellationToken ct) =>
        Ok(await _service.GetFeaturedAsync(ct));

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<PropertyResponse>> GetById(Guid id, CancellationToken ct)
    {
        var p = await _service.GetAsync(id, ct);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpGet("{id:guid}/similar")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<PropertyResponse>>> Similar(Guid id, CancellationToken ct) =>
        Ok(await _service.GetSimilarAsync(id, ct));
}
```

- [ ] **Step 6: Register the service in `Program.cs`**

In `src/ApnaGhar.Api/Program.cs`, immediately after the `AddScoped<IUserRepository, EfUserRepository>();` line, add:
```csharp
builder.Services.AddScoped<ApnaGhar.Api.Services.IPropertyService, ApnaGhar.Api.Services.PropertyService>();
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter PropertiesReadTests`
Expected: PASS (6 tests).

- [ ] **Step 8: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add read endpoints with component-test harness"
```

---

### Task 9: Meta endpoints (amenities, cities)

**Files:**
- Create: `src/ApnaGhar.Api/Controllers/MetaController.cs`
- Test: `tests/ApnaGhar.Api.Tests/Api/MetaTests.cs`

- [ ] **Step 1: Write the failing test**

Create `tests/ApnaGhar.Api.Tests/Api/MetaTests.cs`:
```csharp
using System.Net.Http.Json;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class MetaTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    public MetaTests(ApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task GetAmenities_ReturnsList()
    {
        var res = await _client.GetFromJsonAsync<List<string>>("/api/meta/amenities");
        res.Should().Contain("Gym").And.Contain("Lift");
    }

    [Fact]
    public async Task GetCities_ReturnsList()
    {
        var res = await _client.GetFromJsonAsync<List<string>>("/api/meta/cities");
        res.Should().Contain("Mumbai").And.Contain("Bangalore");
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter MetaTests`
Expected: FAIL — 404 (controller missing).

- [ ] **Step 3: Create the controller**

Create `src/ApnaGhar.Api/Controllers/MetaController.cs`:
```csharp
using ApnaGhar.Api.Data.Seed;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApnaGhar.Api.Controllers;

[ApiController]
[Route("api/meta")]
[AllowAnonymous]
public class MetaController : ControllerBase
{
    [HttpGet("amenities")]
    public ActionResult<IEnumerable<string>> Amenities() => Ok(ReferenceData.Amenities);

    [HttpGet("cities")]
    public ActionResult<IEnumerable<string>> Cities() => Ok(ReferenceData.PopularCities);
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter MetaTests`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add meta endpoints for amenities and cities"
```

---

### Task 10: Authentication (register, login, JWT)

**Files:**
- Create: `src/ApnaGhar.Api/Auth/JwtOptions.cs`
- Create: `src/ApnaGhar.Api/Auth/ITokenService.cs`
- Create: `src/ApnaGhar.Api/Auth/TokenService.cs`
- Create: `src/ApnaGhar.Api/Auth/ICurrentUser.cs`
- Create: `src/ApnaGhar.Api/Auth/CurrentUser.cs`
- Create: `src/ApnaGhar.Api/Services/IAuthService.cs`
- Create: `src/ApnaGhar.Api/Services/AuthService.cs`
- Create: `src/ApnaGhar.Api/Controllers/AuthController.cs`
- Modify: `src/ApnaGhar.Api/Program.cs` (JWT auth, DI)
- Test: `tests/ApnaGhar.Api.Tests/Api/AuthTests.cs`

- [ ] **Step 1: Write the failing test**

Create `tests/ApnaGhar.Api.Tests/Api/AuthTests.cs`:
```csharp
using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class AuthTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    public AuthTests(ApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Register_ThenLogin_ReturnsToken()
    {
        var email = $"u{Guid.NewGuid():N}@b.com";
        var reg = await _client.PostAsJsonAsync("/api/auth/register",
            new RegisterRequest(email, "Passw0rd!", "Test User"));
        reg.StatusCode.Should().Be(HttpStatusCode.OK);
        var regBody = await reg.Content.ReadFromJsonAsync<AuthResponse>();
        regBody!.Token.Should().NotBeNullOrWhiteSpace();
        regBody.User.Email.Should().Be(email);

        var login = await _client.PostAsJsonAsync("/api/auth/login",
            new LoginRequest(email, "Passw0rd!"));
        login.StatusCode.Should().Be(HttpStatusCode.OK);
        var loginBody = await login.Content.ReadFromJsonAsync<AuthResponse>();
        loginBody!.Token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns409()
    {
        var email = $"u{Guid.NewGuid():N}@b.com";
        await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Passw0rd!", "A"));
        var second = await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Passw0rd!", "B"));
        second.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        var email = $"u{Guid.NewGuid():N}@b.com";
        await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, "Passw0rd!", "A"));
        var login = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest(email, "wrong"));
        login.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter AuthTests`
Expected: FAIL — auth endpoints/types do not exist.

- [ ] **Step 3: Create JWT options and token service**

Create `src/ApnaGhar.Api/Auth/JwtOptions.cs`:
```csharp
namespace ApnaGhar.Api.Auth;

public class JwtOptions
{
    public string Issuer { get; set; } = "ApnaGhar";
    public string Audience { get; set; } = "ApnaGharClient";
    public string Key { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 1440;
}
```

Create `src/ApnaGhar.Api/Auth/ITokenService.cs`:
```csharp
using ApnaGhar.Api.Entities;

namespace ApnaGhar.Api.Auth;

public interface ITokenService
{
    string CreateToken(User user);
}
```

Create `src/ApnaGhar.Api/Auth/TokenService.cs`:
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ApnaGhar.Api.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ApnaGhar.Api.Auth;

public class TokenService : ITokenService
{
    private readonly JwtOptions _opt;
    public TokenService(IOptions<JwtOptions> opt) => _opt = opt.Value;

    public string CreateToken(User user)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("name", user.DisplayName)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _opt.Issuer,
            audience: _opt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_opt.ExpiryMinutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

- [ ] **Step 4: Create the current-user accessor**

Create `src/ApnaGhar.Api/Auth/ICurrentUser.cs`:
```csharp
namespace ApnaGhar.Api.Auth;

public interface ICurrentUser
{
    Guid? Id { get; }
}
```

Create `src/ApnaGhar.Api/Auth/CurrentUser.cs`:
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace ApnaGhar.Api.Auth;

public class CurrentUser : ICurrentUser
{
    public Guid? Id { get; }

    public CurrentUser(IHttpContextAccessor accessor)
    {
        var sub = accessor.HttpContext?.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(sub, out var id)) Id = id;
    }
}
```

- [ ] **Step 5: Create the auth service**

Create `src/ApnaGhar.Api/Services/IAuthService.cs`:
```csharp
using ApnaGhar.Api.Dtos;

namespace ApnaGhar.Api.Services;

public enum AuthResult { Success, EmailTaken, InvalidCredentials }

public record AuthOutcome(AuthResult Result, AuthResponse? Response);

public interface IAuthService
{
    Task<AuthOutcome> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
    Task<AuthOutcome> LoginAsync(LoginRequest request, CancellationToken ct = default);
}
```

Create `src/ApnaGhar.Api/Services/AuthService.cs`:
```csharp
using ApnaGhar.Api.Auth;
using ApnaGhar.Api.Data.Repositories;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Entities;
using Microsoft.AspNetCore.Identity;

namespace ApnaGhar.Api.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly ITokenService _tokens;
    private readonly IPasswordHasher<User> _hasher;

    public AuthService(IUserRepository users, ITokenService tokens, IPasswordHasher<User> hasher)
    {
        _users = users;
        _tokens = tokens;
        _hasher = hasher;
    }

    public async Task<AuthOutcome> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLower();
        if (await _users.EmailExistsAsync(email, ct))
            return new AuthOutcome(AuthResult.EmailTaken, null);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            DisplayName = request.DisplayName.Trim(),
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = _hasher.HashPassword(user, request.Password);
        await _users.AddAsync(user, ct);

        return new AuthOutcome(AuthResult.Success,
            new AuthResponse(_tokens.CreateToken(user), user.ToDto()));
    }

    public async Task<AuthOutcome> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLower();
        var user = await _users.GetByEmailAsync(email, ct);
        if (user is null)
            return new AuthOutcome(AuthResult.InvalidCredentials, null);

        var verify = _hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verify == PasswordVerificationResult.Failed)
            return new AuthOutcome(AuthResult.InvalidCredentials, null);

        return new AuthOutcome(AuthResult.Success,
            new AuthResponse(_tokens.CreateToken(user), user.ToDto()));
    }
}
```

- [ ] **Step 6: Create the auth controller**

Create `src/ApnaGhar.Api/Controllers/AuthController.cs`:
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ApnaGhar.Api.Auth;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApnaGhar.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly ICurrentUser _currentUser;

    public AuthController(IAuthService auth, ICurrentUser currentUser)
    {
        _auth = auth;
        _currentUser = currentUser;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken ct)
    {
        var outcome = await _auth.RegisterAsync(request, ct);
        return outcome.Result switch
        {
            AuthResult.Success => Ok(outcome.Response),
            AuthResult.EmailTaken => Conflict(new { message = "Email already registered." }),
            _ => BadRequest()
        };
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var outcome = await _auth.LoginAsync(request, ct);
        return outcome.Result switch
        {
            AuthResult.Success => Ok(outcome.Response),
            _ => Unauthorized(new { message = "Invalid email or password." })
        };
    }

    // Reconstructs the current user from JWT claims (sub/email/name set by TokenService).
    [HttpGet("me")]
    [Authorize]
    public ActionResult<UserDto> Me()
    {
        if (_currentUser.Id is not { } id) return Unauthorized();
        var email = User.FindFirstValue(JwtRegisteredClaimNames.Email)
                    ?? User.FindFirstValue(ClaimTypes.Email) ?? "";
        var name = User.FindFirstValue("name") ?? "";
        return Ok(new UserDto(id, email, name));
    }
}
```

- [ ] **Step 7: Wire JWT auth and DI into `Program.cs`**

In `src/ApnaGhar.Api/Program.cs`, add these registrations after the `IPropertyService` registration:
```csharp
builder.Services.Configure<ApnaGhar.Api.Auth.JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ApnaGhar.Api.Auth.ICurrentUser, ApnaGhar.Api.Auth.CurrentUser>();
builder.Services.AddSingleton<ApnaGhar.Api.Auth.ITokenService, ApnaGhar.Api.Auth.TokenService>();
builder.Services.AddScoped<ApnaGhar.Api.Services.IAuthService, ApnaGhar.Api.Services.AuthService>();
builder.Services.AddSingleton<Microsoft.AspNetCore.Identity.IPasswordHasher<ApnaGhar.Api.Entities.User>,
    Microsoft.AspNetCore.Identity.PasswordHasher<ApnaGhar.Api.Entities.User>>();
```

Also add JWT bearer authentication. Place this before `builder.Services.AddControllers();`:
```csharp
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
builder.Services
    .AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(jwtKey))
        };
    });
```

- [ ] **Step 8: Set the dev JWT signing key via user-secrets**

Run:
```bash
cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api"
dotnet user-secrets init --project src/ApnaGhar.Api
dotnet user-secrets set "Jwt:Key" "dev-super-secret-signing-key-change-me-32b+" --project src/ApnaGhar.Api
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter AuthTests`
Expected: PASS (3 tests).

- [ ] **Step 10: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add JWT registration, login, and current-user accessor"
```

---

### Task 11: Create property endpoint (auth required)

**Files:**
- Modify: `src/ApnaGhar.Api/Services/IPropertyService.cs`
- Modify: `src/ApnaGhar.Api/Services/PropertyService.cs`
- Modify: `src/ApnaGhar.Api/Controllers/PropertiesController.cs`
- Test: `tests/ApnaGhar.Api.Tests/Api/PropertiesWriteTests.cs`
- Test helper: `tests/ApnaGhar.Api.Tests/Infrastructure/AuthHelper.cs`

- [ ] **Step 1: Create an auth helper for tests**

Create `tests/ApnaGhar.Api.Tests/Infrastructure/AuthHelper.cs`:
```csharp
using System.Net.Http.Headers;
using System.Net.Http.Json;
using ApnaGhar.Api.Dtos;

namespace ApnaGhar.Api.Tests.Infrastructure;

public static class AuthHelper
{
    public static async Task<HttpClient> RegisterAndAuthenticateAsync(HttpClient client)
    {
        var email = $"u{Guid.NewGuid():N}@b.com";
        var res = await client.PostAsJsonAsync("/api/auth/register",
            new RegisterRequest(email, "Passw0rd!", "Writer"));
        var body = await res.Content.ReadFromJsonAsync<AuthResponse>();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", body!.Token);
        return client;
    }

    public static CreatePropertyRequest SampleProperty() => new(
        Title: "New Test Listing",
        Description: "A lovely test home with plenty of light.",
        ListingType: "Rent",
        PropertyType: "Apartment",
        Price: 45000m,
        AreaSqft: 900,
        Bedrooms: 2,
        Bathrooms: 2,
        IsFurnished: true,
        ParkingAvailable: true,
        VastuCompliant: false,
        Locality: "Test Locality",
        City: "Pune",
        State: "Maharashtra",
        IsFeatured: false,
        OwnerName: "Test Owner",
        OwnerType: "Owner",
        OwnerPhone: "+91 99xxxxxx00",
        Amenities: new List<string> { "Lift", "Gym" },
        Images: new List<string> { "https://images.unsplash.com/photo-x?w=1200" });
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/ApnaGhar.Api.Tests/Api/PropertiesWriteTests.cs`:
```csharp
using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class PropertiesWriteTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public PropertiesWriteTests(ApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Create_WithoutAuth_Returns401()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/properties", AuthHelper.SampleProperty());
        res.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Create_WithAuth_Returns201AndPersists()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var res = await client.PostAsJsonAsync("/api/properties", AuthHelper.SampleProperty());
        res.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await res.Content.ReadFromJsonAsync<PropertyResponse>();
        created!.Title.Should().Be("New Test Listing");
        created.Amenities.Should().Contain("Gym");

        var fetched = await client.GetFromJsonAsync<PropertyResponse>($"/api/properties/{created.Id}");
        fetched!.Id.Should().Be(created.Id);
    }
}
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter PropertiesWriteTests`
Expected: FAIL — create endpoint does not exist (404/405).

- [ ] **Step 4: Add `CreateAsync` to the service interface**

In `src/ApnaGhar.Api/Services/IPropertyService.cs`, add this method to the interface:
```csharp
Task<PropertyResponse> CreateAsync(CreatePropertyRequest request, Guid userId, CancellationToken ct = default);
```

- [ ] **Step 5: Implement `CreateAsync`**

In `src/ApnaGhar.Api/Services/PropertyService.cs`, add `using ApnaGhar.Api.Entities;` at the top, then add this method to the class:
```csharp
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
```

- [ ] **Step 6: Add the controller action**

In `src/ApnaGhar.Api/Controllers/PropertiesController.cs`, add `using ApnaGhar.Api.Auth;` at the top, inject `ICurrentUser` (add a field and constructor parameter), and add this action:
```csharp
[HttpPost]
[Authorize]
public async Task<ActionResult<PropertyResponse>> Create(CreatePropertyRequest request, CancellationToken ct)
{
    if (_currentUser.Id is not { } userId) return Unauthorized();
    var created = await _service.CreateAsync(request, userId, ct);
    return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
}
```

The updated constructor:
```csharp
private readonly IPropertyService _service;
private readonly ICurrentUser _currentUser;

public PropertiesController(IPropertyService service, ICurrentUser currentUser)
{
    _service = service;
    _currentUser = currentUser;
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter PropertiesWriteTests`
Expected: PASS (2 tests).

- [ ] **Step 8: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add authenticated create-property endpoint"
```

---

### Task 12: Update & delete with ownership enforcement

**Files:**
- Modify: `src/ApnaGhar.Api/Services/IPropertyService.cs`
- Modify: `src/ApnaGhar.Api/Services/PropertyService.cs`
- Modify: `src/ApnaGhar.Api/Controllers/PropertiesController.cs`
- Test: `tests/ApnaGhar.Api.Tests/Api/PropertiesOwnershipTests.cs`

- [ ] **Step 1: Write the failing test**

Create `tests/ApnaGhar.Api.Tests/Api/PropertiesOwnershipTests.cs`:
```csharp
using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class PropertiesOwnershipTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public PropertiesOwnershipTests(ApiFactory factory) => _factory = factory;

    private async Task<(HttpClient client, Guid propertyId)> CreateOwnedProperty()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var res = await client.PostAsJsonAsync("/api/properties", AuthHelper.SampleProperty());
        var created = await res.Content.ReadFromJsonAsync<PropertyResponse>();
        return (client, created!.Id);
    }

    [Fact]
    public async Task Owner_CanUpdate()
    {
        var (client, id) = await CreateOwnedProperty();
        var update = AuthHelper.SampleProperty() with { Title = "Updated Title" };
        var res = await client.PutAsJsonAsync($"/api/properties/{id}", update);
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var dto = await res.Content.ReadFromJsonAsync<PropertyResponse>();
        dto!.Title.Should().Be("Updated Title");
    }

    [Fact]
    public async Task NonOwner_CannotUpdate_Returns403()
    {
        var (_, id) = await CreateOwnedProperty();
        var otherClient = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var res = await otherClient.PutAsJsonAsync($"/api/properties/{id}",
            AuthHelper.SampleProperty() with { Title = "Hacked" });
        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task NonOwner_CannotDelete_Returns403()
    {
        var (_, id) = await CreateOwnedProperty();
        var otherClient = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var res = await otherClient.DeleteAsync($"/api/properties/{id}");
        res.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Owner_CanDelete_ThenGone()
    {
        var (client, id) = await CreateOwnedProperty();
        var del = await client.DeleteAsync($"/api/properties/{id}");
        del.StatusCode.Should().Be(HttpStatusCode.NoContent);
        var get = await client.GetAsync($"/api/properties/{id}");
        get.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Update_UnknownId_Returns404()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var res = await client.PutAsJsonAsync($"/api/properties/{Guid.NewGuid()}", AuthHelper.SampleProperty());
        res.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter PropertiesOwnershipTests`
Expected: FAIL — update/delete endpoints do not exist.

- [ ] **Step 3: Add update/delete results and methods to the service interface**

In `src/ApnaGhar.Api/Services/IPropertyService.cs`, add this enum and methods:
```csharp
public enum WriteOutcome { Updated, Deleted, NotFound, Forbidden }
```
and inside the interface:
```csharp
Task<(WriteOutcome Outcome, PropertyResponse? Property)> UpdateAsync(
    Guid id, UpdatePropertyRequest request, Guid userId, CancellationToken ct = default);
Task<WriteOutcome> DeleteAsync(Guid id, Guid userId, CancellationToken ct = default);
```

- [ ] **Step 4: Implement update/delete in the service**

In `src/ApnaGhar.Api/Services/PropertyService.cs`, the repository's `GetByIdAsync` uses `AsNoTracking`, so update must re-load a tracked entity. Add a tracked fetch via a new repository method. First add to `IPropertyRepository` (`src/ApnaGhar.Api/Data/Repositories/IPropertyRepository.cs`):
```csharp
Task<Property?> GetByIdTrackedAsync(Guid id, CancellationToken ct = default);
```
Implement it in `EfPropertyRepository`:
```csharp
public Task<Property?> GetByIdTrackedAsync(Guid id, CancellationToken ct = default) =>
    _ctx.Properties
        .Include(p => p.Images)
        .Include(p => p.Amenities)
        .FirstOrDefaultAsync(p => p.Id == id, ct);
```
Then add to `PropertyService`:
```csharp
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

    p.Images.Clear();
    p.Images = r.Images.Select((u, i) => new PropertyImage { Id = Guid.NewGuid(), Url = u, SortOrder = i, PropertyId = p.Id }).ToList();
    p.Amenities.Clear();
    p.Amenities = r.Amenities.Select(a => new PropertyAmenity { Id = Guid.NewGuid(), Name = a, PropertyId = p.Id }).ToList();

    await _repo.UpdateAsync(p, ct);
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
```

- [ ] **Step 5: Add the controller actions**

In `src/ApnaGhar.Api/Controllers/PropertiesController.cs`, add:
```csharp
[HttpPut("{id:guid}")]
[Authorize]
public async Task<ActionResult<PropertyResponse>> Update(Guid id, UpdatePropertyRequest request, CancellationToken ct)
{
    if (_currentUser.Id is not { } userId) return Unauthorized();
    var (outcome, property) = await _service.UpdateAsync(id, request, userId, ct);
    return outcome switch
    {
        WriteOutcome.Updated => Ok(property),
        WriteOutcome.NotFound => NotFound(),
        WriteOutcome.Forbidden => Forbid(),
        _ => BadRequest()
    };
}

[HttpDelete("{id:guid}")]
[Authorize]
public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
{
    if (_currentUser.Id is not { } userId) return Unauthorized();
    var outcome = await _service.DeleteAsync(id, userId, ct);
    return outcome switch
    {
        WriteOutcome.Deleted => NoContent(),
        WriteOutcome.NotFound => NotFound(),
        WriteOutcome.Forbidden => Forbid(),
        _ => BadRequest()
    };
}
```
Add `using ApnaGhar.Api.Services;` if not already present (for `WriteOutcome`).

Note: `Forbid()` requires an authentication scheme to challenge. Since the default scheme is JWT bearer, `Forbid()` yields `403`. Verify in Step 6.

- [ ] **Step 6: Run the test to verify it passes**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter PropertiesOwnershipTests`
Expected: PASS (5 tests).

- [ ] **Step 7: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add update/delete endpoints with ownership enforcement"
```

---

### Task 13: Image upload (IImageStorage + local disk)

**Files:**
- Create: `src/ApnaGhar.Api/Storage/IImageStorage.cs`
- Create: `src/ApnaGhar.Api/Storage/LocalDiskImageStorage.cs`
- Modify: `src/ApnaGhar.Api/Controllers/PropertiesController.cs`
- Modify: `src/ApnaGhar.Api/Program.cs` (register `IImageStorage`)
- Test: `tests/ApnaGhar.Api.Tests/Api/ImageUploadTests.cs`

The component-test factory stubs `IImageStorage` so tests don't touch disk.

- [ ] **Step 1: Write the failing test**

Create `tests/ApnaGhar.Api.Tests/Api/ImageUploadTests.cs`:
```csharp
using System.Net;
using System.Net.Http.Json;
using System.Text;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Storage;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class StubImageStorage : IImageStorage
{
    public Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default) =>
        Task.FromResult($"/uploads/stub-{fileName}");
    public Task DeleteAsync(string url, CancellationToken ct = default) => Task.CompletedTask;
}

public class ImageUploadTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    private readonly ApiFactory _factory;

    public ImageUploadTests(ApiFactory factory)
    {
        _factory = factory.WithStubImageStorage();
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task Owner_CanUploadImage()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_client);
        var createRes = await client.PostAsJsonAsync("/api/properties", AuthHelper.SampleProperty());
        var created = await createRes.Content.ReadFromJsonAsync<PropertyResponse>();

        using var form = new MultipartFormDataContent();
        var bytes = Encoding.UTF8.GetBytes("fake-image-bytes");
        var fileContent = new ByteArrayContent(bytes);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
        form.Add(fileContent, "file", "photo.jpg");

        var res = await client.PostAsync($"/api/properties/{created!.Id}/images", form);
        res.StatusCode.Should().Be(HttpStatusCode.OK);
        var updated = await res.Content.ReadFromJsonAsync<PropertyResponse>();
        updated!.Images.Should().Contain(u => u.Contains("stub-photo.jpg"));
    }
}
```

- [ ] **Step 2: Add the `WithStubImageStorage` factory extension**

Append to `tests/ApnaGhar.Api.Tests/Infrastructure/ApiFactory.cs` a method on the class allowing the stub to be substituted. Add this method inside `ApiFactory`:
```csharp
private bool _useStubStorage;
public ApiFactory WithStubImageStorage() { _useStubStorage = true; return this; }
```
And inside `ConfigureWebHost`'s `ConfigureServices` block, after the DbContext replacement, add:
```csharp
if (_useStubStorage)
{
    var storageDescriptor = services.SingleOrDefault(
        d => d.ServiceType == typeof(ApnaGhar.Api.Storage.IImageStorage));
    if (storageDescriptor is not null) services.Remove(storageDescriptor);
    services.AddSingleton<ApnaGhar.Api.Storage.IImageStorage, ApnaGhar.Api.Tests.Api.StubImageStorage>();
}
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter ImageUploadTests`
Expected: FAIL — `IImageStorage` / upload endpoint do not exist.

- [ ] **Step 4: Create the storage abstraction**

Create `src/ApnaGhar.Api/Storage/IImageStorage.cs`:
```csharp
namespace ApnaGhar.Api.Storage;

public interface IImageStorage
{
    Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default);
    Task DeleteAsync(string url, CancellationToken ct = default);
}
```

Create `src/ApnaGhar.Api/Storage/LocalDiskImageStorage.cs`:
```csharp
using Microsoft.AspNetCore.Hosting;

namespace ApnaGhar.Api.Storage;

public class LocalDiskImageStorage : IImageStorage
{
    private readonly string _uploadsRoot;

    public LocalDiskImageStorage(IWebHostEnvironment env)
    {
        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        _uploadsRoot = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(_uploadsRoot);
    }

    public async Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default)
    {
        var ext = Path.GetExtension(fileName);
        var safeName = $"{Guid.NewGuid():N}{ext}";
        var path = Path.Combine(_uploadsRoot, safeName);
        await using var fs = File.Create(path);
        await content.CopyToAsync(fs, ct);
        return $"/uploads/{safeName}";
    }

    public Task DeleteAsync(string url, CancellationToken ct = default)
    {
        var name = Path.GetFileName(url);
        var path = Path.Combine(_uploadsRoot, name);
        if (File.Exists(path)) File.Delete(path);
        return Task.CompletedTask;
    }
}
```

- [ ] **Step 5: Add a service method to append an image URL**

In `src/ApnaGhar.Api/Services/IPropertyService.cs`, add:
```csharp
Task<(WriteOutcome Outcome, PropertyResponse? Property)> AddImageAsync(
    Guid id, string url, Guid userId, CancellationToken ct = default);
```
In `src/ApnaGhar.Api/Services/PropertyService.cs`, add:
```csharp
public async Task<(WriteOutcome Outcome, PropertyResponse? Property)> AddImageAsync(
    Guid id, string url, Guid userId, CancellationToken ct = default)
{
    var p = await _repo.GetByIdTrackedAsync(id, ct);
    if (p is null) return (WriteOutcome.NotFound, null);
    if (p.CreatedByUserId != userId) return (WriteOutcome.Forbidden, null);

    var nextOrder = p.Images.Count == 0 ? 0 : p.Images.Max(i => i.SortOrder) + 1;
    p.Images.Add(new PropertyImage { Id = Guid.NewGuid(), Url = url, SortOrder = nextOrder, PropertyId = p.Id });
    await _repo.UpdateAsync(p, ct);
    return (WriteOutcome.Updated, p.ToResponse());
}
```

- [ ] **Step 6: Add the upload controller action**

In `src/ApnaGhar.Api/Controllers/PropertiesController.cs`, inject `IImageStorage` (add field + constructor param) and add `using ApnaGhar.Api.Storage;`. Then add:
```csharp
private static readonly string[] AllowedContentTypes = { "image/jpeg", "image/png", "image/webp" };
private const long MaxImageBytes = 5 * 1024 * 1024;

[HttpPost("{id:guid}/images")]
[Authorize]
public async Task<ActionResult<PropertyResponse>> UploadImage(Guid id, IFormFile file, CancellationToken ct)
{
    if (_currentUser.Id is not { } userId) return Unauthorized();
    if (file is null || file.Length == 0) return BadRequest(new { message = "No file uploaded." });
    if (file.Length > MaxImageBytes) return BadRequest(new { message = "File too large (max 5MB)." });
    if (!AllowedContentTypes.Contains(file.ContentType))
        return BadRequest(new { message = "Unsupported image type." });

    await using var stream = file.OpenReadStream();
    var url = await _imageStorage.SaveAsync(stream, file.FileName, ct);
    var (outcome, property) = await _service.AddImageAsync(id, url, userId, ct);
    return outcome switch
    {
        WriteOutcome.Updated => Ok(property),
        WriteOutcome.NotFound => NotFound(),
        WriteOutcome.Forbidden => Forbid(),
        _ => BadRequest()
    };
}
```
Updated constructor (now three dependencies):
```csharp
private readonly IPropertyService _service;
private readonly ICurrentUser _currentUser;
private readonly IImageStorage _imageStorage;

public PropertiesController(IPropertyService service, ICurrentUser currentUser, IImageStorage imageStorage)
{
    _service = service;
    _currentUser = currentUser;
    _imageStorage = imageStorage;
}
```

- [ ] **Step 7: Register `IImageStorage` in `Program.cs`**

In `src/ApnaGhar.Api/Program.cs`, after the other service registrations, add:
```csharp
builder.Services.AddScoped<ApnaGhar.Api.Storage.IImageStorage, ApnaGhar.Api.Storage.LocalDiskImageStorage>();
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter ImageUploadTests`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add image upload with local-disk storage behind IImageStorage"
```

---

### Task 14: FluentValidation for write requests

**Files:**
- Create: `src/ApnaGhar.Api/Validators/CreatePropertyRequestValidator.cs`
- Create: `src/ApnaGhar.Api/Validators/UpdatePropertyRequestValidator.cs`
- Create: `src/ApnaGhar.Api/Validators/RegisterRequestValidator.cs`
- Modify: `src/ApnaGhar.Api/Program.cs` (register validators + auto-validation)
- Test: `tests/ApnaGhar.Api.Tests/Api/ValidationTests.cs`

- [ ] **Step 1: Write the failing test**

Create `tests/ApnaGhar.Api.Tests/Api/ValidationTests.cs`:
```csharp
using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class ValidationTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;
    public ValidationTests(ApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Create_WithBlankTitle_Returns400()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var bad = AuthHelper.SampleProperty() with { Title = "" };
        var res = await client.PostAsJsonAsync("/api/properties", bad);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Create_WithNegativePrice_Returns400()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var bad = AuthHelper.SampleProperty() with { Price = -5m };
        var res = await client.PostAsJsonAsync("/api/properties", bad);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Create_WithInvalidListingType_Returns400()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_factory.CreateClient());
        var bad = AuthHelper.SampleProperty() with { ListingType = "Lease" };
        var res = await client.PostAsJsonAsync("/api/properties", bad);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithShortPassword_Returns400()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/auth/register",
            new RegisterRequest($"u{Guid.NewGuid():N}@b.com", "x", "Name"));
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter ValidationTests`
Expected: FAIL — invalid input currently returns 201/200, not 400 (enum parse on invalid `ListingType` would throw 500 — also a fail).

- [ ] **Step 3: Create the validators**

Create `src/ApnaGhar.Api/Validators/CreatePropertyRequestValidator.cs`:
```csharp
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Entities;
using FluentValidation;

namespace ApnaGhar.Api.Validators;

public class CreatePropertyRequestValidator : AbstractValidator<CreatePropertyRequest>
{
    public CreatePropertyRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.ListingType).Must(BeEnum<ListingType>).WithMessage("Invalid listing type.");
        RuleFor(x => x.PropertyType).Must(BeEnum<PropertyType>).WithMessage("Invalid property type.");
        RuleFor(x => x.OwnerType).Must(BeEnum<OwnerType>).WithMessage("Invalid owner type.");
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.AreaSqft).GreaterThan(0);
        RuleFor(x => x.Bedrooms).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Bathrooms).GreaterThanOrEqualTo(0);
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.Locality).NotEmpty();
        RuleFor(x => x.State).NotEmpty();
        RuleFor(x => x.OwnerName).NotEmpty();
    }

    private static bool BeEnum<TEnum>(string value) where TEnum : struct =>
        Enum.TryParse<TEnum>(value, true, out _);
}
```

Create `src/ApnaGhar.Api/Validators/UpdatePropertyRequestValidator.cs`:
```csharp
using ApnaGhar.Api.Dtos;
using ApnaGhar.Api.Entities;
using FluentValidation;

namespace ApnaGhar.Api.Validators;

public class UpdatePropertyRequestValidator : AbstractValidator<UpdatePropertyRequest>
{
    public UpdatePropertyRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty();
        RuleFor(x => x.ListingType).Must(v => Enum.TryParse<ListingType>(v, true, out _)).WithMessage("Invalid listing type.");
        RuleFor(x => x.PropertyType).Must(v => Enum.TryParse<PropertyType>(v, true, out _)).WithMessage("Invalid property type.");
        RuleFor(x => x.OwnerType).Must(v => Enum.TryParse<OwnerType>(v, true, out _)).WithMessage("Invalid owner type.");
        RuleFor(x => x.Price).GreaterThan(0);
        RuleFor(x => x.AreaSqft).GreaterThan(0);
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.Locality).NotEmpty();
        RuleFor(x => x.State).NotEmpty();
        RuleFor(x => x.OwnerName).NotEmpty();
    }
}
```

Create `src/ApnaGhar.Api/Validators/RegisterRequestValidator.cs`:
```csharp
using ApnaGhar.Api.Dtos;
using FluentValidation;

namespace ApnaGhar.Api.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(120);
    }
}
```

- [ ] **Step 4: Register FluentValidation auto-validation in `Program.cs`**

In `src/ApnaGhar.Api/Program.cs`, add `using FluentValidation;` and `using FluentValidation.AspNetCore;` at the top, then after `builder.Services.AddControllers();` add:
```csharp
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<ApnaGhar.Api.Validators.CreatePropertyRequestValidator>();
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter ValidationTests`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add FluentValidation for property and register requests"
```

---

### Task 15: Global error handling (ProblemDetails)

**Files:**
- Modify: `src/ApnaGhar.Api/Program.cs`
- Test: `tests/ApnaGhar.Api.Tests/Api/ErrorHandlingTests.cs`

- [ ] **Step 1: Write the failing test**

Create `tests/ApnaGhar.Api.Tests/Api/ErrorHandlingTests.cs`:
```csharp
using System.Net;
using System.Net.Http.Json;
using ApnaGhar.Api.Tests.Infrastructure;
using FluentAssertions;
using Xunit;

namespace ApnaGhar.Api.Tests.Api;

public class ErrorHandlingTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    public ErrorHandlingTests(ApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Validation400_ReturnsProblemDetailsContentType()
    {
        var client = await AuthHelper.RegisterAndAuthenticateAsync(_client);
        var bad = AuthHelper.SampleProperty() with { Title = "" };
        var res = await client.PostAsJsonAsync("/api/properties", bad);
        res.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        res.Content.Headers.ContentType!.MediaType.Should().Be("application/problem+json");
    }
}
```

- [ ] **Step 2: Run the test to verify it fails or passes**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter ErrorHandlingTests`
Expected: This may already PASS (ASP.NET Core returns `application/problem+json` for model-state 400s by default). If it passes, the default behaviour is sufficient — still add the exception handler below for unhandled 500s, then re-run. If it fails, the handler below fixes it.

- [ ] **Step 3: Add ProblemDetails + global exception handler**

In `src/ApnaGhar.Api/Program.cs`, add after `var builder = WebApplication.CreateBuilder(args);`:
```csharp
builder.Services.AddProblemDetails();
```
And in the middleware pipeline, add as the very first middleware after `var app = builder.Build();` and the seeding block:
```csharp
app.UseExceptionHandler();
app.UseStatusCodePages();
```
(Place `app.UseExceptionHandler();` before `app.UseStaticFiles();`.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test --filter ErrorHandlingTests`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git add apna-ghar-api
git commit -m "feat: add ProblemDetails and global exception handling"
```

---

### Task 16: Full suite green + manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the entire test suite**

Run: `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet test`
Expected: ALL tests pass (DbContext, Seeder, Mapping, Repository, ReadTests, MetaTests, AuthTests, WriteTests, OwnershipTests, ImageUploadTests, ValidationTests, ErrorHandlingTests).

- [ ] **Step 2: Run the API and smoke-test via Swagger**

Run (background): `cd "C:/AI Projects/project/Apna Ghar/apna-ghar-api" && dotnet run --project src/ApnaGhar.Api`
Then verify with curl (replace PORT with the logged port):
```bash
curl -s http://localhost:PORT/api/properties | head -c 400
curl -s http://localhost:PORT/api/properties/featured | head -c 200
curl -s http://localhost:PORT/api/meta/cities
```
Expected: JSON responses with seeded data. Open `http://localhost:PORT/swagger` in a browser to confirm all endpoints are listed. Stop the app.

- [ ] **Step 3: Final commit (if any uncommitted changes)**

```bash
cd "C:/AI Projects/project/Apna Ghar"
git status
git add apna-ghar-api
git commit -m "chore: backend API complete — all component tests green" || echo "nothing to commit"
```

---

## Notes for the next plan (frontend wiring)

When wiring the Next.js frontend to this API (separate plan), remember:
- API base URL via `NEXT_PUBLIC_API_BASE_URL`; the API runs on its own port (see launch logs).
- `PropertyResponse` shape matches the frontend `Property` type **except** `postedAt` (ISO date) replaces `postedDaysAgo` — update `postedLabel()` accordingly.
- Uploaded image URLs are relative (`/uploads/...`); prefix with the API base URL and whitelist that host in `next.config.mjs`.
- Property `id` is now a GUID string (still opaque to routing).
- Detail page must drop `generateStaticParams()` and render at request time.
