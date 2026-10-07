using FaturaOtica.Application.Identity;
using FaturaOtica.Domain.Identity;
using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class PendingProfilePersistenceTests(IdentityPostgreSqlFixture database)
{
    [Fact]
    public async Task Migrate_Proveniencia_MapeiaUuidNullableComIndiceFkCompostaENoAction()
    {
        var data = await IdentityTestData.CreateAsync(database);
        await using var context = IdentityTestData.Context(database.AdminConnectionString, data.TenantA);
        var property = context.Model.FindEntityType(typeof(IdentityUser))!.FindProperty("CreatedForBranchId");
        Assert.NotNull(property);
        Assert.Equal(typeof(Guid?), property.ClrType);
        Assert.Equal("criado_para_filial_id", property.GetColumnName());
        await using var admin = new NpgsqlConnection(database.AdminConnectionString);
        await admin.OpenAsync();
        await RequireProvenanceColumnAsync(admin);
        await using var fk = new NpgsqlCommand("""
            SELECT pg_get_constraintdef(oid), confdeltype::text FROM pg_constraint
            WHERE conrelid='identity.usuarios'::regclass AND contype='f'
              AND pg_get_constraintdef(oid) LIKE '%criado_para_filial_id%'
            """, admin);
        await using (var reader = await fk.ExecuteReaderAsync())
        {
            Assert.True(await reader.ReadAsync(), "Composite provenance FK is required.");
            Assert.Contains("FOREIGN KEY (tenant_id, criado_para_filial_id)", reader.GetString(0));
            Assert.Contains("REFERENCES identity.filiais(tenant_id, id)", reader.GetString(0));
            Assert.Equal("a", reader.GetString(1));
        }
        await using var index = new NpgsqlCommand("SELECT indexdef FROM pg_indexes WHERE schemaname='identity' AND indexname='ix_usuarios_tenant_id_criado_para_filial_id'", admin);
        var definition = Assert.IsType<string>(await index.ExecuteScalarAsync());
        Assert.Contains("(tenant_id, criado_para_filial_id)", definition);
    }

    [Theory]
    [InlineData("empty", "23514")]
    [InlineData("foreign", "23503")]
    [InlineData("missing", "23503")]
    public async Task InsertSqlAdmin_ProvenienciaInvalida_ConstraintNaoMascaradaPorRls(string branch, string sqlState)
    {
        var data = await IdentityTestData.CreateAsync(database);
        await using var admin = new NpgsqlConnection(database.AdminConnectionString);
        await admin.OpenAsync();
        await RequireProvenanceColumnAsync(admin);
        await using var command = IdentityTestData.Command(admin, """
            INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status,criado_para_filial_id)
            VALUES(@id,@ta,'Invalid provenance','invalid-provenance@example.test','Pending',@branch)
            """, data);
        command.Parameters.AddWithValue("branch", branch == "empty" ? Guid.Empty : branch == "foreign" ? data.BranchB : Guid.CreateVersion7());
        var exception = await Assert.ThrowsAsync<PostgresException>(() => command.ExecuteNonQueryAsync());
        Assert.Equal(sqlState, exception.SqlState);
        await using var count = IdentityTestData.Command(admin, "SELECT count(*) FROM identity.usuarios WHERE tenant_id=@ta AND email_normalizado='invalid-provenance@example.test'", data);
        Assert.Equal(0L, await count.ExecuteScalarAsync());
    }

    [Fact]
    public async Task Migrate_LegadosComGrants_PreservaCadastroSemInferirProveniencia()
    {
        var temporaryDatabase = $"s104a1_legacy_{Guid.NewGuid():N}";
        await using var admin = new NpgsqlConnection(database.AdminConnectionString);
        await admin.OpenAsync();
        await using (var create = new NpgsqlCommand($"CREATE DATABASE {temporaryDatabase}", admin))
            await create.ExecuteNonQueryAsync();
        var connectionString = new NpgsqlConnectionStringBuilder(database.AdminConnectionString)
        {
            Database = temporaryDatabase, Pooling = false,
        }.ConnectionString;
        var tenant = Guid.CreateVersion7();
        var user = Guid.CreateVersion7();
        try
        {
            await using var context = IdentityTestData.Context(connectionString, tenant);
            var migrator = context.GetService<IMigrator>();
            await migrator.MigrateAsync("20261006223501_AddIdentityAudit");
            await using var legacy = new NpgsqlConnection(connectionString);
            await legacy.OpenAsync();
            await using var seed = new NpgsqlCommand("""
                INSERT INTO identity.tenants(id,nome) VALUES(@tenant,'Legacy tenant');
                INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status,senha_hash)
                    VALUES(@user,@tenant,'Legacy','legacy@example.test','Active','legacy-test-hash');
                INSERT INTO identity.filiais(id,tenant_id,nome,ativa) VALUES(@branch,@tenant,'Legacy branch',true);
                INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo)
                    VALUES(@grant,@tenant,@user,@branch,'BranchManager',true);
                """, legacy);
            seed.Parameters.AddWithValue("tenant", tenant);
            seed.Parameters.AddWithValue("user", user);
            seed.Parameters.AddWithValue("branch", Guid.CreateVersion7());
            seed.Parameters.AddWithValue("grant", Guid.CreateVersion7());
            await seed.ExecuteNonQueryAsync();
            await migrator.MigrateAsync();
            await RequireProvenanceColumnAsync(legacy);
            await using var check = new NpgsqlCommand("SELECT nome,status,senha_hash,criado_para_filial_id FROM identity.usuarios WHERE id=@user", legacy);
            check.Parameters.AddWithValue("user", user);
            await using var row = await check.ExecuteReaderAsync();
            Assert.True(await row.ReadAsync());
            Assert.Equal("Legacy", row.GetString(0));
            Assert.Equal("Active", row.GetString(1));
            Assert.Equal("legacy-test-hash", row.GetString(2));
            Assert.True(row.IsDBNull(3), "Operational grants cannot be used as a provenance backfill.");
        }
        finally
        {
            await using var drop = new NpgsqlCommand($"DROP DATABASE {temporaryDatabase} WITH (FORCE)", admin);
            await drop.ExecuteNonQueryAsync();
        }
    }

    [Theory]
    [InlineData("UPDATE identity.concessoes_filiais SET ativo=false WHERE id=@ga")]
    [InlineData("UPDATE identity.usuarios SET status='Blocked' WHERE id=@ua")]
    [InlineData("UPDATE identity.usuarios SET status='Pending' WHERE id=@ua")]
    [InlineData("UPDATE identity.filiais SET ativa=false WHERE id=@ba")]
    public async Task AuthorizeAsync_CreatePendingProfileMesmoContexto_LeEstadoAtualSemCache(string update)
    {
        var data = await IdentityTestData.CreateAsync(database);
        await using var admin = new NpgsqlConnection(database.AdminConnectionString);
        await admin.OpenAsync();
        await IdentityTestData.ExecuteAsync(admin, "UPDATE identity.concessoes_filiais SET papel='BranchManager' WHERE id=@ga", data);
        await using var context = IdentityTestData.Context(database.RuntimeConnectionString, data.TenantA);
        var authorizer = new CurrentAccessAuthorizer(new PostgreSqlCurrentUserAccessReader(context), data.TenantA);
        var branch = new BranchScope(data.TenantA, data.BranchA);
        Assert.True((await authorizer.AuthorizeAsync(data.UserA, AccessAction.CreatePendingProfile, branch)).Allowed);
        await IdentityTestData.ExecuteAsync(admin, update, data);
        Assert.False((await authorizer.AuthorizeAsync(data.UserA, AccessAction.CreatePendingProfile, branch)).Allowed);
        Assert.False((await authorizer.AuthorizeAsync(data.UserB, AccessAction.CreatePendingProfile, branch)).Allowed);
    }

    private static async Task RequireProvenanceColumnAsync(NpgsqlConnection connection)
    {
        await using var command = new NpgsqlCommand("""
            SELECT data_type,is_nullable FROM information_schema.columns
            WHERE table_schema='identity' AND table_name='usuarios' AND column_name='criado_para_filial_id'
            """, connection);
        await using var row = await command.ExecuteReaderAsync();
        Assert.True(await row.ReadAsync(), "S1-04A1 migration must add identity.usuarios.criado_para_filial_id; missing metadata is functional Red, not an attempted query of a nonexistent column.");
        Assert.Equal("uuid", row.GetString(0));
        Assert.Equal("YES", row.GetString(1));
    }
}
