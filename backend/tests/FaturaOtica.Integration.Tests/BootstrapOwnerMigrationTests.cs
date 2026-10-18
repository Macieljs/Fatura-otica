using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class BootstrapOwnerMigrationTests(IdentityPostgreSqlFixture fixture)
{
    [Fact]
    public async Task Migrate_AuditoriaHumanaExistente_PreservaRegistroELiberaSomenteBootstrapSistema()
    {
        var database = "bootstrap_migration_" + Guid.NewGuid().ToString("N");
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        await using (var create = new NpgsqlCommand($"CREATE DATABASE {database}", admin)) await create.ExecuteNonQueryAsync();
        var settings = new NpgsqlConnectionStringBuilder(fixture.AdminConnectionString) { Database = database, Pooling = false };
        var tenant = Guid.NewGuid();
        var user = Guid.NewGuid();
        var eventId = Guid.NewGuid();
        var time = new DateTimeOffset(2026, 10, 6, 12, 0, 0, TimeSpan.Zero);
        try
        {
            await using var context = IdentityTestData.Context(settings.ConnectionString, tenant);
            await context.GetService<IMigrator>().MigrateAsync("20261007002023_AddPendingProfileProvenance");
            await using var connection = new NpgsqlConnection(settings.ConnectionString);
            await connection.OpenAsync();
            await using var seed = new NpgsqlCommand("""
                INSERT INTO identity.tenants(id,nome) VALUES(@tenant,'Preserved');
                INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status) VALUES(@user,@tenant,'Preserved','preserved@example.test','Active');
                INSERT INTO identity.auditoria(id,tenant_id,autor_usuario_id,alvo_usuario_id,acao,ocorrido_em,papel,filial_id)
                VALUES(@event,@tenant,@user,@user,'GrantAccess',@time,'Owner',NULL)
                """, connection);
            seed.Parameters.AddWithValue("tenant", tenant);
            seed.Parameters.AddWithValue("user", user);
            seed.Parameters.AddWithValue("event", eventId);
            seed.Parameters.AddWithValue("time", time);
            await seed.ExecuteNonQueryAsync();
            await context.Database.MigrateAsync();
            await context.Database.MigrateAsync();
            await using var check = new NpgsqlCommand("SELECT tenant_id,autor_usuario_id,alvo_usuario_id,acao,ocorrido_em,papel,filial_id FROM identity.auditoria WHERE id=@event", connection);
            check.Parameters.AddWithValue("event", eventId);
            await using (var reader = await check.ExecuteReaderAsync())
            {
                Assert.True(await reader.ReadAsync());
                Assert.Equal(tenant, reader.GetGuid(0));
                Assert.Equal(user, reader.GetGuid(1));
                Assert.Equal(user, reader.GetGuid(2));
                Assert.Equal("GrantAccess", reader.GetString(3));
                Assert.Equal(time.UtcDateTime, reader.GetDateTime(4));
                Assert.Equal("Owner", reader.GetString(5));
                Assert.True(reader.IsDBNull(6));
                Assert.False(await reader.ReadAsync());
            }
            await using var nullable = new NpgsqlCommand("SELECT is_nullable FROM information_schema.columns WHERE table_schema='identity' AND table_name='auditoria' AND column_name='autor_usuario_id'", connection);
            Assert.Equal("YES", await nullable.ExecuteScalarAsync());
            await using var indexes = new NpgsqlCommand("SELECT count(*) FROM pg_index i WHERE i.indrelid='identity.auditoria'::regclass AND i.indisunique AND i.indisvalid AND pg_get_expr(i.indpred,i.indrelid) LIKE '%BootstrapOwner%'", connection);
            Assert.Equal(1L, await indexes.ExecuteScalarAsync());
            await using var bootstrap = new NpgsqlCommand("INSERT INTO identity.auditoria(id,tenant_id,autor_usuario_id,alvo_usuario_id,acao,ocorrido_em,papel,filial_id) VALUES(@id,@tenant,NULL,@user,'BootstrapOwner',@time,'Owner',NULL)", connection);
            bootstrap.Parameters.AddWithValue("id", Guid.NewGuid());
            bootstrap.Parameters.AddWithValue("tenant", tenant);
            bootstrap.Parameters.AddWithValue("user", user);
            bootstrap.Parameters.AddWithValue("time", time);
            Assert.Equal(1, await bootstrap.ExecuteNonQueryAsync());
        }
        finally
        {
            await using var drop = new NpgsqlCommand($"DROP DATABASE {database} WITH (FORCE)", admin);
            await drop.ExecuteNonQueryAsync();
        }
    }
}
