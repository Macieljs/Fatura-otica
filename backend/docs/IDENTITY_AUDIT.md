# Contrato interno de auditoria Identity — S1-03B

Estado: verifying. Contrato revisado com QA/revisor e decisão SM; Red funcional em PostgreSQL real recebido em artifacts/s103b-integration-red/identity-audit-red.trx (30 falhas por comportamento/tabela ausentes). Checks/RLS/triggers não estavam presentes no Red e exigem comprovação Green individual.

## Evento e invariantes

`Domain.Identity.IdentityAuditEvent` é classe selada imutável, somente getters, sem payload livre. Campos: `Id`, `TenantId`, `ActorUserId`, `TargetUserId` (Guid), `Action` (`IdentityAuditAction`), `OccurredAt` (DateTimeOffset UTC), `Role` (AccessRole?), `BranchId` (Guid?). IDs obrigatórios não podem ser vazios; filial, quando presente, não pode ser vazia. Ação e papel devem existir nos enums. Horário exige offset zero. A criação normal usa `IdentityAuditEvent.Create(tenantId, actorUserId, targetUserId, action, occurredAt, role?, branchId?)`, gerando UUIDv7. O construtor público recebe ID explícito para reconstituição, valida as mesmas invariantes e não aceita ID vazio; versão UUID de referências preexistentes não é restringida.

| Ação | Papel | Filial |
| --- | --- | --- |
| GrantAccess / RevokeAccess | Owner / AccessAdministrator | ausente |
| GrantAccess / RevokeAccess | Seller / BranchManager | obrigatória |
| BlockUser | ausente | ausente |

Entradas inválidas lançam ArgumentException (incluindo ArgumentOutOfRangeException onde pertinente). O evento informa uma mudança autorizada pelo chamador futuro; não autoriza acesso nem altera usuários/concessões. Actor e target podem ser iguais; existência e pertencimento ao tenant são validados por FKs compostas.

## Porta e transação

`Application.Identity.IIdentityAuditWriter.AppendAsync(IdentityAuditEvent auditEvent, CancellationToken cancellationToken = default)` retorna ValueTask. Implementação `Infrastructure.Identity.PostgreSqlIdentityAuditWriter(IdentityDbContext context)`.

O writer exige `IdentityTenantTransaction` ativo, validado para o mesmo DbContext, e evento do tenant configurado. Não aceita transação EF avulsa, wrapper encerrado ou wrapper de outro contexto. Essas recusas acontecem antes de INSERT. Nunca começa ou confirma transação, chama SaveChanges ou modifica concessões. Executa um INSERT parametrizado da auditoria na transação do chamador; alterações pendentes do EF continuam responsabilidade do chamador. Cancelamento (inclusive já solicitado) ou erro de INSERT dispõe o wrapper e reverte a transação inteira com CancellationToken.None, tornando impossível confirmar mudanças anteriores após falha do append. Qualquer falha do append, inclusive evento null, tenant divergente e cancelamento prévio, aborta o wrapper próprio validado e impede Commit posterior. Transação avulsa/não reconhecida é preservada, pois o writer não tem propriedade sobre ela. Após falha, o chamador descarta o DbContext e inicia uma nova unidade de trabalho; rollback não restaura valores de entidades rastreadas e reutilizá-las pode reaplicar estado revertido. O commit posterior pertence ao chamador. Dispose sem commit, erro de commit e cancelamento de commit seguem o rollback existente do wrapper.

## Modelo relacional

Migration incremental `AddIdentityAudit`, preservando migration InitialIdentity e seus dados. Tabela `identity.auditoria`: `id`, `tenant_id`, `autor_usuario_id`, `alvo_usuario_id`, `acao`, `ocorrido_em`, `papel`, `filial_id`. Tipos uuid, text com checks para enums, timestamptz UTC. Colunas padrão adicionais `criado_em` (default now), `criado_por`, `atualizado_em`, `atualizado_por`; as três últimas permanecem nulas com CHECK, pois o evento identifica autor explicitamente e ledger não admite atualização. Não há JSON, dados de senha/hash/token/e-mail ou texto arbitrário.

FK tenant → tenants(id); FKs (tenant_id, autor_usuario_id) e (tenant_id, alvo_usuario_id) → usuarios(tenant_id,id); FK (tenant_id, filial_id) → filiais(tenant_id,id), todas NO ACTION. Checks duplicam IDs não vazios, enums e combinação ação/papel/filial usando expressões que não deixam NULL passar indevidamente. UTC é representado por timestamptz normalizado pelo PostgreSQL; offset não é armazenado. Índices para cada FK começam por tenant_id; também índice (tenant_id, ocorrido_em).

Nomes estáveis de constraints: `pk_auditoria`; `fk_auditoria_tenants`, `fk_auditoria_usuarios_autor`, `fk_auditoria_usuarios_alvo`, `fk_auditoria_filiais`; `ck_auditoria_id_nao_vazio`, `ck_auditoria_tenant_id_nao_vazio`, `ck_auditoria_autor_usuario_id_nao_vazio`, `ck_auditoria_alvo_usuario_id_nao_vazio`, `ck_auditoria_filial_id_nao_vazio`, `ck_auditoria_acao`, `ck_auditoria_papel`, `ck_auditoria_escopo`, `ck_auditoria_metadados_imutaveis`. Índices: `ix_auditoria_tenant_id`, `ix_auditoria_tenant_id_autor_usuario_id`, `ix_auditoria_tenant_id_alvo_usuario_id`, `ix_auditoria_tenant_id_filial_id`, `ix_auditoria_tenant_id_ocorrido_em`.

`IdentityDbContext.AuditEvents` expõe DbSet<IdentityAuditEvent>, com filtro global TenantId == ConfiguredTenantId e mapeamento dos getters imutáveis. RLS ENABLE + FORCE, USING e WITH CHECK baseados em app.tenant_id com semântica fail-closed existente. Runtime não pode ser dono nem BYPASSRLS; provisioning concede somente SELECT/INSERT em auditoria. Migration não inventa nome de role operacional do ambiente. Trigger identity.fn_bloquear_alteracao() rejeita UPDATE/DELETE por linha e TRUNCATE por statement, inclusive para administrador com privilégios (exceto intervenções deliberadas que desabilitem triggers). Correções futuras exigem novo evento.

## Evidência esperada e limite

QA cobre AU01–09 com domínio, porta Application e PostgreSQL real, incluindo tentativas admin que alcancem o trigger, runtime SELECT/INSERT, RLS/EF, referências de outro tenant/inexistentes e estado mais append na mesma transação. A prova de atomicidade usa alterações de estado em fixture, sem implementar administração de acessos. Migration é reaplicável pelo histórico EF e snapshot versionado; Down remove apenas estrutura de auditoria e é permitido somente em banco descartável. Não há endpoints, DI, alteração OpenAPI, UI, cadastro/login/SMTP ou mutações reais de acesso neste incremento.

## Preparação registrada

Consulta Graphify: scripts/graphify.ps1 query 'IdentityTenantTransaction persistence identity audit' --budget 2200, retornando wrapper, DbContext, reader e migration inicial. A conferência do código confirmou propriedade do wrapper pelo contexto, ReadCommitted e rollback por DisposeAsync; essa evidência fundamentou reaproveitar o wrapper e recusar transação avulsa, sem criar transação no writer. Decisão SM, após concordância QA/revisor: qualquer falha em Append aborta o wrapper próprio validado e impossibilita Commit posterior. Green autorizado após Red funcional QA; consulta pré-implementação adicional: IdentityDbContext OnModelCreating InitialIdentity IdentityTenantTransaction, budget 1600, confirmou mapping e migration inicial a preservar.

## Implementação e verificação focada

Migration EF incremental 20261006223501_AddIdentityAudit com designer/snapshot gerados pelo cache dotnet-ef existente. InitialIdentity preservada. Mapeamento de getters, checks/FKs/índices, RLS forçada, triggers UPDATE/DELETE/TRUNCATE e REVOKE PUBLIC implementados. Build Infrastructure passou após corrigir CA1861; dotnet test Integration recompilou Domain/Application/Infrastructure/Api/Integration sem warnings observados. Acesso runtime SELECT/INSERT é provisioning, comprovado pela fixture.

Green Integration IdentityAudit: 28 aprovados, 2 falhas, 0 ignorados, 30 total. TRX: artifacts/s103b-integration-green/identity-audit-green.trx. Writer/aborto/commit conjunto, triggers admin, RLS SQL/EF, FKs e preservação/reaplicação migration passaram. Dois inputs inválidos também violam escopo: banco recusou com 23514/ck_auditoria_escopo, enquanto teste exigia papel ou filial_id_nao_vazio. QA revisa esses casos sobrepostos; produção não será relaxada para impor precedência artificial entre checks. Domain Green focado aprovado: 27/27, 0 ignorados, TRX artifacts/s103b-domain-green/identity-audit-domain-green.trx; sem alegação de Red Domain separado. Feature e revisão final pendentes.

QA revisou dois cenários sobrepostos com aceite SM sem mudar produção: papel desconhecido exige 23514 e prova catálogo do CHECK papel; filial vazia usa GrantAccess/Seller para isolar ck_auditoria_filial_id_nao_vazio. Integration IdentityAudit corrigido: 30/30 aprovados, 0 ignorados, TRX artifacts/s103b-integration-green-corrected/identity-audit-green-corrected.trx. Produção pronta para freeze/revisão; Graphify final e Feature pendentes.
