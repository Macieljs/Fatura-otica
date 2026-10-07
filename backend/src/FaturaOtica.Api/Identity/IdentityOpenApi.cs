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
            if (document.Paths.TryGetValue("/api/v1/identity/users", out var path) &&
                path.Operations?.TryGetValue(HttpMethod.Post, out var post) == true)
                post.Security = [new OpenApiSecurityRequirement
                    { [new OpenApiSecuritySchemeReference("bearerAuth", document)] = [] }];
            return Task.CompletedTask;
        });
        options.AddSchemaTransformer((schema, context, _) =>
        {
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
