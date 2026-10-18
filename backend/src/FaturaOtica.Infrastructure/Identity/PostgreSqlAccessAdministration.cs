using FaturaOtica.Domain.Identity;
using Microsoft.EntityFrameworkCore;

namespace FaturaOtica.Infrastructure.Identity;

public enum AccessAdministrationOutcome { Success, InvalidInput, AccessDenied, Conflict }
public sealed record AccessAdministrationResult(AccessAdministrationOutcome Outcome,
    Guid? GrantId = null, AccessRole? Role = null, Guid? BranchId = null, IdentityUser? User = null);

public sealed class PostgreSqlAccessAdministration(IdentityDbContext context)
{
    public async Task<AccessAdministrationResult> GrantAsync(Guid actorId, Guid userId, AccessRole role,
        Guid? branchId, CancellationToken cancellationToken = default)
    {
        if (actorId == Guid.Empty || userId == Guid.Empty || !Enum.IsDefined(role) || branchId == Guid.Empty ||
            (IsTenantRole(role) ? branchId is not null : branchId is null)) return Invalid();
        await using var transaction = await BeginAsync(cancellationToken);
        var authority = await AuthorityAsync(actorId, cancellationToken);
        if (authority == 0 || (IsTenantRole(role) && authority != 2)) return Denied();
        if (!await context.Users.AnyAsync(u => u.Id == userId, cancellationToken)) return Denied();
        if (branchId is { } branch && !await context.Branches.AnyAsync(b => b.Id == branch && b.Active, cancellationToken)) return Denied();
        Guid grantId;
        if (IsTenantRole(role))
        {
            var existing = await context.TenantRoles.SingleOrDefaultAsync(r => r.UserId == userId && r.Role == role, cancellationToken);
            if (existing?.Active == true) return Conflict();
            if (existing is null)
            {
                existing = new IdentityTenantRole { Id = Guid.CreateVersion7(), TenantId = context.ConfiguredTenantId,
                    UserId = userId, Role = role, Active = true, CreatedAt = DateTimeOffset.UtcNow, CreatedBy = actorId };
                context.TenantRoles.Add(existing);
            }
            else { existing.Active = true; Touch(existing, actorId); }
            grantId = existing.Id;
        }
        else
        {
            var existing = await context.BranchGrants.SingleOrDefaultAsync(r => r.UserId == userId && r.Role == role && r.BranchId == branchId, cancellationToken);
            if (existing?.Active == true) return Conflict();
            if (existing is null)
            {
                existing = new IdentityBranchGrant { Id = Guid.CreateVersion7(), TenantId = context.ConfiguredTenantId,
                    UserId = userId, Role = role, BranchId = branchId!.Value, Active = true,
                    CreatedAt = DateTimeOffset.UtcNow, CreatedBy = actorId };
                context.BranchGrants.Add(existing);
            }
            else { existing.Active = true; Touch(existing, actorId); }
            grantId = existing.Id;
        }
        await SaveAsync(actorId, userId, IdentityAuditAction.GrantAccess, role, branchId, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new(AccessAdministrationOutcome.Success, grantId, role, branchId);
    }

    public async Task<AccessAdministrationResult> RevokeAsync(Guid actorId, Guid userId, Guid grantId,
        CancellationToken cancellationToken = default)
    {
        if (actorId == Guid.Empty || userId == Guid.Empty || grantId == Guid.Empty) return Invalid();
        await using var transaction = await BeginAsync(cancellationToken);
        var authority = await AuthorityAsync(actorId, cancellationToken);
        if (authority == 0 || !await context.Users.AnyAsync(u => u.Id == userId, cancellationToken)) return Denied();
        var tenantRole = await context.TenantRoles.SingleOrDefaultAsync(r => r.Id == grantId && r.UserId == userId, cancellationToken);
        var branchGrant = await context.BranchGrants.SingleOrDefaultAsync(r => r.Id == grantId && r.UserId == userId, cancellationToken);
        if (tenantRole is null && branchGrant is null) return Denied();
        if (tenantRole is not null && authority != 2) return Denied();
        if (tenantRole?.Active == false || branchGrant?.Active == false) return Conflict();
        if (branchGrant is not null && !await context.Branches.AnyAsync(b => b.Id == branchGrant.BranchId && b.Active, cancellationToken)) return Denied();
        if (tenantRole?.Role == AccessRole.Owner && await WouldRemoveLastOwnerAsync(userId, cancellationToken)) return Conflict();
        if (tenantRole is not null) { tenantRole.Active = false; Touch(tenantRole, actorId); }
        else { branchGrant!.Active = false; Touch(branchGrant, actorId); }
        await SaveAsync(actorId, userId, IdentityAuditAction.RevokeAccess, tenantRole?.Role ?? branchGrant!.Role,
            branchGrant?.BranchId, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new(AccessAdministrationOutcome.Success);
    }

    public async Task<AccessAdministrationResult> SetStatusAsync(Guid actorId, Guid userId, UserStatus status,
        CancellationToken cancellationToken = default)
    {
        if (actorId == Guid.Empty || userId == Guid.Empty || status is not (UserStatus.Active or UserStatus.Blocked)) return Invalid();
        await using var transaction = await BeginAsync(cancellationToken);
        var authority = await AuthorityAsync(actorId, cancellationToken);
        if (authority == 0) return Denied();
        var user = await context.Users.SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null) return Denied();
        if (authority != 2 && await context.TenantRoles.AnyAsync(r => r.UserId == userId && r.Active &&
            (r.Role == AccessRole.Owner || r.Role == AccessRole.AccessAdministrator), cancellationToken)) return Denied();
        if (user.Status == UserStatus.Pending || string.IsNullOrWhiteSpace(user.PasswordHash) || user.Status == status) return Conflict();
        if (status == UserStatus.Blocked && await WouldRemoveLastOwnerAsync(userId, cancellationToken)) return Conflict();
        user.Status = status;
        Touch(user, actorId);
        await SaveAsync(actorId, userId, status == UserStatus.Blocked ? IdentityAuditAction.BlockUser : IdentityAuditAction.UnblockUser,
            null, null, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new(AccessAdministrationOutcome.Success, User: user);
    }

    private async Task<IdentityTenantTransaction> BeginAsync(CancellationToken cancellationToken)
    {
        var transaction = await IdentityTenantTransaction.BeginAsync(context, cancellationToken);
        try
        {
            await context.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT pg_advisory_xact_lock(hashtextextended({context.ConfiguredTenantId.ToString()}, 0))", cancellationToken);
            return transaction;
        }
        catch { await transaction.DisposeAsync(); throw; }
    }

    private async Task<int> AuthorityAsync(Guid actorId, CancellationToken cancellationToken)
    {
        if (!await context.Users.AnyAsync(u => u.Id == actorId && u.Status == UserStatus.Active, cancellationToken)) return 0;
        var roles = await context.TenantRoles.Where(r => r.UserId == actorId && r.Active).Select(r => r.Role).ToListAsync(cancellationToken);
        return roles.Contains(AccessRole.Owner) ? 2 : roles.Contains(AccessRole.AccessAdministrator) ? 1 : 0;
    }

    private async Task<bool> WouldRemoveLastOwnerAsync(Guid userId, CancellationToken cancellationToken)
    {
        var owners = context.TenantRoles.Where(r => r.Active && r.Role == AccessRole.Owner)
            .Join(context.Users.Where(u => u.Status == UserStatus.Active), r => r.UserId, u => u.Id, (r, u) => u.Id);
        return await owners.AnyAsync(id => id == userId, cancellationToken) &&
            !await owners.AnyAsync(id => id != userId, cancellationToken);
    }

    private async Task SaveAsync(Guid actorId, Guid userId, IdentityAuditAction action, AccessRole? role,
        Guid? branchId, CancellationToken cancellationToken)
    {
        await context.SaveChangesAsync(cancellationToken);
        await new PostgreSqlIdentityAuditWriter(context).AppendAsync(IdentityAuditEvent.Create(context.ConfiguredTenantId,
            actorId, userId, action, DateTimeOffset.UtcNow, role, branchId), cancellationToken);
    }

    private static bool IsTenantRole(AccessRole role) => role is AccessRole.Owner or AccessRole.AccessAdministrator;
    private static void Touch(IdentityRecord record, Guid actorId) { record.UpdatedAt = DateTimeOffset.UtcNow; record.UpdatedBy = actorId; }
    private static AccessAdministrationResult Denied() => new(AccessAdministrationOutcome.AccessDenied);
    private static AccessAdministrationResult Conflict() => new(AccessAdministrationOutcome.Conflict);
    private static AccessAdministrationResult Invalid() => new(AccessAdministrationOutcome.InvalidInput);
}
