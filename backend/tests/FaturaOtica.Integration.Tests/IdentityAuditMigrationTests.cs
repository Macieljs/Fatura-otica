using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentityAuditMigrationTests(IdentityPostgreSqlFixture fixture)
{
    [Fact]
    public async Task Migrate_BancoComIdentityAnterior_PreservaDadosEReaplicacaoSegura()
    {
        var database = "audit_migration_" + Guid.NewGuid().ToString("N");
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        await using (var create = new NpgsqlCommand($"CREATE DATABASE {database}", admin)) await create.ExecuteNonQueryAsync();
        var builder = new NpgsqlConnectionStringBuilder(fixture.AdminConnectionString) { Database = database, Pooling = false };
        var tenant = Guid.NewGuid(); var user = Guid.NewGuid();
        try
        {
            await using var context = IdentityTestData.Context(builder.ConnectionString, tenant);
            var migrator = context.GetService<IMigrator>();
            await migrator.MigrateAsync("20261006165846_InitialIdentity");
            await using var connection = new NpgsqlConnection(builder.ConnectionString);
            await connection.OpenAsync();
            await using var seed = new NpgsqlCommand("INSERT INTO identity.tenants(id,nome) VALUES(@tenant,'Preserved'); INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status) VALUES(@user,@tenant,'Preserved User','preserved@example.test','Pending')", connection);
            seed.Parameters.AddWithValue("tenant", tenant); seed.Parameters.AddWithValue("user", user);
            await seed.ExecuteNonQueryAsync();
            await context.Database.MigrateAsync();
            var migrations = (await context.Database.GetAppliedMigrationsAsync()).ToArray();
            Assert.Contains("20261006165846_InitialIdentity", migrations);
            Assert.Contains("20261006223501_AddIdentityAudit", migrations);
            await context.Database.MigrateAsync();
            await using var check = new NpgsqlCommand("SELECT u.nome,t.nome FROM identity.usuarios u JOIN identity.tenants t ON t.id=u.tenant_id WHERE u.id=@user; SELECT count(*) FROM identity.auditoria", connection);
            check.Parameters.AddWithValue("user", user);
            await using var reader = await check.ExecuteReaderAsync();
            Assert.True(await reader.ReadAsync()); Assert.Equal("Preserved User", reader.GetString(0)); Assert.Equal("Preserved", reader.GetString(1));
            Assert.True(await reader.NextResultAsync()); Assert.True(await reader.ReadAsync()); Assert.Equal(0L, reader.GetInt64(0));
        }
        finally
        {
            await using var drop = new NpgsqlCommand($"DROP DATABASE {database} WITH (FORCE)", admin);
            await drop.ExecuteNonQueryAsync();
        }
    }
}
