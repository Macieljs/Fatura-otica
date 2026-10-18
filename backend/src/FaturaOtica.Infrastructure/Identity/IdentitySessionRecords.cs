namespace FaturaOtica.Infrastructure.Identity;

public sealed class IdentityActivationToken : TenantIdentityRecord
{
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? UsedAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
}

// Every refresh generation is retained. The stable FamilyId is also the JWT sid.
public sealed class IdentitySessionToken : TenantIdentityRecord
{
    public Guid UserId { get; set; }
    public Guid FamilyId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public string? CsrfHash { get; set; }
    public Guid? ActiveBranchId { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ConsumedAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
}
