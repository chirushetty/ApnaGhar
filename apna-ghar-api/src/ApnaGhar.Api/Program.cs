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

builder.Services.Configure<ApnaGhar.Api.Auth.JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ApnaGhar.Api.Auth.ICurrentUser, ApnaGhar.Api.Auth.CurrentUser>();
builder.Services.AddSingleton<ApnaGhar.Api.Auth.ITokenService, ApnaGhar.Api.Auth.TokenService>();
builder.Services.AddScoped<ApnaGhar.Api.Services.IAuthService, ApnaGhar.Api.Services.AuthService>();
builder.Services.AddSingleton<Microsoft.AspNetCore.Identity.IPasswordHasher<ApnaGhar.Api.Entities.User>,
    Microsoft.AspNetCore.Identity.PasswordHasher<ApnaGhar.Api.Entities.User>>();

var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                  ?? Array.Empty<string>();
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod()));

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
if (System.Text.Encoding.UTF8.GetBytes(jwtKey).Length < 32)
    throw new InvalidOperationException("Jwt:Key must be at least 32 bytes (256 bits) for HMAC-SHA256.");
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
            ValidAudience = jwtSection["Audience"]
            // IssuerSigningKey is set via IPostConfigureOptions<JwtBearerOptions>
            // so it always stays in sync with IOptions<JwtOptions> (used by TokenService).
        };
    });

// Wire the signing key from JwtOptions so token creation (TokenService) and
// token validation (JwtBearer middleware) always use the same key material.
builder.Services.AddOptions<Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerOptions>(
    Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .PostConfigure<Microsoft.Extensions.Options.IOptions<ApnaGhar.Api.Auth.JwtOptions>>(
        (bearerOpts, jwtOpts) =>
        {
            var key = jwtOpts.Value.Key
                      ?? throw new InvalidOperationException("Jwt:Key is not configured.");
            bearerOpts.TokenValidationParameters.IssuerSigningKey =
                new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(key));
        });

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
