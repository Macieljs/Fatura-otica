using FaturaOtica.Domain.Identity;

namespace FaturaOtica.Domain.Tests;

public sealed class BootstrapOwnerAuditDomainTests
{
    private static readonly Guid Tenant = Guid.NewGuid();
    private static readonly Guid Target = Guid.NewGuid();
    private static readonly DateTimeOffset Time = new(2026, 10, 7, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public void CreateBootstrapOwner_EntradaValida_IdentificaSistemaOwnerSemFilial()
    {
        var audit = IdentityAuditEvent.CreateBootstrapOwner(Tenant, Target, Time);
        Assert.NotEqual(Guid.Empty, audit.Id);
        Assert.Equal(7, (audit.Id.ToByteArray()[7] >> 4) & 15);
        Assert.Equal(Tenant, audit.TenantId);
        Assert.Equal(Target, audit.TargetUserId);
        Assert.Null(audit.ActorUserId);
        Assert.Equal(IdentityAuditAction.BootstrapOwner, audit.Action);
        Assert.Equal(AccessRole.Owner, audit.Role);
        Assert.Null(audit.BranchId);
        Assert.Equal(Time, audit.OccurredAt);
    }

    [Theory]
    [InlineData("tenant")]
    [InlineData("target")]
    [InlineData("utc")]
    public void CreateBootstrapOwner_IdentificadorOuHorarioInvalido_Recusa(string invalid)
        => Assert.ThrowsAny<ArgumentException>(() => IdentityAuditEvent.CreateBootstrapOwner(
            invalid == "tenant" ? Guid.Empty : Tenant,
            invalid == "target" ? Guid.Empty : Target,
            invalid == "utc" ? Time.ToOffset(TimeSpan.FromHours(-3)) : Time));

    [Fact]
    public void Constructor_BootstrapValido_AceitaSomenteAutorSistema()
    {
        var id = Guid.NewGuid();
        var audit = new IdentityAuditEvent(id, Tenant, null, Target,
            IdentityAuditAction.BootstrapOwner, Time, AccessRole.Owner);
        Assert.Equal(id, audit.Id);
        Assert.Null(audit.ActorUserId);
        Assert.Equal(AccessRole.Owner, audit.Role);
        Assert.Null(audit.BranchId);
    }

    [Theory]
    [InlineData(true, AccessRole.Owner, false)]
    [InlineData(false, AccessRole.AccessAdministrator, false)]
    [InlineData(false, AccessRole.Seller, false)]
    [InlineData(false, AccessRole.BranchManager, true)]
    [InlineData(false, AccessRole.Owner, true)]
    [InlineData(false, null, false)]
    [InlineData(false, (AccessRole)99, false)]
    public void Constructor_BootstrapAutorPapelOuFilialInvalido_Recusa(bool humanActor, AccessRole? role, bool branch)
        => Assert.ThrowsAny<ArgumentException>(() => new IdentityAuditEvent(Guid.NewGuid(), Tenant,
            humanActor ? Target : null, Target, IdentityAuditAction.BootstrapOwner,
            Time, role, branch ? Guid.NewGuid() : null));

    [Theory]
    [InlineData("id")]
    [InlineData("tenant")]
    [InlineData("actor")]
    [InlineData("target")]
    [InlineData("branch")]
    public void Constructor_BootstrapIdsVazios_Recusa(string invalid)
        => Assert.ThrowsAny<ArgumentException>(() => new IdentityAuditEvent(
            invalid == "id" ? Guid.Empty : Guid.NewGuid(),
            invalid == "tenant" ? Guid.Empty : Tenant,
            invalid == "actor" ? Guid.Empty : null,
            invalid == "target" ? Guid.Empty : Target,
            IdentityAuditAction.BootstrapOwner, Time, AccessRole.Owner,
            invalid == "branch" ? Guid.Empty : null));

    [Theory]
    [InlineData(IdentityAuditAction.GrantAccess, AccessRole.Owner)]
    [InlineData(IdentityAuditAction.RevokeAccess, AccessRole.Owner)]
    [InlineData(IdentityAuditAction.BlockUser, null)]
    public void Create_AcaoHumanaSemAutor_RecusaMesmoAposSuporteSistema(IdentityAuditAction action, AccessRole? role)
        => Assert.ThrowsAny<ArgumentException>(() => IdentityAuditEvent.Create(Tenant, null, Target, action, Time, role));

    [Fact]
    public void Create_AcaoHumanaValida_PreservaAutorAutenticado()
    {
        var actor = Guid.NewGuid();
        var audit = IdentityAuditEvent.Create(Tenant, actor, Target, IdentityAuditAction.GrantAccess, Time, AccessRole.Owner);
        Assert.Equal(actor, audit.ActorUserId);
        Assert.Equal(IdentityAuditAction.GrantAccess, audit.Action);
    }
}
