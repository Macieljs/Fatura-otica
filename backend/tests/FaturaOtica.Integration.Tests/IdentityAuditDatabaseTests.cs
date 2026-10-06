using FaturaOtica.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentityAuditDatabaseTests(IdentityPostgreSqlFixture fixture)
{
    private const string Insert = "INSERT INTO identity.auditoria(id,tenant_id,autor_usuario_id,alvo_usuario_id,acao,ocorrido_em,papel,filial_id) VALUES(@id,@ta,@ua,@ua,'BlockUser',now(),NULL,NULL)";

    [Theory]
    [InlineData("@id", "@empty", "ck_auditoria_id_nao_vazio")]
    [InlineData("@ta", "@empty", "ck_auditoria_tenant_id_nao_vazio")]
    [InlineData("@ua,@ua", "@empty,@ua", "ck_auditoria_autor_usuario_id_nao_vazio")]
    [InlineData("@ua,@ua", "@ua,@empty", "ck_auditoria_alvo_usuario_id_nao_vazio")]
    [InlineData("'BlockUser'", "'Unknown'", "ck_auditoria_acao")]
    [InlineData("NULL,NULL", "'Unknown',NULL", null)]
    [InlineData("NULL,NULL", "'Owner',NULL", "ck_auditoria_escopo")]
    [InlineData("'BlockUser'", "'GrantAccess'", "ck_auditoria_escopo")]
    [InlineData("'BlockUser',now(),NULL,NULL", "'GrantAccess',now(),'Seller',@empty", "ck_auditoria_filial_id_nao_vazio")]
    public async Task SqlAdmin_IdsEnumsEscoposInvalidos_CheckRecusa(string oldValue, string newValue, string? constraint)
        => await Reject(Insert.Replace(oldValue, newValue, StringComparison.Ordinal), "23514", constraint);

    [Theory]
    [InlineData("@ua,@ua", "@ub,@ua", "fk_auditoria_usuarios_autor")]
    [InlineData("@ua,@ua", "@id,@ua", "fk_auditoria_usuarios_autor")]
    [InlineData("@ua,@ua", "@ua,@ub", "fk_auditoria_usuarios_alvo")]
    [InlineData("@ua,@ua", "@ua,@id", "fk_auditoria_usuarios_alvo")]
    [InlineData("NULL,NULL", "'Seller',@bb", "fk_auditoria_filiais")]
    [InlineData("NULL,NULL", "'Seller',@id", "fk_auditoria_filiais")]
    public async Task SqlAdmin_AutorAlvoFilialExternosOuInexistentes_FkCompostaRecusa(string oldValue, string newValue, string constraint)
    {
        var sql = Insert.Replace(oldValue, newValue, StringComparison.Ordinal);
        if (constraint == "fk_auditoria_filiais") sql = sql.Replace("'BlockUser'", "'GrantAccess'", StringComparison.Ordinal);
        await Reject(sql, "23503", constraint);
    }

    [Theory]
    [InlineData("UPDATE identity.auditoria SET acao='BlockUser' WHERE tenant_id=@ta")]
    [InlineData("DELETE FROM identity.auditoria WHERE tenant_id=@ta")]
    [InlineData("TRUNCATE TABLE identity.auditoria")]
    public async Task SqlAdmin_UpdateDeleteTruncate_TriggerRecusaEPreservaRegistro(string sql)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await IdentityTestData.ExecuteAsync(connection, Insert, data);
        await using (var transaction = await connection.BeginTransactionAsync())
        {
            var error = await Assert.ThrowsAsync<PostgresException>(() => IdentityTestData.ExecuteAsync(connection, sql, data));
            Assert.Equal("P0001", error.SqlState);
            await transaction.RollbackAsync();
        }
        await using var count = IdentityTestData.Command(connection, "SELECT count(*) FROM identity.auditoria WHERE tenant_id=@ta", data);
        Assert.Equal(1L, await count.ExecuteScalarAsync());
    }

    [Fact]
    public async Task SqlRuntime_PrivilegiosAuditoria_SomenteSelectInsert()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.RuntimeConnectionString);
        await connection.OpenAsync();
        await using var privileges = new NpgsqlCommand("SELECT has_table_privilege(current_user,'identity.auditoria','SELECT'),has_table_privilege(current_user,'identity.auditoria','INSERT'),has_table_privilege(current_user,'identity.auditoria','UPDATE'),has_table_privilege(current_user,'identity.auditoria','DELETE'),has_table_privilege(current_user,'identity.auditoria','TRUNCATE')", connection);
        await using (var reader = await privileges.ExecuteReaderAsync())
        {
            Assert.True(await reader.ReadAsync());
            Assert.True(reader.GetBoolean(0)); Assert.True(reader.GetBoolean(1));
            for (var i = 2; i < 5; i++) Assert.False(reader.GetBoolean(i));
        }
        await using var transaction = await connection.BeginTransactionAsync();
        await IdentityTestData.SetTenantAsync(connection, data.TenantA);
        Assert.Equal(1, await IdentityTestData.ExecuteAsync(connection, Insert, data));
        await transaction.CommitAsync();
    }

    [Fact]
    public async Task SqlRuntime_EfAdmin_LeiturasIsolamTenantEContextoAusenteFalhaFechado()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        await IdentityTestData.ExecuteAsync(admin, Insert, data);
        await IdentityTestData.ExecuteAsync(admin, Insert.Replace("@ta", "@tb", StringComparison.Ordinal).Replace("@ua", "@ub", StringComparison.Ordinal), data);
        await using var context = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA);
        Assert.Equal(data.TenantA, Assert.Single(await context.Set<IdentityAuditEvent>().ToListAsync()).TenantId);
        Assert.True(await context.Set<IdentityAuditEvent>().IgnoreQueryFilters().AnyAsync(x => x.TenantId == data.TenantB));
        await using var runtime = new NpgsqlConnection(fixture.RuntimeConnectionString);
        await runtime.OpenAsync();
        await using var query = new NpgsqlCommand("SELECT count(*) FROM identity.auditoria", runtime);
        Assert.Equal(0L, await query.ExecuteScalarAsync());
        await using (var transaction = await runtime.BeginTransactionAsync())
        {
            await IdentityTestData.SetTenantAsync(runtime, data.TenantA);
            Assert.Equal(1L, await query.ExecuteScalarAsync());
            var error = await Assert.ThrowsAsync<PostgresException>(() => IdentityTestData.ExecuteAsync(runtime, Insert.Replace("@ta", "@tb", StringComparison.Ordinal).Replace("@ua", "@ub", StringComparison.Ordinal), data));
            Assert.Equal("42501", error.SqlState);
            await transaction.RollbackAsync();
        }
        await using (var transaction = await runtime.BeginTransactionAsync())
        {
            var error = await Assert.ThrowsAsync<PostgresException>(() => IdentityTestData.ExecuteAsync(runtime, Insert, data));
            Assert.Equal("42501", error.SqlState);
            await transaction.RollbackAsync();
        }
        await using (var transaction = await runtime.BeginTransactionAsync())
        {
            await using var malformed = new NpgsqlCommand("SELECT set_config('app.tenant_id','malformed',true)", runtime);
            await malformed.ExecuteScalarAsync();
            var error = await Assert.ThrowsAsync<PostgresException>(async () => await query.ExecuteScalarAsync());
            Assert.Equal("22P02", error.SqlState);
            await transaction.RollbackAsync();
        }
    }

    private async Task Reject(string sql, string state, string? constraint)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        var error = await Assert.ThrowsAsync<PostgresException>(() => IdentityTestData.ExecuteAsync(connection, sql, data));
        Assert.Equal(state, error.SqlState);
        if (constraint is not null) Assert.Equal(constraint, error.ConstraintName);
        await transaction.RollbackAsync();
        if (constraint is null)
        {
            // Unknown role necessarily also violates the scope check; prove its dedicated check separately.
            await using var check = new NpgsqlCommand("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='identity.auditoria'::regclass AND conname='ck_auditoria_papel' AND contype='c' AND convalidated", connection);
            var definition = Assert.IsType<string>(await check.ExecuteScalarAsync());
            Assert.Contains("papel IS NULL", definition, StringComparison.Ordinal);
            Assert.Contains("Owner", definition, StringComparison.Ordinal);
            Assert.Contains("AccessAdministrator", definition, StringComparison.Ordinal);
            Assert.Contains("Seller", definition, StringComparison.Ordinal);
            Assert.Contains("BranchManager", definition, StringComparison.Ordinal);
        }
    }
}
