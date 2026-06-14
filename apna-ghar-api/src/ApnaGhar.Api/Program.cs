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
builder.Services.AddScoped<ApnaGhar.Api.Services.IPropertyService, ApnaGhar.Api.Services.PropertyService>();

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
