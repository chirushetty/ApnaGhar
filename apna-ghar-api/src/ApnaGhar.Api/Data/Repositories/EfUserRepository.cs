using ApnaGhar.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ApnaGhar.Api.Data.Repositories;

public class EfUserRepository : IUserRepository
{
    private readonly ApnaGharDbContext _ctx;
    public EfUserRepository(ApnaGharDbContext ctx) => _ctx = ctx;

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        _ctx.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower(), ct);

    public Task<bool> EmailExistsAsync(string email, CancellationToken ct = default) =>
        _ctx.Users.AnyAsync(u => u.Email == email.ToLower(), ct);

    public async Task AddAsync(User user, CancellationToken ct = default)
    {
        _ctx.Users.Add(user);
        await _ctx.SaveChangesAsync(ct);
    }
}
