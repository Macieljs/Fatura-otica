using System.Text.Json;
using System.Text.Json.Serialization;
using FaturaOtica.Domain.Identity;
using FaturaOtica.Infrastructure.Identity;

namespace FaturaOtica.Api.Identity;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record GrantRequest
{
    public required string Role { get; init; }
    public required string Scope { get; init; }
    public Guid? BranchId { get; init; }
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record UserStateRequest { public required string Status { get; init; } }

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record Grant([property: JsonRequired] Guid Id, [property: JsonRequired] string Role,
    [property: JsonRequired] string Scope,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] Guid? BranchId);

internal static class AccessAdministrationEndpoints
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    { PropertyNameCaseInsensitive = false, UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow };

    public static void MapAccessAdministration(this WebApplication app)
    {
        Describe(app.MapPost("/api/v1/identity/users/{userId}/grants", GrantAsync)
            .WithName("identityGrantAccess").Accepts<GrantRequest>("application/json").Produces<Grant>(201));
        Describe(app.MapDelete("/api/v1/identity/users/{userId}/grants/{grantId}", RevokeAsync)
            .WithName("identityRevokeAccess").Produces(204));
        Describe(app.MapPut("/api/v1/identity/users/{userId}/status", StatusAsync)
            .WithName("identitySetUserStatus").Accepts<UserStateRequest>("application/json").Produces<Profile>(200));
    }

    private static void Describe(RouteHandlerBuilder route)
    {
        route.RequireAuthorization().WithTags("Identity");
        foreach (var status in new[] { 400, 401, 403, 409, 500 }) route.Produces<Problem>(status, "application/problem+json");
    }

    private static async Task<IResult> GrantAsync(HttpContext http, string userId, PostgreSqlAccessAdministration service)
    {
        if (!IdentityJwtConfiguration.TryIdentifier(http.User, "sub", out var actor)) return IdentityProblems.Unauthorized(http);
        var request = await ReadAsync<GrantRequest>(http);
        if (!Guid.TryParse(userId, out var user) || user == Guid.Empty || request is null) return IdentityProblems.Validation(http);
        var role = request.Role switch { "owner" => AccessRole.Owner, "accessAdministrator" => AccessRole.AccessAdministrator,
            "seller" => AccessRole.Seller, "branchManager" => AccessRole.BranchManager, _ => (AccessRole?)null };
        if (role is null || (request.Scope == "tenant" ? role is not (AccessRole.Owner or AccessRole.AccessAdministrator) || request.BranchId is not null
            : request.Scope != "branch" || role is not (AccessRole.Seller or AccessRole.BranchManager) || request.BranchId is null))
            return IdentityProblems.Validation(http);
        var result = await service.GrantAsync(actor, user, role.Value, request.BranchId, http.RequestAborted);
        return result.Outcome == AccessAdministrationOutcome.Success
            ? Results.Json(new Grant(result.GrantId!.Value, request.Role, request.Scope, result.BranchId), statusCode: 201)
            : Failure(http, result);
    }

    private static async Task<IResult> RevokeAsync(HttpContext http, string userId, string grantId, PostgreSqlAccessAdministration service)
    {
        if (!IdentityJwtConfiguration.TryIdentifier(http.User, "sub", out var actor)) return IdentityProblems.Unauthorized(http);
        if (!Guid.TryParse(userId, out var user) || !Guid.TryParse(grantId, out var grant)) return IdentityProblems.Validation(http);
        var result = await service.RevokeAsync(actor, user, grant, http.RequestAborted);
        return result.Outcome == AccessAdministrationOutcome.Success ? Results.NoContent() : Failure(http, result);
    }

    private static async Task<IResult> StatusAsync(HttpContext http, string userId, PostgreSqlAccessAdministration service)
    {
        if (!IdentityJwtConfiguration.TryIdentifier(http.User, "sub", out var actor)) return IdentityProblems.Unauthorized(http);
        var request = await ReadAsync<UserStateRequest>(http);
        if (!Guid.TryParse(userId, out var user) || request?.Status is not ("active" or "blocked")) return IdentityProblems.Validation(http);
        var result = await service.SetStatusAsync(actor, user, request.Status == "active" ? UserStatus.Active : UserStatus.Blocked, http.RequestAborted);
        return result.Outcome == AccessAdministrationOutcome.Success
            ? Results.Json(new Profile(result.User!.Id, result.User.Name, result.User.EmailNormalized, request.Status)) : Failure(http, result);
    }

    private static async Task<T?> ReadAsync<T>(HttpContext http)
    {
        try { return await http.Request.ReadFromJsonAsync<T>(Json, http.RequestAborted); }
        catch (JsonException) { return default; }
        catch (BadHttpRequestException) { return default; }
    }

    private static IResult Failure(HttpContext http, AccessAdministrationResult result) => result.Outcome switch
    {
        AccessAdministrationOutcome.InvalidInput => IdentityProblems.Validation(http),
        AccessAdministrationOutcome.AccessDenied => IdentityProblems.AccessDenied(http),
        AccessAdministrationOutcome.Conflict => Results.Json(new Problem("urn:fatura-otica:problem:identity.state_conflict",
            "State conflict", 409, http.TraceIdentifier, "identity.state_conflict"), statusCode: 409, contentType: "application/problem+json"),
        _ => IdentityProblems.Unexpected(http),
    };
}
