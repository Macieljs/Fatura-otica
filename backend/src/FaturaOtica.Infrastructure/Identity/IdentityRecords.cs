using FaturaOtica.Domain.Identity;

namespace FaturaOtica.Infrastructure.Identity;

public abstract class IdentityRecord
{
    public Guid Id { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid? CreatedBy { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
}

public abstract class TenantIdentityRecord : IdentityRecord
{
    public Guid TenantId { get; set; }
}

public sealed class IdentityTenant : IdentityRecord
{
    public string Name { get; set; } = string.Empty;
}

public sealed class IdentityUser : TenantIdentityRecord
{
    public string Name { get; set; } = string.Empty;
    public string EmailNormalized { get; set; } = string.Empty;
    public UserStatus Status { get; set; }
    public string? PasswordHash { get; set; }
    public Guid? CreatedForBranchId { get; set; }
}

public sealed class IdentityBranch : TenantIdentityRecord
{
    public string Name { get; set; } = string.Empty;
    public bool Active { get; set; }
}

public sealed class IdentityTenantRole : TenantIdentityRecord
{
    public Guid UserId { get; set; }
    public AccessRole Role { get; set; }
    public bool Active { get; set; }
}

public sealed class IdentityBranchGrant : TenantIdentityRecord
{
    public Guid UserId { get; set; }
    public Guid BranchId { get; set; }
    public AccessRole Role { get; set; }
    public bool Active { get; set; }
}
