using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentityRlsTests(IdentityPostgreSqlFixture fixture)
{
    private static readonly string[] Tables = ["usuarios", "filiais", "papeis_usuarios", "concessoes_filiais"];

    [Fact]
    public async Task SqlDireto_TenantA_LeituraUpdateDeleteNaoAcessamTenantB()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.RuntimeConnectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        await IdentityTestData.SetTenantAsync(connection, data.TenantA);
        foreach (var table in Tables)
        {
            await using var read = IdentityTestData.Command(connection,
                $"SELECT count(*) FROM identity.{table} WHERE tenant_id=@tb", data);
            Assert.Equal(0L, await read.ExecuteScalarAsync());
            await using var own = IdentityTestData.Command(connection,
                $"SELECT count(*) FROM identity.{table} WHERE tenant_id=@ta", data);
            Assert.Equal(1L, await own.ExecuteScalarAsync());
            Assert.Equal(0, await IdentityTestData.ExecuteAsync(connection,
                $"UPDATE identity.{table} SET tenant_id=@tb WHERE tenant_id=@tb", data));
            Assert.Equal(0, await IdentityTestData.ExecuteAsync(connection,
                $"DELETE FROM identity.{table} WHERE tenant_id=@tb", data));
        }
        await transaction.RollbackAsync();
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        foreach (var table in Tables)
        {
            await using var check = IdentityTestData.Command(admin, $"SELECT count(*) FROM identity.{table} WHERE tenant_id=@tb", data);
            Assert.Equal(1L, await check.ExecuteScalarAsync());
        }
    }

    [Theory]
    [InlineData("INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status) VALUES(@id,@tb,'Forbidden','forbidden@example.test','Pending')")]
    [InlineData("INSERT INTO identity.filiais(id,tenant_id,nome,ativa) VALUES(@id,@tb,'Forbidden',true)")]
    [InlineData("INSERT INTO identity.papeis_usuarios(id,tenant_id,usuario_id,papel,ativo) VALUES(@id,@tb,@ub,'AccessAdministrator',true)")]
    [InlineData("INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo) VALUES(@id,@tb,@ub,@bb,'Seller',true)")]
    [InlineData("UPDATE identity.usuarios SET tenant_id=@tb WHERE id=@ua")]
    [InlineData("UPDATE identity.filiais SET tenant_id=@tb WHERE id=@ba")]
    [InlineData("UPDATE identity.papeis_usuarios SET tenant_id=@tb WHERE id=@ra")]
    [InlineData("UPDATE identity.concessoes_filiais SET tenant_id=@tb WHERE id=@ga")]
    public async Task SqlDireto_GravacaoOutroTenant_WithCheckRecusa(string sql)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.RuntimeConnectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        await IdentityTestData.SetTenantAsync(connection, data.TenantA);
        var error = await Assert.ThrowsAsync<PostgresException>(() => IdentityTestData.ExecuteAsync(connection, sql, data));
        Assert.Equal("42501", error.SqlState);
        await transaction.RollbackAsync();
    }

    [Fact]
    public async Task SqlDireto_SemContextoOuContextoInvalido_FalhaFechado()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.RuntimeConnectionString);
        await connection.OpenAsync();
        foreach (var table in Tables)
        {
            await using var command = new NpgsqlCommand($"SELECT count(*) FROM identity.{table}", connection);
            Assert.Equal(0L, await command.ExecuteScalarAsync());
        }
        await using (var transaction = await connection.BeginTransactionAsync())
        {
            var error = await Assert.ThrowsAsync<PostgresException>(() => IdentityTestData.ExecuteAsync(connection,
                "INSERT INTO identity.filiais(id,tenant_id,nome,ativa) VALUES(@id,@ta,'Forbidden',true)", data));
            Assert.Equal("42501", error.SqlState);
            await transaction.RollbackAsync();
        }
        await using (var transaction = await connection.BeginTransactionAsync())
        {
            await using var set = new NpgsqlCommand("SELECT set_config('app.tenant_id','malformed',true)", connection);
            await set.ExecuteScalarAsync();
            await using var read = new NpgsqlCommand("SELECT count(*) FROM identity.usuarios", connection);
            var error = await Assert.ThrowsAsync<PostgresException>(async () => await read.ExecuteScalarAsync());
            Assert.Equal("22P02", error.SqlState);
            await transaction.RollbackAsync();
        }
    }

    [Fact]
    public async Task EfAdmin_SemRls_GlobalFiltersIsolamAsQuatroEntidades()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var context = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA);
        Assert.Equal(data.UserA, Assert.Single(await context.Users.ToListAsync()).Id);
        Assert.Equal(data.BranchA, Assert.Single(await context.Branches.ToListAsync()).Id);
        Assert.Equal(data.RoleA, Assert.Single(await context.TenantRoles.ToListAsync()).Id);
        Assert.Equal(data.GrantA, Assert.Single(await context.BranchGrants.ToListAsync()).Id);
        Assert.True(await context.Users.IgnoreQueryFilters().AnyAsync(x => x.Id == data.UserB));
        await using var nextContext = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantB);
        Assert.Equal(data.UserB, Assert.Single(await nextContext.Users.ToListAsync()).Id);
        Assert.Equal(data.BranchB, Assert.Single(await nextContext.Branches.ToListAsync()).Id);
        Assert.Equal(data.TenantB, Assert.Single(await nextContext.TenantRoles.ToListAsync()).TenantId);
        Assert.Equal(data.TenantB, Assert.Single(await nextContext.BranchGrants.ToListAsync()).TenantId);
    }

    [Fact]
    public async Task RuntimeRole_SchemaAplicado_NaoTemOwnershipMembershipOuPrivilegiosAdministrativos()
    {
        await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.RuntimeConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(
            """
            SELECT (SELECT count(*) FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname=current_user)),
              (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
               WHERE n.nspname='identity' AND c.relowner=(SELECT oid FROM pg_roles WHERE rolname=current_user)),
              has_schema_privilege(current_user,'identity','CREATE'),
              has_table_privilege(current_user,'identity.tenants','SELECT'),
              has_table_privilege(current_user,'identity.usuarios','TRUNCATE')
            """, connection);
        await using var reader = await command.ExecuteReaderAsync();
        Assert.True(await reader.ReadAsync());
        Assert.Equal(0L, reader.GetInt64(0));
        Assert.Equal(0L, reader.GetInt64(1));
        Assert.False(reader.GetBoolean(2));
        Assert.False(reader.GetBoolean(3));
        Assert.False(reader.GetBoolean(4));
    }
}
