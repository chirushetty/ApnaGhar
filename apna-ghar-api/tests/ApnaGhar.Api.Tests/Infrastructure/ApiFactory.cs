using ApnaGhar.Api.Data;
using ApnaGhar.Api.Data.Seed;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
