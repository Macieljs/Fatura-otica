using System.Diagnostics;
using System.Text.Json.Serialization;

namespace FaturaOtica.Api.Identity;

public sealed record Problem([property: JsonRequired] string Type, [property: JsonRequired] string Title,
    [property: JsonRequired] int Status, [property: JsonRequired] string TraceId,
    [property: JsonRequired] string Code,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] IDictionary<string, string[]>? Errors = null);

internal static class IdentityProblems
{
    public static IResult Unauthorized(HttpContext context)
        => Create(context, 401, "Invalid credentials", "identity.invalid_credentials");
    public static IResult AccessDenied(HttpContext context)
        => Create(context, 403, "Access denied", "identity.access_denied");
    public static IResult Validation(HttpContext context, IDictionary<string, string[]>? errors = null)
        => Create(context, 400, "Invalid input", "identity.validation_failed", errors);
    public static IResult EmailConflict(HttpContext context)
        => Create(context, 409, "Email already exists", "identity.email_already_exists");
    public static IResult Unexpected(HttpContext context)
        => Create(context, 500, "Unexpected error", "identity.internal_error");

    private static IResult Create(HttpContext context, int status, string title, string code,
        IDictionary<string, string[]>? errors = null)
        => Results.Json(new Problem($"urn:fatura-otica:problem:{code}", title, status,
            Activity.Current?.Id ?? context.TraceIdentifier, code, errors),
            statusCode: status, contentType: "application/problem+json");
}
