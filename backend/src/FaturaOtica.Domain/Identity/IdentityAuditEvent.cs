namespace FaturaOtica.Domain.Identity;

public enum IdentityAuditAction { GrantAccess = 1, RevokeAccess = 2, BlockUser = 3, BootstrapOwner = 4, UnblockUser = 5, IssueActivation = 6, ActivateUser = 7, BootstrapOwnerActivation = 8 }

public sealed class IdentityAuditEvent
{
    public IdentityAuditEvent(Guid id, Guid tenantId, Guid? actorUserId, Guid targetUserId,
        IdentityAuditAction action, DateTimeOffset occurredAt, AccessRole? role = null, Guid? branchId = null)
    {
        if (id == Guid.Empty || tenantId == Guid.Empty || actorUserId == Guid.Empty ||
            targetUserId == Guid.Empty || branchId == Guid.Empty)
            throw new ArgumentException("Audit identifiers must not be empty.");
        if (!Enum.IsDefined(action))
            throw new ArgumentOutOfRangeException(nameof(action));
        if (role is { } suppliedRole && !Enum.IsDefined(suppliedRole))
            throw new ArgumentOutOfRangeException(nameof(role));
        if (occurredAt.Offset != TimeSpan.Zero)
            throw new ArgumentException("Audit time must be UTC.", nameof(occurredAt));
        var bootstrap = action is IdentityAuditAction.BootstrapOwner or IdentityAuditAction.BootstrapOwnerActivation;
        if (bootstrap ? actorUserId is not null : actorUserId is null)
            throw new ArgumentException("Only system bootstrap has no user actor.", nameof(actorUserId));
        var validScope = bootstrap
            ? role == AccessRole.Owner && branchId is null
            : action is IdentityAuditAction.BlockUser or IdentityAuditAction.UnblockUser or IdentityAuditAction.IssueActivation or IdentityAuditAction.ActivateUser
            ? role is null && branchId is null
            : role switch
            {
                AccessRole.Owner or AccessRole.AccessAdministrator => branchId is null,
                AccessRole.Seller or AccessRole.BranchManager => branchId is not null,
                _ => false,
            };
        if (!validScope)
            throw new ArgumentException("The audit action, role and branch scope are incompatible.");
        Id = id;
        TenantId = tenantId;
        ActorUserId = actorUserId;
        TargetUserId = targetUserId;
        Action = action;
        OccurredAt = occurredAt;
        Role = role;
        BranchId = branchId;
    }

    public Guid Id { get; }
    public Guid TenantId { get; }
    public Guid? ActorUserId { get; }
    public Guid TargetUserId { get; }
    public IdentityAuditAction Action { get; }
    public DateTimeOffset OccurredAt { get; }
    public AccessRole? Role { get; }
    public Guid? BranchId { get; }

    public static IdentityAuditEvent CreateBootstrapOwner(Guid tenantId, Guid targetUserId,
        DateTimeOffset occurredAt)
        => new(Guid.CreateVersion7(), tenantId, null, targetUserId,
            IdentityAuditAction.BootstrapOwner, occurredAt, AccessRole.Owner);

    public static IdentityAuditEvent Create(Guid tenantId, Guid? actorUserId, Guid targetUserId,
        IdentityAuditAction action, DateTimeOffset occurredAt, AccessRole? role = null, Guid? branchId = null)
        => new(Guid.CreateVersion7(), tenantId, actorUserId, targetUserId, action, occurredAt, role, branchId);
}
