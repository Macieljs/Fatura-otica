using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class AccessAdministrationTests(IdentityPostgreSqlFixture database)
{
    private static readonly int[] ConcurrentStatuses = [200, 409];
    private static readonly int[] ConcurrentRevocations = [204, 409];

    [Fact]
    public async Task Revoke_TenantRole_AdminDeniedAndLastDistinctOwnerProtectedUnderConcurrency()
    {
        var (api, target) = await SetupAsync("AccessAdministrator");
        using (api)
        using (var client = api.CreateClient())
        {
            var targetRole = Guid.CreateVersion7();
            await api.ExecuteAsync($"UPDATE identity.usuarios SET status='Active',senha_hash='test-hash' WHERE id='{target}'; INSERT INTO identity.papeis_usuarios(id,tenant_id,usuario_id,papel,ativo) VALUES('{targetRole}',@ta,'{target}','Owner',true)");
            using var denied = await SendAsync(client, api, HttpMethod.Delete, target, $"grants/{targetRole}");
            Assert.Equal(HttpStatusCode.Forbidden, denied.StatusCode);
            await api.SetActorAsync("Owner");
            var ownRole = await ScalarAsync($"SELECT id::text FROM identity.papeis_usuarios WHERE usuario_id='{api.Data.UserA}' AND papel='Owner'");
            var responses = await Task.WhenAll(
                SendAsync(client, api, HttpMethod.Delete, api.Data.UserA, $"grants/{ownRole}"),
                SendAsync(client, api, HttpMethod.Delete, target, $"grants/{targetRole}", actor: target));
            try { Assert.Equal(ConcurrentRevocations, responses.Select(r => (int)r.StatusCode).Order()); }
            finally { foreach (var response in responses) response.Dispose(); }
            Assert.Equal("1", await ScalarAsync($"SELECT count(DISTINCT usuario_id)::text FROM identity.papeis_usuarios WHERE tenant_id='{api.Data.TenantA}' AND papel='Owner' AND ativo"));
        }
    }

    [Fact]
    public async Task Grant_UntrustedPayloadAndBearer_NoMutation()
    {
        var (api, target) = await SetupAsync("Owner");
        using (api)
        using (var client = api.CreateClient())
        {
            var before = await api.StateAsync();
            using var unauthorized = await client.PostAsync($"/api/v1/identity/users/{target}/grants", new StringContent("{}", Encoding.UTF8, "application/json"));
            Assert.Equal(HttpStatusCode.Unauthorized, unauthorized.StatusCode);
            using var invalid = await SendAsync(client, api, HttpMethod.Post, target, "grants",
                JsonSerializer.Serialize(new { role = "owner", scope = "tenant", tenantId = api.Data.TenantB }));
            Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
            Assert.Equal(before, await api.StateAsync());
        }
    }

    [Fact]
    public async Task OpenApi_AdministrativeOperations_ExposeSecurityAndClosedSchemas()
    {
        var (api, _) = await SetupAsync("Owner");
        using (api)
        using (var client = api.CreateClient())
        {
            using var response = await client.GetAsync("/openapi/v1.json");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            var paths = json.RootElement.GetProperty("paths");
            foreach (var (path, method) in new[] { ("grants", "post"), ("grants/{grantId}", "delete"), ("status", "put") })
                Assert.Contains(paths.GetProperty($"/api/v1/identity/users/{{userId}}/{path}").GetProperty(method).GetProperty("security").EnumerateArray(),
                    security => security.TryGetProperty("bearerAuth", out _));
            var schemas = json.RootElement.GetProperty("components").GetProperty("schemas");
            Assert.False(schemas.GetProperty("GrantRequest").GetProperty("additionalProperties").GetBoolean());
            Assert.Equal(4, schemas.GetProperty("GrantRequest").GetProperty("properties").GetProperty("role").GetProperty("enum").GetArrayLength());
        }
    }
    [Theory]
    [InlineData("Owner", "owner", "tenant")]
    [InlineData("Owner", "accessAdministrator", "tenant")]
    [InlineData("AccessAdministrator", "seller", "branch")]
    [InlineData("AccessAdministrator", "branchManager", "branch")]
    public async Task Grant_AuthorityAndScope_PersistsPendingAndRealActor(string actorRole, string role, string scope)
    {
        var (api, target) = await SetupAsync(actorRole);
        using (api)
        using (var client = api.CreateClient())
        {
            using var response = await SendAsync(client, api, HttpMethod.Post, target, "grants", Grant(role, scope, api.Data.BranchA));
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
            Assert.NotEqual(Guid.Empty, json.RootElement.GetProperty("id").GetGuid());
            Assert.Equal(role, json.RootElement.GetProperty("role").GetString());
            Assert.Equal("Pending|true", await ScalarAsync($"SELECT status || '|' || (senha_hash IS NULL)::text FROM identity.usuarios WHERE id='{target}'"));
            Assert.Equal(api.Data.UserA.ToString(), await ScalarAsync($"SELECT autor_usuario_id::text FROM identity.auditoria WHERE alvo_usuario_id='{target}' AND acao='GrantAccess'"));
        }
    }

    [Theory]
    [InlineData("AccessAdministrator", "owner", "tenant", 403)]
    [InlineData("AccessAdministrator", "accessAdministrator", "tenant", 403)]
    [InlineData("Seller", "seller", "branch", 403)]
    [InlineData("Owner", "owner", "branch", 400)]
    [InlineData("Owner", "seller", "tenant", 400)]
    public async Task Grant_ForbiddenMatrixAndInvalidScope_NoAudit(string actor, string role, string scope, int expected)
    {
        var (api, target) = await SetupAsync(actor);
        using (api)
        using (var client = api.CreateClient())
        {
            var before = await api.StateAsync();
            using var response = await SendAsync(client, api, HttpMethod.Post, target, "grants", Grant(role, scope, api.Data.BranchA));
            Assert.Equal((HttpStatusCode)expected, response.StatusCode);
            Assert.Equal(before, await api.StateAsync());
        }
    }

    [Theory]
    [InlineData("foreignTarget")]
    [InlineData("foreignBranch")]
    [InlineData("inactiveBranch")]
    [InlineData("blockedActor")]
    public async Task Grant_UntrustedOrInactiveRecords_Forbidden(string condition)
    {
        var (api, target) = await SetupAsync("Owner");
        using (api)
        using (var client = api.CreateClient())
        {
            if (condition == "inactiveBranch") await api.ExecuteAsync("UPDATE identity.filiais SET ativa=false WHERE id=@ba");
            if (condition == "blockedActor") await api.ExecuteAsync("UPDATE identity.usuarios SET status='Blocked' WHERE id=@ua");
            var before = await api.StateAsync();
            using var response = await SendAsync(client, api, HttpMethod.Post,
                condition == "foreignTarget" ? api.Data.UserB : target, "grants",
                Grant("seller", "branch", condition == "foreignBranch" ? api.Data.BranchB : api.Data.BranchA));
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            Assert.Equal(before, await api.StateAsync());
        }
    }

    [Fact]
    public async Task Grant_RevokeAndReactivate_ReusesIdAndAuditsTransitions()
    {
        var (api, target) = await SetupAsync("Owner");
        using (api)
        using (var client = api.CreateClient())
        {
            using var first = await SendAsync(client, api, HttpMethod.Post, target, "grants", Grant("seller", "branch", api.Data.BranchA));
            Assert.Equal(HttpStatusCode.Created, first.StatusCode);
            using var json = JsonDocument.Parse(await first.Content.ReadAsStringAsync());
            var id = json.RootElement.GetProperty("id").GetGuid();
            using var foreign = await SendAsync(client, api, HttpMethod.Delete, api.Data.UserB, $"grants/{id}");
            Assert.Equal(HttpStatusCode.Forbidden, foreign.StatusCode);
            using var revoked = await SendAsync(client, api, HttpMethod.Delete, target, $"grants/{id}");
            Assert.Equal(HttpStatusCode.NoContent, revoked.StatusCode);
            using var next = await SendAsync(client, api, HttpMethod.Post, target, "grants", Grant("seller", "branch", api.Data.BranchA));
            Assert.Equal(HttpStatusCode.Created, next.StatusCode);
            using var nextJson = JsonDocument.Parse(await next.Content.ReadAsStringAsync());
            Assert.Equal(id, nextJson.RootElement.GetProperty("id").GetGuid());
            Assert.Equal("3", await ScalarAsync($"SELECT count(*)::text FROM identity.auditoria WHERE alvo_usuario_id='{target}'"));
        }
    }

    [Fact]
    public async Task Status_PendingAndHashless_CannotActivate()
    {
        var (api, target) = await SetupAsync("Owner");
        using (api)
        using (var client = api.CreateClient())
        {
            using var pending = await SendAsync(client, api, HttpMethod.Put, target, "status", "{\"status\":\"active\"}");
            Assert.Equal(HttpStatusCode.Conflict, pending.StatusCode);
            await api.ExecuteAsync($"UPDATE identity.usuarios SET status='Blocked' WHERE id='{target}'");
            using var hashless = await SendAsync(client, api, HttpMethod.Put, target, "status", "{\"status\":\"active\"}");
            Assert.Equal(HttpStatusCode.Conflict, hashless.StatusCode);
        }
    }

    [Fact]
    public async Task Status_AdminCannotBlockOwner_LastOwnerProtectedAndConcurrentOwnersKeepOne()
    {
        var (api, target) = await SetupAsync("AccessAdministrator");
        using (api)
        using (var client = api.CreateClient())
        {
            await api.ExecuteAsync($"UPDATE identity.usuarios SET status='Active',senha_hash='test-hash' WHERE id='{target}'; INSERT INTO identity.papeis_usuarios(id,tenant_id,usuario_id,papel,ativo) VALUES(@id,@ta,'{target}','Owner',true)");
            using var denied = await SendAsync(client, api, HttpMethod.Put, target, "status", "{\"status\":\"blocked\"}");
            Assert.Equal(HttpStatusCode.Forbidden, denied.StatusCode);
            await api.SetActorAsync("Owner");
            var responses = await Task.WhenAll(
                SendAsync(client, api, HttpMethod.Put, api.Data.UserA, "status", "{\"status\":\"blocked\"}"),
                SendAsync(client, api, HttpMethod.Put, target, "status", "{\"status\":\"blocked\"}", target));
            try { Assert.Equal(ConcurrentStatuses, responses.Select(r => (int)r.StatusCode).Order()); }
            finally { foreach (var response in responses) response.Dispose(); }
            Assert.Equal("1", await ScalarAsync($"SELECT count(DISTINCT u.id)::text FROM identity.usuarios u JOIN identity.papeis_usuarios r ON r.usuario_id=u.id AND r.tenant_id=u.tenant_id WHERE u.tenant_id='{api.Data.TenantA}' AND u.status='Active' AND r.papel='Owner' AND r.ativo"));
        }
    }

    [Fact]
    public async Task Status_BlockThenUnblock_RecordsDedicatedHumanAudit()
    {
        var (api, target) = await SetupAsync("Owner");
        using (api)
        using (var client = api.CreateClient())
        {
            await api.ExecuteAsync($"UPDATE identity.usuarios SET status='Active',senha_hash='test-hash' WHERE id='{target}'");
            foreach (var state in new[] { "blocked", "active" })
            {
                using var response = await SendAsync(client, api, HttpMethod.Put, target, "status", JsonSerializer.Serialize(new { status = state }));
                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            }
            Assert.Equal("BlockUser,UnblockUser", await ScalarAsync($"SELECT string_agg(acao,',' ORDER BY ocorrido_em) FROM identity.auditoria WHERE alvo_usuario_id='{target}' AND autor_usuario_id='{api.Data.UserA}' AND papel IS NULL AND filial_id IS NULL"));
        }
    }

    [Fact]
    public async Task Grant_AuditFailure_RollsBackGrant()
    {
        var (api, target) = await SetupAsync("Owner");
        using (api)
        using (var client = api.CreateClient())
        {
            var suffix = Guid.NewGuid().ToString("N");
            await api.ExecuteAsync($"CREATE FUNCTION identity.fail_{suffix}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.alvo_usuario_id='{target}'::uuid THEN RAISE EXCEPTION 'test failure'; END IF; RETURN NEW; END $$; CREATE TRIGGER fail_{suffix} BEFORE INSERT ON identity.auditoria FOR EACH ROW EXECUTE FUNCTION identity.fail_{suffix}()");
            try
            {
                var before = await api.StateAsync();
                using var response = await SendAsync(client, api, HttpMethod.Post, target, "grants", Grant("seller", "branch", api.Data.BranchA));
                Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
                Assert.Equal(before, await api.StateAsync());
            }
            finally { await api.ExecuteAsync($"DROP TRIGGER fail_{suffix} ON identity.auditoria; DROP FUNCTION identity.fail_{suffix}()"); }
        }
    }

    private async Task<(PendingProfileApiFixture Api, Guid Target)> SetupAsync(string role)
    {
        var data = await IdentityTestData.CreateAsync(database);
        var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync(role);
        var target = Guid.CreateVersion7();
        await api.ExecuteAsync($"INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status) VALUES('{target}',@ta,'Target','target@example.test','Pending')");
        return (api, target);
    }

    private async Task<string?> ScalarAsync(string sql)
    {
        await using var connection = new NpgsqlConnection(database.AdminConnectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        return (string?)await command.ExecuteScalarAsync();
    }

    private static string Grant(string role, string scope, Guid branch) => scope == "branch"
        ? JsonSerializer.Serialize(new { role, scope, branchId = branch }) : JsonSerializer.Serialize(new { role, scope });

    private static async Task<HttpResponseMessage> SendAsync(HttpClient client, PendingProfileApiFixture api,
        HttpMethod method, Guid target, string suffix, string? body = null, Guid? actor = null)
    {
        using var request = new HttpRequestMessage(method, $"/api/v1/identity/users/{target}/{suffix}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", api.Token(actor: actor, forgedPermissions: true));
        if (body is not null) request.Content = new StringContent(body, Encoding.UTF8, "application/json");
        return await client.SendAsync(request);
    }
}


