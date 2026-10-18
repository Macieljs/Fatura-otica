using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentitySessionRlsTests(IdentityPostgreSqlFixture fixture)
{
    [Fact]
    public async Task Tokens_RuntimeRole_ForceRlsAndCompositeForeignKeysIsolateTenant()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var admin = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA);
        await admin.Database.ExecuteSqlRawAsync("GRANT SELECT, INSERT, UPDATE, DELETE ON identity.ativacoes, identity.sessoes TO s103a_runtime");
        foreach (var tenant in new[] { data.TenantA, data.TenantB })
        {
            var user = tenant == data.TenantA ? data.UserA : data.UserB;
            admin.Set<IdentityActivationToken>().Add(new() { Id = Guid.CreateVersion7(), TenantId = tenant, UserId = user,
                TokenHash = IdentitySecrets.Hash(IdentitySecrets.Generate()), CreatedAt = DateTimeOffset.UtcNow, ExpiresAt = DateTimeOffset.UtcNow.AddHours(24) });
            admin.Set<IdentitySessionToken>().Add(new() { Id = Guid.CreateVersion7(), FamilyId = Guid.CreateVersion7(), TenantId = tenant, UserId = user,
                TokenHash = IdentitySecrets.Hash(IdentitySecrets.Generate()), CreatedAt = DateTimeOffset.UtcNow, ExpiresAt = DateTimeOffset.UtcNow.AddDays(7) });
        }
        await admin.SaveChangesAsync();
        await using var runtime = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await using var transaction = await IdentityTenantTransaction.BeginAsync(runtime);
        Assert.Single(await runtime.Set<IdentityActivationToken>().IgnoreQueryFilters().ToListAsync());
        Assert.Single(await runtime.Set<IdentitySessionToken>().IgnoreQueryFilters().ToListAsync());
        var policies = await runtime.Database.SqlQuery<int>($"SELECT count(*)::integer AS \"Value\" FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='identity' AND c.relname IN ('ativacoes','sessoes') AND c.relrowsecurity AND c.relforcerowsecurity").SingleAsync();
        Assert.Equal(2, policies);
        runtime.Set<IdentitySessionToken>().Add(new() { Id = Guid.CreateVersion7(), FamilyId = Guid.CreateVersion7(), TenantId = data.TenantA, UserId = data.UserB,
            TokenHash = IdentitySecrets.Hash(IdentitySecrets.Generate()), CreatedAt = DateTimeOffset.UtcNow, ExpiresAt = DateTimeOffset.UtcNow.AddDays(7) });
        var exception = await Assert.ThrowsAsync<DbUpdateException>(() => runtime.SaveChangesAsync());
        Assert.Equal(PostgresErrorCodes.ForeignKeyViolation, Assert.IsType<PostgresException>(exception.InnerException).SqlState);
    }
}
