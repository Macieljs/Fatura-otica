using Npgsql;
using Testcontainers.PostgreSql;

namespace FaturaOtica.Integration.Tests;

public sealed class IdentityPostgreSqlFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer container = new PostgreSqlBuilder("postgres:17-alpine")
        .WithDatabase("s103a_identity_tests")
        .WithUsername("s103a_admin")
        .WithPassword(Guid.NewGuid().ToString("N"))
        .Build();

    public string AdminConnectionString => container.GetConnectionString();

    public string RuntimeConnectionString { get; private set; } = string.Empty;

    public async Task InitializeAsync()
    {
        await container.StartAsync();
        await using var connection = new NpgsqlConnection(AdminConnectionString);
        await connection.OpenAsync();
        await using var health = new NpgsqlCommand("SELECT current_database(), current_setting('server_version_num')::integer", connection);
        await using (var reader = await health.ExecuteReaderAsync())
        {
            Assert.True(await reader.ReadAsync());
            Assert.Equal("s103a_identity_tests", reader.GetString(0));
            Assert.InRange(reader.GetInt32(1), 170000, 179999);
        }

        // The only administrative role used by tests belongs to this disposable container.
        var runtimePassword = Guid.NewGuid().ToString("N");
        await using var createRole = new NpgsqlCommand(
            $"CREATE ROLE s103a_runtime LOGIN NOSUPERUSER NOBYPASSRLS NOINHERIT NOCREATEDB NOCREATEROLE PASSWORD '{runtimePassword}'", connection);
        await createRole.ExecuteNonQueryAsync();
        var settings = new NpgsqlConnectionStringBuilder(AdminConnectionString)
        {
            Username = "s103a_runtime",
            Password = runtimePassword,
            MaxPoolSize = 1,
        };
        RuntimeConnectionString = settings.ConnectionString;

        await using var runtime = new NpgsqlConnection(RuntimeConnectionString);
        await runtime.OpenAsync();
        await using var identity = new NpgsqlCommand(
            "SELECT current_user, rolsuper, rolbypassrls, rolinherit FROM pg_roles WHERE rolname = current_user", runtime);
        await using var role = await identity.ExecuteReaderAsync();
        Assert.True(await role.ReadAsync());
        Assert.Equal("s103a_runtime", role.GetString(0));
        Assert.False(role.GetBoolean(1));
        Assert.False(role.GetBoolean(2));
        Assert.False(role.GetBoolean(3));
    }

    public async Task DisposeAsync()
    {
        if (!string.IsNullOrEmpty(RuntimeConnectionString))
        {
            await using var runtime = new NpgsqlConnection(RuntimeConnectionString);
            NpgsqlConnection.ClearPool(runtime);
        }

        await container.DisposeAsync();
    }
}

[CollectionDefinition(Name, DisableParallelization = true)]
public sealed class IdentityPostgreSqlDefinition : ICollectionFixture<IdentityPostgreSqlFixture>
{
    public const string Name = "S1-03A PostgreSQL identity";
}

