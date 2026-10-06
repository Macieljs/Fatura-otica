namespace FaturaOtica.Domain.Identity;

public enum UserStatus { Pending, Active, Blocked }
public enum AccessRole { Seller, BranchManager, Owner, AccessAdministrator }
public enum AccessAction { ReadOwnProfile, OperateBranch, CreatePendingProfile, ManageAccess }
public enum AccessDenialReason { None, InvalidContext, TenantMismatch, InactiveUser, PermissionDenied, BranchRequired, BranchNotGranted }
public sealed record BranchScope(Guid TenantId, Guid BranchId);
public sealed record BranchGrant(Guid TenantId, Guid BranchId, AccessRole Role);
public sealed record UserAccessSnapshot(Guid UserId, Guid TenantId, UserStatus Status,
    IReadOnlyCollection<AccessRole> TenantRoles, IReadOnlyCollection<BranchGrant> BranchGrants);
public sealed record AccessDecision(bool Allowed, AccessDenialReason Reason);

public static class AccessPolicy
{
    public static AccessDecision Evaluate(UserAccessSnapshot user, Guid configuredTenantId,
        AccessAction permission, BranchScope? targetBranch = null)
    {
        if (user is null || configuredTenantId == Guid.Empty || user.UserId == Guid.Empty ||
            user.TenantId == Guid.Empty || !Enum.IsDefined(user.Status) || !Enum.IsDefined(permission) ||
            user.TenantRoles is null || user.BranchGrants is null ||
            targetBranch is { } scope && (scope.TenantId == Guid.Empty || scope.BranchId == Guid.Empty))
            return Deny(AccessDenialReason.InvalidContext);

        if (user.TenantId != configuredTenantId ||
            targetBranch is { } branch && branch.TenantId != configuredTenantId)
            return Deny(AccessDenialReason.TenantMismatch);

        if (user.TenantRoles.Any(role => role is not (AccessRole.Owner or AccessRole.AccessAdministrator)) ||
            user.BranchGrants.Any(grant => grant is null || grant.TenantId != configuredTenantId ||
                grant.BranchId == Guid.Empty || grant.Role is not (AccessRole.Seller or AccessRole.BranchManager)))
            return Deny(AccessDenialReason.InvalidContext);

        if (user.Status != UserStatus.Active)
            return Deny(AccessDenialReason.InactiveUser);

        if (permission == AccessAction.ReadOwnProfile)
            return Allow();

        var owner = user.TenantRoles.Contains(AccessRole.Owner);
        if (permission == AccessAction.ManageAccess)
            return owner || user.TenantRoles.Contains(AccessRole.AccessAdministrator)
                ? Allow() : Deny(AccessDenialReason.PermissionDenied);

        if (targetBranch is null)
            return Deny(AccessDenialReason.BranchRequired);

        if (owner)
            return Allow();

        var matchingGrants = user.BranchGrants.Where(grant => grant.BranchId == targetBranch.BranchId);
        if (permission == AccessAction.OperateBranch)
            return matchingGrants.Any() ? Allow() : Deny(AccessDenialReason.BranchNotGranted);

        return matchingGrants.Any(grant => grant.Role == AccessRole.BranchManager)
            ? Allow() : Deny(AccessDenialReason.PermissionDenied);
    }

    private static AccessDecision Allow() => new(true, AccessDenialReason.None);
    private static AccessDecision Deny(AccessDenialReason reason) => new(false, reason);
}
