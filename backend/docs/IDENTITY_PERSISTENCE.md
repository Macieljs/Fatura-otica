# Identity — contrato de persistência S1-03A

Estado: Red catálogo confirmado em PostgreSQL17 real (2 falhas funcionais, sem skips); após mappings/migration/RLS, QA confirmou 40 cenários verdes (catálogo/integridade/RLS) e 19 falhas funcionais reader/wrapper/contexto. Reader/wrapper implementados após esse Red, aguardando validação final. Não representa DoD nem endpoints disponíveis. Fontes: ADR0005, IDENTITY_MODEL, DATABASE_CONVENTIONS e S1-03A-PERSISTENCE. Tokens, sessão, SMTP, endpoints e auditoria append-only pertencem aos próximos incrementos.

## Superfície para testes

Namespace `FaturaOtica.Infrastructure.Identity`:

```csharp
IdentityDbContext(DbContextOptions<IdentityDbContext> options, Guid configuredTenantId)
// ConfiguredTenantId; DbSets Tenants, Users, Branches, TenantRoles, BranchGrants
PostgreSqlCurrentUserAccessReader(IdentityDbContext context)
// ICurrentUserAccessReader.GetAsync(Guid, CancellationToken) existente
IdentityTenantTransaction.BeginAsync(IdentityDbContext context, CancellationToken cancellationToken = default)
// Task<IdentityTenantTransaction>; IAsyncDisposable; Task CommitAsync(CancellationToken)
```

As assinaturas foram inicialmente entregues como skeletons antes do Red; após evidência QA receberam a implementação mínima. Contexto sem tenant (`Guid.Empty`) é rejeitado com ArgumentException antes de I/O; tenant configurado é imutável durante sua vida. Begin rejeita transação já ativa. Reader recebe UserId vazio como usuário ausente (null), antes de qualquer I/O, após propagar token já cancelado. Migrations são aplicadas via `context.Database.MigrateAsync()` em contexto com conexão administrativa separada; não há método administrativo na porta Application nem execução automática em requisições.

## Modelo relacional esperado

Schema `identity`; nomes SQL explícitos e IDs UUIDv7 gerados pela aplicação, sem defaults UUID no banco. Toda tabela tem `id uuid` PK. Exceto tenants, toda tabela contém `tenant_id uuid NOT NULL` com FK para tenants. Campos comuns: `criado_em timestamptz NOT NULL DEFAULT now()`, `criado_por uuid NULL`, `atualizado_em timestamptz NULL`, `atualizado_por uuid NULL`. São metadados, sem promessa de ledger/auditoria nesta fatia. Valores de data enviados como UTC.

| DbSet / tipo | Tabela | Propriedades específicas / colunas |
| --- | --- | --- |
| Tenants / IdentityTenant | tenants | Name / nome text NOT NULL |
| Users / IdentityUser | usuarios | Name/nome text, EmailNormalized/email_normalizado text, Status/status text NOT NULL; PasswordHash/senha_hash text NULL |
| Branches / IdentityBranch | filiais | Name/nome text, Active/ativa boolean NOT NULL |
| TenantRoles / IdentityTenantRole | papeis_usuarios | UserId/usuario_id uuid, Role/papel text, Active/ativo boolean NOT NULL |
| BranchGrants / IdentityBranchGrant | concessoes_filiais | UserId/usuario_id uuid, BranchId/filial_id uuid, Role/papel text, Active/ativo boolean NOT NULL |

Todas as entidades expõem Id, TenantId (exceto IdentityTenant), CreatedAt, CreatedBy, UpdatedAt, UpdatedBy; coleções/navegações não são necessárias ao contrato de testes. PasswordHash é dado interno da camada Infrastructure; snapshots e DTOs nunca o recebem. Nenhum token é persistido nesta migration. Pending admite hash nulo; hash presente deve ser não vazio. Algoritmo/ativação e exigência de hash para Active serão implementados com o ciclo de credenciais, sem senha padrão. Testes usam sentinela não secreta, jamais senha real.

| Regra | Nome / comportamento |
| --- | --- |
| Email único normalizado por tenant | ux_usuarios_tenant_id_email_normalizado (tenant_id,email_normalizado) |
| Chaves alternativas para FKs | ux_usuarios_tenant_id_id; ux_filiais_tenant_id_id |
| Papel único | ux_papeis_usuarios_tenant_id_usuario_id_papel |
| Grant único | ux_concessoes_filiais_tenant_id_usuario_id_filial_id_papel |
| FK papel → usuário | fk_papeis_usuarios_usuarios (tenant_id,usuario_id) → usuarios(tenant_id,id) |
| FK grant → usuário/filial | fk_concessoes_filiais_usuarios; fk_concessoes_filiais_filiais, ambas compostas |
| FK tenant | fk_<tabela>_tenants; índices ix_<tabela>_tenant_id |
| Índices FKs compostas | ix_papeis_usuarios_tenant_id_usuario_id; ix_concessoes_filiais_tenant_id_usuario_id; ix_concessoes_filiais_tenant_id_filial_id |
| Status | ck_usuarios_status: Pending, Active, Blocked |
| Papel empresarial | ck_papeis_usuarios_papel: Owner, AccessAdministrator |
| Papel filial | ck_concessoes_filiais_papel: Seller, BranchManager |
| Email canônico | ck_usuarios_email_normalizado: não vazio, btrim e lower iguais ao valor persistido |
| Hash presente | ck_usuarios_senha_hash: NULL ou valor não vazio |
| UUID não vazio | ck_<tabela>_id_nao_vazio em todas as cinco tabelas; ck_<tabela>_tenant_id_nao_vazio nas quatro operacionais; ck_papeis_usuarios_usuario_id_nao_vazio, ck_concessoes_filiais_usuario_id_nao_vazio, ck_concessoes_filiais_filial_id_nao_vazio |

Enums em text com check, sem PostgreSQL enum nativo. Conversão explícita preserva exatamente os nomes de domínio. FKs usam NO ACTION, sem cascata implícita. Relacionamentos entre tenants falham também na conexão administrativa (23503), mesmo quando RLS não é aplicado. Constraints/checks produzem 23505/23514 conforme cenário; QA confirma catálogo e erro concreto.

## RLS e transações

Cada tabela com tenant_id recebe ENABLE e FORCE RLS e policy `tenant_isolation` com USING e WITH CHECK iguais a `tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid`. Ausência/reset do GUC resulta em NULL e nenhuma linha visível; UUID malformado falha fechado. `tenants` permanece a única tabela sem tenant_id/RLS conforme convenção: role runtime não recebe SELECT/INSERT/UPDATE/DELETE nessa tabela.

Role administrativa aplica DDL/migrations e prepara dados isolados; role runtime separada tem LOGIN, NOSUPERUSER, NOBYPASSRLS, não é owner de tabelas/schema e não é membro de roles privilegiadas. Recebe USAGE identity e somente DML das quatro tabelas operacionais, não CREATE, TRUNCATE ou DDL. Criação/credenciais de roles são configuração de ambiente/fixture, nunca senha versionada na migration. FORCE não protege contra superuser/BYPASSRLS: testes devem comprovar atributos/ownership/membership da role usada.

Begin abre transação ReadCommitted e executa `select set_config('app.tenant_id', @tenant, true)` parametrizado; não interpolar SQL nem usar SET persistente. Commit confirma; dispose sem commit reverte. Falhas, cancelamento e erros SQL devem terminar a transação antes de devolver conexão ao pool. SaveChanges fora de transação com GUC local não tem permissão implícita. Global EF filters nas quatro tabelas usam a propriedade imutável ConfiguredTenantId do contexto; RLS continua obrigatório para IgnoreQueryFilters e SQL direto.

Reader abre/encerra seu próprio wrapper quando não há transação. Dentro de wrapper do chamador, usa o contexto já definido e não confirma/encerra a transação externa. Somente transação criada pelo IdentityTenantTransaction para aquele contexto e tenant é reconhecida: uma transação aberta diretamente via Database.BeginTransaction é rejeitada, mesmo que Database.CurrentTransaction exista. O wrapper registra internamente sua identidade/tenant/isolamento e limpa registro ao terminar; reader não deduz validade apenas de CurrentTransaction. Wrapper não é reentrante; trocar tenant exige outro contexto. O isolamento é ReadCommitted para avaliação do estado corrente, sem cache/entidades rastreadas; RepeatableRead/Serializable externos não são aceitos. O reader carrega usuário/status, papéis ativos e grants ativos cujas filiais existem, são ativas e pertencem ao tenant. Retorna null para usuário ausente/outro tenant; retorna Pending/Blocked no snapshot para policy negar. UserId vazio falha fechado antes de consulta; cancelamento é propagado.

O snapshot contém exclusivamente UserId, TenantId, Status, TenantRoles e BranchGrants. Nunca PasswordHash, tokens, campos de login ou entidade EF. A implementação deve obter usuário e todos os vínculos numa única instrução SQL, sem split query, garantindo snapshot coerente sob concorrência em ReadCommitted. Uma revogação confirmada antes da próxima avaliação deve aparecer, inclusive reutilizando o mesmo contexto EF. Cada check UUID não vazio rejeita explicitamente 00000000-0000-0000-0000-000000000000; FKs não substituem essa validação quando o pai também poderia ser vazio.

## Limites e riscos para QA/revisão

- A policy existente permite Owner para BranchScope sintaticamente válido; a porta GetAsync não recebe filial alvo. Reader elimina grants de filiais inválidas, mas a futura borda deve carregar/validar a filial alvo também para Owner. Não afirmar que esta fatia implementa endpoint operacional ou valida qualquer BranchScope arbitrário.
- Pooling: provar commit, rollback, dispose/cancelamento/erro e ausência de tenant em transação subsequente, idealmente pool max=1 e mesmo backend PID. Testar SQL sem filtros EF, tentativas de leitura/escrita cruzadas e alterações de tenant_id.
- Comparar snapshot antes/depois de revogação/bloqueio com contexto reutilizado; não cachear JWT/roles. Grant/papel inativo permanece persistido, mas não autoriza.
- Testar integridade composta usando admin isolado para que RLS não mascare FK incorreta; testar checks status/papel e unicidade entre tenants.
- Migration inicial cria schema/modelo/RLS sem dados seed ou defaults de senha. Down só se aplica ao banco descartável; remover schema destrói dados e não é reversão de produção autorizada.
- Evidência Red exige fixture PostgreSQL real saudável e cenário com dados/ação/resultado contratados. Testes de reader/wrapper podem falhar NotImplementedException na ação ausente quando o teste exige snapshot/transação/isolamento reais; testes que apenas chamam ou esperam o stub lançar não comprovam cenário funcional. Conexão indisponível e compilação quebrada não satisfazem Red. Snapshot/hash dos arquivos identifica cada evidência; novas alterações invalidam evidências anteriores aplicáveis.

## Incremento S1-04A1 — proveniência de perfil pendente

Migration incremental `20261007002023_AddPendingProfileProvenance` adiciona `IdentityUser.CreatedForBranchId` / `usuarios.criado_para_filial_id uuid NULL`, CHECK de UUID não vazio quando presente, FK composta `(tenant_id, criado_para_filial_id)` para filiais com NO ACTION e índice `ix_usuarios_tenant_id_criado_para_filial_id`. Não preenche legados a partir de grants. O caso de uso novo exige filial ativa/autorizada e grava o ID somente como proveniência: não participa do snapshot de autorização nem concede acesso. CreatedBy/CreatedAt recebem autor do principal autenticado e horário UTC do servidor; Pending com PasswordHash NULL, sem papel, grant ou append no ledger S1-03B.

`PostgreSqlPendingProfileStore` é adaptador da porta Application `IPendingProfileStore`; usa o wrapper existente e o mesmo contexto do `CurrentAccessAuthorizer`. Canonicalização usa SQL parametrizado `lower(btrim(...))`, conforme collation e CHECK do próprio PostgreSQL. Tentativa de INSERT depende da constraint tenant-scoped final: somente23505/ux_usuarios_tenant_id_email_normalizado vira conflito; erros desconhecidos, inclusive commit deferred, são500 genéricos após rollback. O endpoint protegido, validações e evidências estão em docs/sprints/S1-04A1-PENDING-PROFILE.md. Não há migration automática na API; aplicação da migration continua administrativa e separada da conexão runtime.

## Configuração sem segredos

Planejamento de DI: `Identity:TenantId` (UUID não vazio) e `ConnectionStrings:Identity` para role runtime. Conexão administrativa somente ferramenta/fixture de migration externa. Valores chegam de configuração confiável do servidor/secret provider; não aceitar header, payload ou query como tenant. Não adicionar connection string real, senha, logging de SQL com dados sensíveis ou SMTP neste incremento.

## Migration e operação administrativa

Migration inicial `20261006165846_InitialIdentity`, designer e snapshot foram gerados por EF CLI10.0.12 e vivem em `Infrastructure/Persistence/Migrations` (ADR0003). O código SQL RLS foi adicionado ao Up; nenhuma role/credencial ou tenant é criado na migration. A fábrica design-time usa apenas provider e tenant marcador, sem connection string; permite geração offline, mas não conecta nem migra bancos.

Geração de novas migrations: `dotnet ef migrations add <Nome> --project backend/src/FaturaOtica.Infrastructure --output-dir Persistence/Migrations`. A aplicação da migration é por ferramenta administrativa/fixture que constrói IdentityDbContext com conexão administrativa externa e chama Database.MigrateAsync. Não usar a factory offline para database update, não usar a role runtime para DDL e não executar migration na inicialização da API. Down remove as cinco tabelas e só é autorizado no banco descartável do teste; dados reais exigem estratégia de backup/restauração e autorização próprias.

Pins diretos de EF Core e EF Relational10.0.12 propagam runtime consistente com Design10.0.12; sem eles provider transitivo10.0.4 causava CS1705/MSB3277. Não houve upgrade genérico.

Próximo gate: QA valida reader/wrapper, cenários adicionais de cancelamento/pooling/model cache e regressão/cobertura sobre fonte congelada. Revisão independente segue antes de qualquer integração. DI/endpoints/configuração operacional não foram conectados nesta fatia. Este documento não declara DoD.
