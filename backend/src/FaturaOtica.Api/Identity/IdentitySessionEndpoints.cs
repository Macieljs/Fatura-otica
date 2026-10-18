using System.Text.Json;
using System.Text.Json.Serialization;
using FaturaOtica.Infrastructure.Identity;

namespace FaturaOtica.Api.Identity;

[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record LoginRequest([property: JsonRequired] string Email, [property: JsonRequired] string Password);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record ActivationRequest([property: JsonRequired] string Token, [property: JsonRequired] string Password, [property: JsonRequired] string Name);
[JsonUnmappedMemberHandling(JsonUnmappedMemberHandling.Disallow)]
public sealed record BranchSelectionRequest([property: JsonRequired] Guid BranchId);
public sealed record Session(string AccessToken, int ExpiresIn, string TokenType, IdentityMeView Me);
public sealed record CsrfResponse(string CsrfToken);

internal static class IdentitySessionEndpoints
{
    private const string Prefix = "/api/v1/identity";
    private const string RefreshCookie = "fatura_refresh";
    private static readonly JsonSerializerOptions RequestOptions = new(JsonSerializerDefaults.Web)
        { PropertyNameCaseInsensitive = false, UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow };

    public static void MapIdentitySessions(this WebApplication app)
    {
        var group = app.MapGroup(Prefix).WithTags("Identity");
        group.AddEndpointFilter(async (context, next) =>
        {
            context.HttpContext.Response.Headers.CacheControl = "no-store";
            context.HttpContext.Response.Headers.Pragma = "no-cache";
            return await next(context).ConfigureAwait(false);
        });
        group.MapPost("/login", LoginAsync).WithName("identityLogin").RequireRateLimiting("identity-public").Produces<Session>();
        group.MapPost("/activation/complete", ActivateAsync).WithName("identityCompleteActivation").RequireRateLimiting("identity-public");
        group.MapGet("/me", MeAsync).WithName("identityGetMe").RequireAuthorization().Produces<IdentityMeView>();
        group.MapPut("/me/branch", SelectBranchAsync).WithName("identitySelectBranch").RequireAuthorization().Produces<IdentityMeView>();
        group.MapPost("/users/{userId:guid}/activation", IssueActivationAsync).WithName("identityIssueActivation").RequireAuthorization().Produces<IdentityActivationSecret>(202);
        group.MapGet("/csrf", CsrfAsync).WithName("identityGetCsrfToken").RequireRateLimiting("identity-session");
        group.MapPost("/refresh", RefreshAsync).WithName("identityRefresh").RequireRateLimiting("identity-session").Produces<Session>();
        group.MapPost("/logout", LogoutAsync).WithName("identityLogout").RequireRateLimiting("identity-session");
    }

    private static async Task<IResult> LoginAsync(HttpContext http, IdentitySessionService service, IConfiguration config, IHostEnvironment environment)
    {
        var request = await ReadAsync<LoginRequest>(http).ConfigureAwait(false);
        if (request is null) return IdentityProblems.Validation(http);
        var result = await service.LoginAsync(request.Email, request.Password, http.RequestAborted).ConfigureAwait(false);
        return result is null ? IdentityProblems.Unauthorized(http) : SessionResult(http, result, config, environment);
    }

    private static async Task<IResult> ActivateAsync(HttpContext http, IdentitySessionService service)
    {
        var request = await ReadAsync<ActivationRequest>(http).ConfigureAwait(false);
        if (request is null || request.Password is null || request.Password.Length is < 12 or > 128 ||
            string.IsNullOrWhiteSpace(request.Name) || request.Name.Length > 200) return IdentityProblems.Validation(http);
        return await service.ActivateAsync(request.Token, request.Password, request.Name, http.RequestAborted).ConfigureAwait(false)
            ? Results.NoContent() : IdentityProblems.InvalidToken(http);
    }

    private static async Task<IResult> IssueActivationAsync(Guid userId, HttpContext http, IdentitySessionService service)
    {
        if (!IdentityJwtConfiguration.TryIdentifier(http.User, "sub", out var actor)) return IdentityProblems.Unauthorized(http);
        var result = await service.IssueActivationAsync(actor, userId, http.RequestAborted).ConfigureAwait(false);
        return result is null ? IdentityProblems.AccessDenied(http) : Results.Json(result, statusCode: 202);
    }

    private static async Task<IResult> MeAsync(HttpContext http, IdentitySessionService service)
    {
        if (!Identifiers(http, out var user, out var sid)) return IdentityProblems.Unauthorized(http);
        var me = await service.MeAsync(user, sid, ct: http.RequestAborted).ConfigureAwait(false);
        return me is null ? IdentityProblems.Unauthorized(http) : Results.Ok(me);
    }

    private static async Task<IResult> SelectBranchAsync(HttpContext http, IdentitySessionService service)
    {
        if (!Identifiers(http, out var user, out var sid)) return IdentityProblems.Unauthorized(http);
        var request = await ReadAsync<BranchSelectionRequest>(http).ConfigureAwait(false);
        if (request is null || request.BranchId == Guid.Empty) return IdentityProblems.Validation(http);
        var me = await service.MeAsync(user, sid, request.BranchId, http.RequestAborted).ConfigureAwait(false);
        return me is null ? IdentityProblems.AccessDenied(http) : Results.Ok(me);
    }

    private static async Task<IResult> CsrfAsync(HttpContext http, IdentitySessionService service, IConfiguration config)
    {
        if (!AllowedOrigin(http, config)) return IdentityProblems.AccessDenied(http);
        var refresh = http.Request.Cookies[RefreshCookie];
        if (refresh is null) return IdentityProblems.Unauthorized(http);
        var token = await service.IssueCsrfAsync(refresh, http.RequestAborted).ConfigureAwait(false);
        return token is null ? IdentityProblems.Unauthorized(http) : Results.Ok(new CsrfResponse(token));
    }

    private static async Task<IResult> RefreshAsync(HttpContext http, IdentitySessionService service, IConfiguration config, IHostEnvironment environment)
    {
        if (!AllowedOrigin(http, config) || !CsrfHeader(http, out var csrf)) return IdentityProblems.AccessDenied(http);
        var refresh = http.Request.Cookies[RefreshCookie];
        if (refresh is null) return IdentityProblems.Unauthorized(http);
        var result = await service.RefreshAsync(refresh, csrf, http.RequestAborted).ConfigureAwait(false);
        return result is null ? IdentityProblems.Unauthorized(http) : SessionResult(http, result, config, environment);
    }

    private static async Task<IResult> LogoutAsync(HttpContext http, IdentitySessionService service, IConfiguration config, IHostEnvironment environment)
    {
        if (!AllowedOrigin(http, config) || !CsrfHeader(http, out var csrf)) return IdentityProblems.AccessDenied(http);
        var refresh = http.Request.Cookies[RefreshCookie];
        if (refresh is null || !await service.LogoutAsync(refresh, csrf, http.RequestAborted).ConfigureAwait(false)) return IdentityProblems.Unauthorized(http);
        http.Response.Cookies.Delete(RefreshCookie, CookieOptions(environment));
        return Results.NoContent();
    }

    private static IResult SessionResult(HttpContext http, IdentityLoginResult result, IConfiguration config, IHostEnvironment environment)
    {
        var cookie = CookieOptions(environment); cookie.Expires = result.ExpiresAt;
        http.Response.Cookies.Append(RefreshCookie, result.RefreshToken, cookie);
        return Results.Ok(new Session(IdentityJwtConfiguration.Read(config).Issue(result.UserId, result.SessionId), 900, "Bearer", result.Me));
    }

    private static CookieOptions CookieOptions(IHostEnvironment environment)
        => new() { HttpOnly = true, Secure = !environment.IsDevelopment(), SameSite = SameSiteMode.Lax, Path = Prefix, IsEssential = true };

    private static bool AllowedOrigin(HttpContext http, IConfiguration config)
        => http.Request.Headers.Origin.Count == 1 && config.GetSection("Identity:AllowedOrigins").GetChildren()
            .Any(origin => string.Equals(origin.Value, http.Request.Headers.Origin[0], StringComparison.Ordinal));

    private static bool CsrfHeader(HttpContext http, out string csrf)
    {
        csrf = http.Request.Headers["X-CSRF-Token"].ToString();
        return http.Request.Headers["X-CSRF-Token"].Count == 1 && csrf.Length == 43;
    }

    private static bool Identifiers(HttpContext http, out Guid user, out Guid sid)
    {
        sid = Guid.Empty;
        return IdentityJwtConfiguration.TryIdentifier(http.User, "sub", out user) && IdentityJwtConfiguration.TryIdentifier(http.User, "sid", out sid);
    }

    private static async Task<T?> ReadAsync<T>(HttpContext http) where T : class
    {
        try { return await http.Request.ReadFromJsonAsync<T>(RequestOptions, http.RequestAborted).ConfigureAwait(false); }
        catch (JsonException) { return null; }
        catch (BadHttpRequestException) { return null; }
    }
}
