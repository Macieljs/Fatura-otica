using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

internal sealed record IdentityTestData(Guid TenantA, Guid TenantB, Guid UserA, Guid UserB,
    Guid BranchA, Guid BranchB, Guid GrantA, Guid RoleA)
{
    public static IdentityDbContext Context(string connectionString, Guid tenant)
        => new(new DbContextOptionsBuilder<IdentityDbContext>().UseNpgsql(connectionString).Options, tenant);

    public static async Task<IdentityTestData> CreateAsync(IdentityPostgreSqlFixture fixture)
    {
        var data = new IdentityTestData(Guid.CreateVersion7(), Guid.CreateVersion7(), Guid.CreateVersion7(),
            Guid.CreateVersion7(), Guid.CreateVersion7(), Guid.CreateVersion7(), Guid.CreateVersion7(), Guid.CreateVersion7());
        await using var context = Context(fixture.AdminConnectionString, data.TenantA);
        await context.Database.MigrateAsync();
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await ExecuteAsync(connection,
            """
            GRANT USAGE ON SCHEMA identity TO s103a_runtime;
            GRANT SELECT, INSERT, UPDATE, DELETE ON identity.usuarios, identity.filiais,
                identity.papeis_usuarios, identity.concessoes_filiais TO s103a_runtime;
            DO $audit$ BEGIN
              IF to_regclass('identity.auditoria') IS NOT NULL THEN
                GRANT SELECT, INSERT ON identity.auditoria TO s103a_runtime;
              END IF;
            END $audit$;
            INSERT INTO identity.tenants (id,nome) VALUES (@ta,'Tenant A'),(@tb,'Tenant B');
            INSERT INTO identity.usuarios (id,tenant_id,nome,email_normalizado,status,senha_hash)
              VALUES (@ua,@ta,'User A','seller@example.test','Active','test-only-hash'),
                     (@ub,@tb,'User B','seller@example.test','Active','test-only-hash');
            INSERT INTO identity.filiais (id,tenant_id,nome,ativa)
              VALUES (@ba,@ta,'Branch A',true),(@bb,@tb,'Branch B',true);
            INSERT INTO identity.papeis_usuarios (id,tenant_id,usuario_id,papel,ativo)
              VALUES (@ra,@ta,@ua,'AccessAdministrator',true),(@id,@tb,@ub,'Owner',true);
            INSERT INTO identity.concessoes_filiais (id,tenant_id,usuario_id,filial_id,papel,ativo)
              VALUES (@ga,@ta,@ua,@ba,'Seller',true),(@id,@tb,@ub,@bb,'BranchManager',true);
            """, data);
        return data;
    }

    public static NpgsqlCommand Command(NpgsqlConnection connection, string sql, IdentityTestData data)
    {
        var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("ta", data.TenantA);
        command.Parameters.AddWithValue("tb", data.TenantB);
        command.Parameters.AddWithValue("ua", data.UserA);
        command.Parameters.AddWithValue("ub", data.UserB);
        command.Parameters.AddWithValue("ba", data.BranchA);
        command.Parameters.AddWithValue("bb", data.BranchB);
        command.Parameters.AddWithValue("ga", data.GrantA);
        command.Parameters.AddWithValue("ra", data.RoleA);
        command.Parameters.AddWithValue("id", Guid.CreateVersion7());
        command.Parameters.AddWithValue("empty", Guid.Empty);
        return command;
    }

    public static async Task<int> ExecuteAsync(NpgsqlConnection connection, string sql, IdentityTestData data)
    {
        await using var command = Command(connection, sql, data);
        return await command.ExecuteNonQueryAsync();
    }

    public static async Task SetTenantAsync(NpgsqlConnection connection, Guid tenant)
    {
        await using var command = new NpgsqlCommand("SELECT set_config('app.tenant_id', @tenant, true)", connection);
        command.Parameters.AddWithValue("tenant", tenant.ToString());
        Assert.Equal(tenant.ToString(), await command.ExecuteScalarAsync());
    }
}
