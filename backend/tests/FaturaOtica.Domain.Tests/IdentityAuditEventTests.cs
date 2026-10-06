using FaturaOtica.Domain.Identity;

namespace FaturaOtica.Domain.Tests;

public sealed class IdentityAuditEventTests
{
    private static readonly Guid Tenant = Guid.NewGuid();
    private static readonly Guid User = Guid.NewGuid();
    private static readonly Guid Branch = Guid.NewGuid();
    private static readonly string[] ExpectedProperties = ["Action", "ActorUserId", "BranchId", "Id", "OccurredAt", "Role", "TargetUserId", "TenantId"];
    private static readonly DateTimeOffset Time = new(2026, 10, 6, 12, 0, 0, TimeSpan.Zero);

    [Theory]
    [InlineData(IdentityAuditAction.GrantAccess, AccessRole.Owner, false)]
    [InlineData(IdentityAuditAction.GrantAccess, AccessRole.AccessAdministrator, false)]
    [InlineData(IdentityAuditAction.GrantAccess, AccessRole.Seller, true)]
    [InlineData(IdentityAuditAction.GrantAccess, AccessRole.BranchManager, true)]
    [InlineData(IdentityAuditAction.RevokeAccess, AccessRole.Owner, false)]
    [InlineData(IdentityAuditAction.RevokeAccess, AccessRole.AccessAdministrator, false)]
    [InlineData(IdentityAuditAction.RevokeAccess, AccessRole.Seller, true)]
    [InlineData(IdentityAuditAction.RevokeAccess, AccessRole.BranchManager, true)]
    [InlineData(IdentityAuditAction.BlockUser, null, false)]
    public void Create_AcoesValidas_RegistraIdentidadeEscopoEHorarioUtc(IdentityAuditAction action, AccessRole? role, bool branch)
    {
        var audit = IdentityAuditEvent.Create(Tenant, User, User, action, Time, role, branch ? Branch : null);
        Assert.NotEqual(Guid.Empty, audit.Id);
        Assert.Equal(7, (audit.Id.ToByteArray()[7] >> 4) & 15);
        Assert.Equal(Tenant, audit.TenantId);
        Assert.Equal(User, audit.ActorUserId);
        Assert.Equal(User, audit.TargetUserId);
        Assert.Equal(action, audit.Action);
        Assert.Equal(Time, audit.OccurredAt);
        Assert.Equal(role, audit.Role);
        Assert.Equal(branch ? Branch : null, audit.BranchId);
    }

    [Theory]
    [InlineData(0)] [InlineData(1)] [InlineData(2)] [InlineData(3)] [InlineData(4)]
    public void Constructor_IdsVazios_Recusa(int field)
    {
        var id = Guid.NewGuid();
        Assert.ThrowsAny<ArgumentException>(() => new IdentityAuditEvent(field == 0 ? Guid.Empty : id,
            field == 1 ? Guid.Empty : Tenant, field == 2 ? Guid.Empty : User, field == 3 ? Guid.Empty : User,
            IdentityAuditAction.GrantAccess, Time, AccessRole.Seller, field == 4 ? Guid.Empty : Branch));
    }

    [Theory]
    [InlineData((IdentityAuditAction)0, AccessRole.Owner, false)]
    [InlineData((IdentityAuditAction)99, AccessRole.Owner, false)]
    [InlineData(IdentityAuditAction.GrantAccess, (AccessRole)99, false)]
    [InlineData(IdentityAuditAction.GrantAccess, null, false)]
    [InlineData(IdentityAuditAction.RevokeAccess, null, true)]
    [InlineData(IdentityAuditAction.GrantAccess, AccessRole.Owner, true)]
    [InlineData(IdentityAuditAction.RevokeAccess, AccessRole.AccessAdministrator, true)]
    [InlineData(IdentityAuditAction.GrantAccess, AccessRole.Seller, false)]
    [InlineData(IdentityAuditAction.RevokeAccess, AccessRole.BranchManager, false)]
    [InlineData(IdentityAuditAction.BlockUser, AccessRole.Owner, false)]
    [InlineData(IdentityAuditAction.BlockUser, null, true)]
    public void Constructor_AcaoPapelOuEscopoInvalido_Recusa(IdentityAuditAction action, AccessRole? role, bool branch)
        => Assert.ThrowsAny<ArgumentException>(() => new IdentityAuditEvent(Guid.NewGuid(), Tenant, User, User,
            action, Time, role, branch ? Branch : null));

    [Fact]
    public void Constructor_HorarioNaoUtc_Recusa()
        => Assert.ThrowsAny<ArgumentException>(() => new IdentityAuditEvent(Guid.NewGuid(), Tenant, User, User,
            IdentityAuditAction.BlockUser, Time.ToOffset(TimeSpan.FromHours(-3))));

    [Fact]
    public void Contrato_PropriedadesTipadasESomenteLeitura_SemCredenciaisOuPayloadLivre()
    {
        var properties = typeof(IdentityAuditEvent).GetProperties();
        Assert.Equal(ExpectedProperties,
            properties.Select(x => x.Name).Order().ToArray());
        Assert.All(properties, property => { Assert.Null(property.SetMethod); Assert.NotEqual(typeof(string), property.PropertyType); });
    }
}
