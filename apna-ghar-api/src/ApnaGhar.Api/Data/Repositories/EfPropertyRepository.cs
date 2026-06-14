using ApnaGhar.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ApnaGhar.Api.Data.Repositories;

public class EfPropertyRepository : IPropertyRepository
{
    private readonly ApnaGharDbContext _ctx;
    public EfPropertyRepository(ApnaGharDbContext ctx) => _ctx = ctx;

    public async Task<PagedResult<Property>> QueryAsync(PropertyQuery q, CancellationToken ct = default)
    {
        IQueryable<Property> query = _ctx.Properties
            .Include(p => p.Images)
            .Include(p => p.Amenities)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(q.ListingType) &&
            Enum.TryParse<ListingType>(q.ListingType, true, out var lt))
            query = query.Where(p => p.ListingType == lt);

        if (!string.IsNullOrWhiteSpace(q.PropertyType) &&
            Enum.TryParse<PropertyType>(q.PropertyType, true, out var pt))
            query = query.Where(p => p.PropertyType == pt);

        if (!string.IsNullOrWhiteSpace(q.City))
        {
            var city = q.City.ToLower();
            query = query.Where(p => p.City.ToLower() == city);
        }

        if (q.MinPrice is { } min) query = query.Where(p => p.Price >= min);
        if (q.MaxPrice is { } max) query = query.Where(p => p.Price <= max);
        if (q.Bedrooms is { } beds) query = query.Where(p => p.Bedrooms >= beds);
        if (q.Furnished is { } furnished) query = query.Where(p => p.IsFurnished == furnished);

        if (!string.IsNullOrWhiteSpace(q.Search))
        {
            var s = q.Search.ToLower();
            query = query.Where(p =>
                p.Title.ToLower().Contains(s) || p.Locality.ToLower().Contains(s));
        }

        query = q.Sort switch
        {
            "price_asc" => query.OrderBy(p => p.Price),
            "price_desc" => query.OrderByDescending(p => p.Price),
            _ => query.OrderByDescending(p => p.PostedAt)
        };

        var total = await query.CountAsync(ct);
        var page = q.Page < 1 ? 1 : q.Page;
        var size = q.PageSize is < 1 or > 100 ? 12 : q.PageSize;

        var items = await query
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(ct);

        return new PagedResult<Property>
        {
            Items = items, Total = total, Page = page, PageSize = size
        };
    }

    public Task<Property?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _ctx.Properties
            .Include(p => p.Images)
            .Include(p => p.Amenities)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public Task<Property?> GetByIdTrackedAsync(Guid id, CancellationToken ct = default) =>
        _ctx.Properties
            .Include(p => p.Images)
            .Include(p => p.Amenities)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IReadOnlyList<Property>> GetFeaturedAsync(CancellationToken ct = default) =>
        await _ctx.Properties
            .Include(p => p.Images)
            .Include(p => p.Amenities)
            .AsNoTracking()
            .Where(p => p.IsFeatured)
            .OrderByDescending(p => p.PostedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Property>> GetSimilarAsync(Guid id, CancellationToken ct = default)
    {
        var current = await _ctx.Properties.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id, ct);
        if (current is null) return Array.Empty<Property>();
        return await _ctx.Properties
            .Include(p => p.Images)
            .Include(p => p.Amenities)
            .AsNoTracking()
            .Where(p => p.City == current.City && p.Id != id)
            .Take(3)
            .ToListAsync(ct);
    }

    public async Task AddAsync(Property property, CancellationToken ct = default)
    {
        _ctx.Properties.Add(property);
        await _ctx.SaveChangesAsync(ct);
    }

    public async Task UpdateAsync(Property property, CancellationToken ct = default)
    {
        // If already tracked (e.g. loaded via GetByIdTrackedAsync), SaveChanges picks up
        // changes automatically. Only call Update() for detached entities.
        if (_ctx.Entry(property).State == Microsoft.EntityFrameworkCore.EntityState.Detached)
            _ctx.Properties.Update(property);
        await _ctx.SaveChangesAsync(ct);
    }

    public async Task ReplaceChildrenAsync(Guid propertyId,
        IReadOnlyList<PropertyImage> newImages,
        IReadOnlyList<PropertyAmenity> newAmenities,
        CancellationToken ct = default)
    {
        var oldImages = await _ctx.PropertyImages.Where(i => i.PropertyId == propertyId).ToListAsync(ct);
        var oldAmenities = await _ctx.PropertyAmenities.Where(a => a.PropertyId == propertyId).ToListAsync(ct);
        _ctx.PropertyImages.RemoveRange(oldImages);
        _ctx.PropertyAmenities.RemoveRange(oldAmenities);
        _ctx.PropertyImages.AddRange(newImages);
        _ctx.PropertyAmenities.AddRange(newAmenities);
        await _ctx.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(Property property, CancellationToken ct = default)
    {
        _ctx.Properties.Remove(property);
        await _ctx.SaveChangesAsync(ct);
    }
}
