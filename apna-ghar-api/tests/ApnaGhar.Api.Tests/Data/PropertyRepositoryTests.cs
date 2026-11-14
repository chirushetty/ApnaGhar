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
