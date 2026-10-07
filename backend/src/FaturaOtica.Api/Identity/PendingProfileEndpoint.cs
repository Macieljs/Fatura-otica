using System.Text.Json;
using System.Text.Json.Serialization;
using FaturaOtica.Application.Identity;

namespace FaturaOtica.Api.Identity;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record CreateProfileRequest
{
    public required string Email { get; init; }
    public required string Name { get; init; }
    public required Guid BranchId { get; init; }
}

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record Profile([property: JsonRequired] Guid Id, [property: JsonRequired] string Name,
    [property: JsonRequired] string Email, [property: JsonRequired] string Status);

internal static class PendingProfileEndpoint
{
    private static readonly JsonSerializerOptions RequestJsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = false,
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow,
    };

    public static void MapPendingProfile(this WebApplication app)
    {
        app.MapPost("/api/v1/identity/users", HandleAsync)
            .WithName("identityCreatePendingProfile").WithTags("Identity")
            .RequireAuthorization()
            .Accepts<CreateProfileRequest>("application/json")
            .Produces<Profile>(StatusCodes.Status201Created)
            .Produces<Problem>(StatusCodes.Status400BadRequest, "application/problem+json")
            .Produces<Problem>(StatusCodes.Status401Unauthorized, "application/problem+json")
            .Produces<Problem>(StatusCodes.Status403Forbidden, "application/problem+json")
            .Produces<Problem>(StatusCodes.Status409Conflict, "application/problem+json")
            .Produces<Problem>(StatusCodes.Status500InternalServerError, "application/problem+json");
    }

    private static async Task<IResult> HandleAsync(HttpContext context, CreatePendingProfileHandler handler)
    {
        if (!IdentityJwtConfiguration.TryIdentifier(context.User, "sub", out var actor))
            return IdentityProblems.Unauthorized(context);
        CreateProfileRequest? request;
        try
        {
            request = await context.Request.ReadFromJsonAsync<CreateProfileRequest>(RequestJsonOptions,
                context.RequestAborted).ConfigureAwait(false);
        }
        catch (JsonException) { return IdentityProblems.Validation(context); }
        catch (BadHttpRequestException) { return IdentityProblems.Validation(context); }
        if (request is null)
            return IdentityProblems.Validation(context);

        var result = await handler.HandleAsync(new(request.Email, request.Name, request.BranchId),
            actor, context.RequestAborted).ConfigureAwait(false);
        return result.Outcome switch
        {
            PendingProfileOutcome.Created => Results.Json(new Profile(result.Profile!.Id, result.Profile.Name,
                result.Profile.Email, "pending"), statusCode: StatusCodes.Status201Created),
            PendingProfileOutcome.InvalidInput => IdentityProblems.Validation(context, result.Errors),
            PendingProfileOutcome.AccessDenied => IdentityProblems.AccessDenied(context),
            PendingProfileOutcome.EmailAlreadyExists => IdentityProblems.EmailConflict(context),
            _ => IdentityProblems.Unexpected(context),
        };
    }
}
