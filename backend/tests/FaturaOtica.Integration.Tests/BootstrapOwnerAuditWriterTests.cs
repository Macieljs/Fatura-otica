using FaturaOtica.Domain.Identity;
using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class BootstrapOwnerAuditWriterTests(IdentityPostgreSqlFixture fixture)
{
    private static readonly DateTimeOffset Time = new(2026, 10, 7, 12, 0, 0, TimeSpan.Zero);
    [Theory]
    [InlineData(true, true)]
    [InlineData(true, false)]
    [InlineData(false, true)]
    [InlineData(false, false)]
    public async Task Append_WrapperValidado_SistemaEHumanoConfirmamOuRevertemComMutacao(bool bootstrap, bool commit)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        var audit = Event(data, bootstrap);
        await using (var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA))
        {
            await using var wrapper = await IdentityTenantTransaction.BeginAsync(context);
            await context.Database.ExecuteSqlInterpolatedAsync($"UPDATE identity.usuarios SET status='Blocked' WHERE id={data.UserA}");
            await new PostgreSqlIdentityAuditWriter(context).AppendAsync(audit);

            var stored = await context.Set<IdentityAuditEvent>().AsNoTracking().SingleAsync(row => row.Id == audit.Id);
            Assert.Equal(audit.ActorUserId, stored.ActorUserId);
            if (bootstrap) Assert.Null(stored.ActorUserId);
            else Assert.Equal(data.UserA, stored.ActorUserId);
            Assert.Equal(audit.Action, stored.Action);
            Assert.Equal(audit.Role, stored.Role);
            Assert.NotNull(context.Database.CurrentTransaction);
            // An independent connection proves Append did not implicitly commit either effect.
            await AssertStored(data, audit, "Active", false);
            if (commit) await wrapper.CommitAsync();
        }
        await AssertStored(data, audit, commit ? "Blocked" : "Active", commit);
    }

    [Theory]
    [InlineData(true, false)]
    [InlineData(true, true)]
    [InlineData(false, false)]
    [InlineData(false, true)]
    public async Task Append_SemWrapperValidado_RecusaSistemaEHumanoSemConfirmarTransacaoExterna(bool bootstrap, bool external)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        var audit = Event(data, bootstrap);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        if (external) await context.Database.BeginTransactionAsync();
        var transaction = context.Database.CurrentTransaction;
        await Assert.ThrowsAsync<InvalidOperationException>(() => new PostgreSqlIdentityAuditWriter(context).AppendAsync(audit).AsTask());
        Assert.Same(transaction, context.Database.CurrentTransaction);
        Assert.Empty(context.ChangeTracker.Entries<IdentityAuditEvent>());
        await AssertStored(data, audit, "Active", false);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Append_EventoDeOutroTenant_ReverteMutacaoEImpedeCommitSistemaEHumano(bool bootstrap)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        var audit = Event(data, bootstrap, data.TenantB);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await using var wrapper = await IdentityTenantTransaction.BeginAsync(context);
        await context.Database.ExecuteSqlInterpolatedAsync($"UPDATE identity.usuarios SET status='Blocked' WHERE id={data.UserA}");
        await Assert.ThrowsAsync<InvalidOperationException>(() => new PostgreSqlIdentityAuditWriter(context).AppendAsync(audit).AsTask());
        await Assert.ThrowsAsync<InvalidOperationException>(() => wrapper.CommitAsync());
        Assert.Null(context.Database.CurrentTransaction);
        await AssertStored(data, audit, "Active", false);
    }

    private static IdentityAuditEvent Event(IdentityTestData data, bool bootstrap, Guid? tenant = null)
        => bootstrap
            ? IdentityAuditEvent.CreateBootstrapOwner(tenant ?? data.TenantA, data.UserA, Time)
            : IdentityAuditEvent.Create(tenant ?? data.TenantA, data.UserA, data.UserA,
                IdentityAuditAction.GrantAccess, Time, AccessRole.Owner);

    private async Task AssertStored(IdentityTestData data, IdentityAuditEvent audit, string status, bool present)
    {
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        await using var state = new NpgsqlCommand("SELECT status,(SELECT count(*) FROM identity.auditoria WHERE id=@audit) FROM identity.usuarios WHERE id=@user", admin);
        state.Parameters.AddWithValue("audit", audit.Id);
        state.Parameters.AddWithValue("user", data.UserA);
        await using (var reader = await state.ExecuteReaderAsync())
        {
            Assert.True(await reader.ReadAsync());
            Assert.Equal(status, reader.GetString(0));
            Assert.Equal(present ? 1L : 0L, reader.GetInt64(1));
        }
        if (!present) return;
        await using var row = new NpgsqlCommand("SELECT tenant_id,autor_usuario_id,alvo_usuario_id,acao,ocorrido_em,papel,filial_id FROM identity.auditoria WHERE id=@audit", admin);
        row.Parameters.AddWithValue("audit", audit.Id);
        await using var persisted = await row.ExecuteReaderAsync();
        Assert.True(await persisted.ReadAsync());
        Assert.Equal(audit.TenantId, persisted.GetGuid(0));
        if (audit.ActorUserId is { } actor) Assert.Equal(actor, persisted.GetGuid(1));
        else Assert.True(persisted.IsDBNull(1));
        Assert.Equal(audit.TargetUserId, persisted.GetGuid(2));
        Assert.Equal(audit.Action.ToString(), persisted.GetString(3));
        Assert.Equal(audit.OccurredAt.UtcDateTime, persisted.GetDateTime(4));
        Assert.Equal(audit.Role!.Value.ToString(), persisted.GetString(5));
        Assert.True(persisted.IsDBNull(6));
        Assert.False(await persisted.ReadAsync());
    }
}
