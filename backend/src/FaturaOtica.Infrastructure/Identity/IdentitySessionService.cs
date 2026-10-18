using FaturaOtica.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text.Json.Serialization;

namespace FaturaOtica.Infrastructure.Identity;

public sealed record IdentityActivationSecret(string Token, DateTimeOffset ExpiresAt);
public sealed record IdentityBranchView(Guid Id, string Name);
public sealed record IdentityGrantView(Guid Id, string Role, string Scope,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] Guid? BranchId);
public sealed record IdentityProfileView(Guid Id, string Name, string Email, string Status);
public sealed record IdentityMeView(IdentityProfileView Profile, IReadOnlyList<IdentityBranchView> Branches,
    IReadOnlyList<string> TenantRoles, IReadOnlyList<IdentityGrantView> Grants, Guid? ActiveBranchId);
public sealed record IdentityLoginResult(Guid SessionId, Guid UserId, string RefreshToken, DateTimeOffset ExpiresAt, IdentityMeView Me);
public sealed class IdentitySessionService(IdentityDbContext context, IdentityCredentialHasher hasher)
{
    public async Task<IdentityActivationSecret?> IssueActivationAsync(Guid actor, Guid target, CancellationToken ct = default)
    {
        await using var tx = await BeginAsync(ct).ConfigureAwait(false);
        var actorUser = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.Id == actor, ct).ConfigureAwait(false);
        if (actorUser?.Status != UserStatus.Active) return null;
        var roles = await RolesAsync(actor, ct).ConfigureAwait(false);
        if (!roles.Contains(AccessRole.Owner) && !roles.Contains(AccessRole.AccessAdministrator)) return null;
        var targetUser = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.Id == target, ct).ConfigureAwait(false);
        if (targetUser is null || targetUser.Status == UserStatus.Blocked || !await HasAccessAsync(target, ct).ConfigureAwait(false)) return null;
        if (!roles.Contains(AccessRole.Owner) && (await RolesAsync(target, ct).ConfigureAwait(false)).Length != 0) return null;
        var result = await IssueAsync(target, actor, false, ct).ConfigureAwait(false);
        await tx.CommitAsync(ct).ConfigureAwait(false);
        return result;
    }

    public async Task<IdentityActivationSecret?> IssueInitialOwnerActivationAsync(Guid target, CancellationToken ct = default)
    {
        var privileged = await context.Database.SqlQuery<bool>($"""
            SELECT (r.rolsuper OR r.rolbypassrls OR r.rolcreaterole OR r.rolcreatedb
              OR has_schema_privilege(current_user, 'identity', 'CREATE')
              OR EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                WHERE n.nspname='identity' AND pg_has_role(current_user, c.relowner, 'MEMBER'))) AS "Value"
            FROM pg_roles r WHERE r.rolname=current_user
            """).SingleAsync(ct).ConfigureAwait(false);
        if (privileged) throw new InvalidOperationException("Initial activation requires a dedicated DML role without ownership or RLS bypass.");
        await using var tx = await BeginAsync(ct).ConfigureAwait(false);
        if (!await context.Users.AnyAsync(u => u.Id == target && u.Status == UserStatus.Pending, ct).ConfigureAwait(false) ||
            !await context.TenantRoles.AnyAsync(r => r.UserId == target && r.Active && r.Role == AccessRole.Owner, ct).ConfigureAwait(false) ||
            !await context.AuditEvents.AnyAsync(a => a.TargetUserId == target && a.Action == IdentityAuditAction.BootstrapOwner, ct).ConfigureAwait(false)) return null;
        var result = await IssueAsync(target, null, true, ct).ConfigureAwait(false);
        await tx.CommitAsync(ct).ConfigureAwait(false);
        return result;
    }

    private async Task<IdentityActivationSecret> IssueAsync(Guid target, Guid? actor, bool initial, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        await context.Set<IdentityActivationToken>().Where(t => t.UserId == target && t.UsedAt == null && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now), ct).ConfigureAwait(false);
        var secret = IdentitySecrets.Generate();
        var expires = now.AddHours(24);
        context.Set<IdentityActivationToken>().Add(new() { Id = Guid.CreateVersion7(), TenantId = context.ConfiguredTenantId,
            UserId = target, TokenHash = IdentitySecrets.Hash(secret), CreatedAt = now, CreatedBy = actor, ExpiresAt = expires });
        await context.SaveChangesAsync(ct).ConfigureAwait(false);
        await new PostgreSqlIdentityAuditWriter(context).AppendAsync(IdentityAuditEvent.Create(context.ConfiguredTenantId,
            actor, target, initial ? IdentityAuditAction.BootstrapOwnerActivation : IdentityAuditAction.IssueActivation, now,
            initial ? AccessRole.Owner : null), ct).ConfigureAwait(false);
        return new(secret, expires);
    }

    public async Task<bool> ActivateAsync(string token, string password, string name, CancellationToken ct = default)
    {
        if (!ValidSecret(token) || password is null || password.Length is < 12 or > 128 || string.IsNullOrWhiteSpace(name) || name.Length > 200) return false;
        await using var tx = await BeginAsync(ct).ConfigureAwait(false);
        var hash = IdentitySecrets.Hash(token);
        var stored = await context.Set<IdentityActivationToken>().SingleOrDefaultAsync(t => t.TokenHash == hash, ct).ConfigureAwait(false);
        var now = DateTimeOffset.UtcNow;
        if (stored is null || stored.UsedAt is not null || stored.RevokedAt is not null || stored.ExpiresAt <= now) return false;
        var user = await context.Users.SingleOrDefaultAsync(u => u.Id == stored.UserId, ct).ConfigureAwait(false);
        if (user is null || user.Status == UserStatus.Blocked || !await HasAccessAsync(user.Id, ct).ConfigureAwait(false)) return false;
        user.PasswordHash = await hasher.HashAsync(password).ConfigureAwait(false);
        user.Name = name.Trim(); user.Status = UserStatus.Active; user.UpdatedAt = now; user.UpdatedBy = user.Id;
        stored.UsedAt = now;
        await context.Set<IdentitySessionToken>().Where(s => s.UserId == user.Id && s.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now), ct).ConfigureAwait(false);
        await context.SaveChangesAsync(ct).ConfigureAwait(false);
        await new PostgreSqlIdentityAuditWriter(context).AppendAsync(IdentityAuditEvent.Create(context.ConfiguredTenantId,
            user.Id, user.Id, IdentityAuditAction.ActivateUser, now), ct).ConfigureAwait(false);
        await tx.CommitAsync(ct).ConfigureAwait(false);
        return true;
    }

    public async Task<IdentityLoginResult?> LoginAsync(string email, string password, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email) || email.Length > 320 || password is null || password.Length is < 12 or > 128) return null;
        await using var tx = await BeginAsync(ct).ConfigureAwait(false);
        var normalized = await context.Database.SqlQuery<string>($"SELECT lower(btrim({email})) AS \"Value\"").SingleAsync(ct).ConfigureAwait(false);
        var user = await context.Users.AsNoTracking().SingleOrDefaultAsync(u => u.EmailNormalized == normalized, ct).ConfigureAwait(false);
        // Equal-cost verification for unknown/pending/blocked users avoids the easy account-existence timing signal.
        var valid = await hasher.VerifyAsync(password, user?.PasswordHash ?? DummyHash).ConfigureAwait(false);
        if (user?.Status != UserStatus.Active || !valid || !await HasAccessAsync(user.Id, ct).ConfigureAwait(false)) return null;
        var secret = IdentitySecrets.Generate();
        var now = DateTimeOffset.UtcNow;
        var row = NewSession(user.Id, Guid.CreateVersion7(), secret, now.AddDays(7));
        var me = await ReadMeAsync(user, null, null, ct).ConfigureAwait(false);
        row.ActiveBranchId = me.ActiveBranchId;
        context.Set<IdentitySessionToken>().Add(row);
        await context.SaveChangesAsync(ct).ConfigureAwait(false);
        await tx.CommitAsync(ct).ConfigureAwait(false);
        return new(row.FamilyId, user.Id, secret, row.ExpiresAt, me);
    }

    // A syntactically valid fixed profile only; never an accepted fallback credential.
    private const string DummyHash = "$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

    public async Task<IdentityMeView?> MeAsync(Guid user, Guid sid, Guid? selectBranch = null, CancellationToken ct = default)
    {
        await using var tx = await BeginAsync(ct).ConfigureAwait(false);
        var session = await CurrentAsync(user, sid, ct).ConfigureAwait(false);
        if (session is null) return null;
        var account = await context.Users.AsNoTracking().SingleAsync(u => u.Id == user, ct).ConfigureAwait(false);
        var me = await ReadMeAsync(account, session.ActiveBranchId, selectBranch, ct).ConfigureAwait(false);
        if (selectBranch is not null && me.ActiveBranchId != selectBranch) return null;
        session.ActiveBranchId = me.ActiveBranchId;
        await context.SaveChangesAsync(ct).ConfigureAwait(false);
        await tx.CommitAsync(ct).ConfigureAwait(false);
        return me;
    }

    public async Task<bool> ValidateSessionAsync(Guid user, Guid sid, CancellationToken ct = default)
    {
        await using var tx = await BeginAsync(ct).ConfigureAwait(false);
        return await CurrentAsync(user, sid, ct).ConfigureAwait(false) is not null;
    }

    // Authentication establishes a live session. Each authorized handler still evaluates
    // the current user/grants, retaining its own 403 semantics for removed permissions.
    public async Task<bool> ValidateBearerSessionAsync(Guid user, Guid sid, CancellationToken ct = default)
    {
        await using var tx = await BeginAsync(ct).ConfigureAwait(false);
        var now = DateTimeOffset.UtcNow;
        return user != Guid.Empty && sid != Guid.Empty && await context.Set<IdentitySessionToken>().AnyAsync(
            s => s.UserId == user && s.FamilyId == sid && s.ConsumedAt == null && s.RevokedAt == null && s.ExpiresAt > now, ct).ConfigureAwait(false);
    }

    private async Task<IdentitySessionToken?> CurrentAsync(Guid user, Guid sid, CancellationToken ct)
    {
        if (user == Guid.Empty || sid == Guid.Empty ||
            !await context.Users.AnyAsync(u => u.Id == user && u.Status == UserStatus.Active, ct).ConfigureAwait(false) ||
            !await HasAccessAsync(user, ct).ConfigureAwait(false)) return null;
        var now = DateTimeOffset.UtcNow;
        return await context.Set<IdentitySessionToken>().SingleOrDefaultAsync(s => s.UserId == user && s.FamilyId == sid &&
            s.ConsumedAt == null && s.RevokedAt == null && s.ExpiresAt > now, ct).ConfigureAwait(false);
    }

    public async Task<string?> IssueCsrfAsync(string refresh, CancellationToken ct = default)
    {
        if (!ValidSecret(refresh)) return null;
        await using var tx = await BeginAsync(ct).ConfigureAwait(false);
        var session = await FindRefreshAsync(refresh, ct).ConfigureAwait(false);
        if (session is null || session.ConsumedAt is not null || session.RevokedAt is not null || session.ExpiresAt <= DateTimeOffset.UtcNow ||
            await CurrentAsync(session.UserId, session.FamilyId, ct).ConfigureAwait(false) is null) return null;
        var csrf = IdentitySecrets.Generate(); session.CsrfHash = IdentitySecrets.Hash(csrf);
        await context.SaveChangesAsync(ct).ConfigureAwait(false);
        await tx.CommitAsync(ct).ConfigureAwait(false);
        return csrf;
    }

    public async Task<IdentityLoginResult?> RefreshAsync(string refresh, string csrf, CancellationToken ct = default)
    {
        if (!ValidSecret(refresh) || !ValidSecret(csrf)) return null;
        await using var tx = await BeginAsync(ct).ConfigureAwait(false);
        var old = await FindRefreshAsync(refresh, ct).ConfigureAwait(false);
        if (old is null || !MatchesCsrf(old, csrf)) return null;
        if (old.ConsumedAt is not null)
        {
            await RevokeFamilyAsync(old.FamilyId, ct).ConfigureAwait(false);
            await tx.CommitAsync(ct).ConfigureAwait(false);
            return null;
        }
        if (old.RevokedAt is not null || old.ExpiresAt <= DateTimeOffset.UtcNow ||
            await CurrentAsync(old.UserId, old.FamilyId, ct).ConfigureAwait(false) is null) return null;
        old.ConsumedAt = DateTimeOffset.UtcNow;
        var secret = IdentitySecrets.Generate();
        var next = NewSession(old.UserId, old.FamilyId, secret, old.ExpiresAt);
        var user = await context.Users.AsNoTracking().SingleAsync(u => u.Id == old.UserId, ct).ConfigureAwait(false);
        var me = await ReadMeAsync(user, old.ActiveBranchId, null, ct).ConfigureAwait(false);
        next.ActiveBranchId = me.ActiveBranchId;
        context.Set<IdentitySessionToken>().Add(next);
        await context.SaveChangesAsync(ct).ConfigureAwait(false);
        await tx.CommitAsync(ct).ConfigureAwait(false);
        return new(next.FamilyId, next.UserId, secret, next.ExpiresAt, me);
    }

    public async Task<bool> LogoutAsync(string refresh, string csrf, CancellationToken ct = default)
    {
        if (!ValidSecret(refresh) || !ValidSecret(csrf)) return false;
        await using var tx = await BeginAsync(ct).ConfigureAwait(false);
        var session = await FindRefreshAsync(refresh, ct).ConfigureAwait(false);
        if (session is null || !MatchesCsrf(session, csrf) || session.RevokedAt is not null || session.ExpiresAt <= DateTimeOffset.UtcNow) return false;
        await RevokeFamilyAsync(session.FamilyId, ct).ConfigureAwait(false);
        await tx.CommitAsync(ct).ConfigureAwait(false);
        return true;
    }

    private Task<IdentitySessionToken?> FindRefreshAsync(string refresh, CancellationToken ct)
    {
        var hash = IdentitySecrets.Hash(refresh);
        return context.Set<IdentitySessionToken>().SingleOrDefaultAsync(s => s.TokenHash == hash, ct);
    }

    private Task<int> RevokeFamilyAsync(Guid sid, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        return context.Set<IdentitySessionToken>().Where(s => s.FamilyId == sid && s.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now), ct);
    }

    private static bool MatchesCsrf(IdentitySessionToken session, string csrf)
        => session.CsrfHash is { Length: 64 } stored && CryptographicOperations.FixedTimeEquals(
            System.Text.Encoding.ASCII.GetBytes(stored), System.Text.Encoding.ASCII.GetBytes(IdentitySecrets.Hash(csrf)));

    private static bool ValidSecret(string? token)
        => token is { Length: 43 } && token.All(c => char.IsAsciiLetterOrDigit(c) || c is '-' or '_');

    private IdentitySessionToken NewSession(Guid user, Guid family, string secret, DateTimeOffset expires)
        => new() { Id = Guid.CreateVersion7(), TenantId = context.ConfiguredTenantId, UserId = user, FamilyId = family,
            TokenHash = IdentitySecrets.Hash(secret), ExpiresAt = new DateTimeOffset(expires.Ticks - expires.Ticks % 10, TimeSpan.Zero), CreatedAt = DateTimeOffset.UtcNow };

    private async Task<IdentityTenantTransaction> BeginAsync(CancellationToken ct)
    {
        var tx = await IdentityTenantTransaction.BeginAsync(context, ct).ConfigureAwait(false);
        try
        {
            await context.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({context.ConfiguredTenantId.ToString()}, 0))", ct).ConfigureAwait(false);
            return tx;
        }
        catch { await tx.DisposeAsync().ConfigureAwait(false); throw; }
    }

    private Task<AccessRole[]> RolesAsync(Guid user, CancellationToken ct)
        => context.TenantRoles.AsNoTracking().Where(r => r.UserId == user && r.Active).Select(r => r.Role).ToArrayAsync(ct);

    private async Task<bool> HasAccessAsync(Guid user, CancellationToken ct)
        => await context.TenantRoles.AnyAsync(r => r.UserId == user && r.Active, ct).ConfigureAwait(false) ||
           await context.BranchGrants.AnyAsync(g => g.UserId == user && g.Active && context.Branches.Any(b => b.Id == g.BranchId && b.Active), ct).ConfigureAwait(false);

    private async Task<IdentityMeView> ReadMeAsync(IdentityUser user, Guid? current, Guid? requested, CancellationToken ct)
    {
        var roles = await context.TenantRoles.AsNoTracking().Where(r => r.UserId == user.Id && r.Active).ToListAsync(ct).ConfigureAwait(false);
        var grants = await context.BranchGrants.AsNoTracking().Where(g => g.UserId == user.Id && g.Active &&
            context.Branches.Any(b => b.Id == g.BranchId && b.Active)).ToListAsync(ct).ConfigureAwait(false);
        var owner = roles.Any(r => r.Role == AccessRole.Owner);
        var ids = grants.Select(g => g.BranchId).ToArray();
        var branches = await context.Branches.AsNoTracking().Where(b => b.Active && (owner || ids.Contains(b.Id)))
            .OrderBy(b => b.Name).Select(b => new IdentityBranchView(b.Id, b.Name)).ToListAsync(ct).ConfigureAwait(false);
        var selected = requested ?? current;
        if (!branches.Any(b => b.Id == selected)) selected = branches.Count == 1 ? branches[0].Id : null;
        return new(new(user.Id, user.Name, user.EmailNormalized, user.Status.ToString().ToLowerInvariant()), branches,
            roles.Select(r => RoleName(r.Role)).ToArray(),
            roles.Select(r => new IdentityGrantView(r.Id, RoleName(r.Role), "tenant", null))
                .Concat(grants.Select(g => new IdentityGrantView(g.Id, RoleName(g.Role), "branch", g.BranchId))).ToArray(), selected);
    }

    private static string RoleName(AccessRole role) => role switch
    { AccessRole.AccessAdministrator => "accessAdministrator", AccessRole.BranchManager => "branchManager", AccessRole.Owner => "owner", _ => "seller" };
}
