using System.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FaturaOtica.Integration.Tests;

[Collection(IdentityPostgreSqlDefinition.Name)]
public sealed class PendingProfileConfigurationTests(IdentityPostgreSqlFixture database)
{
    [Theory]
    [InlineData("Identity:TenantId", null)]
    [InlineData("Identity:Jwt:Issuer", null)]
    [InlineData("Identity:Jwt:Audience", null)]
    [InlineData("Identity:Jwt:SigningKey", null)]
    [InlineData("Identity:Jwt:AllowedAlgorithms:0", null)]
    [InlineData("Identity:TenantId", "not-a-uuid")]
    [InlineData("Identity:TenantId", "00000000-0000-0000-0000-000000000000")]
    [InlineData("Identity:Jwt:Issuer", "  ")]
    [InlineData("Identity:Jwt:Audience", "  ")]
    [InlineData("Identity:Jwt:SigningKey", "short")]
    [InlineData("Identity:Jwt:AllowedAlgorithms:0", "")]
    [InlineData("Identity:Jwt:AllowedAlgorithms:0", "none")]
    [InlineData("Identity:Jwt:AllowedAlgorithms:0", "not-a-signing-algorithm")]
    public async Task Post_ConfiguracaoObrigatoriaAusenteOuInvalida_FalhaFechadaSemFallback(
        string setting, string? value)
    {
        var data = await IdentityTestData.CreateAsync(database);
        using var api = new PendingProfileApiFixture(database, data,
            new Dictionary<string, string?> { [setting] = value });
        // Sign/validate independently using the original isolated credentials; a missing setting
        // must not make the application accept a fallback credential or quietly omit its validator.
        api.VerifySignedTokenFixture();
        await api.SetActorAsync("BranchManager");
        HttpClient? client = null;
        var startupFailure = Record.Exception(() => client = api.CreateClient());
        if (startupFailure is not null)
        {
            // Arbitrary fixture/hosting failures are not evidence of fail-closed configuration.
            var configurationFailure = startupFailure is OptionsValidationException ||
                startupFailure is ArgumentException or InvalidOperationException &&
                startupFailure.Message.Contains(ConfigurationField(setting), StringComparison.OrdinalIgnoreCase);
            Assert.True(configurationFailure,
                $"Unexpected startup/fixture failure for {setting}: {startupFailure.GetType().Name}. This is an impediment, not a configuration acceptance result.");
            return;
        }

        Assert.NotNull(client);
        using (client)
        {
            // Prove the override actually reached application configuration before the request.
            Assert.Equal(value, api.Services.GetRequiredService<IConfiguration>()[setting]);
            using var health = await client.GetAsync("/health");
            var before = await api.StateAsync();
            using var response = await PendingProfileApiFixture.PostAsync(client, api.Request(), api.Token());
            Assert.Equal(before, await api.StateAsync());
            Assert.True(response.StatusCode is HttpStatusCode.InternalServerError or HttpStatusCode.ServiceUnavailable,
                $"Required configuration {setting} was {(value is null ? "missing" : "invalid")}; API started (health={(int)health.StatusCode}) and POST returned {(int)response.StatusCode}. Expected a configuration startup failure or explicit 500/503 refusal, with no fallback. A missing route/401 does not prove configuration validation.");
            await PendingProfileApiFixture.ProblemAsync(response, response.StatusCode, null);
        }
    }

    private static string ConfigurationField(string setting)
        => setting == "Identity:Jwt:AllowedAlgorithms:0" ? "AllowedAlgorithms" : setting[(setting.LastIndexOf(':') + 1)..];
}
