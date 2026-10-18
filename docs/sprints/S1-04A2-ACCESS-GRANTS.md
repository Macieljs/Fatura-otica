# S1-04A2 — Concessão explícita de acessos

- Estado: `A2a1 validated locally; A2a2 ready`
- Tipo: feature backend; autorização crítica
- Objetivo: permitir que administrador de acessos/dono autorizado conceda e revogue papéis e filiais em perfis já existentes.
- Base: `develop` em `5983e23`; branch `feature/s1-04a2-access-grants`.
- Dependências: S1-02, S1-03A, S1-03B e S1-04A1 integradas; contratos HTTP design-first em `backend/docs/contracts/identity.openapi.yaml`.
- Modelo: GPT-6.1 Sol para contrato, autorização e implementação; revisão crítica independente em Sol. Luna pode apoiar tarefas documentais fechadas.
- Escopo externo: backend somente. Frontend/E2E automatizados, ativação, SMTP, login/sessões e recuperação de senha não fazem parte deste incremento.

## Contrato proposto para refinamento

- `POST /api/v1/identity/users/{userId}/grants`: receber somente papel, escopo e `branchId` quando aplicável; tenant e autor vêm do contexto autenticado confiável.
- `DELETE /api/v1/identity/users/{userId}/grants/{grantId}`: revogar apenas o vínculo correspondente ao alvo e tenant validados.
- Tenant roles: `Owner` e `AccessAdministrator`, sem filial. Grants de filial: `Seller` e `BranchManager`, com filial ativa do mesmo tenant.
- Concessão não ativa perfil `Pending`, não define senha e não emite token. Revalidar autoridade na fonte persistida em cada operação; claims de papel no JWT não bastam.
- Alteração e evento `GrantAccess`/`RevokeAccess` devem persistir atomicamente e usar PostgreSQL real/RLS no aceite.
- `Owner` administra acessos no próprio tenant. `AccessAdministrator` pode conceder/revogar `Seller` e `BranchManager`, mas não pode conceder/remover `Owner`/`AccessAdministrator`; somente Owner pode fazê-lo.
- Não permitir revogar, bloquear ou remover o último Owner ativo. Serializar alterações administrativas do tenant para manter essa invariante sob concorrência.
- Um comando explícito de instalação, após as migrations, provisionará tenant (se ainda não existir) e um Owner inicial `Pending`, usando somente a configuração confiável do tenant. O Owner define a senha pelo fluxo de ativação de uso único. O comando não roda a cada startup da API nem cria senha padrão; falha sem efeitos colaterais se Owner já existir.
- Registrar a inicialização como ação de sistema `BootstrapOwner`, com autor humano nulo e alvo Owner criado na mesma transação; nunca atribuir falsamente o evento ao Owner recém-criado.

## Decisões de produto confirmadas em 2026-10-06

1. `Owner` recebe `ManageAccess` e tem autoridade para conceder/remover papéis empresariais no próprio tenant.
2. `AccessAdministrator` não pode conceder/remover `Owner`/`AccessAdministrator`; sua gestão fica restrita aos papéis de filial `Seller`/`BranchManager`.
3. A empresa deve manter pelo menos um Owner ativo; proteger contra revogação/bloqueio do último Owner, inclusive em operações concorrentes.
4. O Owner inicial é provisionado uma vez por comando explícito de instalação, após as migrations, sem senha padrão. A ativação define a senha pelo próprio usuário.
5. A auditoria da inicialização usa ação explícita `BootstrapOwner` (ator de sistema, `ActorUserId = NULL`); grant/revoke feitos por usuários continuam exigindo ator autenticado.

## Granularidade

Separar em incrementos: A2a1 adiciona suporte do domínio/ledger para o evento de bootstrap; A2a2 implementa o console de provisionamento inicial; A2b entrega endpoints de concessão/revogação. Executar nesta ordem. A ativação de senha ficará em S1-04B, antes da gestão autenticada de acessos. Não expor endpoint público de bootstrap.

### Contrato técnico congelado para A2a

- Criar `backend/src/FaturaOtica.Bootstrap`, console administrativo separado da API. Invocation: `dotnet run --project backend/src/FaturaOtica.Bootstrap -- bootstrap-owner`; exige comando explícito e nunca inicia listener HTTP.
- Usar configuração confiável `Identity:TenantId`, `Identity:TenantName`, `Identity:OwnerName`, `Identity:OwnerEmail` e `ConnectionStrings:IdentityBootstrap`; não aceitar tenant/autor em payload e não fazer fallback para `ConnectionStrings:Identity`. A role de bootstrap tem DML mínimo, sem `BYPASSRLS`, ownership ou DDL. Migrations são pré-requisito e não são executadas pelo comando.
- Em uma transação tenant, criar o registro da empresa se ausente, depois o usuário `Pending`, papel tenant `Owner` ativo e evento `BootstrapOwner`. Não criar senha/hash, sessão, concessão de filial ou token neste incremento.
- Se existir evento bootstrap ou qualquer papel `Owner` no tenant, recusar sem alterar dados. E-mail duplicado, configurações ausentes/inválidas e falha em qualquer insert também deixam zero alterações.
- Serializar execuções por tenant e incluir índice único parcial de `BootstrapOwner` por tenant como defesa no banco; duas execuções concorrentes não podem deixar Owners/eventos órfãos ou duplicados.
- Migration permite `ActorUserId` nulo somente para `BootstrapOwner`, cuja role é obrigatoriamente `Owner` e `BranchId` nulo. Ações humanas existentes continuam exigindo ator válido/FK. Preservar ledger, RLS, filtros, grants e triggers, sem reescrever eventos antigos.
- Depois de A2a, o Owner existe como identidade pendente; autenticação/definição de senha depende de S1-04B. O comando não deve sugerir que o usuário já consegue entrar.

## Evidências de refinamento

- Na passagem inicial de contrato/QA, a inspeção foi somente leitura no HEAD `5983e23`; ainda não havia testes ou build.
- Tentativa inicial do Red (`artifacts/qa/s1-04a2a-schema-red/`) é histórica e foi substituída por Red corrigido: 12 casos, 8 aprovados e 4 falhas funcionais esperadas em PostgreSQL 17, exit 1. Depois, Green de schema/migration passou 12/12; testes diretos de Domain 21/21 e writer PostgreSQL 10/10 passaram. Evidências detalhadas em `S1-04A2a-QA.md` e `S1-04A2a1-IMPLEMENTATION.md`.
- Aceite Red preliminar cobre grants/revogações autorizados segundo a matriz confirmada, tenant/filial/alvo estrangeiros, papel/escopo inválido, perfil pendente, JWT e claims, atualização efetiva no próximo pedido, auditoria e atomicidade de grant + ledger; incluir concorrência para a invariante do último Owner.
- Persistência atual possui papéis/grants ativos e inativos com chaves únicas, FKs compostas, filtros por tenant, leitor que ignora grants/filiais inativos e ledger tipado. A reativação precisa respeitar a unicidade existente.
- O ledger atual exige `ActorUserId` referenciando um usuário existente. O evento `BootstrapOwner` será a única ação de auditoria com ator nulo; demais ações continuam exigindo usuário. Isso requer migration EF incremental para nullable/checks, atualização do snapshot e testes PostgreSQL de preservação dos dados anteriores, RLS e integridade.
- Próxima etapa: congelar contrato/aceites e OpenAPI com a matriz confirmada; QA escreve Red; backend implementa Green; executar gate Feature uma vez após os ciclos focados; revisão independente do snapshot.
- Graphify local atualizado neste worktree em 2026-10-07: 1.444 nós, 2.588 arestas, 110 comunidades. Arquivos de grafo/cache permanecem ignorados e fora do commit.
