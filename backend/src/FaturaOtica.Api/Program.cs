using FaturaOtica.Application;
using FaturaOtica.Infrastructure;
using Scalar.AspNetCore;
using Serilog;
using FaturaOtica.Api.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration)
        .WriteTo.Console(formatProvider: System.Globalization.CultureInfo.InvariantCulture));

builder.Services.AddOpenApi(IdentityOpenApi.Configure);
builder.Services.AddProblemDetails();
builder.Services.AddHostedService<IdentityConfigurationGuard>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => IdentityJwtConfiguration.Read(builder.Configuration).Configure(options));
builder.Services.AddAuthorization();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("identity-public", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions
        { PermitLimit = 30, Window = TimeSpan.FromMinutes(1), QueueLimit = 0, AutoReplenishment = true }));
    options.AddPolicy("identity-session", context =>
    {
        var partition = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter(partition, _ => new FixedWindowRateLimiterOptions
        { PermitLimit = 600, Window = TimeSpan.FromMinutes(1), QueueLimit = 0, AutoReplenishment = true });
    });
    options.OnRejected = async (context, _) =>
    {
        context.HttpContext.Response.Headers.CacheControl = "no-store";
        await Results.Json(new Problem("urn:fatura-otica:problem:identity.rate_limited", "Too many requests", 429,
            context.HttpContext.TraceIdentifier, "identity.rate_limited"), statusCode: 429, contentType: "application/problem+json")
            .ExecuteAsync(context.HttpContext).ConfigureAwait(false);
    };
});
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler(handler => handler.Run(context => IdentityProblems.Unexpected(context).ExecuteAsync(context)));
app.UseSerilogRequestLogging();
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/v1/identity"))
    {
        context.Response.Headers.CacheControl = "no-store";
        context.Response.Headers.Pragma = "no-cache";
    }
    await next(context).ConfigureAwait(false);
});
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference("/docs");
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .WithName("HealthCheck")
    .WithTags("Infra");
app.MapPendingProfile();
app.MapIdentitySessions();
app.MapIdentityDirectory();
app.MapAccessAdministration();

await app.RunAsync();

/// <summary>Exposto para WebApplicationFactory nos testes de integração.</summary>
public partial class Program;
