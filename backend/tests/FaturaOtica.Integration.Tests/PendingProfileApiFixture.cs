using System.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

namespace FaturaOtica.Integration.Tests;

// Only supplies trusted configuration and signed tokens. Never replaces the production auth handler.
internal sealed class PendingProfileApiFixture : WebApplicationFactory<Program>
{
    public const string Route = "/api/v1/identity/users";
    private const string Issuer = "s104a1-test-issuer";
    private const string Audience = "s104a1-test-api";
    private readonly byte[] signingKey = RandomNumberGenerator.GetBytes(64);
    private readonly IdentityPostgreSqlFixture database;
    private readonly IReadOnlyDictionary<string, string?> configurationOverrides;
    public IdentityTestData Data { get; }

    public PendingProfileApiFixture(IdentityPostgreSqlFixture database, IdentityTestData data,
        IReadOnlyDictionary<string, string?>? configurationOverrides = null)
    {
        this.database = database;
        Data = data;
        this.configurationOverrides = configurationOverrides ?? new Dictionary<string, string?>();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("Identity:TenantId", Data.TenantA.ToString());
        var runtime = new NpgsqlConnectionStringBuilder(database.RuntimeConnectionString) { MaxPoolSize = 8 };
        builder.UseSetting("ConnectionStrings:Identity", runtime.ConnectionString);
        builder.UseSetting("Identity:Jwt:Issuer", Issuer);
        builder.UseSetting("Identity:Jwt:Audience", Audience);
        builder.UseSetting("Identity:Jwt:SigningKey", Convert.ToBase64String(signingKey));
        builder.UseSetting("Identity:Jwt:AllowedAlgorithms:0", "HS256");
        foreach (var setting in configurationOverrides)
            builder.UseSetting(setting.Key, setting.Value);
        // The minimal-host factory normalizes null web-host settings to empty strings.
        // Preserve missing values in application configuration without any fallback provider.
        builder.ConfigureAppConfiguration((_, configuration) =>
            configuration.AddInMemoryCollection(configurationOverrides));
    }

    public string? Token(string variant = "valid", Guid? actor = null, bool forgedPermissions = false)
    {
        if (variant == "absent") return null;
        if (variant == "malformed") return "this-is-not-a-jwt";
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var payload = new Dictionary<string, object?>
        {
            ["iss"] = variant == "issuer" ? "untrusted-issuer" : Issuer,
            ["aud"] = variant == "audience" ? "another-api" : Audience,
            ["sub"] = (actor ?? Data.UserA).ToString(),
            ["tenant_id"] = Data.TenantA.ToString(),
            ["iat"] = now,
            ["nbf"] = now - 1,
            ["exp"] = now + 900,
        };
        switch (variant)
        {
            case "expired": payload["exp"] = now - 1; payload["nbf"] = now - 900; break;
            case "future": payload["nbf"] = now + 600; break;
            case "no-exp": payload.Remove("exp"); break;
            case "no-issuer": payload.Remove("iss"); break;
            case "no-audience": payload.Remove("aud"); break;
            case "tenant-foreign": payload["tenant_id"] = Data.TenantB.ToString(); break;
            case "tenant-empty": payload["tenant_id"] = Guid.Empty.ToString(); break;
            case "tenant-malformed": payload["tenant_id"] = "not-a-uuid"; break;
            case "tenant-absent": payload.Remove("tenant_id"); break;
            case "sub-empty": payload["sub"] = Guid.Empty.ToString(); break;
            case "sub-malformed": payload["sub"] = "not-a-uuid"; break;
            case "sub-absent": payload.Remove("sub"); break;
        }
        if (forgedPermissions)
        {
            payload["role"] = "Owner";
            payload["filial_id"] = Data.BranchA.ToString();
        }
        var algorithm = variant == "algorithm" ? "HS384" : variant == "unsigned" ? "none" : "HS256";
        var header = Base64Url(JsonSerializer.SerializeToUtf8Bytes(new { alg = algorithm, typ = "JWT" }));
        var body = Base64Url(JsonSerializer.SerializeToUtf8Bytes(payload));
        var input = Encoding.ASCII.GetBytes($"{header}.{body}");
        // SigningKey is supplied as a base64 string, and used as UTF-8 bytes by the configured handler.
        var key = Encoding.UTF8.GetBytes(Convert.ToBase64String(signingKey));
        if (variant == "signature") key = RandomNumberGenerator.GetBytes(64);
        var signature = algorithm switch
        {
            "none" => string.Empty,
            "HS384" => Base64Url(HMACSHA384.HashData(key, input)),
            _ => Base64Url(HMACSHA256.HashData(key, input)),
        };
        return $"{header}.{body}.{signature}";
    }

    private static string Base64Url(byte[] value)
        => Convert.ToBase64String(value).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    public void VerifySignedTokenFixture()
    {
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = true, ValidIssuer = Issuer,
            ValidateAudience = true, ValidAudience = Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Convert.ToBase64String(signingKey))),
            ValidateLifetime = true, RequireExpirationTime = true, RequireSignedTokens = true,
            ClockSkew = TimeSpan.Zero, ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
        };
        var handler = new JwtSecurityTokenHandler { MapInboundClaims = false };
        var principal = handler.ValidateToken(Token(), parameters, out var validated);
        Assert.Equal(Data.UserA.ToString(), principal.FindFirst("sub")?.Value);
        Assert.Equal(Data.TenantA.ToString(), principal.FindFirst("tenant_id")?.Value);
        Assert.Equal("HS256", Assert.IsType<JwtSecurityToken>(validated).Header.Alg);
        foreach (var invalid in new[] { "signature", "expired", "future", "no-exp", "issuer", "audience", "algorithm", "unsigned" })
            Assert.ThrowsAny<SecurityTokenException>(() => handler.ValidateToken(Token(invalid), parameters, out _));
    }

    public string Request(string email = "new@example.test", Guid? branch = null, string name = "Ana")
        => JsonSerializer.Serialize(new { email, name, branchId = branch ?? Data.BranchA });

    public static async Task<HttpResponseMessage> PostAsync(HttpClient client, string json, string? token)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, Route);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");
        if (token is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await client.SendAsync(request);
    }

    public async Task SetActorAsync(string role)
    {
        await ExecuteAsync("DELETE FROM identity.papeis_usuarios WHERE tenant_id=@ta AND usuario_id=@ua; DELETE FROM identity.concessoes_filiais WHERE tenant_id=@ta AND usuario_id=@ua;");
        if (role is "Owner" or "AccessAdministrator")
            await ExecuteAsync($"INSERT INTO identity.papeis_usuarios(id,tenant_id,usuario_id,papel,ativo) VALUES(@id,@ta,@ua,'{role}',true)");
        if (role is "BranchManager" or "Seller" or "AdminManager")
            await ExecuteAsync($"INSERT INTO identity.concessoes_filiais(id,tenant_id,usuario_id,filial_id,papel,ativo) VALUES(@id,@ta,@ua,@ba,'{(role == "Seller" ? "Seller" : "BranchManager")}',true)");
        if (role == "AdminManager")
            await ExecuteAsync("INSERT INTO identity.papeis_usuarios(id,tenant_id,usuario_id,papel,ativo) VALUES(@id,@ta,@ua,'AccessAdministrator',true)");
    }

    public async Task ExecuteAsync(string sql)
    {
        await using var connection = new NpgsqlConnection(database.AdminConnectionString);
        await connection.OpenAsync();
        await IdentityTestData.ExecuteAsync(connection, sql, Data);
    }

    public async Task<long[]> StateAsync()
    {
        await using var connection = new NpgsqlConnection(database.AdminConnectionString);
        await connection.OpenAsync();
        await using var command = IdentityTestData.Command(connection, """
            SELECT (SELECT count(*) FROM identity.usuarios WHERE tenant_id IN (@ta,@tb)),
                   (SELECT count(*) FROM identity.papeis_usuarios WHERE tenant_id IN (@ta,@tb)),
                   (SELECT count(*) FROM identity.concessoes_filiais WHERE tenant_id IN (@ta,@tb)),
                   (SELECT count(*) FROM identity.auditoria WHERE tenant_id IN (@ta,@tb))
            """, Data);
        await using var reader = await command.ExecuteReaderAsync();
        Assert.True(await reader.ReadAsync());
        return [reader.GetInt64(0), reader.GetInt64(1), reader.GetInt64(2), reader.GetInt64(3)];
    }

    public static async Task<JsonElement> ProblemAsync(HttpResponseMessage response, HttpStatusCode status, string? code)
    {
        Assert.Equal(status, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);
        var body = document.RootElement.Clone();
        Assert.Equal((int)status, body.GetProperty("status").GetInt32());
        foreach (var key in new[] { "type", "title", "traceId", "code" })
            Assert.False(string.IsNullOrWhiteSpace(body.GetProperty(key).GetString()));
        if (code is not null) Assert.Equal(code, body.GetProperty("code").GetString());
        foreach (var leak in new[] { "Npgsql", "PostgresException", "stackTrace", "senha_hash", "SigningKey", "INSERT INTO" })
            Assert.DoesNotContain(leak, json, StringComparison.OrdinalIgnoreCase);
        return body;
    }
}
