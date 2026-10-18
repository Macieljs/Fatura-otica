using System.Text.Json.Nodes;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace FaturaOtica.Api.Identity;

internal static class IdentityOpenApi
{
    public static void Configure(OpenApiOptions options)
    {
        options.AddDocumentTransformer((document, _, _) =>
        {
            document.Components ??= new();
            document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
            document.Components.SecuritySchemes["bearerAuth"] = new OpenApiSecurityScheme
                { Type = SecuritySchemeType.Http, Scheme = "bearer", BearerFormat = "JWT" };
            foreach (var entry in document.Paths.Where(p => p.Key.StartsWith("/api/v1/identity/", StringComparison.Ordinal)))
            {
                var isPublic = entry.Key is "/api/v1/identity/login" or "/api/v1/identity/activation/complete" or
                    "/api/v1/identity/csrf" or "/api/v1/identity/refresh" or "/api/v1/identity/logout";
                foreach (var operation in entry.Value.Operations?.Values.AsEnumerable() ?? [])
                    operation.Security = isPublic ? [] : [new OpenApiSecurityRequirement
                        { [new OpenApiSecuritySchemeReference("bearerAuth", document)] = [] }];
            }
            return Task.CompletedTask;
        });
        options.AddSchemaTransformer((schema, context, _) =>
        {
            if (context.JsonTypeInfo.Type == typeof(GrantRequest) || context.JsonTypeInfo.Type == typeof(Grant) ||
                context.JsonTypeInfo.Type == typeof(UserStateRequest))
            {
                schema.AdditionalPropertiesAllowed = false;
                schema.Required = schema.Properties!.Keys.Where(key => key != "branchId").ToHashSet(StringComparer.Ordinal);
                if (schema.Properties.TryGetValue("role", out var role) && role is OpenApiSchema roleSchema)
                    roleSchema.Enum = [JsonValue.Create("seller"), JsonValue.Create("branchManager"), JsonValue.Create("owner"), JsonValue.Create("accessAdministrator")];
                if (schema.Properties.TryGetValue("scope", out var scope) && scope is OpenApiSchema scopeSchema)
                    scopeSchema.Enum = [JsonValue.Create("tenant"), JsonValue.Create("branch")];
                if (schema.Properties.TryGetValue("status", out var state) && state is OpenApiSchema stateSchema)
                    stateSchema.Enum = [JsonValue.Create("active"), JsonValue.Create("blocked")];
            }
            if (context.JsonTypeInfo.Type == typeof(CreateProfileRequest) || context.JsonTypeInfo.Type == typeof(Profile))
            {
                schema.AdditionalPropertiesAllowed = false;
                schema.Required = schema.Properties!.Keys.ToHashSet(StringComparer.Ordinal);
                if (schema.Properties.TryGetValue("email", out var email) && email is OpenApiSchema emailSchema)
                    emailSchema.Format = "email";
                if (schema.Properties.TryGetValue("name", out var name) && name is OpenApiSchema nameSchema)
                    nameSchema.MinLength = 1;
                if (schema.Properties.TryGetValue("status", out var status) && status is OpenApiSchema statusSchema)
                    statusSchema.Enum = [JsonValue.Create("pending"), JsonValue.Create("active"), JsonValue.Create("blocked")];
            }
            return Task.CompletedTask;
        });
    }
}
