using FaturaOtica.Domain.Identity;

namespace FaturaOtica.Domain.Tests;

public sealed class AccessPolicyTests
{
    private static readonly Guid Tenant = Guid.NewGuid();
    private static readonly Guid OtherTenant = Guid.NewGuid();
    private static readonly Guid Branch = Guid.NewGuid();
    private static readonly Guid OtherBranch = Guid.NewGuid();

    [Theory]
    [InlineData(UserStatus.Pending)]
    [InlineData(UserStatus.Blocked)]
    public void Evaluate_UsuarioNaoAtivo_Nega(UserStatus status)
        => Denied(User(status: status), AccessAction.ReadOwnProfile, AccessDenialReason.InactiveUser);

    [Fact]
    public void Evaluate_OutroTenant_NegaMesmoDono()
        => Denied(User(tenant: OtherTenant, roles: [AccessRole.Owner]), AccessAction.ManageAccess, AccessDenialReason.TenantMismatch);

    [Fact]
    public void Evaluate_VendedorNaFilialConcedida_Permite()
        => Allowed(User(grants: [Grant(AccessRole.Seller)]), AccessAction.OperateBranch, Scope());

    [Fact]
    public void Evaluate_VendedorEmFilialNaoConcedida_Nega()
        => Denied(User(grants: [Grant(AccessRole.Seller)]), AccessAction.OperateBranch, AccessDenialReason.BranchNotGranted, new(Tenant, OtherBranch));

    [Fact]
    public void Evaluate_FilialDeOutroTenant_NegaMesmoDono()
        => Denied(User(roles: [AccessRole.Owner]), AccessAction.OperateBranch, AccessDenialReason.TenantMismatch, new(OtherTenant, Branch));

    [Fact]
    public void Evaluate_DonoSemConcessoes_PermiteTodasFiliaisDaEmpresa()
    {
        var owner = User(roles: [AccessRole.Owner]);
        Allowed(owner, AccessAction.OperateBranch, Scope());
        Allowed(owner, AccessAction.OperateBranch, new(Tenant, OtherBranch));
        Allowed(owner, AccessAction.ManageAccess);
        Allowed(owner, AccessAction.CreatePendingProfile, Scope());
    }

    [Fact]
    public void Evaluate_GestorCadastraPerfilNaPropriaFilial_Permite()
        => Allowed(User(grants: [Grant(AccessRole.BranchManager)]), AccessAction.CreatePendingProfile, Scope());

    [Fact]
    public void Evaluate_GestorNaoPodeConcederAcessos_Nega()
        => Denied(User(grants: [Grant(AccessRole.BranchManager)]), AccessAction.ManageAccess, AccessDenialReason.PermissionDenied);

    [Fact]
    public void Evaluate_VendedorNaoPodeCadastrarPerfil_Nega()
        => Denied(User(grants: [Grant(AccessRole.Seller)]), AccessAction.CreatePendingProfile, AccessDenialReason.PermissionDenied, Scope());

    [Fact]
    public void Evaluate_AdminSemFilial_PermiteAdministrarMasNegaOperacao()
    {
        var admin = User(roles: [AccessRole.AccessAdministrator]);
        Allowed(admin, AccessAction.ManageAccess);
        Denied(admin, AccessAction.OperateBranch, AccessDenialReason.BranchNotGranted, Scope());
    }

    [Fact]
    public void Evaluate_PerfilProprioSemFilial_Permite()
        => Allowed(User(), AccessAction.ReadOwnProfile);

    [Theory]
    [InlineData(AccessAction.OperateBranch)]
    [InlineData(AccessAction.CreatePendingProfile)]
    public void Evaluate_OperacaoSemFilial_Nega(AccessAction permission)
        => Denied(User(roles: [AccessRole.Owner]), permission, AccessDenialReason.BranchRequired);

    [Fact]
    public void Evaluate_ContextoTenantVazio_Nega()
    {
        var result = AccessPolicy.Evaluate(User(), Guid.Empty, AccessAction.ReadOwnProfile);
        Assert.False(result.Allowed);
        Assert.Equal(AccessDenialReason.InvalidContext, result.Reason);
    }

    [Fact]
    public void Evaluate_UsuarioIdVazio_Nega()
        => Denied(User() with { UserId = Guid.Empty }, AccessAction.ReadOwnProfile, AccessDenialReason.InvalidContext);

    [Fact]
    public void Evaluate_FilialIdVazio_Nega()
        => Denied(User(roles: [AccessRole.Owner]), AccessAction.OperateBranch, AccessDenialReason.InvalidContext, new(Tenant, Guid.Empty));

    [Fact]
    public void Evaluate_ConcessaoDeOutroTenant_NegaContextoCorrompido()
        => Denied(User(grants: [new(OtherTenant, Branch, AccessRole.Seller)]), AccessAction.OperateBranch, AccessDenialReason.InvalidContext, Scope());

    [Fact]
    public void Evaluate_DonoDentroDeConcessaoDeFilial_NaoPromoveParaEmpresa()
        => Denied(User(grants: [Grant(AccessRole.Owner)]), AccessAction.ManageAccess, AccessDenialReason.InvalidContext);

    [Fact]
    public void Evaluate_PapelDeVendedorEmEscopoEmpresa_NegaContextoCorrompido()
        => Denied(User(roles: [AccessRole.Seller]), AccessAction.ReadOwnProfile, AccessDenialReason.InvalidContext);

    [Fact]
    public void Evaluate_PermissaoDesconhecida_Nega()
        => Denied(User(roles: [AccessRole.Owner]), (AccessAction)999, AccessDenialReason.InvalidContext);

    private static UserAccessSnapshot User(UserStatus status = UserStatus.Active, Guid? tenant = null,
        AccessRole[]? roles = null, BranchGrant[]? grants = null)
        => new(Guid.NewGuid(), tenant ?? Tenant, status, roles ?? [], grants ?? []);

    private static BranchGrant Grant(AccessRole role) => new(Tenant, Branch, role);
    private static BranchScope Scope() => new(Tenant, Branch);

    private static void Allowed(UserAccessSnapshot user, AccessAction permission, BranchScope? scope = null)
    {
        var result = AccessPolicy.Evaluate(user, Tenant, permission, scope);
        Assert.True(result.Allowed);
        Assert.Equal(AccessDenialReason.None, result.Reason);
    }

    private static void Denied(UserAccessSnapshot user, AccessAction permission, AccessDenialReason reason, BranchScope? scope = null)
    {
        var result = AccessPolicy.Evaluate(user, Tenant, permission, scope);
        Assert.False(result.Allowed);
        Assert.Equal(reason, result.Reason);
    }
}
