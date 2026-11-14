namespace ApnaGhar.Api.Auth;

public class JwtOptions
{
    public string Issuer { get; set; } = "ApnaGhar";
    public string Audience { get; set; } = "ApnaGharClient";
    public string Key { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 1440;
}
