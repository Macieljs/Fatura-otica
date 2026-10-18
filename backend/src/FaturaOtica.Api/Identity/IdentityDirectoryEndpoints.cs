using System.Text.Json.Serialization;
using FaturaOtica.Domain.Identity;
using FaturaOtica.Infrastructure.Identity;

namespace FaturaOtica.Api.Identity;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record DirectoryProfileResponse([property: JsonRequired] Guid Id, [property: JsonRequired] string Name,
    [property: JsonRequired] string Email, [property: JsonRequired] string Status, [property: JsonRequired] Guid? BranchId);

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record UsersDirectory([property: JsonRequired] IReadOnlyList<DirectoryProfileResponse> Profiles,
    [property: JsonRequired] IReadOnlyDictionary<Guid, Grant[]> GrantsMap);

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record Branch([property: JsonRequired] Guid Id, [property: JsonRequired] string Name);

internal static class IdentityDirectoryEndpoints
{
    public static void MapIdentityDirectory(this WebApplication app)
    {
        Describe(app.MapGet("/api/v1/identity/users", UsersAsync)
            .WithName("identityListUsers").Produces<UsersDirectory>());
        Describe(app.MapGet("/api/v1/identity/branches", BranchesAsync)
            .WithName("identityListBranches").Produces<Branch[]>());
    }

    private static void Describe(RouteHandlerBuilder route)
    {
        route.RequireAuthorization().WithTags("Identity");
        route.AddEndpointFilter(async (context, next) =>
        {
            context.HttpContext.Response.Headers.CacheControl = "no-store";
            return await next(context);
        });
        foreach (var status in new[] { 401, 403, 500 }) route.Produces<Problem>(status, "application/problem+json");
    }

    private static async Task<IResult> UsersAsync(HttpContext http, PostgreSqlIdentityDirectory directory)
    {
        if (!IdentityJwtConfiguration.TryIdentifier(http.User, "sub", out var actor)) return IdentityProblems.Unauthorized(http);
        var users = await directory.UsersAsync(actor, http.RequestAborted);
        if (users is null) return IdentityProblems.AccessDenied(http);
        return Results.Json(new UsersDirectory(users.Profiles.Select(p => new DirectoryProfileResponse(p.Id, p.Name, p.Email,
            p.Status switch { UserStatus.Pending => "pending", UserStatus.Active => "active", _ => "blocked" }, p.BranchId)).ToArray(),
            users.Profiles.ToDictionary(p => p.Id, p => users.Grants.Where(g => g.UserId == p.Id)
                .Select(g => new Grant(g.Id, Role(g.Role), g.BranchId is null ? "tenant" : "branch", g.BranchId)).ToArray())));
    }

    private static async Task<IResult> BranchesAsync(HttpContext http, PostgreSqlIdentityDirectory directory)
    {
        if (!IdentityJwtConfiguration.TryIdentifier(http.User, "sub", out var actor)) return IdentityProblems.Unauthorized(http);
        var branches = await directory.BranchesAsync(actor, http.RequestAborted);
        return branches is null ? IdentityProblems.AccessDenied(http) : Results.Json(branches.Select(b => new Branch(b.Id, b.Name)).ToArray());
    }

    private static string Role(AccessRole role) => role switch
    {
        AccessRole.Owner => "owner", AccessRole.AccessAdministrator => "accessAdministrator",
        AccessRole.BranchManager => "branchManager", _ => "seller",
    };
}

