using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class BootstrapOwnerAuditPersistenceTests(IdentityPostgreSqlFixture fixture)
{
    private const string BootstrapInsert = "INSERT INTO identity.auditoria(id,tenant_id,autor_usuario_id,alvo_usuario_id,acao,ocorrido_em,papel,filial_id) VALUES(@id,@ta,NULL,@ua,'BootstrapOwner',now(),'Owner',NULL)";

    [Fact]
    public async Task Insert_BootstrapOwnerSistema_PermiteAutorNullEPersisteEscopoExato()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        Assert.Equal(1, await IdentityTestData.ExecuteAsync(connection, BootstrapInsert, data));
        await using var check = IdentityTestData.Command(connection,
            "SELECT autor_usuario_id,alvo_usuario_id,papel,filial_id FROM identity.auditoria WHERE tenant_id=@ta AND acao='BootstrapOwner'", data);
        await using var reader = await check.ExecuteReaderAsync();
        Assert.True(await reader.ReadAsync());
        Assert.True(reader.IsDBNull(0));
        Assert.Equal(data.UserA, reader.GetGuid(1));
        Assert.Equal("Owner", reader.GetString(2));
        Assert.True(reader.IsDBNull(3));
        Assert.False(await reader.ReadAsync());
    }

    [Theory]
    [InlineData("GrantAccess", "Owner")]
    [InlineData("RevokeAccess", "Owner")]
    [InlineData("BlockUser", null)]
    public async Task Insert_AcaoHumanaAutorNull_CheckRecusa(string action, string? role)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        await using var insert = IdentityTestData.Command(connection,
            "INSERT INTO identity.auditoria(id,tenant_id,autor_usuario_id,alvo_usuario_id,acao,ocorrido_em,papel,filial_id) VALUES(@id,@ta,NULL,@ua,@action,now(),@role,NULL)", data);
        insert.Parameters.AddWithValue("action", action);
        insert.Parameters.Add(new NpgsqlParameter("role", NpgsqlTypes.NpgsqlDbType.Text) { Value = (object?)role ?? DBNull.Value });
        var error = await Assert.ThrowsAsync<PostgresException>(() => insert.ExecuteNonQueryAsync());
        AssertRejected(error, "23514");
        await transaction.RollbackAsync();
    }

    [Theory]
    [InlineData("NULL,@ua", "@ua,@ua")]
    [InlineData("'Owner',NULL", "'AccessAdministrator',NULL")]
    [InlineData("'Owner',NULL", "'Seller',@ba")]
    [InlineData("'Owner',NULL", "'Owner',@ba")]
    public async Task Insert_BootstrapOwnerEscopoOuAutorInvalido_CheckRecusa(string oldValue, string newValue)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        var error = await Assert.ThrowsAsync<PostgresException>(() => IdentityTestData.ExecuteAsync(connection,
            BootstrapInsert.Replace(oldValue, newValue, StringComparison.Ordinal), data));
        AssertRejected(error, "23514");
        await transaction.RollbackAsync();
    }

    [Fact]
    public async Task Insert_SegundoBootstrapNoTenant_IndiceUnicoRecusa()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await IdentityTestData.ExecuteAsync(connection, BootstrapInsert, data);
        await using var transaction = await connection.BeginTransactionAsync();
        var error = await Assert.ThrowsAsync<PostgresException>(() => IdentityTestData.ExecuteAsync(connection, BootstrapInsert, data));
        Assert.Equal("23505", error.SqlState);
        await transaction.RollbackAsync();
        await using var count = IdentityTestData.Command(connection, "SELECT count(*) FROM identity.auditoria WHERE tenant_id=@ta AND acao='BootstrapOwner'", data);
        Assert.Equal(1L, await count.ExecuteScalarAsync());
    }

    [Fact]
    public async Task Insert_BootstrapAlvoDeOutroTenant_FkCompostaRecusa()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        var error = await Assert.ThrowsAsync<PostgresException>(() => IdentityTestData.ExecuteAsync(connection,
            BootstrapInsert.Replace("NULL,@ua", "NULL,@ub", StringComparison.Ordinal), data));
        AssertRejected(error, "23503");
        await transaction.RollbackAsync();
    }

    [Fact]
    public async Task Read_BootstrapPorTenant_RuntimeRlsNaoVazaOutroTenant()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var admin = new NpgsqlConnection(fixture.AdminConnectionString);
        await admin.OpenAsync();
        await IdentityTestData.ExecuteAsync(admin, BootstrapInsert, data);
        await IdentityTestData.ExecuteAsync(admin,
            BootstrapInsert.Replace("@ta", "@tb", StringComparison.Ordinal).Replace("@ua", "@ub", StringComparison.Ordinal), data);
        await using var runtime = new NpgsqlConnection(fixture.RuntimeConnectionString);
        await runtime.OpenAsync();
        await using var transaction = await runtime.BeginTransactionAsync();
        await IdentityTestData.SetTenantAsync(runtime, data.TenantA);
        await using var count = new NpgsqlCommand("SELECT count(*) FROM identity.auditoria WHERE acao='BootstrapOwner'", runtime);
        Assert.Equal(1L, await count.ExecuteScalarAsync());
        await transaction.RollbackAsync();
    }

    private static void AssertRejected(PostgresException error, string expectedState)
    {
        // Before the migration, the stricter NOT NULL actor guard rejects first.
        // That is valid fail-closed behavior, not the missing BootstrapOwner feature.
        if (error.SqlState == "23502")
        {
            Assert.Equal("autor_usuario_id", error.ColumnName);
            return;
        }
        Assert.Equal(expectedState, error.SqlState);
    }
}
