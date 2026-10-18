using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class IdentitySessionHttpTests(IdentityPostgreSqlFixture fixture)
{
    [Fact]
    public async Task Session_BrowserFlow_EnforcesOriginCsrfCookieAndLogoutSid()
    {
        var data = await IdentityTestData.CreateAsync(fixture);
        await using (var admin = IdentityTestData.Context(fixture.AdminConnectionString, data.TenantA))
        {
            (await admin.Users.SingleAsync()).PasswordHash = await new IdentityCredentialHasher().HashAsync("safe-password-123");
            await admin.SaveChangesAsync();
            await admin.Database.ExecuteSqlRawAsync("GRANT SELECT, INSERT, UPDATE, DELETE ON identity.ativacoes, identity.sessoes TO s103a_runtime");
        }
        await using var app = new PendingProfileApiFixture(fixture, data,
            new Dictionary<string, string?> { ["Identity:AllowedOrigins:0"] = "https://app.example.test" });
        using var client = app.CreateClient(new() { HandleCookies = false });
        using var login = await client.PostAsJsonAsync("/api/v1/identity/login", new { email = "seller@example.test", password = "safe-password-123" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        Assert.True(login.Headers.CacheControl?.NoStore);
        var cookie = Assert.Single(login.Headers.GetValues("Set-Cookie"));
        Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=lax", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("path=/api/v1/identity", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("domain=", cookie, StringComparison.OrdinalIgnoreCase);
        using var body = JsonDocument.Parse(await login.Content.ReadAsStringAsync());
        var jwt = body.RootElement.GetProperty("accessToken").GetString();
        Assert.False(body.RootElement.TryGetProperty("refreshToken", out _));
        var rawCookie = cookie.Split(';')[0];
        using var noOrigin = await SendAsync(HttpMethod.Get, "/api/v1/identity/csrf", rawCookie);
        Assert.Equal(HttpStatusCode.Forbidden, noOrigin.StatusCode);
        using var csrfResponse = await SendAsync(HttpMethod.Get, "/api/v1/identity/csrf", rawCookie, origin: "https://app.example.test");
        Assert.Equal(HttpStatusCode.OK, csrfResponse.StatusCode);
        Assert.True(csrfResponse.Headers.CacheControl?.NoStore);
        using var csrfBody = JsonDocument.Parse(await csrfResponse.Content.ReadAsStringAsync());
        var csrf = csrfBody.RootElement.GetProperty("csrfToken").GetString();
        using var forbidden = await SendAsync(HttpMethod.Post, "/api/v1/identity/refresh", rawCookie, csrf, "https://evil.example.test");
        Assert.Equal(HttpStatusCode.Forbidden, forbidden.StatusCode);
        using var missingCsrf = await SendAsync(HttpMethod.Post, "/api/v1/identity/refresh", rawCookie, origin: "https://app.example.test");
        Assert.Equal(HttpStatusCode.Forbidden, missingCsrf.StatusCode);
        using var logout = await SendAsync(HttpMethod.Post, "/api/v1/identity/logout", rawCookie, csrf, "https://app.example.test");
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
        using var meRequest = new HttpRequestMessage(HttpMethod.Get, "/api/v1/identity/me");
        meRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", jwt);
        using var me = await client.SendAsync(meRequest);
        Assert.Equal(HttpStatusCode.Unauthorized, me.StatusCode);

        async Task<HttpResponseMessage> SendAsync(HttpMethod method, string path, string refresh, string? antiCsrf = null, string? origin = null)
        {
            using var request = new HttpRequestMessage(method, path);
            request.Headers.Add("Cookie", refresh);
            if (antiCsrf is not null) request.Headers.Add("X-CSRF-Token", antiCsrf);
            if (origin is not null) request.Headers.Add("Origin", origin);
            return await client.SendAsync(request);
        }
    }
}
