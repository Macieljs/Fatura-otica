using FaturaOtica.Domain.Identity;
using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class OwnerBootstrapTests(IdentityPostgreSqlFixture fixture) : IAsyncLifetime
{
    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
        => await ExecuteAdminAsync("REVOKE SELECT, INSERT ON identity.tenants FROM s103a_runtime");

    [Fact]
    public async Task Provision_TenantAusente_CriaOwnerPendenteComAuditoriaDeSistemaSemSenha()
    {
        await PrepareAsync();
        var tenant = Guid.CreateVersion7();
        var userId = await ProvisionAsync(tenant);
        await using var stored = IdentityTestData.Context(fixture.AdminConnectionString, tenant);
        Assert.Equal("New tenant", (await stored.Tenants.SingleAsync(t => t.Id == tenant)).Name);
        var user = await stored.Users.SingleAsync();
        Assert.Equal(userId, user.Id);
        Assert.Equal("Initial Owner", user.Name);
        Assert.Equal("owner@example.test", user.EmailNormalized);
        Assert.Equal(UserStatus.Pending, user.Status);
        Assert.Null(user.PasswordHash);
        Assert.Null(user.CreatedForBranchId);
        Assert.Null(user.CreatedBy);
        var role = await stored.TenantRoles.SingleAsync();
        Assert.Equal(userId, role.UserId);
        Assert.Equal(AccessRole.Owner, role.Role);
        Assert.True(role.Active);
        var audit = await stored.AuditEvents.SingleAsync();
        Assert.Equal(userId, audit.TargetUserId);
        Assert.Null(audit.ActorUserId);
        Assert.Equal(IdentityAuditAction.BootstrapOwner, audit.Action);
        Assert.Equal(AccessRole.Owner, audit.Role);
        Assert.Null(audit.BranchId);
        Assert.Empty(await stored.BranchGrants.ToListAsync());
    }

    [Fact]
    public async Task Provision_TenantExistente_PreservaEmpresaEOutroTenant()
    {
        var data = await PrepareAsync();
        var foreignBefore = await SnapshotAsync(data.TenantB);
        await ProvisionAsync(data.TenantA);
        await using var stored = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA);
        Assert.Equal("Tenant A", (await stored.Tenants.SingleAsync(t => t.Id == data.TenantA)).Name);
        Assert.Equal(2, await stored.Users.CountAsync());
        Assert.Equal(foreignBefore, await SnapshotAsync(data.TenantB));
    }

    [Theory]
    [InlineData("active-owner")]
    [InlineData("inactive-owner")]
    [InlineData("bootstrap-event")]
    public async Task Provision_InicializacaoJaExistente_RecusaSemAlteracoes(string existing)
    {
        var data = await PrepareAsync();
        await using (var admin = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA))
        {
            if (existing == "bootstrap-event")
                admin.AuditEvents.Add(IdentityAuditEvent.CreateBootstrapOwner(data.TenantA, data.UserA, DateTimeOffset.UtcNow));
            else
                admin.TenantRoles.Add(new IdentityTenantRole { Id = Guid.CreateVersion7(), TenantId = data.TenantA,
                    UserId = data.UserA, Role = AccessRole.Owner, Active = existing == "active-owner" });
            await admin.SaveChangesAsync();
        }
        var before = await SnapshotAsync(data.TenantA);
        await Assert.ThrowsAsync<InvalidOperationException>(() => ProvisionAsync(data.TenantA));
        Assert.Equal(before, await SnapshotAsync(data.TenantA));
    }

    [Fact]
    public async Task Provision_EmailDuplicado_ReverteSemCriarPapelOuAuditoria()
    {
        var data = await PrepareAsync();
        var before = await SnapshotAsync(data.TenantA);
        var error = await Record.ExceptionAsync(() => ProvisionAsync(data.TenantA, email: " SELLER@EXAMPLE.TEST "));
        Assert.NotNull(error);
        Assert.True(error is DbUpdateException or PostgresException, error.ToString());
        Assert.Equal(before, await SnapshotAsync(data.TenantA));
    }

    [Fact]
    public async Task Provision_ConcorrenciaMesmoTenant_ConfirmaExatamenteUmOwnerEUmEvento()
    {
        await PrepareAsync();
        var tenant = Guid.CreateVersion7();
        var results = await Task.WhenAll(AttemptAsync(), AttemptAsync());
        Assert.Single(results, e => e is null);
        Assert.Single(results, e => e is InvalidOperationException);
        await using var stored = IdentityTestData.Context(fixture.AdminConnectionString, tenant);
        Assert.Equal(1, await stored.Users.CountAsync());
        Assert.Equal(1, await stored.TenantRoles.CountAsync());
        Assert.Equal(1, await stored.AuditEvents.CountAsync());
        async Task<Exception?> AttemptAsync() => await Record.ExceptionAsync(() => ProvisionAsync(tenant));
    }

    [Fact]
    public async Task Provision_FalhaNoInsertAuditoria_ReverteEmpresaUsuarioEPapel()
    {
        await PrepareAsync();
        var tenant = Guid.CreateVersion7();
        // Reject only this tenant: shared fixture data and concurrent suites stay unaffected.
        await ExecuteAdminAsync($"ALTER TABLE identity.auditoria ADD CONSTRAINT qa_bootstrap_failure CHECK (tenant_id <> '{tenant}'::uuid)");
        try
        {
            var error = await Record.ExceptionAsync(() => ProvisionAsync(tenant));
            Assert.NotNull(error);
            Assert.True(error is DbUpdateException or PostgresException, error.ToString());
            var empty = await SnapshotAsync(tenant);
            Assert.Equal((0, 0, 0, 0), (empty.Tenants, empty.Users, empty.Roles, empty.Audits));
        }
        finally { await ExecuteAdminAsync("ALTER TABLE identity.auditoria DROP CONSTRAINT qa_bootstrap_failure"); }
    }

    [Theory]
    [InlineData("", "Owner", "owner@example.test")]
    [InlineData("Tenant", " ", "owner@example.test")]
    [InlineData("Tenant", "Owner", "invalid-email")]
    public async Task Provision_ConfiguracaoInvalida_RecusaSemEfeitos(string name, string owner, string email)
    {
        await PrepareAsync();
        var tenant = Guid.CreateVersion7();
        await Assert.ThrowsAnyAsync<ArgumentException>(() => ProvisionAsync(tenant, name, owner, email));
        var empty = await SnapshotAsync(tenant);
            Assert.Equal((0, 0, 0, 0), (empty.Tenants, empty.Users, empty.Roles, empty.Audits));
    }

    [Fact]
    public async Task Provision_RoleSuperuser_RecusaSemEfeitos()
    {
        await PrepareAsync();
        var tenant = Guid.CreateVersion7();
        await using var context = IdentityTestData.Context(fixture.AdminConnectionString, tenant);
        await Assert.ThrowsAsync<InvalidOperationException>(() => new PostgreSqlOwnerBootstrapper(context)
            .ProvisionAsync("Tenant", "Owner", "owner@example.test"));
        var empty = await SnapshotAsync(tenant);
        Assert.Equal((0, 0, 0, 0), (empty.Tenants, empty.Users, empty.Roles, empty.Audits));
    }

    private async Task<IdentityTestData> PrepareAsync()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await ExecuteAdminAsync("GRANT SELECT, INSERT ON identity.tenants TO s103a_runtime");
        return data;
    }

    private async Task<Guid> ProvisionAsync(Guid tenant, string name = "New tenant", string owner = "Initial Owner", string email = " OWNER@EXAMPLE.TEST ")
    {
        var settings = new NpgsqlConnectionStringBuilder(fixture.RuntimeConnectionString) { Pooling = false };
        await using var context = IdentityTestData.Context(settings.ConnectionString, tenant);
        return await new PostgreSqlOwnerBootstrapper(context).ProvisionAsync(name, owner, email);
    }

    private async Task ExecuteAdminAsync(string sql)
    {
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        await command.ExecuteNonQueryAsync();
    }

    private async Task<(int Tenants, int Users, int Roles, int Audits, string State)> SnapshotAsync(Guid tenant)
    {
        await using var context = IdentityTestData.Context(fixture.AdminConnectionString, tenant);
        var tenants = await context.Tenants.Where(t => t.Id == tenant).OrderBy(t => t.Id).ToListAsync();
        var users = await context.Users.OrderBy(u => u.Id).ToListAsync();
        var roles = await context.TenantRoles.OrderBy(r => r.Id).ToListAsync();
        var audits = await context.AuditEvents.OrderBy(a => a.Id).ToListAsync();
        return (tenants.Count, users.Count, roles.Count, audits.Count,
            System.Text.Json.JsonSerializer.Serialize(new { tenants, users, roles, audits }));
    }
}



