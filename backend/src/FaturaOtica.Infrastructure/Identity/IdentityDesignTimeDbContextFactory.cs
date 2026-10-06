using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FaturaOtica.Infrastructure.Identity;

public sealed class IdentityDesignTimeDbContextFactory : IDesignTimeDbContextFactory<IdentityDbContext>
{
    public IdentityDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<IdentityDbContext>().UseNpgsql().Options;
        return new IdentityDbContext(options, Guid.Parse("00000000-0000-0000-0000-000000000001"));
    }
}
