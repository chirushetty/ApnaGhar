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
