using System.Net;
using System.Text.Json;
using FaturaOtica.Domain.Identity;
using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class PendingProfileApiTests(IdentityPostgreSqlFixture database)
{
    private static readonly string[] ProfileProperties = ["email", "id", "name", "status"];
    private static readonly string[] RequestProperties = ["branchId", "email", "name"];

    [Fact]
    public async Task Fixture_JwtAssinadoValidoEVariantes_VerificaCriptografiaSemSubstituirHandlerDaApi()
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        api.VerifySignedTokenFixture();
    }
    [Theory]
    [InlineData("BranchManager")]
    [InlineData("Owner")]
    [InlineData("AdminManager")]
    public async Task Post_GestorAutorizado_CriaPendingComProvenienciaSemAcesso(string role)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync(role);
        using var client = api.CreateClient();
        var before = DateTimeOffset.UtcNow;
        var state = await api.StateAsync();
        using var response = await PendingProfileApiFixture.PostAsync(client, api.Request("  Ana@Example.Test  ", name: "  Ana  "), api.Token());
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var profile = document.RootElement;
        Assert.Equal(ProfileProperties, profile.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
        var id = profile.GetProperty("id").GetGuid();
        Assert.NotEqual(Guid.Empty, id);
        Assert.Equal('7', id.ToString("D")[14]);
        Assert.Equal("pending", profile.GetProperty("status").GetString());
        Assert.Equal("Ana", profile.GetProperty("name").GetString());
        Assert.Equal("ana@example.test", profile.GetProperty("email").GetString());
        await using var connection = new NpgsqlConnection(database.AdminConnectionString);
        await connection.OpenAsync();
        // Query only after 201: missing columns cannot masquerade as HTTP Red.
        await using var command = new NpgsqlCommand("""
            SELECT tenant_id,nome,email_normalizado,status,senha_hash,criado_por,criado_em,
                   criado_para_filial_id,atualizado_em,atualizado_por
            FROM identity.usuarios WHERE id=@id
            """, connection);
        command.Parameters.AddWithValue("id", id);
        await using (var row = await command.ExecuteReaderAsync())
        {
            Assert.True(await row.ReadAsync());
            Assert.Equal(data.TenantA, row.GetGuid(0));
            Assert.Equal("Ana", row.GetString(1));
            Assert.Equal("ana@example.test", row.GetString(2));
            Assert.Equal("Pending", row.GetString(3));
            Assert.True(row.IsDBNull(4));
            Assert.Equal(data.UserA, row.GetGuid(5));
            var created = row.GetFieldValue<DateTimeOffset>(6);
            Assert.Equal(TimeSpan.Zero, created.Offset);
            Assert.InRange(created, before, DateTimeOffset.UtcNow);
            Assert.Equal(data.BranchA, row.GetGuid(7));
            Assert.True(row.IsDBNull(8));
            Assert.True(row.IsDBNull(9));
            Assert.False(await row.ReadAsync());
        }
        var after = await api.StateAsync();
        Assert.Equal(new[] { state[0] + 1, state[1], state[2], state[3] }, after);
        await using var runtime = IdentityTestData.Context(database.RuntimeConnectionString, data.TenantA);
        var snapshot = await new PostgreSqlCurrentUserAccessReader(runtime).GetAsync(id);
        Assert.NotNull(snapshot);
        Assert.Equal(UserStatus.Pending, snapshot.Status);
        Assert.Empty(snapshot.TenantRoles);
        Assert.Empty(snapshot.BranchGrants);
        await using var wrapper = await IdentityTenantTransaction.BeginAsync(runtime);
        Assert.DoesNotContain(await runtime.Users.IgnoreQueryFilters().ToListAsync(), user => user.TenantId == data.TenantB);
        await using var raw = new NpgsqlCommand("SELECT count(*) FROM identity.usuarios WHERE id=@foreign", (NpgsqlConnection)runtime.Database.GetDbConnection());
        raw.Parameters.AddWithValue("foreign", data.UserB);
        Assert.Equal(0L, await raw.ExecuteScalarAsync());
    }

    [Theory]
    [InlineData("absent")]
    [InlineData("malformed")]
    [InlineData("signature")]
    [InlineData("expired")]
    [InlineData("future")]
    [InlineData("no-exp")]
    [InlineData("issuer")]
    [InlineData("no-issuer")]
    [InlineData("audience")]
    [InlineData("no-audience")]
    [InlineData("tenant-foreign")]
    [InlineData("tenant-empty")]
    [InlineData("tenant-malformed")]
    [InlineData("tenant-absent")]
    [InlineData("sub-empty")]
    [InlineData("sub-malformed")]
    [InlineData("sub-absent")]
    [InlineData("algorithm")]
    [InlineData("unsigned")]
    public async Task Post_BearerInvalido_401AntesDoBindingSemMutacao(string token)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("BranchManager");
        using var client = api.CreateClient();
        var before = await api.StateAsync();
        // Even malformed JSON must not bypass authentication or disclose validation details.
        using var response = await PendingProfileApiFixture.PostAsync(client, "{", api.Token(token));
        Assert.Equal(before, await api.StateAsync());
        await PendingProfileApiFixture.ProblemAsync(response, HttpStatusCode.Unauthorized, null);
    }

    [Theory]
    [InlineData("Seller")]
    [InlineData("AccessAdministrator")]
    [InlineData("None")]
    [InlineData("Pending")]
    [InlineData("Blocked")]
    [InlineData("ForeignActor")]
    [InlineData("MissingActor")]
    public async Task Post_SemCapacidadeAtual_403MesmoComClaimsDeOwner(string condition)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync(condition is "Pending" or "Blocked" ? "BranchManager" : condition);
        if (condition is "Pending" or "Blocked")
            await api.ExecuteAsync($"UPDATE identity.usuarios SET status='{condition}' WHERE id=@ua");
        var actor = condition == "ForeignActor" ? data.UserB : condition == "MissingActor" ? Guid.CreateVersion7() : data.UserA;
        using var client = api.CreateClient();
        var before = await api.StateAsync();
        using var response = await PendingProfileApiFixture.PostAsync(client, api.Request(), api.Token(actor: actor, forgedPermissions: true));
        Assert.Equal(before, await api.StateAsync());
        await PendingProfileApiFixture.ProblemAsync(response, HttpStatusCode.Forbidden, "identity.access_denied");
    }

    [Theory]
    [InlineData("BranchManager", "other")]
    [InlineData("BranchManager", "inactive")]
    [InlineData("BranchManager", "missing")]
    [InlineData("BranchManager", "foreign")]
    [InlineData("Owner", "inactive")]
    [InlineData("Owner", "missing")]
    [InlineData("Owner", "foreign")]
    public async Task Post_FilialNaoAutorizada_403UniformeAntesDaDuplicidade(string role, string condition)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync(role);
        var branch = condition == "foreign" ? data.BranchB : condition == "inactive" ? data.BranchA : Guid.CreateVersion7();
        if (condition == "inactive") await api.ExecuteAsync("UPDATE identity.filiais SET ativa=false WHERE id=@ba");
        if (condition == "other")
        {
            await using var connection = new NpgsqlConnection(database.AdminConnectionString);
            await connection.OpenAsync();
            await using var insert = new NpgsqlCommand("INSERT INTO identity.filiais(id,tenant_id,nome,ativa) VALUES(@branch,@tenant,'Unassigned',true)", connection);
            insert.Parameters.AddWithValue("branch", branch);
            insert.Parameters.AddWithValue("tenant", data.TenantA);
            await insert.ExecuteNonQueryAsync();
        }
        using var client = api.CreateClient();
        var before = await api.StateAsync();
        var bodies = new List<JsonElement>();
        foreach (var email in new[] { "seller@example.test", "unknown@example.test" })
        {
            using var response = await PendingProfileApiFixture.PostAsync(client, api.Request(email, branch), api.Token());
            Assert.Equal(before, await api.StateAsync());
            bodies.Add(await PendingProfileApiFixture.ProblemAsync(response, HttpStatusCode.Forbidden, "identity.access_denied"));
        }
        foreach (var key in new[] { "type", "title", "status", "code" })
            Assert.Equal(bodies[0].GetProperty(key).ToString(), bodies[1].GetProperty(key).ToString());
    }

    [Theory]
    [InlineData("UPDATE identity.concessoes_filiais SET ativo=false WHERE id=@ga")]
    [InlineData("UPDATE identity.usuarios SET status='Blocked' WHERE id=@ua")]
    [InlineData("UPDATE identity.filiais SET ativa=false WHERE id=@ba")]
    public async Task Post_MesmoBearerAposRevogacao_ProximaOperacao403(string update)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("BranchManager");
        using var client = api.CreateClient();
        var token = api.Token();
        using var first = await PendingProfileApiFixture.PostAsync(client, api.Request("first@example.test"), token);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        // SetActorAsync recreated the grant; revoke by user/branch rather than the old seed id.
        await api.ExecuteAsync(update.Replace("id=@ga", "usuario_id=@ua AND filial_id=@ba", StringComparison.Ordinal));
        var before = await api.StateAsync();
        using var second = await PendingProfileApiFixture.PostAsync(client, api.Request("second@example.test"), token);
        Assert.Equal(before, await api.StateAsync());
        await PendingProfileApiFixture.ProblemAsync(second, HttpStatusCode.Forbidden, "identity.access_denied");
    }

    public static TheoryData<string> InvalidRequests => new()
    {
        "{", "null", "[]", "{}",
        "{\"name\":\"Ana\",\"branchId\":\"$branch\"}",
        "{\"email\":null,\"name\":\"Ana\",\"branchId\":\"$branch\"}",
        "{\"email\":\"\",\"name\":\"Ana\",\"branchId\":\"$branch\"}",
        "{\"email\":\"invalid\",\"name\":\"Ana\",\"branchId\":\"$branch\"}",
        "{\"email\":42,\"name\":\"Ana\",\"branchId\":\"$branch\"}",
        "{\"email\":\"ana@example.test\",\"branchId\":\"$branch\"}",
        "{\"email\":\"ana@example.test\",\"name\":null,\"branchId\":\"$branch\"}",
        "{\"email\":\"ana@example.test\",\"name\":\"\",\"branchId\":\"$branch\"}",
        "{\"email\":\"ana@example.test\",\"name\":\"  \",\"branchId\":\"$branch\"}",
        "{\"email\":\"ana@example.test\",\"name\":42,\"branchId\":\"$branch\"}",
        "{\"email\":\"ana@example.test\",\"name\":\"Ana\"}",
        "{\"email\":\"ana@example.test\",\"name\":\"Ana\",\"branchId\":null}",
        "{\"email\":\"ana@example.test\",\"name\":\"Ana\",\"branchId\":\"invalid\"}",
        "{\"email\":\"ana@example.test\",\"name\":\"Ana\",\"branchId\":\"00000000-0000-0000-0000-000000000000\"}",
    };

    [Theory]
    [MemberData(nameof(InvalidRequests))]
    public async Task Post_EntradaInvalida_400SemMutacao(string json)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("BranchManager");
        using var client = api.CreateClient();
        var before = await api.StateAsync();
        using var response = await PendingProfileApiFixture.PostAsync(client, json.Replace("$branch", data.BranchA.ToString(), StringComparison.Ordinal), api.Token());
        Assert.Equal(before, await api.StateAsync());
        await PendingProfileApiFixture.ProblemAsync(response, HttpStatusCode.BadRequest, "identity.validation_failed");
    }

    [Theory]
    [InlineData("tenantId", "\"00000000-0000-4000-8000-000000000001\"")]
    [InlineData("actorUserId", "\"00000000-0000-4000-8000-000000000001\"")]
    [InlineData("createdBy", "\"00000000-0000-4000-8000-000000000001\"")]
    [InlineData("status", "\"active\"")]
    [InlineData("role", "\"owner\"")]
    [InlineData("grants", "[]")]
    [InlineData("password", "\"secret-test-only\"")]
    [InlineData("passwordHash", "\"secret-test-only\"")]
    [InlineData("activationToken", "\"secret-test-only\"")]
    [InlineData("accessToken", "\"secret-test-only\"")]
    [InlineData("id", "\"00000000-0000-4000-8000-000000000001\"")]
    [InlineData("createdAt", "\"2020-01-01T00:00:00Z\"")]
    [InlineData("unknown", "null")]
    public async Task Post_PropriedadeNaoDeclarada_400SemIgnorarCampo(string property, string value)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("BranchManager");
        using var client = api.CreateClient();
        var before = await api.StateAsync();
        var json = api.Request();
        json = json[..^1] + $",\"{property}\":{value}}}";
        using var response = await PendingProfileApiFixture.PostAsync(client, json, api.Token());
        Assert.Equal(before, await api.StateAsync());
        await PendingProfileApiFixture.ProblemAsync(response, HttpStatusCode.BadRequest, "identity.validation_failed");
    }

    [Theory]
    [InlineData("Pending")]
    [InlineData("Blocked")]
    [InlineData("Active")]
    public async Task Post_EmailCanonicoExistenteNoTenant_409SemReutilizarPerfil(string status)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("BranchManager");
        await api.ExecuteAsync($"INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status) VALUES(@id,@ta,'Existing','duplicate@example.test','{status}')");
        using var client = api.CreateClient();
        var before = await api.StateAsync();
        using var response = await PendingProfileApiFixture.PostAsync(client, api.Request("  DUPLICATE@Example.Test  "), api.Token());
        Assert.Equal(before, await api.StateAsync());
        await PendingProfileApiFixture.ProblemAsync(response, HttpStatusCode.Conflict, "identity.email_already_exists");
    }

    [Fact]
    public async Task Post_EmailExisteSomenteNoOutroTenant_CriaLocalSemRevelarOutroPerfil()
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("BranchManager");
        await api.ExecuteAsync("INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status) VALUES(@id,@tb,'Foreign','foreign-only@example.test','Pending')");
        using var client = api.CreateClient();
        using var response = await PendingProfileApiFixture.PostAsync(client, api.Request("foreign-only@example.test"), api.Token());
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        await using var admin = new NpgsqlConnection(database.AdminConnectionString);
        await admin.OpenAsync();
        await using var count = IdentityTestData.Command(admin, "SELECT count(*) FROM identity.usuarios WHERE tenant_id IN (@ta,@tb) AND email_normalizado='foreign-only@example.test'", data);
        Assert.Equal(2L, await count.ExecuteScalarAsync());
    }

    [Theory]
    [InlineData("ana+tag@example.test", "ana@example.test")]
    [InlineData("a.na@example.test", "ana@example.test")]
    public async Task Post_AliasNaoContratado_PreservaEmailsDistintos(string firstEmail, string secondEmail)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("BranchManager");
        using var client = api.CreateClient();
        using var first = await PendingProfileApiFixture.PostAsync(client, api.Request(firstEmail), api.Token());
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        using var second = await PendingProfileApiFixture.PostAsync(client, api.Request(secondEmail), api.Token());
        Assert.Equal(HttpStatusCode.Created, second.StatusCode);
    }

    [Theory]
    [InlineData("  ANA@ÉXAMPLE.TEST  ")]
    [InlineData("  ANA@İEXAMPLE.TEST  ")]
    public async Task Post_EmailUnicode_CanonicoCompativelComPostgreSqlSemRestricaoAscii(string email)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("BranchManager");
        using var client = api.CreateClient();
        using var response = await PendingProfileApiFixture.PostAsync(client, api.Request(email), api.Token());
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        await using var admin = new NpgsqlConnection(database.AdminConnectionString);
        await admin.OpenAsync();
        await using var canonical = new NpgsqlCommand("SELECT lower(btrim(@email))", admin);
        canonical.Parameters.AddWithValue("email", email);
        Assert.Equal(await canonical.ExecuteScalarAsync(), document.RootElement.GetProperty("email").GetString());
    }

    [Fact]
    public async Task Post_DuasRequisicoesConcorrentes_Uma201Uma409EExatamenteUmaLinha()
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("BranchManager");
        using var client = api.CreateClient();
        var before = await api.StateAsync();
        var responses = await Task.WhenAll(
            PendingProfileApiFixture.PostAsync(client, api.Request("  RACE@Example.Test  "), api.Token()),
            PendingProfileApiFixture.PostAsync(client, api.Request("race@example.test"), api.Token()));
        try
        {
            Assert.Equal(new[] { HttpStatusCode.Created, HttpStatusCode.Conflict }, responses.Select(r => r.StatusCode).Order());
            await PendingProfileApiFixture.ProblemAsync(responses.Single(r => r.StatusCode == HttpStatusCode.Conflict), HttpStatusCode.Conflict, "identity.email_already_exists");
            var after = await api.StateAsync();
            Assert.Equal(new[] { before[0] + 1, before[1], before[2], before[3] }, after);
            await using var admin = new NpgsqlConnection(database.AdminConnectionString);
            await admin.OpenAsync();
            await using var count = IdentityTestData.Command(admin, "SELECT count(*) FROM identity.usuarios WHERE tenant_id=@ta AND email_normalizado='race@example.test'", data);
            Assert.Equal(1L, await count.ExecuteScalarAsync());
        }
        finally { foreach (var response in responses) response.Dispose(); }
    }

    [Theory]
    [InlineData("23514")]
    [InlineData("23505")]
    public async Task Post_FalhaNoCommit_RevertePerfilSemClassificarConstraintDesconhecidaComoEmail(string sqlState)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("BranchManager");
        var suffix = Guid.NewGuid().ToString("N");
        var function = $"s104a1_fail_{suffix}";
        var trigger = $"s104a1_commit_{suffix}";
        await api.ExecuteAsync($"""
            CREATE FUNCTION identity.{function}() RETURNS trigger LANGUAGE plpgsql AS $failure$
            BEGIN
              IF NEW.tenant_id = '{data.TenantA}'::uuid AND NEW.email_normalizado = 'rollback@example.test' THEN
                RAISE EXCEPTION 'test-only deferred commit failure' USING ERRCODE='{sqlState}', CONSTRAINT='s104a1_other_constraint';
              END IF;
              RETURN NEW;
            END $failure$;
            CREATE CONSTRAINT TRIGGER {trigger} AFTER INSERT ON identity.usuarios
              DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION identity.{function}();
            """);
        try
        {
            // Prove this fixture really fails at commit, independently of the absent endpoint.
            await using var admin = new NpgsqlConnection(database.AdminConnectionString);
            await admin.OpenAsync();
            await using (var transaction = await admin.BeginTransactionAsync())
            {
                await IdentityTestData.ExecuteAsync(admin, "INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status) VALUES(@id,@ta,'Probe','rollback@example.test','Pending')", data);
                var error = await Assert.ThrowsAsync<PostgresException>(() => transaction.CommitAsync());
                Assert.Equal(sqlState, error.SqlState);
                Assert.Equal("s104a1_other_constraint", error.ConstraintName);
            }
            using var client = api.CreateClient();
            var before = await api.StateAsync();
            using var response = await PendingProfileApiFixture.PostAsync(client, api.Request("rollback@example.test"), api.Token());
            Assert.Equal(before, await api.StateAsync());
            await PendingProfileApiFixture.ProblemAsync(response, HttpStatusCode.InternalServerError, null);
        }
        finally
        {
            await api.ExecuteAsync($"DROP TRIGGER {trigger} ON identity.usuarios; DROP FUNCTION identity.{function}();");
        }
    }

    [Fact]
    public async Task OpenApi_RotaPostProtegida_ExportaContratoA1Fechado()
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        using var client = api.CreateClient();
        using var response = await client.GetAsync("/openapi/v1.json");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.True(document.RootElement.GetProperty("paths").TryGetProperty(PendingProfileApiFixture.Route, out var path), "Runtime OpenAPI must include POST /api/v1/identity/users.");
        var post = path.GetProperty("post");
        Assert.Equal("identityCreatePendingProfile", post.GetProperty("operationId").GetString());
        Assert.Contains(post.GetProperty("security").EnumerateArray(), security => security.TryGetProperty("bearerAuth", out _));
        var schemas = document.RootElement.GetProperty("components").GetProperty("schemas");
        var request = schemas.GetProperty("CreateProfileRequest");
        Assert.False(request.GetProperty("additionalProperties").GetBoolean());
        Assert.Equal(RequestProperties, request.GetProperty("required").EnumerateArray().Select(p => p.GetString()).Order(StringComparer.Ordinal));
        Assert.Equal(RequestProperties, request.GetProperty("properties").EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
        var responses = post.GetProperty("responses");
        foreach (var code in new[] { "201", "400", "401", "403", "409", "500" }) Assert.True(responses.TryGetProperty(code, out _));
        var profile = schemas.GetProperty("Profile");
        Assert.False(profile.GetProperty("additionalProperties").GetBoolean());
        Assert.Equal(ProfileProperties, profile.GetProperty("properties").EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal));
    }
}
