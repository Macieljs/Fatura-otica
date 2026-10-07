# Sprint 01 — acompanhamento do Scrum Master

Data: 2026-10-06. Estado da sprint: em execução; conclusão funcional ainda bloqueada.

## Estimativa de conclusão

- O estado anterior registrava S1-01/02/03 integrados: 3/7 (≈43%) por contagem igual dos marcos. Em 2026-10-06 o escopo do MVP foi replanejado; esse número não estima esforço nem proximidade funcional e deixa de ser indicador atual. S1-04/05, integração frontend e candidata final seguem pendentes.

## Estado atual — 06/10/2026

- Decisão do Product Owner: SMTP de ativação e recuperação self-service foram adiados para pós-MVP. Ativação segue necessária, com link/token de uso único gerado pelo backend, exibido uma vez a administrador autorizado e entregue manualmente por canal externo. O administrador pode revogar e reemitir link sem ver/definir a senha. Não relaxar hash, validade, uso único, auditoria ou autorização.
- Incremento S1-04A1 Green/revisão: Feature passou 254/254, Domain100%65 linhas, build0warning/0error; QA Red 92 casos + PEND-11 focal13, sem erros de ambiente. Revisor independente GPT-6.1 Sol aprovou snapshot técnico `f4fa97bc6e34748eac9831cf7fbf617c8cc53a7e146e3e366e383e9ce67d9840`, sem achados bloqueantes e com 59 hashes técnicos conferidos. Parecer e limites em `S1-04A1-REVIEW.md`. Branch `feature/s1-04a-pending-profiles` aguarda commit/integrar em develop e CI remoto; main/MVP/sprint continuam pendentes.
- S1-04B ativação manual e login/sessões seguem MVP; S1-04C SMTP e S1-05D recuperação ficam pós-MVP. Ver recorte revisado em `SPRINT-01-IDENTITY.md` e `INCREMENTAL_EXECUTION.md`.

- S1-03B: contrato interno e testes de auditoria registrados em `S1-03B-AUDIT.md`, branch `feature/s1-03b-audit`. Build Debug da solução aprovado após correção de analyzer somente no teste: 0 warnings/0 errors em 18,62s.
- Red funcional de Integration executado fora da sandbox: PostgreSQL 17 e fixture passaram readiness; 30 testes, 30 falhas, 0 êxitos/skips, TRX `artifacts/s103b-integration-red/identity-audit-red.trx`, ~1m14s. Writer stub causou `NotImplementedException`; migração/tabela ausentes causaram migration count 1 em vez de 2 e SQLSTATE `42P01`. Testes de check/FK/RLS/trigger que bateram na relação ausente ainda não comprovam seus critérios específicos. Relatório por método em `S1-03B-QA.md`.
- Green focal e Feature final aprovados: Feature 149/149, zero skips/falhas; Architecture3, Domain48 (100% de 62 linhas), Application7, Integration91. QA isolou papel desconhecido por SQLSTATE23514 sem amarrar a ordem de CHECKs; filial vazia confirmou `ck_auditoria_filial_id_nao_vazio`. Revisão independente aprovada. Merge local em develop `9fd17be` com tree `c1f160b`, igual à tree da feature revisada. CI remoto passou em ambos os jobs: https://github.com/Macieljs/Fatura-otica/actions/runs/37543048845. Runner default no sandbox travou, e a execução fora da sandbox concluiu com TRX.
- Roteamento de modelos: `docs/MODEL_ROUTING.md` agora explicita GPT-6 Luna como padrão para backend comum de baixo risco com aceite fechado e GPT-6.1 Sol para arquitetura, segurança, RLS, migrations e revisão crítica. Esta fatia usa Sol pelo risco. Economia em tokens ainda não medida.
- Manutenção documental: a cada transição, atualizar spec, este status e o registro QA/implementação/revisão correspondente; regra incorporada em `docs/AGENT_WORKFLOW.md` e `.agents/rules/agent-workflow.md`.

## Base e execução

- Base empresarial/spec: `docs/sprints/SPRINT-01-IDENTITY.md`, autorização do usuário registrada.
- `develop` criada e publicada em origin; commit inicial do workflow `8a60e57692f2abcfc8cb63c6331e26a41465d7cc`.
- Checkout de integração: `work/develop`. Implementação: `work/sprint-01-identity`, branch `feature/sprint-01-identity`.
- Checkout frontend original preservado em main; a frente frontend precisa usar branch de tarefa/worktree próprio a partir de develop para as próximas entregas.
- Papéis ativos: SM coordenador; Backend contrato/produção; QA test-first; revisor independente workflow/código.

## Passagens comprovadas

1. Spec/BDD autorizados e versionados.
2. Contrato/modelagem S1-01 entregues pelo backend; OpenAPI planejado, não endpoints funcionando.
3. QA Red S1-02: Domain21 executados/21falhas; Application6/6falhas; sem skipped. Compilação aprovada, falhas NotImplementedException de comportamento ausente. Logs/TRX em artifacts/qa/s1-02-red no checkout da tarefa.
4. SM liberou Green somente para o núcleo de políticas de acesso S1-02. Implementação validada: Domain21/21, Application6/6 e Architecture3/3; build0warnings0errors; Domain100%33/33linhas.
5. Revisão independente do workflow aprovada sem inconsistência bloqueante da spec; revisão independente do núcleo S1-02 aprovada, com hashes e evidências no parecer da branch feature.

## CI remoto observado

Execução: https://github.com/Macieljs/Fatura-otica/actions/runs/37485593867
SHA: `8a60e57692f2abcfc8cb63c6331e26a41465d7cc`.
Frontend quality: success. Backend quality: failure na etapa Behavioral tests and coverage, exit1. Os logs completos exigiram autenticação (API403); não afirmar causa detalhada apenas pela anotação. Suítes funcionais vazias na base são um impedimento local conhecido e o gate Feature permanece obrigatório. Vercel Preview Comments: success não comprova deploy da API.

## Obstáculos detectados e tratamento

| Obstáculo | Tratamento/estado |
| --- | --- |
| Analyzer CA1711 no nome AccessPermission | Backend e QA renomearam contrato para AccessAction. Compilação passou; erro de build não foi aceito como Red. |
| Builds simultâneos compartilhando DLL no checkout | QA passou a executar suites em sequência. Dev aguarda QA encerrar antes do próprio build. Worktree separa frontend/backend, não torna builds simultâneos na mesma árvore seguros. |
| Docker Desktop sem motor Linux | Tentativa start sem progresso interrompida; status/info continuam sem servidor. PostgreSQL real/AC13 e conclusão funcional bloqueados. |
| SMTP real sem configuração | Canal automático SMTP aprovado. Contrato pode avançar; host/porta/remetente/segredos externos e captura local/entrega real ainda precisam ser configurados e verificados. |
| Integração frontend em outro terminal | Entregar contrato e critérios à frente; não editar suas telas. Cliente gerado/fluxo integrado/manual ainda pendentes. |
| Proteções de branches sem comprovação | CI aciona develop/main; revisão obrigatória/proteções precisam ser configuradas/verificadas no provedor antes de promover candidata estável. |

## Próximos passos

- Núcleo S1-02 concluído nesta etapa de início: código testado/revisado e publicado em feature/sprint-01-identity, commit55ea2cd. Não representa endpoints ou sprintDone.
- Persistência/RLS com PostgreSQL real, cadastro/ativação SMTP, autenticação/sessão/recuperação e integração frontend seguem no backlog da sprint.
- Código parcial permanece na branch de tarefa; não promover candidata funcional a develop/main sem gates aplicáveis e evidências da combinação.
- Não houve merge de develop para main ou publicação autorizada pelo SM nesta sprint.

## Verificações finais desta etapa

- Red → Green → QA → revisão independente executados para o núcleo de autorização.
- Branch feature publicada, sem merge funcional para develop/main. Contrato amplo possui14operações planejadas; nenhuma dessas operações HTTP foi implementada nesta etapa.
- Coletor de cobertura produz cópia de attachment do mesmoXML. O gate foi corrigido pelo QA para deduplicar por SHA256 antes de parse, mantendo ambiguidade para conteúdos distintos.5fixtures do mecanismo verificadas, revisão independente aprovada; não são testes funcionais.
- A restrição de comunicação local VSTest/datacollector no sandbox causou timeout90s. Executar as suites com permissão adequada resolveu; testes/gates não foram enfraquecidos.
- Modelo: agentes desta etapa herdaram o modelo do chat. É possível escolher modelos por tarefa mediante instrução do usuário; nenhuma troca de modelo foi aplicada nesta etapa.
- Próximo passo: disponibilizar PostgreSQL real (Docker local ou execução remota controlada) e implementar S1-03/04/05 com QA Red, incluindo SMTP com captura local. Entrega real de e-mail requer configuração de destino externo; não confundir falta de credenciais de produção com impossibilidade de testar o adaptador.
## Política de execução adotada

A partir deste refinamento, o SM executa um incremento pequeno por run e registra a próxima ação ao encerrar. Roteamento de modelos em docs/MODEL_ROUTING.md; plano de incrementos em docs/INCREMENTAL_EXECUTION.md. Primeiro apoio simples delegado explicitamente a gpt-6-luna, esforço medium, contexto novo restrito: conferência de links/coerência da política; resultado sem inconsistência concreta. Nenhum agente crítico existente foi trocado. Economia de consumo não foi medida.

Docker info foi rechecado neste refinamento e o motor Linux permanece indisponível. Próximo alvo: disponibilizar ambiente de PostgreSQL real como tarefa delimitada e então executar S1-03A; não iniciar toda a sprint de uma vez.

Revisões desta política: apoio documental solicitado explicitamente a gpt-6-luna (medium/contexto restrito), sem inconsistência concreta; revisão de limites de execução/integração pelo agente independente do modelo principal, parecer favorável. Confirmação da dependência55ea2cd fora de develop; nenhuma redução de Feature/DoD nem implementação de outra etapa nesta run.

## Retomada S1-03A em 2026-10-06

- Branch de tarefa: feature/s1-03a-persistence; base atual 7e0428c incorpora núcleo55ea2cd e develop5154670.
- Docker Engine disponível: versão29.1.3 confirmada após iniciar Docker Desktop. O bloqueio histórico do motor Linux acima foi resolvido; fixture PostgreSQL real e testes ainda pendentes.
- Backend e QA retomados após interrupção por limite de uso. Contrato e skeletons precedem Red funcional; não há implementação de persistência aprovada nem rotas Identity prontas para integração.
- Checkout original observado em feature/frontend-sprint-25 na preparação deste incremento; não alterar branch/arquivos do terminal frontend.


## Validação técnica S1-03A

- Persistência Identity, migration, RLS/filtros/FKs e reader atual implementados na branch feature/s1-03a-persistence.
- PostgreSQL17 real: Green Integration61/61. GateFeatureRelease91/91 testes, 0skips, build0warnings0errors, Domain100%31linhas. Snapshot233246f6d9d6a3bf28a6d1ce4cfb4522f0581d168837b69793ef2932f55988b1.
- QA técnico e revisão independente aprovados; parecer S1-03A-CODE-REVIEW.md. Incremento interno validado na branch de tarefa. Integração em develop ainda pendente neste registro.
- Nenhuma rota Identity/DI operacional/login/SMTP entregue pelo recorte. Próxima tarefa planejada S1-03B auditoria de alterações de acesso; não iniciada automaticamente.

## Fechamento S1-03A — integração local aprovada

- Commitfeature6033823 publicado; candidata local develop7d2c205 aprovada e limpa durante o gate. Próximo commit somente documental registra este fechamento; conferência remota após push ainda necessária.
- BuildRelease0warnings0errors (57,99s), Architecture3/Domain21/Application6/Integration61 (91/91),0skips,Domain100%31linhas. Evidências artifacts/quality/backend/20261006-173451-a4338108; snapshotb310ddf8ef3a68e5cdc839a46d578ae19d78dac20ac0390afeb82ad926a90ab8.
- Frontendlint/build aprovados, árvorefrontend inalterada. Parecer independente de integração aprovado em S1-03A-INTEGRATION-REVIEW.md. Main e checkoutfrontend externo preservados.
- ConectorGitHub autenticado recusou criaçãoPR com403/permissão insuficiente. NenhumPR criado; não confundir ausênciaPR com aprovaçãoGitHub ou proteção de branches comprovada.
- Custos observados: instalação frontend5min; compilaçãoNext42s+TypeScript35,8s; build integradoRelease57,99s; IntegrationGreen12s. Houve setupDocker/imagens/restore inicial, conflitoEF e interrupção por limite de uso antes da retomada. Builds serializados e gates em feature/candidata também aumentaram a duração.
- Preparação de ambiente concluída, dependências disponíveis nos checkouts e incremento interno encerrado. Próxima run S1-03B; não foi iniciada nesta execução. Login/cadastro/SMTP e integração de rotas seguem pendentes.

## Início S1-03B — auditoria de acessos

- Autorização de continuidade mantida; escopo AU01-09 em S1-03B-AUDIT.md. Branch feature/s1-03b-audit a partir de origin/develop ca5e378.
- Checkout backend limpo reaproveitado, ambiente Docker29.1.3/SDK10.0.203 disponível e dependências em cache. Backend/QA/revisor principais delegados; autor/revisor distintos.
- Próxima passagem: contrato/modelagem → QA Red → Green focado → Feature final/revisão → integração/CI. Nenhum endpoint, SMTP ou tela neste recorte.
- S1-03A está publicado em develop ca5e378; Quality37505523256 concluiu Frontend/Backend success. Falha de criaçãoPR403 no conector permanece limitação conhecida; não repetir autenticação/permissão sem mudança de evidência.


## S1-04A1 — QA Red em execução (2026-10-06)

- Contrato fechado; QA escreve somente testes e registros. Risco crítico (bearer/autorização/tenant/RLS); modelo GPT-6.1 Sol herdado.
- Docker 29.1.3 confirmado com acesso adequado à named pipe; falha inicial de permissão do sandbox não representa PostgreSQL indisponível.
- Superfícies novas Application/Domain ainda ausentes; prioridade API real + migration/PostgreSQL, sem implementar produção. Red funcional e regressões ainda não executados.
- Evidências serão gravadas em artifacts/qa/s1-04a1-red; próximo responsável Backend somente após a passagem Red.


## S1-04A1 — QA Red concluído (2026-10-06)

- Estado do incremento: qa-red-complete, sem Green/liberação. Três arquivos novos somente de teste, contrato/produção preservados; report S1-04A1-QA.md e critérios mapeados na spec.
- Build final0warnings0errors8,87s; runner Feature build10,53s. PostgreSQL17 real/runtime NOBYPASSRLS; Docker29.1.3. Snapshot a5161af368c29a30850733dbc87ee4e1aa294175b9401d76fb10702a127d9b12 sobre3c79faf.
- Feature executado exit1 esperado: Architecture3/3,Domain48/48,Application7/7,Integration183 (96aprovados/87falhas),0skips; total241 (154aprovados/87falhas). Novos92:5aprovados/87falhas; regressões anteriores149/149 verdes. CoberturaDomain100%65/65linhas.
- 87 falhas funcionais:81POST404;1OpenAPI sem rota;1modelo sem propriedade;4guards de catálogo sem proveniência. FixtureJWT e4cenários do authorizer atual passaram. Readiness/fixture/compilação finais passaram; falhas iniciais de preparação não foram usadas como Red.
- As assertions de comportamento específicas após status/coluna ainda não foram alcançadas. Report registra limites e não declara criação, constraints, grant zero,401/403, rollback do endpoint ou corrida de índice já validados.
- Evidências artifacts/quality/backend/20261006-234556-d2b3979e e artifacts/qa/s1-04a1-red. Próximo responsável Backend Green preservando contrato/testes, completando testes de superfícies adicionais antes do código; depois QA/gateFeature/revisão independente. Sem commit/push/deploy nesta passagem QA.

## S1-04A1 — PEND-11 QA Red complementar em execução

- SM adicionou PEND-11: configuração JWT obrigatória ausente/inválida deve falhar fechada, sem defaults/fallback.
- QA adicionará teste de startup ou recusa explícita por configuração e executará somente o filtro novo. A execução Feature anterior permanece evidência histórica; não representa a revisão com novos testes.
- Testes anteriores preservados. Sem alteração em produção/contrato e sem Green.

- PEND-11 primeira execução:8 falhas funcionais e5 falhas de verificação da fixture (host normalizou null para vazio), não usadas como Red. QA corrige somente injeção de configuração ausente; repetição do mesmo filtro em andamento.

## S1-04A1 — PEND-11 QA Red complementar concluído

- 13 casos executados/13 falhas funcionais/0 aprovados/0 ignorados, após corrigir exclusivamente a fixture que normalizava null em vazio. Primeira tentativa preservada:8 Reds funcionais+5 falhas de fixture, não usadas como Red dos ausentes.
- Build focado final0 erros/0 warnings,1m04,71s. PostgreSQL17 real; valores exatos de configuração e JWT da fixture verificados. Todos os13 casos iniciaram API com health200 e POST404, sem mutação, em vez de startup failure por configuração ou recusa explícita500/503.
- Filtro PendingProfileConfigurationTests executado com exit1 esperado. Snapshot deb130e40ae62e0d4b2fe9f932b67a849154143eb7403ab315944baf857559ae; TRX/log/source/hashes/CSV/summary em artifacts/qa/s1-04a1-red/configuration. Spec/QA report atualizados.
- Limitação: comprova guard/recusa de configuração ausentes; não comprova token default aceito porque handler/rota não existem. Gate Feature anterior é histórico; sem novo gate combinado neste complemento. Atualmente105 novos casos preparados (92+13), Red em passagens separadas.
- Estado qa-red-complete; próximo responsável Backend Green preservando critérios/testes, seguido de QA/gate completo/revisão independente. Sem produção, commit/push ou Green nesta passagem QA.

## S1-04A1 — compatibilidade da regressão de migration

- QA ajustou somente a assertion antiga de IdentityAuditMigrationTests: exige InitialIdentity/AddIdentityAudit aplicadas sem congelar total2/posição da migration. Preservadas reaplicação e integridade dos dados; todos os aceites A1 mantidos.
- Migration incremental de A1 não deve invalidar o teste de auditoria anterior. Teste focado aguardando coordenação/liberação de build pelo Backend; sem nova execução Feature ou alteração de produção pelo QA. Incremento continua green-in-progress.

- Compatibilidade de migration encerrada: filtro legado passou1/1,0 falhas/0 ignorados, PostgreSQL17 real, exit0. Reutilizado build Backend0 erros/0 warnings92,95s com terceira migration A1; sem build/teste paralelo nem Feature novo pelo QA. TRX e hashes em artifacts/qa/s1-04a1-migration-compat. Backend avisado e já retomou o recorte A1; green-in-progress/gates/revisão do incremento permanecem pendentes.
