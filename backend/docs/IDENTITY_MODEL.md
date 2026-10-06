# Modelo Identity — Sprint 01

Contrato de implementação da spec `docs/sprints/SPRINT-01-IDENTITY.md`. Ainda não representa endpoints implementados ou persistência entregue.

## Contexto e entidades

Uma empresa configurada por ambiente. `TenantId` é obrigatório nos dados, nunca escolhido pelo cliente nesta entrega. Filial selecionada não concede direitos.

- Usuario: Id, TenantId, EmailNormalizado, Nome, Status Pending/Active/Blocked, hash de senha privado.
- Filial: Id, TenantId, Nome, Ativa. Filiais operacionais precisam existir e estar ativas.
- Papel empresarial: Owner ou AccessAdministrator para um usuário do mesmo tenant.
- ConcessaoFilial: TenantId, UsuarioId, FilialId, Role Seller/BranchManager, estado ativo. Constraints/FKs compostas garantem mesmo tenant. Concessão revogada não aparece no snapshot de autorização.
- TokenPrimeiroAcesso: hash, propósito Activation/PasswordRecovery, TenantId/UsuarioId, expiração UTC, consumido/revogado. Consumo atômico.
- Sessao/RefreshToken: hashes, família de rotação, expiração absoluta, revogação e detecção de reutilização.
- Auditoria append-only: tenant, autor, alvo, ação, instante UTC, metadados sem senha/token.

Conceder acesso não ativa a conta automaticamente; cadastro pelo gestor também não concede papel. DTOs comuns jamais expõem senha, hash ou tokens de ativação. Usuário recebe segredo apenas no canal SMTP. Tokens operacionais só nas respostas de sessão apropriadas.

## Contrato compilável S1-02

Namespace Domain: `FaturaOtica.Domain.Identity`. Records são snapshots de avaliação; não são DTOs públicos nem substituem invariantes das futuras entidades.

```csharp
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
        AccessAction permission, BranchScope? targetBranch = null);
}
```

Application namespace `FaturaOtica.Application.Identity`:

```csharp
public interface ICurrentUserAccessReader
{
    ValueTask<UserAccessSnapshot?> GetAsync(Guid userId, CancellationToken cancellationToken = default);
}
public sealed class CurrentAccessAuthorizer(ICurrentUserAccessReader reader, Guid configuredTenantId)
{
    public ValueTask<AccessDecision> AuthorizeAsync(Guid userId, AccessAction permission,
        BranchScope? targetBranch = null, CancellationToken cancellationToken = default);
}
```

Leitor consultado em cada operação, sem cache na S1-02. Snapshot ausente => InactiveUser. O adaptador deve carregar vínculos atuais e validar existência/estado da filial; nunca reconstruir concessões apenas de JWT. Validação de sessão autenticada pertence à API; esta policy avalia permissões, não autentica credenciais.

## Regras de avaliação

1. Identificadores vazios, enums desconhecidos e contexto malformado => deny InvalidContext; fail closed.
2. Usuário/filial alvo de tenant diferente do configurado => deny TenantMismatch, inclusive Owner.
3. Pending/Blocked => deny InactiveUser, inclusive Owner/admin.
4. ReadOwnProfile => usuário ativo do ambiente, sem exigir filial.
5. ManageAccess => Owner/AccessAdministrator em TenantRoles. Gestor/vendedor não podem conceder, mesmo com filial.
6. OperateBranch => filial obrigatória. Owner cobre todas as filiais válidas do próprio tenant; demais somente BranchGrant Seller/BranchManager explícito para alvo.
7. CreatePendingProfile => filial obrigatória. Owner ou BranchManager explicitamente concedido para alvo. Admin sem vínculo operacional não ganha cadastro operacional implicitamente.
8. Owner/admin em BranchGrants não criam privilégios empresariais; Seller/BranchManager em TenantRoles não criam acesso global. Snapshot inválido/enum desconhecido nega.
9. Remover grant ou bloquear conta deve afetar chamada seguinte do authorizer. JWT não replica fonte de verdade.

S1-02 cobre AC01/03/04/08/09/10 no nível policy. Persistência, isolamento PostgreSQL, endpoints e transações serão comprovados separadamente; estes testes não satisfazem AC13.

## Portas das próximas tarefas (desenho, não implementadas)

IIdentityRepository, ICredentialHasher (Argon2id), IOneTimeTokenStore (consumo atômico), ISessionStore (rotação/revogação atômica), IIdentityEmailSender (SMTP), IAuditWriter, IConfiguredTenantContext e TimeProvider. Token em armazenamento somente hash; envio usa segredo transitório que não é logado.

## Entrega da sprint e impedimentos

Contrato YAML é design-first para alinhamento/testes. Na implementação, OpenAPI exportado da API deve ser validado contra ele e ser fonte do client gerado; não manter dois contratos divergentes. Não incluir client gerado até endpoint/schema estabilizar.

SMTP precisa captura local e configuração externa em homologação. Docker/PostgreSQL indisponível impede testar AC13 e liberar Feature. Nenhum destes documentos significa que autenticação ou envio já funcionam.

## Transporte S1-05

Decisão fechada pelo SM: refresh cookie HttpOnly/host-only/SameSite=Lax/Secure em HTTPS; JWT curto em memória, sem localStorage. POST refresh/logout protege CSRF+Origin. Contrato inclui bootstrap GET /csrf com sessão refresh, no-store e Origin permitido. Proxy mesma origem recomendado, destinos pendentes. Ver ADR-0005. Proteção último admin é proposta pendente fora S1-02.
