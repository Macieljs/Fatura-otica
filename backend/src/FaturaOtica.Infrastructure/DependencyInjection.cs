using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using FaturaOtica.Application.Identity;
using FaturaOtica.Infrastructure.Identity;

namespace FaturaOtica.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);
        services.AddScoped(provider =>
        {
            if (!Guid.TryParse(configuration["Identity:TenantId"], out var tenantId) || tenantId == Guid.Empty)
                throw new InvalidOperationException("Identity TenantId configuration is required.");
            var connection = configuration.GetConnectionString("Identity");
            if (string.IsNullOrWhiteSpace(connection))
                throw new InvalidOperationException("Identity connection configuration is required.");
            var options = new DbContextOptionsBuilder<IdentityDbContext>().UseNpgsql(connection).Options;
            return new IdentityDbContext(options, tenantId);
        });
        services.AddScoped<ICurrentUserAccessReader, PostgreSqlCurrentUserAccessReader>();
        services.AddScoped(provider => new CurrentAccessAuthorizer(
            provider.GetRequiredService<ICurrentUserAccessReader>(),
            provider.GetRequiredService<IdentityDbContext>().ConfiguredTenantId));
        services.AddScoped<IPendingProfileStore, PostgreSqlPendingProfileStore>();
        return services;
    }
}
