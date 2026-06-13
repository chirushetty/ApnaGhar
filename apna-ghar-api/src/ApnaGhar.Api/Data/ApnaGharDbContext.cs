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
