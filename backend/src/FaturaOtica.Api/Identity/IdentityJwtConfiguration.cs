using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace FaturaOtica.Api.Identity;

internal sealed class IdentityJwtConfiguration
{
    public required Guid TenantId { get; init; }
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public required byte[] SigningKey { get; init; }
    public required string[] AllowedAlgorithms { get; init; }

    public static IdentityJwtConfiguration Read(IConfiguration configuration)
    {
        if (!Guid.TryParse(configuration["Identity:TenantId"], out var tenantId) || tenantId == Guid.Empty)
            throw new InvalidOperationException("Identity TenantId must be configured as a nonempty UUID.");
        var issuer = Required(configuration, "Identity:Jwt:Issuer");
        var audience = Required(configuration, "Identity:Jwt:Audience");
        var key = Encoding.UTF8.GetBytes(Required(configuration, "Identity:Jwt:SigningKey"));
        var algorithms = configuration.GetSection("Identity:Jwt:AllowedAlgorithms").GetChildren()
            .Select(item => item.Value).ToArray();
        if (algorithms.Length == 0)
            throw new InvalidOperationException("Identity Jwt AllowedAlgorithms must be configured.");
        foreach (var algorithm in algorithms)
        {
            var minimumKeyBytes = algorithm switch
            {
                SecurityAlgorithms.HmacSha256 => 32,
                SecurityAlgorithms.HmacSha384 => 48,
                SecurityAlgorithms.HmacSha512 => 64,
                _ => throw new InvalidOperationException("Identity Jwt AllowedAlgorithms contains an unsupported algorithm."),
            };
            if (key.Length < minimumKeyBytes)
                throw new InvalidOperationException("Identity Jwt SigningKey is insufficient for AllowedAlgorithms.");
        }
        _ = Required(configuration, "ConnectionStrings:Identity");
        return new() { TenantId = tenantId, Issuer = issuer, Audience = audience,
            SigningKey = key, AllowedAlgorithms = algorithms.Select(algorithm => algorithm!).ToArray() };
    }

    private static string Required(IConfiguration configuration, string key)
        => !string.IsNullOrWhiteSpace(configuration[key]) ? configuration[key]!
            : throw new InvalidOperationException($"Required configuration {key} is missing or invalid.");

    public void Configure(JwtBearerOptions options)
    {
        options.MapInboundClaims = false;
        options.IncludeErrorDetails = false;
        options.SaveToken = false;
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true, ValidIssuer = Issuer,
            ValidateAudience = true, RequireAudience = true, ValidAudience = Audience,
            ValidateIssuerSigningKey = true, IssuerSigningKey = new SymmetricSecurityKey(SigningKey),
            ValidateLifetime = true, RequireExpirationTime = true, RequireSignedTokens = true,
            ValidAlgorithms = AllowedAlgorithms, ClockSkew = TimeSpan.Zero, NameClaimType = "sub",
        };
        options.Events = new()
        {
            OnTokenValidated = context =>
            {
                if (!TryIdentifier(context.Principal, "sub", out _) ||
                    !TryIdentifier(context.Principal, "tenant_id", out var tenant) || tenant != TenantId)
                    context.Fail("Invalid authenticated identity context.");
                return Task.CompletedTask;
            },
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.Headers.WWWAuthenticate = "Bearer";
                await IdentityProblems.Unauthorized(context.HttpContext).ExecuteAsync(context.HttpContext).ConfigureAwait(false);
            },
            OnForbidden = context => IdentityProblems.AccessDenied(context.HttpContext).ExecuteAsync(context.HttpContext),
        };
    }

    internal static bool TryIdentifier(ClaimsPrincipal? principal, string claimType, out Guid identifier)
    {
        identifier = Guid.Empty;
        var claims = principal?.FindAll(claimType).ToArray();
        return claims is { Length: 1 } && Guid.TryParse(claims[0].Value, out identifier) && identifier != Guid.Empty;
    }
}

internal sealed class IdentityConfigurationGuard(IConfiguration configuration) : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        _ = IdentityJwtConfiguration.Read(configuration);
        return Task.CompletedTask;
    }
    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
