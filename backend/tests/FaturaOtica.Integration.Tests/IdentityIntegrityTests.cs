using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentityIntegrityTests(IdentityPostgreSqlFixture fixture)
{
    [Theory]
    [InlineData("INSERT INTO identity.papeis_usuarios(id,tenant_id,usuario_id,papel,ativo) VALUES(@id,@ta,@ub,'Owner',true)", "fk_papeis_usuarios_usuarios")]
    [InlineData("INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo) VALUES(@id,@ta,@ub,@ba,'Seller',true)", "fk_concessoes_filiais_usuarios")]
    [InlineData("INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo) VALUES(@id,@ta,@ua,@bb,'Seller',true)", "fk_concessoes_filiais_filiais")]
    [InlineData("UPDATE identity.concessoes_filiais SET filial_id=@bb WHERE id=@ga", "fk_concessoes_filiais_filiais")]
    [InlineData("UPDATE identity.papeis_usuarios SET usuario_id=@id WHERE id=@ra", "fk_papeis_usuarios_usuarios")]
    public async Task Persistir_VinculoCrossTenantOuAusente_FkCompostaRecusaMesmoComoAdmin(string sql, string constraint)
        => await AssertConstraintAsync(sql, "23503", constraint);

    [Theory]
    [InlineData("UPDATE identity.usuarios SET status='Unknown' WHERE id=@ua", "ck_usuarios_status")]
    [InlineData("UPDATE identity.papeis_usuarios SET papel='Seller' WHERE id=@ra", "ck_papeis_usuarios_papel")]
    [InlineData("UPDATE identity.concessoes_filiais SET papel='Owner' WHERE id=@ga", "ck_concessoes_filiais_papel")]
    [InlineData("UPDATE identity.usuarios SET email_normalizado='SELLER@example.test' WHERE id=@ua", "ck_usuarios_email_normalizado")]
    [InlineData("UPDATE identity.usuarios SET email_normalizado='' WHERE id=@ua", "ck_usuarios_email_normalizado")]
    [InlineData("UPDATE identity.usuarios SET senha_hash='' WHERE id=@ua", "ck_usuarios_senha_hash")]
    [InlineData("INSERT INTO identity.tenants(id,nome) VALUES(@empty,'Invalid')", "ck_tenants_id_nao_vazio")]
    [InlineData("INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status) VALUES(@empty,@ta,'Invalid','invalid@example.test','Pending')", "ck_usuarios_id_nao_vazio")]
    [InlineData("INSERT INTO identity.filiais(id,tenant_id,nome,ativa) VALUES(@empty,@ta,'Invalid',true)", "ck_filiais_id_nao_vazio")]
    [InlineData("INSERT INTO identity.papeis_usuarios(id,tenant_id,usuario_id,papel,ativo) VALUES(@empty,@ta,@ua,'Owner',true)", "ck_papeis_usuarios_id_nao_vazio")]
    [InlineData("INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo) VALUES(@empty,@ta,@ua,@ba,'BranchManager',true)", "ck_concessoes_filiais_id_nao_vazio")]
    [InlineData("UPDATE identity.usuarios SET tenant_id=@empty WHERE id=@ua", "ck_usuarios_tenant_id_nao_vazio")]
    [InlineData("UPDATE identity.filiais SET tenant_id=@empty WHERE id=@ba", "ck_filiais_tenant_id_nao_vazio")]
    [InlineData("UPDATE identity.papeis_usuarios SET tenant_id=@empty WHERE id=@ra", "ck_papeis_usuarios_tenant_id_nao_vazio")]
    [InlineData("UPDATE identity.concessoes_filiais SET tenant_id=@empty WHERE id=@ga", "ck_concessoes_filiais_tenant_id_nao_vazio")]
    [InlineData("UPDATE identity.papeis_usuarios SET usuario_id=@empty WHERE id=@ra", "ck_papeis_usuarios_usuario_id_nao_vazio")]
    [InlineData("UPDATE identity.concessoes_filiais SET usuario_id=@empty WHERE id=@ga", "ck_concessoes_filiais_usuario_id_nao_vazio")]
    [InlineData("UPDATE identity.concessoes_filiais SET filial_id=@empty WHERE id=@ga", "ck_concessoes_filiais_filial_id_nao_vazio")]
    public async Task Persistir_DadoInvalido_CheckRecusaComoAdmin(string sql, string constraint)
        => await AssertConstraintAsync(sql, "23514", constraint);

    [Theory]
    [InlineData("INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status) VALUES(@id,@ta,'Duplicate','seller@example.test','Pending')", "ux_usuarios_tenant_id_email_normalizado")]
    [InlineData("INSERT INTO identity.papeis_usuarios(id,tenant_id,usuario_id,papel,ativo) VALUES(@id,@ta,@ua,'AccessAdministrator',false)", "ux_papeis_usuarios_tenant_id_usuario_id_papel")]
    [InlineData("INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo) VALUES(@id,@ta,@ua,@ba,'Seller',false)", "ux_concessoes_filiais_tenant_id_usuario_id_filial_id_papel")]
    public async Task Persistir_DuplicataNoTenant_UnicidadeRecusa(string sql, string constraint)
        => await AssertConstraintAsync(sql, "23505", constraint);

    private async Task AssertConstraintAsync(string sql, string expectedState, string constraint)
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using var connection = new NpgsqlConnection(fixture.AdminConnectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        var error = await Assert.ThrowsAsync<PostgresException>(() => IdentityTestData.ExecuteAsync(connection, sql, data));
        Assert.Equal(expectedState, error.SqlState);
        Assert.Equal(constraint, error.ConstraintName);
        await transaction.RollbackAsync();
        await using var health = new NpgsqlCommand("SELECT 1", connection);
        Assert.Equal(1, await health.ExecuteScalarAsync());
    }
}
