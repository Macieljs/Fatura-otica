# S1-04A1 — Cadastro de perfil pendente

- Estado: `review-approved-awaiting-integration`
- Tipo: feature
- Escopo: backend
- Objetivo: permitir que gestor autorizado crie perfil de funcionário pendente dentro da própria filial, sem senha, token de ativação, papel ou acesso operacional concedido.
- Autorização: escopo da Sprint 01 aprovado pelo Product Owner; replanejamento do MVP registrado em `MVP-SCOPE-DECISION-2026-10-06.md`.
- Dependências: núcleo de autorização S1-02, persistência/isolation S1-03A, auditoria S1-03B; HEAD de `develop` `3c79faf`.
- Branch/worktree: `feature/s1-04a-pending-profiles`, `work/s1-04a-pending-profiles`.
- Responsáveis: Scrum Master coordena; Backend fecha contrato e implementa após Red; QA escreve Red e verifica; agente independente revisa.
- Modelo: GPT-6.1 Sol para contrato/autorização/persistência; Luna somente para apoio documental verificável.
- Fora de escopo: conceder papéis/filiais (S1-04A2), token/ativação/senha (S1-04B), SMTP (pós-MVP), login/sessões (S1-05), frontend/UX, testes frontend/E2E, recuperação e deploy.

## Critérios de aceite

| ID | Dado / Quando / Então | Teste que comprova | Resultado |
| --- | --- | --- | --- |
| PEND-01 | Dado um gestor autenticado com autorização na filial A, quando cadastrar perfil para A, então o perfil é criado pendente, dentro do tenant do gestor, sem senha nem credenciais de acesso. | Post_GestorAutorizado (3); aliases/Unicode | Green Feature; assertions alcançadas e aprovadas |
| PEND-02 | Dado gestor sem autorização para filial B, quando enviar B como filial de cadastro, então a operação é negada e nenhum perfil é criado. | Post_FilialNaoAutorizada; SemCapacidadeAtual; MesmoBearerAposRevogacao; AuthorizeAsyncMesmoContexto | Green Feature; assertions alcançadas e aprovadas |
| PEND-03 | Dado cadastro concluído, quando ler papéis/concessões do perfil, então não existe papel nem filial operacional concedida implicitamente; a criação não equivale à autorização do administrador. | Post_GestorAutorizado: Profile/state/snapshot sem papéis/grants | Green Feature; assertions alcançadas e aprovadas |
| PEND-04 | Dado identidade de outro tenant ou identificador arbitrário enviado pelo cliente, quando tentar escolher tenant/autor, então o backend deriva esses dados do principal/contexto confiável ou rejeita; não permite cruzamento de tenant. | PropriedadeNaoDeclarada; BearerInvalido; ator estrangeiro; RLS runtime pós201 | Green Feature; assertions alcançadas e aprovadas |
| PEND-05 | Dada tentativa duplicada de e-mail dentro do tenant, quando cadastrar novamente, então a operação segue a regra de unicidade da spec, sem criar estado parcial nem revelar informação de outro tenant. | EmailCanonicoExistente (3); EmailExisteSomenteNoOutroTenant | Green Feature; assertions alcançadas e aprovadas |
| PEND-06 | Dado erro de persistência, quando cadastro falhar, então não permanece perfil parcial nem concessão de acesso. | Post_FalhaNoCommit (2), trigger deferred real23514/23505 | Green Feature; assertions alcançadas e aprovadas |
| PEND-07 | Dado bearer ausente, adulterado, expirado ou com issuer/audience/tenant/sub inválidos, quando chamar a rota, então recebe 401 e nenhum dado é criado; tokens assinados da fixture válida seguem para autorização atual. | Post_BearerInvalido (19); FixtureJwtAssinado | Green Feature; assertions alcançadas e aprovadas |
| PEND-08 | Dado cadastro autorizado na filial A, quando persistir, então CreatedForBranchId registra A, CreatedBy registra o principal e CreatedAt vem do servidor UTC, sem criar grant; usuários legados sem proveniência são preservados pela migration. | Post_GestorAutorizado; MigrateProveniencia; InsertSqlAdmin (3); Legados | Green Feature; assertions alcançadas e aprovadas |
| PEND-09 | Dado Owner com tenant válido, quando cadastrar em filial inexistente/inativa/de outro tenant, então recebe 403 uniforme e nenhum perfil é criado. | Post_FilialNaoAutorizada Owner (3) | Green Feature; assertions alcançadas e aprovadas |
| PEND-10 | Dadas duas criações concorrentes do mesmo e-mail canônico no tenant, quando persistirem, então exatamente uma conclui e outra recebe 409; o mesmo e-mail de outro tenant não bloqueia cadastro local. | Post_DuasRequisicoesConcorrentes; duplicidade local/estrangeira | Green Feature; assertions alcançadas e aprovadas |
| PEND-11 | Dado que uma configuração obrigatória de validação JWT (issuer, audience, signing key, tenant ou algoritmo permitido) esteja ausente/inválida, quando iniciar a API ou validar a requisição, então a borda falha fechada sem fallback e nunca aceita bearer com valores padrão. | Post_ConfiguracaoObrigatoriaAusenteOuInvalida_FalhaFechadaSemFallback (13) | Green Feature; assertions alcançadas e aprovadas |

## Plano e gates

1. Backend: inspecionar entidades, autorização, persistência e contrato S1-01; propor endpoint/DTO e fechar modelagem sem implementar lógica de produção nesta passagem. **Concluído;** JWT bearer mínimo necessário à rota protegida foi incluído como boundary A1, sem emissor/login/refresh.
2. Scrum Master valida coerência com os critérios aprovados e versiona contrato/spec. **Concluído;** OpenAPI existente refinado.
3. QA escreve testes de domínio, aplicação e integração/API adequados ao comportamento; executar Red funcional antes de implementação. **PEND-01..10 concluídos:** 92 novos casos,87 falhas funcionais/5 aprovados; assertions posteriores documentadas como ainda não alcançadas. **PEND-11 concluído:** filtro dedicado com 13 falhas funcionais, zero aprovados/ignorados; sem nova execução Feature combinada.
4. Backend implementa Green sem mudar intenção dos testes; PostgreSQL real para isolamento/constraints aplicáveis; executar gate Feature completo. **Concluído:**254/254,0falhas/skips, Domain100%65linhas, build0warnings0errors; evidências abaixo. Intenção dos testes A1 preservada.
5. Revisor independente audita o snapshot, critérios, migrações, contrato e evidência; corrigir achados antes de candidato. **Concluído, aprovado sem achados bloqueantes;** limites registrados em `S1-04A1-REVIEW.md`.

## Evidências

- Contrato: passagem documental backend concluída sobre base `3c79fafb02cdfc1c6787584905d1e76e28d37ed6`; contrato existente confirmado e refinamento detalhado abaixo. Scrum Master confirmou A1 como fatia HTTP protegida com validação bearer mínima, sem emissor/login/refresh.
- Red: PEND-01..10 concluído em 2026-10-06: 92 testes novos executados, 87 falhas funcionais esperadas, 5 aprovados, zero ignorados. Regressões149/149 verdes; PEND-11 também concluído: 13 falhas funcionais em execução focada separada, após corrigir a fixture de valores ausentes. Detalhe/limites em S1-04A1-QA.md.
- Green/Feature: aprovado em artifacts/quality/backend/20261007-003109-90ada1f5, snapshot `f4fa97bc6e34748eac9831cf7fbf617c8cc53a7e146e3e366e383e9ce67d9840`; checkout sujo sobre HEAD3c79faf, sem autorização de release.
- Revisão independente: aprovada por agente GPT-6.1 Sol; ver `S1-04A1-REVIEW.md`. Snapshot técnico `f4fa97bc6e34748eac9831cf7fbf617c8cc53a7e146e3e366e383e9ce67d9840`; 59 hashes técnicos conferidos sem divergência após documentação.
- Integração em develop: pendente; exige revisão e gates aplicáveis.

Este recorte não declara S1-04A, MVP ou Sprint 01 completos. Próximo recorte após aprovação: S1-04A2 concessão explícita de papéis/filiais por administrador de acessos/dono.

## Contrato refinado — passagem backend, 2026-10-06

Esta passagem altera somente documentação. Nenhum endpoint, DTO C#, migration ou teste foi implementado; Red/Green continuam pendentes. A proposta reutiliza o OpenAPI design-first de S1-01; o exportado pela API futura deverá convergir antes da geração de cliente TS. As decisões atualizadas da Sprint 01 prevalecem sobre menções antigas a SMTP em ADR-0005, IDENTITY_MODEL e endpoints de ativação do YAML. Não há SMTP, recuperação self-service, emissor de sessão ou ativação neste recorte.

### Endpoint e DTOs existentes

`POST /api/v1/identity/users`, operação `identityCreatePendingProfile`, bearer autenticado obrigatório. Não há rota pública de cadastro. Request `CreateProfileRequest`: objeto fechado, contendo exclusivamente `email` (string, formato e-mail), `name` (string não vazia) e `branchId` (UUID não vazio), todos obrigatórios. A semântica de `branchId` é filial de contexto/destino da criação, sujeita à autorização atual do autor.

```json
{"email":"ana@example.com","name":"Ana","branchId":"11111111-1111-4111-8111-111111111111"}
```

Não aceitar propriedades extras, inclusive `tenantId`, `actorUserId`, `createdBy`, `status`, `role`, `grants`, `password`, `passwordHash` e tokens. Isso concretiza `additionalProperties: false`; o binding futuro precisa rejeitar membros desconhecidos, pois DTO estreito com desserialização que os ignore não comprova esse contrato. Tenant, autor, ID, horário e estado não são campos do request.

Resposta `201 application/json`, schema `Profile`, exclusivamente `id`, `name`, `email`, `status`; `status` sempre `pending`. O ID é UUIDv7 do servidor; o e-mail retornado corresponde ao valor normalizado persistido. Não incluir senha/hash/token, sessão, papéis, concessões ou filial operacional. O schema existente não declara header Location nem GET do perfil recém-criado; não presumir esse endpoint para fabricar Location.

```json
{"id":"01900000-0000-7000-8000-000000000001","name":"Ana","email":"ana@example.com","status":"pending"}
```

Validação proposta para QA: JSON malformado, campo obrigatório ausente/nulo, e-mail inválido, nome vazio/somente espaços e UUID inválido/vazio resultam em `400`; remover espaços nas bordas de nome/e-mail antes de persistir e validar. Não há CPF, telefone, cargo, limite comercial de tamanho, algoritmo de equivalência de aliases ou remoção de pontos/`+tag` aprovado neste contrato; não acrescentar campos/restrições empresariais. Normalização deve cumprir a invariável persistente `email_normalizado = lower(btrim(email_normalizado))`; diferenças Unicode/collation devem ser resolvidas no adaptador e verificadas contra PostgreSQL, sem impor restrição ASCII inventada.

### Resultados e precedência

Erros usam `application/problem+json` e schema `Problem` existente (`type`, `title`, `status`, `traceId`, `code`; `errors` por campo quando aplicável), sem SQL, stack trace, credenciais ou dados de outro tenant.

| Condição | Resultado proposto | Persistência |
| --- | --- | --- |
| Sem bearer válido, `sub` inválido/ausente ou `tenant_id` incompatível com ambiente | 401; código de credencial inválida existente | Nenhuma |
| Ator ausente/Pending/Blocked ou sem capacidade atual de criar no alvo | 403 `identity.access_denied` | Nenhuma |
| Filial inexistente, inativa, de outro tenant ou fora da autorização | 403 `identity.access_denied`, resposta uniforme para não distinguir outro tenant | Nenhuma |
| Entrada inválida após autenticação | 400 `identity.validation_failed` | Nenhuma |
| Mesmo e-mail normalizado já existe no tenant, inclusive Pending/Blocked | 409 `identity.email_already_exists` | Nenhuma nova linha |
| Falha inesperada de gravação/commit | 500 Problem genérico, sem detalhes internos | Transação revertida |

Autenticar antes de executar o caso de uso; autorizar a filial antes de consultar duplicidade, para que um chamador sem permissão não use conflitos como enumeração. Uma duplicidade só diz respeito ao tenant confiável já autorizado. A identidade em outro tenant não muda o resultado do cadastro local. Códigos de validação/duplicidade acima congelados como detalhe técnico para QA. `429` genérico veio do design-first, sem limite/política definida; o refinamento de A1 remove essa resposta declarativa deste endpoint até existir uma fatia de rate limiting contratada. Não alterar intenções de teste depois de Red sem devolução ao QA.

### Contexto confiável e autorização

O ambiente resolve TenantId por configuração confiável imutável do servidor; o tenant validado do principal deve coincidir com ele. O principal autenticado fornece UserId/autor (`sub`), nunca header livre ou identificador escolhido pelo cliente. Claims `role`/`filial_id` não decidem permissão. O caso de uso recebe contexto confiável separado do DTO público; não recebe ator/tenant provenientes do binding do request.

Avaliar `CurrentAccessAuthorizer.AuthorizeAsync(actorUserId, CreatePendingProfile, new BranchScope(configuredTenantId, branchId))` sobre estado persistente atual, em cada operação. Autor precisa estar Active. Owner cria em filial válida do próprio tenant. BranchManager precisa de concessão ativa exatamente no alvo. Seller e AccessAdministrator sem concessão BranchManager são negados. Admin com a concessão explícita de gestor pode criar por essa concessão, não pela capacidade empresarial.

Carregar a filial alvo do mesmo tenant e comprovar `Active` também para Owner: `AccessPolicy` aceita Owner para BranchScope sintaticamente válido e não consulta catálogo de filiais. Não confiar apenas na policy, no grant do JWT ou na filial atualmente selecionada. Revogação/bloqueio confirmados antes da próxima avaliação devem negar a nova criação; o reader não usa cache de grants. QA deve cobrir o contexto EF reutilizado e rejeição de ator de outro tenant.

### Modelo e impacto persistente

Decisão do Scrum Master nesta passagem: guardar `CreatedForBranchId` (ou equivalente) somente como proveniência do cadastro. Esse campo não entra no snapshot de autorização, não preenche filial operacional e não cria `IdentityBranchGrant`. Até S1-04A2, o perfil não tem papel empresarial nem concessão de filial.

| Campo interno | Valor no cadastro S1-04A1 |
| --- | --- |
| Id | UUIDv7 gerado pelo servidor |
| TenantId | Tenant confiável do ambiente validado contra principal |
| Name / EmailNormalized | Nome validado / e-mail canônico |
| Status / PasswordHash | Pending / NULL |
| CreatedAt / CreatedBy | Horário UTC do servidor / autor autenticado validado |
| CreatedForBranchId | Filial de contexto/destino validada e autorizada |
| UpdatedAt / UpdatedBy | NULL na criação |
| TenantRoles / BranchGrants | Zero linhas criadas para o novo perfil |

Proposta de migration incremental, depois de Red: adicionar `identity.usuarios.criado_para_filial_id uuid NULL`, FK composta `(tenant_id, criado_para_filial_id)` → `identity.filiais(tenant_id,id)` com NO ACTION, índice `ix_usuarios_tenant_id_criado_para_filial_id` e CHECK de UUID não vazio quando presente. Nullable preserva usuários legados/provisionados, cuja filial de origem não pode ser deduzida; o caso de uso novo exige valor. Não fazer backfill com concessões operacionais nem mudar a migration inicial. Reusar RLS/filtro existentes de usuarios, mantendo isolamento inclusive para SQL sem filtro EF. Os nomes são proposta técnica para QA/Dev congelarem antes de Red.

`CreatedBy`/`CreatedAt` já existem. Preenchê-los com autor/tempo confiáveis dá proveniência inicial; esta fatia não estende o ledger S1-03B, cujo enum/check de ações aceita apenas concessão, revogação e bloqueio. Criar perfil pendente é criação inicial, sem alteração de acesso nem transição para Active. Nenhuma evidência daqui pode ser apresentada como append auditado desse cadastro. Se for exigido ledger de criação, será necessário contrato explícito da nova ação, invariantes, migration incremental e cenários QA antes do Green; não reutilizar `GrantAccess`/`BlockUser` para rotular criação.

Salvar usuário e metadados numa unidade de trabalho com `IdentityTenantTransaction`, RLS local (`set_config(..., true)`) e commit único. Falha, cancelamento ou constraint devem terminar em rollback; descartar DbContext após falha, sem salvar novamente entidades rastreadas revertidas. Não criar ou confirmar concessões/tokens/sessões em nenhum ponto.

A constraint existente `ux_usuarios_tenant_id_email_normalizado` é a defesa final contra duplicidade concorrente. Pré-checagem pode melhorar erro, mas não substitui o índice. Converter somente SQLSTATE 23505 dessa constraint conhecida em conflito de e-mail; outras falhas não são duplicidade. Duas requisições concorrentes com o mesmo tenant/e-mail deixam exatamente um perfil; outro tenant pode usar o mesmo e-mail. O perfil Pending ocupa a unicidade: não reutilizar/ativar/promover perfil existente nem gerar idempotência implicitamente.

### Borda HTTP: fatia mínima confirmada pelo Scrum Master

Achado: `Program.cs` só mapeia `/health`; não registra AddAuthentication/AddAuthorization, validação JWT ou middlewares correspondentes. DI Application/Infrastructure são no-op. Appsettings não define TenantId, conexão runtime, issuer, audience, chave ou algoritmos aceitos. `Microsoft.AspNetCore.Authentication.JwtBearer` já está declarado; pacote instalado não autentica a rota. Somente adicionar `RequireAuthorization` não fecha a dependência.

Decisão SM: manter A1 como fatia HTTP protegida e incluir a configuração mínima de validação JWT antes de S1-05. Configurar handler bearer com validação de assinatura, issuer, audience, expiração e algoritmo permitido a partir de configuração confiável; exigir `sub` UUID não vazio e tenant compatível; registrar política/middlewares e adaptador do principal para contexto de ator; registrar runtime DbContext/reader/authorizer/transação; proibir fallback de chave/tenant e falhar fechado quando configuração necessária faltar. Não criar login, token issuer, refresh, cookie ou store de sessão. Testes de API precisam usar JWTs efetivamente assinados com parâmetros isolados da fixture e provar assinatura/issuer/audience/expiração/tenant inválidos, além de ausência de bearer; principal artificial de teste sozinho não comprova esse handler.

Configuração técnica prevista: `Identity:TenantId`, `ConnectionStrings:Identity`, `Identity:Jwt:Issuer`, `Identity:Jwt:Audience`, `Identity:Jwt:SigningKey` e `Identity:Jwt:AllowedAlgorithms`, todos de ambiente/secret provider confiável. Issuer/audience devem ser não vazios; chave/algoritmos compatíveis e explicitamente configurados; requerer tokens assinados e `exp`, validar `nbf` quando presente, sem tolerância temporal implícita nesta fatia (clock skew zero). A fixture pode usar algoritmo/chave isolados de teste, nunca chave de produção. Não aceitar algoritmo escolhido pelo token fora da allowlist nem fallback de configuração. Parâmetros/segredos reais são responsabilidade de ambiente futuro, não versionados; sua ausência impede inicialização/uso da rota protegida no ambiente, não impede QA com configuração isolada.

A1 entrega autenticação de bearer mais autorização atual de conta/grants. Validação/revogação de sessão persistente será completada em S1-05; a integração posterior deve validar sessão atual conforme seu contrato. Não declarar S1-05 concluído apenas por JWT válido. A alternativa de entregar somente Application/persistência foi descartada pelo SM para este incremento; gate A1 inclui o endpoint autenticado de ponta a ponta. Nunca liberar a rota anonimamente para avançar os testes.

### Plano QA a preparar após congelamento do contrato

- Domain/Application: criação Pending sem segredos/papéis/concessões; campos inválidos; gestor na filial A versus B; Owner; Seller/admin isolado; conta bloqueada/pendente; revogação; tenant/autor confiáveis; relógio UTC; falha/cancelamento sem estado parcial.
- PostgreSQL real/runtime sem BYPASSRLS: RLS/filtro, FK composta da proveniência (também com conexão administrativa para não mascarar integridade), filial inválida/inativa inclusive Owner, unicidade canônica tenant-scoped, corrida de duplicidade, rollback/commit e preservação dos legados após migration.
- API/contrato: bearer real e todos os erros de validação do JWT; `401` sem autenticação; `403` uniforme de filial; rejeição de propriedades não declaradas; request/201/Profile/Problem no OpenAPI exportado; ausência de credenciais e grants na resposta; conflito restrito ao próprio tenant.
- Evidenciar Red funcional por critério; falha de compilação, Docker, configuração ou tabela fixture não substitui o comportamento esperado. QA decide métodos/arquivos e congela as assinaturas mínimas; esta passagem não escreveu testes.

### Evidências verificáveis desta passagem

Graphify inexistia neste checkout: primeira query falhou `graph file not found`; `scripts/graphify.ps1 update .` gerou grafo local AST com 1123 nós/1788 arestas, sem LLM. Consultas seguintes localizaram AccessPolicy, CurrentAccessAuthorizer, IdentityUser, IdentityDbContext e wrapper. Expansão conferida no vocabulário local: `pending email branch audit tenant`; consulta com budget 700 foi truncada, portanto a confirmação dos invariantes veio do código abaixo, não de relações supostas. Grafo/cache permanecem ignorados, não versionados.

| Evidência confirmada | Fonte na base 3c79faf |
| --- | --- |
| Rota/operationId/request/response/bearer design-first | backend/docs/contracts/identity.openapi.yaml:655, :657, :734; CreateProfileRequest:1235; Profile:1370 |
| Estado/capacidade e gestor/Owner | backend/src/FaturaOtica.Domain/Identity/AccessPolicy.cs:3, :5, :33, :47, :54 |
| Leitura atual e correspondência de autor | backend/src/FaturaOtica.Application/Identity/CurrentAccessAuthorizer.cs:22, :28, :32 |
| Usuário existente, hash nullable e ausência de filial de origem | backend/src/FaturaOtica.Infrastructure/Identity/IdentityRecords.cs:24; CreatedBy:9 |
| Unicidade/canonicalização | backend/src/FaturaOtica.Infrastructure/Identity/IdentityDbContext.cs:46, :50 |
| Limite do ledger e filtro EF | backend/src/FaturaOtica.Infrastructure/Identity/IdentityDbContext.cs:101, :103, :160; Domain/Identity/IdentityAuditEvent.cs:3 |
| Transação local/rollback | backend/src/FaturaOtica.Infrastructure/Identity/IdentityTenantTransaction.cs:20, :28, :33, :84 |
| Ausência de borda autenticada implementada | backend/src/FaturaOtica.Api/Program.cs:12, :15, :19, :28; Application/DependencyInjection.cs:7; Infrastructure/DependencyInjection.cs:8 |
| JwtBearer já disponível | backend/src/FaturaOtica.Api/FaturaOtica.Api.csproj:9; backend/Directory.Packages.props:18 |

Verificação documental: `git diff --check` sem erro de whitespace; o YAML em sintaxe JSON foi lido com `ConvertFrom-Json`, confirmando request fechado e respostas 201/400/401/403/409/500. Nenhum teste funcional/build foi executado nesta passagem de contrato; essas verificações não são evidência Red/Green nem validação OpenAPI exportado.

### Dependências e passagem

| Pendência | Dono | Condição para retomar |
| --- | --- | --- |
| Borda bearer/contexto ausente no código da base | Backend/QA | Incluída explicitamente em A1; QA comprova Red funcional de autenticação/autorização antes de Green |
| Configuração/segredos reais de tenant, banco e JWT | Ambiente futuro | Fornecer configuração segura no destino antes de executar; QA usa configuração isolada; nenhum segredo real será versionado |
| Assinaturas de caso de uso e migration de proveniência | Backend/QA | Preparar superfície compilável mínima/testes sem comportamento de produção, preservando modelo e critérios acima; QA executa Red real |
| Sessão persistente/revogação de sessão | S1-05 | Completar borda de sessão na fatia de login/refresh; não é entrega de A1 |

Próxima ação original foi QA Red, já concluída. Antes de Green, QA acrescenta e executa o caso PEND-11 de configuração fail-closed. Esta passagem não fez commit/push e não altera o estado de integração ou conclusão da sprint.



## Passagem QA Red — 2026-10-06

QA escreveu apenas três arquivos de testes (fixture/API/persistência), preservando contrato e produção. Build final0warnings0errors8,87s; runner Feature0warnings0errors10,53s. PostgreSQL17 real com runtime NOBYPASSRLS; Docker29.1.3. Snapshot testado `a5161af368c29a30850733dbc87ee4e1aa294175b9401d76fb10702a127d9b12` sobre base `3c79faf`.

Execução Feature: Architecture3/3, Domain48/48, Application7/7, Integration183 (96aprovados/87falhas),0ignorados; total241 (154aprovados/87falhas). Novos92 (5aprovados/87falhas); regressões149/149 verdes. Domain100%,65/65linhas instrumentadas. Gate exit1/bloqueado esperado por Red funcional; não representa gate aprovado.

Falhas conferidas no TRX:81 POSTs com404, OpenAPI200 sem rota, propriedade EF ausente e4 guards de catálogo sem coluna. FixtureJWT válida e4 testes do autorizador atual passaram. Não houve compilação/fixture/banco indisponível na execução final. Checks posteriores a201/403 e à coluna ausente ainda não estão comprovados. Report S1-04A1-QA.md detalha limites, inclusive interleaving de concorrência e superfícies novas/cancelamento/configuração fail-closed ainda sem teste dedicado.

Evidências: `artifacts/quality/backend/20261006-234556-d2b3979e/` (TRX/summary/source/Cobertura) e `artifacts/qa/s1-04a1-red/` (logs,CSV e contagens por método). Próxima passagem: Backend Green neste recorte, preservando testes/contrato; depois QA/gate/revisão independente. Red encerrado sem commit/push/produção; feature, integração e sprint continuam pendentes.

## Complemento QA PEND-11 — Red de configuração

Teste novo PendingProfileConfigurationTests.Post_ConfiguracaoObrigatoriaAusenteOuInvalida_FalhaFechadaSemFallback:13 casos (5 ausentes,8 inválidos),13 falhas funcionais,0 aprovados,0 ignorados. A fixture verifica valor exato em IConfiguration e JWT assinado independentemente; API atual inicia com configuração ausente/inválida, health200, POST404 e nenhuma mutação. Isso demonstra falta de guard de configuração; ainda não demonstra aceitação de bearer com defaults, porque o handler/rota continuam ausentes.

Primeira tentativa teve8 Reds funcionais e5 falhas de fixture (UseSetting(null) normalizado para vazio); estas5 não contaram como Red. Provider in-memory exclusivamente de teste preservou null sem fallback; a repetição alcançou a assertion funcional em todos os13 casos. Código/aceite anterior preservados, sem produção/Green. Build focado final0 erros/0 warnings,1m04,71s.

Comando final: dotnet test backend/tests/FaturaOtica.Integration.Tests/FaturaOtica.Integration.Tests.csproj --configuration Debug --no-build --no-restore --filter FullyQualifiedName~PendingProfileConfigurationTests --logger "trx;LogFileName=configuration-red.trx" --results-directory artifacts/qa/s1-04a1-red/configuration. Exit1 esperado. Snapshot deb130e40ae62e0d4b2fe9f932b67a849154143eb7403ab315944baf857559ae, TRX/log/source/hashes em artifacts/qa/s1-04a1-red/configuration.

A execução Feature anterior permanece histórica para PEND-01..10; não foi reexecutada neste complemento, conforme orientação do SM. PEND-01..11 têm testes preparados/Red observado em passagens separadas; Green e gate Feature combinado permanecem pendentes. Próxima passagem Backend Green, preservando a intenção dos105 casos novos atuais (92 anteriores+13 configuração).

## Passagem Backend Green — implementação em andamento

Green autorizado pelo Scrum Master após os Reds QA, inclusive PEND-11. Caso de uso Application, validação FluentValidation, portas de store/transação, adaptador PostgreSQL, proveniência e borda JWT/Problem/endpoint/OpenAPI estão em implementação. O adaptador usa lower(btrim()) do PostgreSQL para a canonicalização Unicode, não ToLowerInvariant; o INSERT tenta a constraint real de unicidade e somente sua 23505 conhecida vira409. Reaproveita wrapper RLS local e autorizador atual; não escreve papéis/grants/ledger/token/sessão.

Primeiro comando de build (Debug, --no-restore) encerrou exit1 com resumo0warnings0errors e sem diagnóstico de compilador no log; não é Green nem falha funcional de teste. Log artifacts/green/s1-04a1/build-first.log. Investigação isolada com build serial/--disable-build-servers em andamento antes de gerar migration e executar testes focados. Gate Feature ainda não executado nesta passagem; intenção/fontes dos testes QA preservadas.

### Green focado confirmado e freeze de código

Build serial `dotnet build backend/FaturaOtica.slnx --configuration Debug --no-restore --disable-build-servers -m:1 -v minimal`: primeiro passou0warnings0errors56,41s. Migration gerada via `dotnet ef migrations add AddPendingProfileProvenance --project backend/src/FaturaOtica.Infrastructure/FaturaOtica.Infrastructure.csproj --startup-project backend/src/FaturaOtica.Infrastructure/FaturaOtica.Infrastructure.csproj --context IdentityDbContext --output-dir Persistence/Migrations --no-build`. A tentativa com startup Api recusou por ausência de EF.Design; usar factory Infrastructure resolveu sem instalar dependência. Migration20261007002023_AddPendingProfileProvenance/designer/snapshot incrementais preservam InitialIdentity/AddIdentityAudit. CA1861 no código gerado foi corrigido com arrays static readonly, sem suprimir analyzer; build final0warnings0errors92,95s (build-migration-corrected.log).

Recorte executado: `dotnet test backend/tests/FaturaOtica.Integration.Tests/FaturaOtica.Integration.Tests.csproj --configuration Debug --no-build --no-restore --filter FullyQualifiedName~PendingProfile --logger "trx;LogFileName=pending-profile-green.trx" --results-directory artifacts/green/s1-04a1/focused`.105/105aprovados,0falhas,0skips, duração VSTest1m15s; exit0. TRX em artifacts/green/s1-04a1/focused/pending-profile-green.trx; log focused-test.log. Inclui13casos PEND-11 com recusa de startup quando configuração é inválida/ausente. As assertions posteriores a201 e ao catálogo agora foram alcançadas: proveniência, senha NULL, zero papéis/grants/append, constraints admin/FK, legados, RLS runtime/IgnoreQueryFilters/SQL direto, JWT real, rollback deferred no commit e OpenAPI exportado. A corrida faz sempre INSERT sem pré-checagem de duplicidade;409 só é produzido pela23505 da constraint conhecida, inclusive na dupla concorrente. O teste não força a ordem temporal de execução de cada INSERT.

Detalhe de configuração da borda implementada: SigningKey é o texto secreto convertido em bytes UTF-8 (não decodificar base64 implicitamente); a allowlist explícita suporta HS256/HS384/HS512 com pelo menos32/48/64bytes respectivamente. S1-05 deverá alinhar o emissor a essa convenção. Guard no startup exige tenant não vazio, issuer/audience, chave compatível, algoritmos e conexão; não há defaults nem segredo real versionado. Middleware autentica antes da leitura JSON manual estrita, mapeando falhas para Problem sem dados internos. TimeProvider.System define horário UTC; store/handler/auth são registrados em DI.

Código congelado após Green focado; próximo passo Graphify update e gate Feature das quatro suítes sobre snapshot identificado pelo runner. Nenhum teste A1/intenção QA foi alterado pelo Backend. O ajuste de contagem do teste legado foi realizado e verificado pelo QA separadamente. Gate completo/revisão independente ainda pendentes; nenhuma liberação, commit ou push.

### Feature completo — resultado final do Backend

Comando: `pwsh -NoProfile -File scripts/test-backend.ps1 -Level Feature -Configuration Debug -NoRestore`. Exit0, conclusion passed, sem blockers/stageFailures. Build da solução0errors0warnings17,30s. Execução serial das quatro suítes com PostgreSQL17/Testcontainers real; não houve InMemory/SQLite, teste ignorado ou substituição do handler de autenticação. Artefatos em `artifacts/quality/backend/20261007-003109-90ada1f5/` (summary.json, run-source.json, quatro TRX e Cobertura); log `artifacts/green/s1-04a1/feature.log`.

| Suíte | Executados | Aprovados | Falhas | Skips |
| --- | ---: | ---: | ---: | ---: |
| Architecture | 3 | 3 | 0 | 0 |
| Domain | 48 | 48 | 0 | 0 |
| Application | 7 | 7 | 0 | 0 |
| Integration | 196 | 196 | 0 | 0 |
| Total | 254 | 254 | 0 | 0 |

Domain100% de cobertura de linhas,65/65instrumentadas. Os105casos A1 estão incluídos nas196integrações; o recorte focado anterior105/105 não é somado novamente ao total. Métodos/contagens extraídos de TRX em artifacts/green/s1-04a1/focused/method-results.json. PEND-01..11 verdes por assertions alcançadas; o histórico Red permanece nas seções anteriores e no relatório QA.

Identidade testada: HEAD `3c79fafb02cdfc1c6787584905d1e76e28d37ed6`, branch `feature/s1-04a-pending-profiles`, workingTreeDirty=true; snapshot `f4fa97bc6e34748eac9831cf7fbf617c8cc53a7e146e3e366e383e9ce67d9840`, confirmado sem mudança pelo runner. Não é revisão de release/commit imutável. Graphify atualizado depois de congelar código:1352nós/2376arestas/107comunidades, log graphify-update.log; nenhum grafo/cache versionado.

Esta seção e atualização de estado/resultado foram gravadas depois do gate, alterando o fingerprint documental. Não houve mudança de código, testes ou contrato executável depois do freeze/gate. Lista de hashes técnicos antes do gate em artifacts/green/s1-04a1/technical-source-hashes.json; conferência e identidade posterior aos registros em technical-integrity.json e source-after-docs.json, nesse mesmo diretório ignorado. Revisão independente deve identificar a candidata final e comparar essas evidências; qualquer mudança técnica posterior exige verificações afetadas novamente.

Limites/riscos da passagem: configuração e segredos reais ainda pertencem ao ambiente futuro; chave HMAC/allowlist/issuer/audience deverão ser alinhados ao emissor de S1-05. Sessões/revogação de sessão, login, concessões, ativação, SMTP, recuperação e frontend não estão implementados. Auditoria de criação usa apenas proveniência inicial, sem nova ação no ledger. Os testes de cancelamento existentes comprovam wrapper/reader; não há cenário dedicado que interrompa o novo handler após INSERT. Tokens/sessões não possuem store nesta base, portanto não afirmar teste de ausência de escrita em store inexistente. A corrida comprova201/409/linha única via INSERT/constraint, sem impor interleaving determinístico. Migration Down remove proveniência; só é autorizado em banco descartável, sem estratégia de rollback de dados de produção presumida.

Checkout liberado pelo Backend para QA de Green/revisão independente do diff, com registros/evidências reais. Não houve commit, push, merge, deploy ou alteração frontend. A1 validado pelo gate não significa integração em develop nem S1-04A/MVP/Sprint concluídos. Próxima passagem é revisão independente; não iniciar A2 automaticamente.

## Compatibilidade da regressão de migration — QA

S1-04A1 adiciona corretamente migration incremental de proveniência. QA ajustou apenas as assertions de IdentityAuditMigrationTests.Migrate_BancoComIdentityAnterior_PreservaDadosEReaplicacaoSegura: exige os IDs InitialIdentity e AddIdentityAudit aplicados, em vez de fixar total2/posição1. Preservadas migração desde InitialIdentity, reaplicação, dados existentes e tabela audit vazia. Não alterados produção, aceites A1 ou intenção de auditoria. Execução focada será coordenada após Backend disponibilizar a migration e liberar o checkout para build/test; Feature não será reexecutado neste complemento.

Compatibilidade de migration verificada: filtro Migrate_BancoComIdentityAnterior_PreservaDadosEReaplicacaoSegura passou com PostgreSQL17 real,1 aprovado/0 falhas/0 ignorados, exit0. Reutilizado build Backend0 erros/0 warnings (92,95s), com AddPendingProfileProvenance e assertion atualizada compiladas. QA não executou build adicional nem Feature. TRX/log/metadata/hashes/diff em artifacts/qa/s1-04a1-migration-compat; Backend retomou o recorte A1 após encerramento do filtro. Resultado comprova somente essa regressão de aplicação/reaplicação/preservação; Green/gate combinado/revisão do incremento continuam pendentes.
