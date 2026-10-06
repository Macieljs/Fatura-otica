using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentityMigrationTests(IdentityPostgreSqlFixture fixture)
{
    private static readonly string[] ExpectedTables =
        ["auditoria", "concessoes_filiais", "filiais", "papeis_usuarios", "tenants", "usuarios"];

    [Fact]
    public async Task MigrateAsync_BancoVazio_CriaModeloIdentityVersionadoComRlsForcada()
    {
        var options = new DbContextOptionsBuilder<IdentityDbContext>()
            .UseNpgsql(fixture.AdminConnectionString).Options;
        await using var context = new IdentityDbContext(options, Guid.CreateVersion7());
        await context.Database.MigrateAsync();

        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(
            """
            SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity, pg_get_userbyid(c.relowner)
            FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'identity' AND c.relkind = 'r'
            ORDER BY c.relname
            """, connection);
        await using var reader = await command.ExecuteReaderAsync();
        var tables = new List<string>();
        while (await reader.ReadAsync())
        {
            var name = reader.GetString(0);
            tables.Add(name);
            Assert.NotEqual("s103a_runtime", reader.GetString(3));
            if (name != "tenants")
            {
                Assert.True(reader.GetBoolean(1), $"RLS must be enabled on identity.{name}");
                Assert.True(reader.GetBoolean(2), $"RLS must be forced on identity.{name}");
            }
        }

        Assert.Equal(ExpectedTables, tables);
        Assert.NotEmpty(await context.Database.GetAppliedMigrationsAsync());
        await context.Database.MigrateAsync();
    }

    [Fact]
    public async Task MigrateAsync_ModeloIdentity_CriaChecksFksCompostasETiposConvencionados()
    {
        var options = new DbContextOptionsBuilder<IdentityDbContext>()
            .UseNpgsql(fixture.AdminConnectionString).Options;
        await using var context = new IdentityDbContext(options, Guid.CreateVersion7());
        await context.Database.MigrateAsync();
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(
            """
            SELECT c.conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE n.nspname = 'identity'
            """, connection);
        var constraints = new Dictionary<string, string>(StringComparer.Ordinal);
        await using (var reader = await command.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
                constraints.Add(reader.GetString(0), reader.GetString(1));
        }

        foreach (var table in ExpectedTables)
        {
            Assert.Contains($"ck_{table}_id_nao_vazio", constraints.Keys);
            if (table != "tenants")
            {
                Assert.Contains($"ck_{table}_tenant_id_nao_vazio", constraints.Keys);
                Assert.Contains($"fk_{table}_tenants", constraints.Keys);
            }
        }

        foreach (var name in new[]
        {
            "ck_usuarios_status", "ck_usuarios_email_normalizado", "ck_usuarios_senha_hash",
            "ck_papeis_usuarios_papel", "ck_concessoes_filiais_papel",
            "ck_papeis_usuarios_usuario_id_nao_vazio", "ck_concessoes_filiais_usuario_id_nao_vazio",
            "ck_concessoes_filiais_filial_id_nao_vazio",
        })
            Assert.Contains(name, constraints.Keys);

        Assert.Contains("FOREIGN KEY (tenant_id, usuario_id)", constraints["fk_papeis_usuarios_usuarios"]);
        Assert.Contains("REFERENCES identity.usuarios(tenant_id, id)", constraints["fk_papeis_usuarios_usuarios"]);
        Assert.Contains("FOREIGN KEY (tenant_id, usuario_id)", constraints["fk_concessoes_filiais_usuarios"]);
        Assert.Contains("REFERENCES identity.usuarios(tenant_id, id)", constraints["fk_concessoes_filiais_usuarios"]);
        Assert.Contains("FOREIGN KEY (tenant_id, filial_id)", constraints["fk_concessoes_filiais_filiais"]);
        Assert.Contains("REFERENCES identity.filiais(tenant_id, id)", constraints["fk_concessoes_filiais_filiais"]);

        await using var columns = new NpgsqlCommand(
            """
            SELECT table_name, column_name, data_type, is_nullable, column_default
            FROM information_schema.columns WHERE table_schema = 'identity'
            """, connection);
        await using var columnReader = await columns.ExecuteReaderAsync();
        var checkedColumns = 0;
        while (await columnReader.ReadAsync())
        {
            var name = columnReader.GetString(1);
            if (name is "id" or "tenant_id" or "usuario_id" or "filial_id" or "autor_usuario_id" or "alvo_usuario_id")
            {
                Assert.Equal("uuid", columnReader.GetString(2));
                Assert.Equal(name == "filial_id" && columnReader.GetString(0) == "auditoria" ? "YES" : "NO", columnReader.GetString(3));
                if (name == "id") Assert.True(columnReader.IsDBNull(4));
                checkedColumns++;
            }
            if (name is "criado_em" or "atualizado_em")
            {
                Assert.Equal("timestamp with time zone", columnReader.GetString(2));
                checkedColumns++;
            }
            if (name is "status" or "papel")
            {
                Assert.Equal("text", columnReader.GetString(2));
                checkedColumns++;
            }
        }
        Assert.True(checkedColumns >= 20, "Identity catalog must contain the required typed columns.");
    }
}


