using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentityTenantTransactionTests(IdentityPostgreSqlFixture fixture)
{
    [Fact]
    public void IdentityDbContext_TenantVazio_RecusaAntesDeIo()
        => Assert.Throws<ArgumentException>(() => IdentityTestData.Context(fixture.RuntimeConnectionString, Guid.Empty));

    [Fact]
    public async Task BeginAsync_TransacaoAtiva_RecusaSemSubstituirContexto()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await using var first = await IdentityTenantTransaction.BeginAsync(context);
        var transaction = context.Database.CurrentTransaction;
        await Assert.ThrowsAsync<InvalidOperationException>(() => IdentityTenantTransaction.BeginAsync(context));
        Assert.Same(transaction, context.Database.CurrentTransaction);
        Assert.Equal(data.TenantA.ToString(), await ScalarAsync(context, "SELECT current_setting('app.tenant_id',true)"));
    }

    [Fact]
    public async Task CommitDispose_ReusoFisicoDaConexao_PoolingNaoTransportaTenant()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        int pid;
        await using (var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA))
        {
            await context.Database.OpenConnectionAsync();
            pid = (int)(await ScalarAsync(context, "SELECT pg_backend_pid()"))!;
            await using (var wrapper = await IdentityTenantTransaction.BeginAsync(context))
            {
                Assert.Equal(data.TenantA.ToString(), await ScalarAsync(context, "SELECT current_setting('app.tenant_id',true)"));
                Assert.Equal(1L, await ScalarAsync(context, "SELECT count(*) FROM identity.usuarios"));
                await wrapper.CommitAsync();
            }
            Assert.True(string.IsNullOrEmpty((string?)await ScalarAsync(context, "SELECT current_setting('app.tenant_id',true)")));
            Assert.Equal(0L, await ScalarAsync(context, "SELECT count(*) FROM identity.usuarios"));
            Assert.Null(context.Database.CurrentTransaction);
        }
        await using (var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantB))
        {
            await context.Database.OpenConnectionAsync();
            Assert.Equal(pid, await ScalarAsync(context, "SELECT pg_backend_pid()"));
            Assert.Equal(0L, await ScalarAsync(context, "SELECT count(*) FROM identity.usuarios"));
            await using var wrapper = await IdentityTenantTransaction.BeginAsync(context);
            Assert.Equal(data.TenantB.ToString(), await ScalarAsync(context, "SELECT current_setting('app.tenant_id',true)"));
            Assert.Equal(1L, await ScalarAsync(context, "SELECT count(*) FROM identity.usuarios"));
            Assert.Equal(data.UserB, await ScalarAsync(context, "SELECT id FROM identity.usuarios"));
        }
        await using var final = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await final.Database.OpenConnectionAsync();
        Assert.Equal(pid, await ScalarAsync(final, "SELECT pg_backend_pid()"));
        await using var finalWrapper = await IdentityTenantTransaction.BeginAsync(final);
        Assert.Equal(data.UserA, await ScalarAsync(final, "SELECT id FROM identity.usuarios"));
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task DisposeAsync_SemCommitOuAposErroSql_ReverteELimpaContextoNaMesmaConexao(bool failSql)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await context.Database.OpenConnectionAsync();
        var pid = await ScalarAsync(context, "SELECT pg_backend_pid()");
        await using (var wrapper = await IdentityTenantTransaction.BeginAsync(context))
        {
            await context.Database.ExecuteSqlInterpolatedAsync($"UPDATE identity.usuarios SET nome='Uncommitted' WHERE id={data.UserA}");
            if (failSql)
            {
                var error = await Assert.ThrowsAsync<PostgresException>(() => ScalarAsync(context, "SELECT 1/0"));
                Assert.Equal("22012", error.SqlState);
            }
        }
        Assert.Equal(pid, await ScalarAsync(context, "SELECT pg_backend_pid()"));
        Assert.True(string.IsNullOrEmpty((string?)await ScalarAsync(context, "SELECT current_setting('app.tenant_id',true)")));
        Assert.Equal(0L, await ScalarAsync(context, "SELECT count(*) FROM identity.usuarios"));
        await using var next = await IdentityTenantTransaction.BeginAsync(context);
        Assert.Equal("User A", await ScalarAsync(context, "SELECT nome FROM identity.usuarios"));
    }

    [Fact]
    public async Task BeginAsync_Cancelamento_PropagaSemContextoReutilizavel()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.RuntimeConnectionString, data.TenantA);
        await context.Database.OpenConnectionAsync();
        using var cancellation = new CancellationTokenSource();
        await cancellation.CancelAsync();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => IdentityTenantTransaction.BeginAsync(context, cancellation.Token));
        Assert.Null(context.Database.CurrentTransaction);
        Assert.True(string.IsNullOrEmpty((string?)await ScalarAsync(context, "SELECT current_setting('app.tenant_id',true)")));
    }

    private static async Task<object?> ScalarAsync(IdentityDbContext context, string sql)
    {
        await using var command = new NpgsqlCommand(sql, (NpgsqlConnection)context.Database.GetDbConnection());
        var value = await command.ExecuteScalarAsync();
        return value is DBNull ? null : value;
    }
}
