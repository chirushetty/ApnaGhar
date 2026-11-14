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
