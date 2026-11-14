namespace ApnaGhar.Api.Entities;

public class PropertyImage
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public Property? Property { get; set; }
    public string Url { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
