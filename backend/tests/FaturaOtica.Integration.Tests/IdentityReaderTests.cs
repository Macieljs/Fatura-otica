using System.Data;
using System.Data.Common;
using FaturaOtica.Application.Identity;
using FaturaOtica.Domain.Identity;
using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentityReaderTests(IdentityPostgreSqlFixture fixture)
{
    private static readonly string[] SnapshotPropertyNames = ["BranchGrants", "Status", "TenantId", "TenantRoles", "UserId"];

    [Fact]
    public async Task GetAsync_UsuarioAtual_SnapshotExatoSemSegredosEmUmaInstrucao()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        await IdentityTestData.ExecuteAsync(admin,
            "INSERT INTO identity.papeis_usuarios(id,tenant_id,usuario_id,papel,ativo) VALUES(@id,@ta,@ua,'Owner',false)", data);
        await IdentityTestData.ExecuteAsync(admin,
            """
            INSERT INTO identity.filiais(id,tenant_id,nome,ativa) VALUES(@id,@ta,'Inactive',false);
            INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo) VALUES(@id,@ta,@ua,@id,'Seller',true)
            """, data);
        await IdentityTestData.ExecuteAsync(admin,
            """
            INSERT INTO identity.filiais(id,tenant_id,nome,ativa) VALUES(@id,@ta,'Unassigned',true);
            INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo) VALUES(@id,@ta,@ua,@id,'Seller',false)
            """, data);
        var counter = new SnapshotCommandCounter();
        var options = new DbContextOptionsBuilder<IdentityDbContext>().UseNpgsql(fixture.RuntimeConnectionString)
            .AddInterceptors(counter).Options;
        await using var context = new IdentityDbContext(options, data.TenantA);
        var reader = new PostgreSqlCurrentUserAccessReader(context);
        var snapshot = await reader.GetAsync(data.UserA);
        Assert.NotNull(snapshot);
        Assert.Equal(data.UserA, snapshot.UserId);
        Assert.Equal(data.TenantA, snapshot.TenantId);
        Assert.Equal(UserStatus.Active, snapshot.Status);
        Assert.Equal(AccessRole.AccessAdministrator, Assert.Single(snapshot.TenantRoles));
        Assert.Equal(new BranchGrant(data.TenantA, data.BranchA, AccessRole.Seller), Assert.Single(snapshot.BranchGrants));
        Assert.Equal(1, counter.SnapshotCommands);
        Assert.Empty(context.ChangeTracker.Entries());
        Assert.Equal(SnapshotPropertyNames,
            typeof(UserAccessSnapshot).GetProperties().Select(x => x.Name).Order(StringComparer.Ordinal));
        Assert.Null(await reader.GetAsync(data.UserB));
        Assert.Null(await reader.GetAsync(Guid.CreateVersion7()));
        Assert.Null(context.Database.CurrentTransaction);
    }

    [Theory]
    [InlineData("UPDATE identity.concessoes_filiais SET ativo=false WHERE id=@ga", AccessAction.OperateBranch, AccessDenialReason.BranchNotGranted)]
    [InlineData("UPDATE identity.usuarios SET status='Blocked' WHERE id=@ua", AccessAction.ReadOwnProfile, AccessDenialReason.InactiveUser)]
    [InlineData("UPDATE identity.usuarios SET status='Pending' WHERE id=@ua", AccessAction.ReadOwnProfile, AccessDenialReason.InactiveUser)]
    [InlineData("UPDATE identity.filiais SET ativa=false WHERE id=@ba", AccessAction.OperateBranch, AccessDenialReason.BranchNotGranted)]
    [InlineData("UPDATE identity.papeis_usuarios SET ativo=false WHERE id=@ra", AccessAction.ManageAccess, AccessDenialReason.PermissionDenied)]
    public async Task AuthorizeAsync_MesmoWrapperReadCommitted_MudancaConfirmadaAfetaProximaLeitura(
        string update, AccessAction action, AccessDenialReason expectedDenial)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await using var wrapper = await IdentityTenantTransaction.BeginAsync(context);
        var originalTransaction = context.Database.CurrentTransaction;
        Assert.NotNull(originalTransaction);
        var authorizer = new CurrentAccessAuthorizer(new PostgreSqlCurrentUserAccessReader(context), data.TenantA);
        var branch = action == AccessAction.OperateBranch ? new BranchScope(data.TenantA, data.BranchA) : null;
        Assert.True((await authorizer.AuthorizeAsync(data.UserA, action, branch)).Allowed);
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        Assert.Equal(1, await IdentityTestData.ExecuteAsync(admin, update, data));
        var second = await authorizer.AuthorizeAsync(data.UserA, action, branch);
        Assert.False(second.Allowed);
        Assert.Equal(expectedDenial, second.Reason);
        Assert.Same(originalTransaction, context.Database.CurrentTransaction);
    }

    [Fact]
    public async Task GetAsync_MesmoContextoSemWrapper_RevogacaoAfetaProximaLeitura()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        var reader = new PostgreSqlCurrentUserAccessReader(context);
        Assert.Single((await reader.GetAsync(data.UserA))!.BranchGrants);
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        await IdentityTestData.ExecuteAsync(admin, "DELETE FROM identity.concessoes_filiais WHERE id=@ga", data);
        Assert.Empty((await reader.GetAsync(data.UserA))!.BranchGrants);
    }

    [Theory]
    [InlineData(IsolationLevel.ReadCommitted)]
    [InlineData(IsolationLevel.RepeatableRead)]
    [InlineData(IsolationLevel.Serializable)]
    public async Task GetAsync_TransacaoExternaMesmoTenant_RecusaSemEncerrarChamador(IsolationLevel isolation)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await using var external = await context.Database.BeginTransactionAsync(isolation);
        await context.Database.ExecuteSqlInterpolatedAsync($"SELECT set_config('app.tenant_id', {data.TenantA.ToString()}, true)");
        var reader = new PostgreSqlCurrentUserAccessReader(context);
        await Assert.ThrowsAsync<InvalidOperationException>(async () => await reader.GetAsync(data.UserA));
        Assert.Same(external, context.Database.CurrentTransaction);
        await external.RollbackAsync();
    }

    [Fact]
    public async Task GetAsync_WrapperLegitimo_NaoConfirmaMutacaoDoChamador()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await using (var wrapper = await IdentityTenantTransaction.BeginAsync(context))
        {
            await context.Database.ExecuteSqlInterpolatedAsync($"UPDATE identity.usuarios SET nome='Uncommitted' WHERE id={data.UserA}");
            Assert.NotNull(await new PostgreSqlCurrentUserAccessReader(context).GetAsync(data.UserA));
            Assert.NotNull(context.Database.CurrentTransaction);
        }
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        await using var command = IdentityTestData.Command(admin, "SELECT nome FROM identity.usuarios WHERE id=@ua", data);
        Assert.Equal("User A", await command.ExecuteScalarAsync());
    }

    [Fact]
    public async Task GetAsync_WrapperConfirmadoDepoisTransacaoSubstituida_RecusaEscopoObsoleto()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await using (var wrapper = await IdentityTenantTransaction.BeginAsync(context))
            await wrapper.CommitAsync();
        await using (var replacement = await context.Database.BeginTransactionAsync())
        {
            await context.Database.ExecuteSqlInterpolatedAsync($"SELECT set_config('app.tenant_id',{data.TenantA.ToString()},true)");
            await Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await new PostgreSqlCurrentUserAccessReader(context).GetAsync(data.UserA));
            Assert.Same(replacement, context.Database.CurrentTransaction);
            await replacement.RollbackAsync();
        }
        Assert.NotNull(await new PostgreSqlCurrentUserAccessReader(context).GetAsync(data.UserA));
    }

    [Fact]
    public async Task GetAsync_Cancelamento_PropagaENaoDeixaTransacao()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        using var cancellation = new CancellationTokenSource();
        await cancellation.CancelAsync();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(async () =>
            await new PostgreSqlCurrentUserAccessReader(context).GetAsync(data.UserA, cancellation.Token));
        Assert.Null(context.Database.CurrentTransaction);
    }

    [Fact]
    public async Task GetAsync_UserIdVazio_RetornaNullSemComandoOuTransacao()
    {
        var counter = new SnapshotCommandCounter();
        var options = new DbContextOptionsBuilder<IdentityDbContext>().UseNpgsql(fixture.RuntimeConnectionString)
            .AddInterceptors(counter).Options;
        await using var context = new IdentityDbContext(options, Guid.CreateVersion7());
        var reader = new PostgreSqlCurrentUserAccessReader(context);
        Assert.Null(await reader.GetAsync(Guid.Empty));
        Assert.Equal(0, counter.AllCommands);
        Assert.Null(context.Database.CurrentTransaction);
        Assert.Equal(ConnectionState.Closed, context.Database.GetDbConnection().State);
        using var cancellation = new CancellationTokenSource();
        await cancellation.CancelAsync();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(async () => await reader.GetAsync(Guid.Empty, cancellation.Token));
        Assert.Equal(0, counter.AllCommands);
    }

    [Fact]
    public async Task GetAsync_QueryBloqueadaAposBegin_CancelamentoReverteELimpaMesmaConexao()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        await using var lockTransaction = await admin.BeginTransactionAsync();
        await using var block = new NpgsqlCommand("LOCK TABLE identity.usuarios IN ACCESS EXCLUSIVE MODE", admin);
        await block.ExecuteNonQueryAsync();
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await context.Database.OpenConnectionAsync();
        var connection = (NpgsqlConnection)context.Database.GetDbConnection();
        await using var pidCommand = new NpgsqlCommand("SELECT pg_backend_pid()", connection);
        var pid = await pidCommand.ExecuteScalarAsync();
        using var cancellation = new CancellationTokenSource(TimeSpan.FromSeconds(20));
        var readTask = new PostgreSqlCurrentUserAccessReader(context).GetAsync(data.UserA, cancellation.Token).AsTask();
        await using var observer = new NpgsqlConnection(fixture.AdminConnectionString);
        await observer.OpenAsync();
        var observedBlockedTransaction = false;
        for (var attempt = 0; attempt < 50 && !readTask.IsCompleted; attempt++)
        {
            await using var activity = new NpgsqlCommand(
                "SELECT count(*) FROM pg_stat_activity WHERE pid=@pid AND xact_start IS NOT NULL AND wait_event_type='Lock' AND query LIKE '%usuarios%'", observer);
            activity.Parameters.AddWithValue("pid", pid!);
            if (Equals(1L, await activity.ExecuteScalarAsync()))
            {
                observedBlockedTransaction = true;
                break;
            }
            await Task.Delay(100);
        }
        await cancellation.CancelAsync();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(async () => await readTask);
        await lockTransaction.RollbackAsync();
        Assert.True(observedBlockedTransaction, "Reader must reach its snapshot statement inside a transaction before cancellation.");
        Assert.Null(context.Database.CurrentTransaction);
        Assert.Equal(pid, await pidCommand.ExecuteScalarAsync());
        await using var guc = new NpgsqlCommand("SELECT current_setting('app.tenant_id',true)", connection);
        var tenant = await guc.ExecuteScalarAsync();
        Assert.True(tenant is null or DBNull || string.IsNullOrEmpty((string)tenant));
        Assert.NotNull(await new PostgreSqlCurrentUserAccessReader(context).GetAsync(data.UserA));
    }

    private sealed class SnapshotCommandCounter : DbCommandInterceptor
    {
        public int SnapshotCommands { get; private set; }
        public int AllCommands { get; private set; }

        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(DbCommand command,
            CommandEventData eventData, InterceptionResult<DbDataReader> result, CancellationToken cancellationToken = default)
        {
            AllCommands++;
            if (command.CommandText.Contains("usuarios", StringComparison.OrdinalIgnoreCase))
                SnapshotCommands++;
            return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
        }

        public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(DbCommand command,
            CommandEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            AllCommands++;
            return base.NonQueryExecutingAsync(command, eventData, result, cancellationToken);
        }

        public override ValueTask<InterceptionResult<object>> ScalarExecutingAsync(DbCommand command,
            CommandEventData eventData, InterceptionResult<object> result, CancellationToken cancellationToken = default)
        {
            AllCommands++;
            return base.ScalarExecutingAsync(command, eventData, result, cancellationToken);
        }
    }
}
