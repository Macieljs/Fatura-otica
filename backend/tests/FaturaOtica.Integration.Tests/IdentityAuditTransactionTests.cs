using FaturaOtica.Domain.Identity;
using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentityAuditTransactionTests(IdentityPostgreSqlFixture fixture)
{
    private static IdentityAuditEvent Event(IdentityTestData data, Guid? tenant = null)
        => new(Guid.CreateVersion7(), tenant ?? data.TenantA, data.UserA, data.UserA,
            IdentityAuditAction.BlockUser, DateTimeOffset.UtcNow);

    [Theory]
    [InlineData(false)] [InlineData(true)]
    public async Task Append_SemWrapperOuTransacaoExterna_RecusaAntesDePersistir(bool external)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        if (external) await context.Database.BeginTransactionAsync();
        var audit = Event(data);
        var transaction = context.Database.CurrentTransaction;
        await Assert.ThrowsAsync<InvalidOperationException>(() => new PostgreSqlIdentityAuditWriter(context).AppendAsync(audit).AsTask());
        Assert.Same(transaction, context.Database.CurrentTransaction);
        Assert.Empty(context.ChangeTracker.Entries<IdentityAuditEvent>());
    }

    [Theory]
    [InlineData(false)] [InlineData(true)]
    public async Task Append_TenantDivergenteOuEventoNull_ReverteAlteracaoEImpedeCommit(bool missing)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await using var wrapper = await IdentityTenantTransaction.BeginAsync(context);
        await context.Database.ExecuteSqlInterpolatedAsync($"UPDATE identity.usuarios SET status='Blocked' WHERE id={data.UserA}");
        var writer = new PostgreSqlIdentityAuditWriter(context);
        if (missing) await Assert.ThrowsAnyAsync<ArgumentException>(() => writer.AppendAsync(null!).AsTask());
        else await Assert.ThrowsAsync<InvalidOperationException>(() => writer.AppendAsync(Event(data, data.TenantB)).AsTask());
        Assert.Empty(context.ChangeTracker.Entries<IdentityAuditEvent>());
        await Assert.ThrowsAsync<InvalidOperationException>(() => wrapper.CommitAsync());
        await AssertStored(data, Guid.NewGuid(), "Active", 0L);
    }

    [Theory]
    [InlineData("commit")] [InlineData("dispose")] [InlineData("sql-failure")] [InlineData("cancel")]
    public async Task Append_AlteracaoERegistro_ConfirmamOuRevertemJuntos(string outcome)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        var audit = Event(data);
        await using (var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA))
        {
            await using var wrapper = await IdentityTenantTransaction.BeginAsync(context);
            await context.Database.ExecuteSqlInterpolatedAsync($"UPDATE identity.usuarios SET status='Blocked' WHERE id={data.UserA}");
            var writer = new PostgreSqlIdentityAuditWriter(context);
            if (outcome == "cancel")
            {
                using var cancellation = new CancellationTokenSource();
                await cancellation.CancelAsync();
                await Assert.ThrowsAnyAsync<OperationCanceledException>(() => writer.AppendAsync(audit, cancellation.Token).AsTask());
                await Assert.ThrowsAsync<InvalidOperationException>(() => wrapper.CommitAsync());
            }
            else
            {
                await writer.AppendAsync(audit);
                Assert.NotNull(context.Database.CurrentTransaction);
                Assert.Equal(1L, await Scalar(context, "SELECT count(*) FROM identity.auditoria"));
                // Independent admin sees neither uncommitted effect; Append must not commit.
                await AssertStored(data, audit.Id, "Active", 0L);
                if (outcome == "commit") await wrapper.CommitAsync();
                if (outcome == "sql-failure")
                {
                    var error = await Assert.ThrowsAsync<PostgresException>(() => context.Database.ExecuteSqlRawAsync("SELECT 1/0"));
                    Assert.Equal("22012", error.SqlState);
                }
            }
        }
        await AssertStored(data, audit.Id, outcome == "commit" ? "Blocked" : "Active", outcome == "commit" ? 1L : 0L);
    }

    [Fact]
    public async Task Append_InsertFalha_ReverteAlteracaoEImpedeCommit()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await using var wrapper = await IdentityTenantTransaction.BeginAsync(context);
        await context.Database.ExecuteSqlInterpolatedAsync($"UPDATE identity.usuarios SET status='Blocked' WHERE id={data.UserA}");
        var audit = new IdentityAuditEvent(Guid.CreateVersion7(), data.TenantA, Guid.NewGuid(), data.UserA,
            IdentityAuditAction.BlockUser, DateTimeOffset.UtcNow);
        var error = await Assert.ThrowsAsync<PostgresException>(() => new PostgreSqlIdentityAuditWriter(context).AppendAsync(audit).AsTask());
        Assert.Equal("23503", error.SqlState);
        await Assert.ThrowsAsync<InvalidOperationException>(() => wrapper.CommitAsync());
        await AssertStored(data, audit.Id, "Active", 0L);
    }

    private async Task AssertStored(IdentityTestData data, Guid id, string status, long count)
    {
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        await using var user = IdentityTestData.Command(admin, "SELECT status FROM identity.usuarios WHERE id=@ua", data);
        Assert.Equal(status, await user.ExecuteScalarAsync());
        await using var rows = new NpgsqlCommand("SELECT count(*) FROM identity.auditoria WHERE id=@audit", admin);
        rows.Parameters.AddWithValue("audit", id);
        Assert.Equal(count, await rows.ExecuteScalarAsync());
    }

    private static async Task<object?> Scalar(IdentityDbContext context, string sql)
    {
        await using var command = new NpgsqlCommand(sql, (NpgsqlConnection)context.Database.GetDbConnection());
        return await command.ExecuteScalarAsync();
    }
}
