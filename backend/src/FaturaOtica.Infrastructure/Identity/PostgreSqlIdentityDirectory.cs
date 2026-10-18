using FaturaOtica.Domain.Identity;
using Microsoft.EntityFrameworkCore;

namespace FaturaOtica.Infrastructure.Identity;

public sealed record DirectoryProfile(Guid Id, string Name, string Email, UserStatus Status, Guid? BranchId);
public sealed record DirectoryGrant(Guid Id, Guid UserId, AccessRole Role, Guid? BranchId);
public sealed record DirectoryBranch(Guid Id, string Name);
public sealed record DirectoryUsers(IReadOnlyList<DirectoryProfile> Profiles, IReadOnlyList<DirectoryGrant> Grants);

public sealed class PostgreSqlIdentityDirectory(IdentityDbContext context)
{
    public async Task<DirectoryUsers?> UsersAsync(Guid actorId, CancellationToken cancellationToken = default)
    {
        await using var transaction = await IdentityTenantTransaction.BeginAsync(context, cancellationToken);
        var scope = await ScopeAsync(actorId, cancellationToken);
        if (scope is null) return null;
        var users = context.Users.AsNoTracking();
        if (!scope.All) users = users.Where(u => u.CreatedForBranchId != null && scope.Branches.Contains(u.CreatedForBranchId.Value));
        var profiles = await users.OrderBy(u => u.Name).ThenBy(u => u.Id)
            .Select(u => new DirectoryProfile(u.Id, u.Name, u.EmailNormalized, u.Status, u.CreatedForBranchId)).ToListAsync(cancellationToken);
        var ids = profiles.Select(p => p.Id).ToArray();
        // Branch managers may inspect only branch permissions inside their own
        // managed scope; employee provenance alone does not reveal other grants.
        var grants = scope.All
            ? await context.TenantRoles.AsNoTracking().Where(r => r.Active && ids.Contains(r.UserId))
                .Select(r => new DirectoryGrant(r.Id, r.UserId, r.Role, null)).ToListAsync(cancellationToken)
            : [];
        var scopedBranchGrants = context.BranchGrants.AsNoTracking().Where(g => g.Active && ids.Contains(g.UserId));
        if (!scope.All) scopedBranchGrants = scopedBranchGrants.Where(g => scope.Branches.Contains(g.BranchId));
        var branchGrants = await scopedBranchGrants
            .Join(context.Branches.Where(b => b.Active), g => g.BranchId, b => b.Id,
                (g, b) => new DirectoryGrant(g.Id, g.UserId, g.Role, g.BranchId)).ToListAsync(cancellationToken);
        grants.AddRange(branchGrants);
        await transaction.CommitAsync(cancellationToken);
        return new(profiles, grants);
    }

    public async Task<IReadOnlyList<DirectoryBranch>?> BranchesAsync(Guid actorId, CancellationToken cancellationToken = default)
    {
        await using var transaction = await IdentityTenantTransaction.BeginAsync(context, cancellationToken);
        var scope = await ScopeAsync(actorId, cancellationToken);
        if (scope is null) return null;
        var branches = context.Branches.AsNoTracking().Where(b => b.Active);
        if (!scope.All) branches = branches.Where(b => scope.Branches.Contains(b.Id));
        var result = await branches.OrderBy(b => b.Name).ThenBy(b => b.Id)
            .Select(b => new DirectoryBranch(b.Id, b.Name)).ToListAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return result;
    }

    private async Task<DirectoryScope?> ScopeAsync(Guid actorId, CancellationToken cancellationToken)
    {
        if (actorId == Guid.Empty || !await context.Users.AnyAsync(u => u.Id == actorId && u.Status == UserStatus.Active, cancellationToken)) return null;
        if (await context.TenantRoles.AnyAsync(r => r.UserId == actorId && r.Active &&
            (r.Role == AccessRole.Owner || r.Role == AccessRole.AccessAdministrator), cancellationToken)) return new(true, []);
        var branches = await context.BranchGrants.Where(g => g.UserId == actorId && g.Active && g.Role == AccessRole.BranchManager)
            .Join(context.Branches.Where(b => b.Active), g => g.BranchId, b => b.Id, (g, b) => b.Id)
            .Distinct().ToArrayAsync(cancellationToken);
        return branches.Length == 0 ? null : new(false, branches);
    }

    private sealed record DirectoryScope(bool All, Guid[] Branches);
}

