using FaturaOtica.Domain.Identity;
using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentitySessionTests(IdentityPostgreSqlFixture fixture) : IAsyncLifetime
{
    private const string Password = "safe-password-123";

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
        => await ExecuteAdminAsync("REVOKE SELECT, INSERT ON identity.tenants FROM s103a_runtime");

    [Fact]
    public async Task BootstrapActivation_RequiresDmlRolePendingOwnerAndBootstrapProvenance()
    {
        var data = await PrepareAsync();
        await using var admin = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA);
        await admin.Database.ExecuteSqlRawAsync("GRANT SELECT, INSERT ON identity.tenants TO s103a_runtime");
        var tenant = Guid.CreateVersion7();
        var settings = new NpgsqlConnectionStringBuilder(fixture.RuntimeConnectionString) { Pooling = false };
        await using (var runtime = IdentityTestData.Context(settings.ConnectionString, tenant))
        {
            var user = await new PostgreSqlOwnerBootstrapper(runtime).ProvisionAsync("Tenant", "Owner", "owner@bootstrap.test");
            Assert.NotNull(await new IdentitySessionService(runtime, new IdentityCredentialHasher()).IssueInitialOwnerActivationAsync(user));
        }
        await using var privileged = IdentityTestData.Context(fixture.AdminConnectionString, tenant);
        var owner = await privileged.Users.SingleAsync();
        await Assert.ThrowsAsync<InvalidOperationException>(() => new IdentitySessionService(privileged, new IdentityCredentialHasher()).IssueInitialOwnerActivationAsync(owner.Id));
        Assert.Null(await RunAsync(data, s => s.IssueInitialOwnerActivationAsync(data.UserA)));
        var issued = await RunAsync(data with { TenantA = tenant }, s => s.IssueInitialOwnerActivationAsync(owner.Id)); Assert.NotNull(issued);
        Assert.True(await RunAsync(data with { TenantA = tenant }, s => s.ActivateAsync(issued.Token, Password, "Owner")));
        Assert.Null(await RunAsync(data with { TenantA = tenant }, s => s.IssueInitialOwnerActivationAsync(owner.Id)));
        var audit = (await privileged.AuditEvents.AsNoTracking().ToListAsync()).Where(a => a.Action.ToString() == "BootstrapOwnerActivation").ToList();
        Assert.NotEmpty(audit); Assert.All(audit, a => Assert.Null(a.ActorUserId));
    }

    [Fact]
    public async Task Me_OwnerGetsOnlyActiveBranchesInOwnTenant()
    {
        var data = await PrepareAsync();
        await using var admin = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA);
        admin.Branches.Add(new IdentityBranch { Id = Guid.CreateVersion7(), TenantId = data.TenantA, Name = "Inactive", Active = false });
        var second = Guid.CreateVersion7();
        admin.Branches.Add(new IdentityBranch { Id = second, TenantId = data.TenantA, Name = "Second", Active = true });
        await admin.SaveChangesAsync();
        var login = await LoginAsync(data);
        Assert.Equal(2, login.Me.Branches.Count); Assert.Null(login.Me.ActiveBranchId);
        var selected = await RunAsync(data, s => s.MeAsync(data.UserA, login.SessionId, second));
        Assert.NotNull(selected); Assert.Equal(second, selected.ActiveBranchId);
        Assert.DoesNotContain(login.Me.Branches, b => b.Id == data.BranchB);
    }

    [Fact]
    public async Task Activation_ReissueInvalidatesOld_ConsumesOnceAndHashesPassword()
    {
        var data = await PrepareAsync();
        var old = await RunAsync(data, s => s.IssueActivationAsync(data.UserA, data.UserA));
        var current = await RunAsync(data, s => s.IssueActivationAsync(data.UserA, data.UserA));
        Assert.NotNull(old); Assert.NotNull(current);
        Assert.False(await RunAsync(data, s => s.ActivateAsync(old.Token, Password, "Name")));
        Assert.True(await RunAsync(data, s => s.ActivateAsync(current.Token, Password, "Name")));
        Assert.False(await RunAsync(data, s => s.ActivateAsync(current.Token, Password, "Name")));
        await using var admin = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA);
        var user = await admin.Users.SingleAsync();
        Assert.Equal(UserStatus.Active, user.Status);
        Assert.True(await new IdentityCredentialHasher().VerifyAsync(Password, user.PasswordHash));
        Assert.DoesNotContain(current.Token, System.Text.Json.JsonSerializer.Serialize(await admin.Set<IdentityActivationToken>().ToListAsync()));
    }

    [Theory]
    [InlineData("expired")]
    [InlineData("revoked")]
    [InlineData("blocked")]
    [InlineData("foreign")]
    public async Task Activation_InvalidState_DoesNotChangeCredential(string state)
    {
        var data = await PrepareAsync();
        var issued = await RunAsync(data, s => s.IssueActivationAsync(data.UserA, data.UserA));
        Assert.NotNull(issued);
        await using (var admin = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA))
        {
            var row = await admin.Set<IdentityActivationToken>().SingleAsync();
            if (state == "expired") { row.CreatedAt = DateTimeOffset.UtcNow.AddDays(-2); row.ExpiresAt = DateTimeOffset.UtcNow.AddSeconds(-1); }
            if (state == "revoked") row.RevokedAt = DateTimeOffset.UtcNow;
            if (state == "blocked") (await admin.Users.SingleAsync()).Status = UserStatus.Blocked;
            // Foreign tenant is checked using a context bound to tenant B.
            await admin.SaveChangesAsync();
        }
        Assert.False(await RunAsync(state == "foreign" ? data with { TenantA = data.TenantB } : data,
            s => s.ActivateAsync(issued.Token, Password, "Changed")));
    }

    [Fact]
    public async Task Activation_AdminCannotResetOwner_OrTargetWithoutGrant()
    {
        var data = await PrepareAsync();
        await using var admin = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA);
        await admin.TenantRoles.ExecuteUpdateAsync(x => x.SetProperty(r => r.Role, AccessRole.AccessAdministrator));
        var owner = Guid.CreateVersion7();
        admin.Users.Add(new IdentityUser { Id = owner, TenantId = data.TenantA, Name = "Owner", EmailNormalized = "owner@test.local", Status = UserStatus.Active });
        admin.TenantRoles.Add(new IdentityTenantRole { Id = Guid.CreateVersion7(), TenantId = data.TenantA, UserId = owner, Role = AccessRole.Owner, Active = true });
        await admin.SaveChangesAsync();
        Assert.Null(await RunAsync(data, s => s.IssueActivationAsync(data.UserA, owner)));
        await admin.BranchGrants.ExecuteUpdateAsync(x => x.SetProperty(g => g.Active, false));
        await admin.TenantRoles.Where(r => r.UserId == data.UserA).ExecuteUpdateAsync(x => x.SetProperty(g => g.Active, false));
        Assert.Null(await RunAsync(data, s => s.IssueActivationAsync(owner, data.UserA)));
    }

    [Fact]
    public async Task Login_NormalizesEmail_AutoSelectsSingleBranchAndRejectsWrongCredential()
    {
        var data = await PrepareAsync();
        Assert.Null(await RunAsync(data, s => s.LoginAsync("seller@example.test", "wrong")));
        var login = await LoginAsync(data);
        Assert.Equal(data.BranchA, login.Me.ActiveBranchId);
        Assert.Single(login.Me.Branches);
        Assert.True(await RunAsync(data, s => s.ValidateSessionAsync(data.UserA, login.SessionId)));
        Assert.Null(await RunAsync(data with { TenantA = data.TenantB }, s => s.LoginAsync("seller@example.test", Password)));
    }

    [Theory]
    [InlineData(UserStatus.Pending)]
    [InlineData(UserStatus.Blocked)]
    public async Task Login_InactiveAccount_Denies(UserStatus status)
    {
        var data = await PrepareAsync();
        await using var admin = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA);
        await admin.Users.ExecuteUpdateAsync(x => x.SetProperty(u => u.Status, status));
        Assert.Null(await RunAsync(data, s => s.LoginAsync("seller@example.test", Password)));
    }

    [Fact]
    public async Task Me_RemovedGrantAndBlockedUser_TakeEffectImmediately()
    {
        var data = await PrepareAsync(); var login = await LoginAsync(data);
        Assert.Null(await RunAsync(data, s => s.MeAsync(data.UserA, login.SessionId, data.BranchB)));
        await using var admin = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA);
        await admin.TenantRoles.ExecuteUpdateAsync(x => x.SetProperty(r => r.Role, AccessRole.AccessAdministrator));
        await admin.BranchGrants.ExecuteUpdateAsync(x => x.SetProperty(g => g.Active, false));
        var me = await RunAsync(data, s => s.MeAsync(data.UserA, login.SessionId));
        Assert.NotNull(me); Assert.Empty(me.Branches); Assert.Null(me.ActiveBranchId);
        await admin.Users.ExecuteUpdateAsync(x => x.SetProperty(u => u.Status, UserStatus.Blocked));
        Assert.False(await RunAsync(data, s => s.ValidateSessionAsync(data.UserA, login.SessionId)));
    }

    [Fact]
    public async Task Refresh_RotationThenReplay_RevokesFamilyAndJwtSession()
    {
        var data = await PrepareAsync(); var login = await LoginAsync(data);
        var csrf = await RunAsync(data, s => s.IssueCsrfAsync(login.RefreshToken)); Assert.NotNull(csrf);
        var next = await RunAsync(data, s => s.RefreshAsync(login.RefreshToken, csrf)); Assert.NotNull(next);
        Assert.NotEqual(login.RefreshToken, next.RefreshToken); Assert.Equal(login.ExpiresAt, next.ExpiresAt);
        Assert.Null(await RunAsync(data, s => s.RefreshAsync(login.RefreshToken, csrf)));
        Assert.False(await RunAsync(data, s => s.ValidateSessionAsync(data.UserA, login.SessionId)));
        Assert.Null(await RunAsync(data, s => s.IssueCsrfAsync(next.RefreshToken)));
    }

    [Fact]
    public async Task Logout_RequiresCsrf_ThenRevokesFamily()
    {
        var data = await PrepareAsync(); var login = await LoginAsync(data);
        Assert.False(await RunAsync(data, s => s.LogoutAsync(login.RefreshToken, "forged")));
        var csrf = await RunAsync(data, s => s.IssueCsrfAsync(login.RefreshToken)); Assert.NotNull(csrf);
        Assert.True(await RunAsync(data, s => s.LogoutAsync(login.RefreshToken, csrf)));
        Assert.False(await RunAsync(data, s => s.ValidateSessionAsync(data.UserA, login.SessionId)));
    }

    [Fact]
    public async Task Activation_ConcurrentConsumption_OnlyOneSucceeds()
    {
        var data = await PrepareAsync();
        var issued = await RunAsync(data, s => s.IssueActivationAsync(data.UserA, data.UserA)); Assert.NotNull(issued);
        var results = await Task.WhenAll(RunAsync(data, s => s.ActivateAsync(issued.Token, Password, "Name")), RunAsync(data, s => s.ActivateAsync(issued.Token, Password, "Name")));
        Assert.Single(results, r => r);
    }

    [Fact]
    public async Task Refresh_ConcurrentConsumption_LeavesNoExtraValidFamily()
    {
        var data = await PrepareAsync(); var login = await LoginAsync(data);
        var csrf = await RunAsync(data, s => s.IssueCsrfAsync(login.RefreshToken)); Assert.NotNull(csrf);
        var results = await Task.WhenAll(RunAsync(data, s => s.RefreshAsync(login.RefreshToken, csrf)), RunAsync(data, s => s.RefreshAsync(login.RefreshToken, csrf)));
        Assert.Single(results, r => r is not null);
        Assert.False(await RunAsync(data, s => s.ValidateSessionAsync(data.UserA, login.SessionId)));
        var successful = Assert.Single(results, r => r is not null)!;
        Assert.Null(await RunAsync(data, s => s.IssueCsrfAsync(successful.RefreshToken)));
    }

    private async Task<IdentityTestData> PrepareAsync()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var admin = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA);
        var user = await admin.Users.SingleAsync();
        user.PasswordHash = await new IdentityCredentialHasher().HashAsync(Password);
        (await admin.TenantRoles.SingleAsync()).Role = AccessRole.Owner;
        await admin.SaveChangesAsync();
        await admin.Database.ExecuteSqlRawAsync("GRANT SELECT, INSERT, UPDATE, DELETE ON identity.ativacoes, identity.sessoes TO s103a_runtime");
        return data;
    }

    private async Task ExecuteAdminAsync(string sql)
    {
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        await command.ExecuteNonQueryAsync();
    }

    private async Task<T> RunAsync<T>(IdentityTestData data, Func<IdentitySessionService, Task<T>> run)
    {
        var settings = new NpgsqlConnectionStringBuilder(fixture.RuntimeConnectionString) { Pooling = false };
        await using var context = IdentityTestData.Context(settings.ConnectionString, data.TenantA);
        return await run(new IdentitySessionService(context, new IdentityCredentialHasher()));
    }

    private async Task<IdentityLoginResult> LoginAsync(IdentityTestData data)
        => Assert.IsType<IdentityLoginResult>(await RunAsync(data, s => s.LoginAsync(" SELLER@EXAMPLE.TEST ", Password)));
}
