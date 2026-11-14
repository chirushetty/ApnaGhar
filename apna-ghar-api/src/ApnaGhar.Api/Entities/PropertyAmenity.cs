namespace ApnaGhar.Api.Entities;

public class PropertyAmenity
{
    public Guid Id { get; set; }
    public Guid PropertyId { get; set; }
    public Property? Property { get; set; }
    public string Name { get; set; } = string.Empty;
}
