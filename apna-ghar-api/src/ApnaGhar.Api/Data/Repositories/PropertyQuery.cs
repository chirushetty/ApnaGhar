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
