using FaturaOtica.Application;
using FaturaOtica.Infrastructure;
using Scalar.AspNetCore;
using Serilog;
using FaturaOtica.Api.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;

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
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseExceptionHandler(handler => handler.Run(context => IdentityProblems.Unexpected(context).ExecuteAsync(context)));
app.UseSerilogRequestLogging();
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

await app.RunAsync();

/// <summary>Exposto para WebApplicationFactory nos testes de integração.</summary>
public partial class Program;
