using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentityDirectoryTests(IdentityPostgreSqlFixture database)
{
    private static readonly string[] DirectoryProperties = ["grantsMap", "profiles"];
    private static readonly string[] ProfileProperties = ["branchId", "email", "id", "name", "status"];
    private static readonly string[] BranchProperties = ["id", "name"];

    [Theory]
    [InlineData("Owner")]
    [InlineData("AccessAdministrator")]
    public async Task Get_Admin_ListsOnlyOwnTenantWithSafeContracts(string role)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync(role);
        await api.ExecuteAsync("INSERT INTO identity.filiais(id,tenant_id,nome,ativa) VALUES(@id,@ta,'Inactive',false)");
        using var client = api.CreateClient();
        using var users = await GetAsync(client, "users", api.Token());
        Assert.Equal(HttpStatusCode.OK, users.StatusCode);
        Assert.True(users.Headers.CacheControl?.NoStore);
        var json = await users.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        Assert.Equal(DirectoryProperties, doc.RootElement.EnumerateObject().Select(p => p.Name).Order());
        var profile = Assert.Single(doc.RootElement.GetProperty("profiles").EnumerateArray());
        Assert.Equal(data.UserA, profile.GetProperty("id").GetGuid());
        Assert.Equal(JsonValueKind.Null, profile.GetProperty("branchId").ValueKind);
        Assert.Equal(ProfileProperties, profile.EnumerateObject().Select(p => p.Name).Order());
        Assert.Single(doc.RootElement.GetProperty("grantsMap").EnumerateObject());
        Assert.DoesNotContain(data.UserB.ToString(), json);
        foreach (var secret in new[] { "password", "hash", "token", "credential", "test-only" })
            Assert.DoesNotContain(secret, json, StringComparison.OrdinalIgnoreCase);
        using var branches = await GetAsync(client, "branches", api.Token());
        Assert.Equal(HttpStatusCode.OK, branches.StatusCode);
        Assert.True(branches.Headers.CacheControl?.NoStore);
        using var branchDoc = JsonDocument.Parse(await branches.Content.ReadAsStringAsync());
        var branch = Assert.Single(branchDoc.RootElement.EnumerateArray());
        Assert.Equal(data.BranchA, branch.GetProperty("id").GetGuid());
        Assert.Equal(BranchProperties, branch.EnumerateObject().Select(p => p.Name).Order());
    }

    [Fact]
    public async Task Get_Manager_FiltersProfilesByRegistrationBranchAndBranchesByActiveManagement()
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("BranchManager");
        await api.ExecuteAsync("""
            INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status,criado_para_filial_id)
            VALUES(@id,@ta,'Pending','pending@example.test','Pending',@ba);
            INSERT INTO identity.filiais(id,tenant_id,nome,ativa) VALUES(@id,@ta,'Unmanaged',true);
            INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo)
            SELECT gen_random_uuid(),@ta,id,@ba,'Seller',true FROM identity.usuarios WHERE tenant_id=@ta AND email_normalizado='pending@example.test';
            INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo)
            SELECT gen_random_uuid(),@ta,id,@id,'Seller',true FROM identity.usuarios WHERE tenant_id=@ta AND email_normalizado='pending@example.test';
            INSERT INTO identity.usuarios(id,tenant_id,nome,email_normalizado,status,criado_para_filial_id)
            VALUES(gen_random_uuid(),@ta,'Outside','outside@example.test','Pending',@id);
            INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo)
            SELECT gen_random_uuid(),@ta,id,@ba,'Seller',true FROM identity.usuarios WHERE tenant_id=@ta AND email_normalizado='outside@example.test';
            """);
        await api.ExecuteAsync("INSERT INTO identity.filiais(id,tenant_id,nome,ativa) VALUES(@id,@ta,'Inactive',false)");
        using var client = api.CreateClient();
        using var users = await GetAsync(client, "users", api.Token());
        Assert.Equal(HttpStatusCode.OK, users.StatusCode);
        using var doc = JsonDocument.Parse(await users.Content.ReadAsStringAsync());
        var profile = Assert.Single(doc.RootElement.GetProperty("profiles").EnumerateArray());
        Assert.Equal("Pending", profile.GetProperty("name").GetString());
        Assert.Equal("pending", profile.GetProperty("status").GetString());
        Assert.Equal(data.BranchA, profile.GetProperty("branchId").GetGuid());
        Assert.Single(doc.RootElement.GetProperty("grantsMap").EnumerateObject());
        var visibleGrants = doc.RootElement.GetProperty("grantsMap").GetProperty(profile.GetProperty("id").GetString()!).EnumerateArray().ToArray();
        Assert.Single(visibleGrants);
        Assert.Equal(data.BranchA, visibleGrants[0].GetProperty("branchId").GetGuid());
        using var branches = await GetAsync(client, "branches", api.Token());
        Assert.Equal(HttpStatusCode.OK, branches.StatusCode);
        Assert.True(branches.Headers.CacheControl?.NoStore);
        using var branchDoc = JsonDocument.Parse(await branches.Content.ReadAsStringAsync());
        Assert.Equal(data.BranchA, Assert.Single(branchDoc.RootElement.EnumerateArray()).GetProperty("id").GetGuid());
        await api.ExecuteAsync("UPDATE identity.filiais SET ativa=false WHERE id=@ba");
        foreach (var route in new[] { "users", "branches" })
        {
            using var denied = await GetAsync(client, route, api.Token());
            Assert.Equal(HttpStatusCode.Forbidden, denied.StatusCode);
        }
    }

    [Theory]
    [InlineData("Seller", "", 403)]
    [InlineData("Owner", "UPDATE identity.usuarios SET status='Blocked' WHERE id=@ua", 403)]
    [InlineData("Owner", "UPDATE identity.papeis_usuarios SET ativo=false WHERE usuario_id=@ua", 403)]
    [InlineData("BranchManager", "UPDATE identity.concessoes_filiais SET ativo=false WHERE usuario_id=@ua", 403)]
    public async Task Get_WithoutCurrentAuthority_DeniesBothDirectories(string role, string mutation, int status)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync(role);
        if (mutation.Length > 0) await api.ExecuteAsync(mutation);
        using var client = api.CreateClient();
        foreach (var route in new[] { "users", "branches" })
        {
            using var response = await GetAsync(client, route, api.Token(forgedPermissions: true));
            Assert.Equal(status, (int)response.StatusCode);
        }
    }

    [Theory]
    [InlineData("absent")]
    [InlineData("tenant-foreign")]
    public async Task Get_InvalidIdentity_DeniesBothDirectories(string variant)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data);
        await api.SetActorAsync("Owner");
        using var client = api.CreateClient();
        foreach (var route in new[] { "users", "branches" })
        {
            using var response = await GetAsync(client, route, api.Token(variant));
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }

    private static async Task<HttpResponseMessage> GetAsync(HttpClient client, string route, string? token)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/identity/{route}");
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await client.SendAsync(request);
    }
}




