# S1-03B — QA de auditoria de acesso

Estado: Red e Green focados concluídos; Feature final passou 149/149 e revisão independente aprovou o snapshot. Pronto para integrar em develop; evidências abaixo distinguem cada etapa e seus limites.
Base: develop `ca5e37865a875504c09d51c30603c3f53dbe4011`; branch `feature/s1-03b-audit`.
Escopo: AC-14 e AU01–09. PostgreSQL 17 real via fixture existente; runtime não proprietário, sem BYPASSRLS. QA escreve testes; Backend implementa produção. Builds, testes e grafo serializados pelo SM.

## Catálogo de cenários e resultados esperados

Contrato alinhado em backend/docs/IDENTITY_AUDIT.md: IdentityAuditEvent, IIdentityAuditWriter.AppendAsync, PostgreSqlIdentityAuditWriter e tabela identity.auditoria. Os nomes abaixo descrevem os cenários; a evidência identifica os métodos efetivos executados. Contagens não substituem os resultados de cada cenário.

| Aceite | Nome do teste/cenário | Resultado esperado |
| --- | --- | --- |
| AU01 | Create_AcoesValidas_RegistraIdentidadeEscopoEHorarioUtc | Concessão e revogação empresarial/filial e bloqueio produzem ID, tenant, autor, alvo, ação, horário UTC e escopo pertinente. |
| AU02 | Create_IdsVazios_Recusa | ID do evento, tenant, autor e alvo vazios são recusados; filial vazia quando fornecida também. |
| AU02 | Create_AcaoOuPapelDesconhecido_Recusa | Valores desconhecidos dos enums são recusados. |
| AU02 | Create_EscopoIncompativel_Recusa | Bloqueio sem papel/filial; papel empresarial sem filial; papel de filial exige filial; concessão/revogação exige papel válido no escopo. |
| AU02 | SqlAdmin_IdsEnumsEscoposInvalidos_CheckRecusa | Checks do PostgreSQL recusam o mesmo conjunto aplicável sem depender da validação do domínio. |
| AU03 | SqlAdmin_AutorAlvoFilialExternosOuInexistentes_FkCompostaRecusa | Autor, alvo e filial de outro tenant ou inexistentes são recusados por FK composta, isolando a prova de RLS. |
| AU03/AU05 | SqlRuntime_InsertOutroTenant_RlsRecusa | WITH CHECK recusa evento de tenant B sob contexto A. |
| AU04 | SqlRuntime_PrivilegiosAuditoria_SomenteSelectInsert | SELECT/INSERT permitidos; UPDATE/DELETE/TRUNCATE negados, runtime sem ownership/membership/admin. |
| AU04 | SqlAdmin_UpdateDeleteTruncate_TriggerRecusaEPreservaRegistro | Admin exclusivo do container possui privilégio para operar e triggers recusam cada mutação; registro permanece intacto após rollback da tentativa. |
| AU05 | SqlRuntime_LeituraTenantA_NaoRetornaTenantB | SQL direto retorna apenas A mesmo quando B possui auditoria. |
| AU05 | SqlRuntime_ContextoAusenteOuMalformado_FalhaFechado | Ausência não expõe registros e recusa insert; valor malformado não permite leitura ou escrita. |
| AU05 | EfAdmin_SemRls_FiltroGlobalIsolaAuditoria | EF sobre conexão admin só retorna tenant do contexto; IgnoreQueryFilters prova existência de B. |
| AU06 | Append_AlteracaoERegistro_CommitConfirmaAmbos | Alteração demonstrativa de acesso/estado e evento tornam-se persistentes juntos após commit do wrapper do chamador. |
| AU06 | Append_SemCommit_RollbackReverteAmbos | Append não faz autocommit; descarte/rollback desfaz alteração e evento. |
| AU06 | Append_FalhaSqlPosterior_ReverteAmbos | Erro real de SQL após append aborta a transação e não deixa alteração/evento residual. |
| AU06 | Append_Cancelamento_ReverteAlteracaoESemEvento | CancellationToken cancelado propaga cancelamento; descarte do wrapper não deixa alteração nem evento. |
| AU07 | Append_SemWrapperValidado_RecusaAntesDePersistir | Ausência de transação validada recusa append. |
| AU07 | Append_TransacaoExternaSemWrapper_RecusaAntesDePersistir | Database.BeginTransaction externo não equivale ao wrapper; writer recusa. |
| AU07 | Append_TenantDivergente_RecusaAntesDePersistir | Evento B ou null sob wrapper próprio validado é recusado, reverte alteração anterior e impede Commit posterior. Transação externa não reconhecida permanece intacta. |
| AU08 | ContratoAuditoria_PropriedadesTipadas_SemCredenciaisOuPayloadLivre | Entidade/contrato/colunas não expõem senha, hash, token, e-mail ou JSON/texto livre; reader/snapshot existente mantém provas de ausência de credenciais. |
| AU09 | Migrate_BancoComIdentityAnterior_PreservaDadosEReaplicacaoSegura | Banco isolado no container recebe migration anterior, dados Identity, migration incremental e reaplicação sem perda de dados. |
| AU09 | Migrate_ModeloCompleto_SeisTabelasComRlsChecksEFks | Catálogo existente passa a exigir seis tabelas e mantém RLS forçada/checks anteriores; auditoria também exige proteção. |

## Retrocompatibilidade e metodologia

- Atualizar ExpectedTables de cinco para seis, preservando exigências de RLS/checks; não aceitar ausência condicional.
- Conceder auditoria ao runtime apenas com SELECT/INSERT em IdentityTestData; grants existentes Identity preservados.
- TRUNCATE é tentado como admin exclusivamente no container descartável, nunca sobre ambiente externo.
- Migration incremental usa banco isolado no mesmo container para não regredir o schema compartilhado da coleção.
- Evidência Red exige compilação e fixture saudáveis. NotImplementedException na rota contratada é comportamento ausente; não comprova SQL/check/trigger ainda não alcançado.
- Executar ciclo focado com slot coordenado. Feature completo apenas na candidata congelada após grafo, com quatro suítes reais, Domain ≥90% e build sem warnings.

## Evidências

- Primeiro build: dotnet build FaturaOtica.slnx --no-restore -c Debug; exit 1 sem diagnóstico útil (0 avisos/0 erros). Não conta como Red.
- Única repetição de diagnóstico: build serial -m:1 --disable-build-servers -v:normal, log artifacts/s103b-build-red.log. Exit 1; 0 avisos, 1 erro CA1861 em IdentityAuditEventTests.cs:71 (array constante de propriedades esperado). Não conta como Red; testes ainda não executados e fixture ainda não verificada nesta execução.
- Correção test-only autorizada pelo SM: array ExpectedProperties movido para campo static readonly; nenhuma mudança de intenção/produção. Compilação corrigida com dotnet build FaturaOtica.slnx --no-restore -c Debug -m:1 --disable-build-servers -v:minimal -flp:logfile=../artifacts/s103b-build-red-corrected.log: exit 0, zero avisos e erros, 18.62s.
- Pendente após compilação: execução focada Domain/Application/Integration; Feature completo reservado ao snapshot final congelado.
- Observações preliminares do revisor para completar antes do gate final: wrapper encerrado por Commit/Dispose antes de Append e cancelamento de Commit após Append bem-sucedido. Cenário atual de cancelamento é token pré-cancelado no Append; não alegar prova de cancelamento de Commit.

## Uso do grafo

Foi executado scripts/graphify.ps1 query "IdentityTenantTransaction IdentityDbContext AccessRole" --budget 1200. O retorno apontou AccessPolicy.cs, BeginAsync/CommitAsync/IsValidFor do wrapper, DbContext.OnModelCreating e fixtures; guiou a leitura desses trechos e a reutilização da transação validada. Limitação: regras e alguns testes/fixtures já tinham sido lidos antes da consulta; não se afirma que a consulta precedeu toda a navegação. O grafo estático não prova execução de PostgreSQL. Atualização final permanece serializada pelo SM após alterações de código.


## Red executado — 2026-10-06

Primeira tentativa Domain no sandbox padrão anunciou a assembly e não concluiu descoberta/resultados por mais de 90s; foi interrompida sem TRX. Isto não contou como Red. Histórico desta sprint já registra bloqueio semelhante da comunicação local VSTest; a retomada controlada com permissão fora da sandbox fez o runner concluir.

Build pré-Red: `dotnet build FaturaOtica.slnx --no-restore -c Debug -m:1 --disable-build-servers -v:minimal`; exit 0, 0 avisos, 0 erros, 18,62s.

Comando executado da pasta `backend`:

`dotnet test tests/FaturaOtica.Integration.Tests/FaturaOtica.Integration.Tests.csproj --no-build --no-restore -c Debug --filter FullyQualifiedName~IdentityAudit --logger "console;verbosity=normal" --logger "trx;LogFileName=identity-audit-red.trx" --results-directory ../artifacts/s103b-integration-red`

A execução foi concedida fora da sandbox devido ao impedimento VSTest observado. Fixture Docker/PostgreSQL 17 iniciou e passou readiness. Foram descobertos e executados 30 casos; TRX `artifacts/s103b-integration-red/identity-audit-red.trx`; exit 1; 30 falhas, 0 êxitos, 0 skips; duração 1m14s.

| Método/casos | Esperado | Resultado real |
| --- | --- | --- |
| `Append_AlteracaoERegistro_ConfirmamOuRevertemJuntos` (4) | Append só persiste junto ao commit/rollback do chamador e falhas/cancelamento abortam wrapper | Todos chegaram a `NotImplementedException` no writer; Red confirma writer ausente, ainda não prova rollback. |
| `Append_InsertFalha_ReverteAlteracaoEImpedeCommit` (1) | Falha real de SQL aborta unidade de trabalho | `NotImplementedException` antes do INSERT; erro ainda não exercitado. |
| `Append_SemWrapperOuTransacaoExterna_RecusaAntesDePersistir` (2) | Recusa `InvalidOperationException` e preserva transação externa | Stub lançou `NotImplementedException`; writer não implementado. |
| `Append_TenantDivergenteOuEventoNull_ReverteAlteracaoEImpedeCommit` (2) | Recusa, desfaz estado e impede Commit após falha | Stub lançou `NotImplementedException`; atomicidade ainda não exercitada. |
| `Migrate_BancoComIdentityAnterior_PreservaDadosEReaplicacaoSegura` (1) | Duas migrations aplicadas com dados existentes preservados | Apenas uma migration no assembly; migration incremental ausente. |
| `SqlAdmin_IdsEnumsEscoposInvalidos_CheckRecusa` (9) | SQLSTATE/constraint de check esperado | PostgreSQL real retornou `42P01`, tabela `identity.auditoria` inexistente; checks individuais não exercitados. |
| `SqlAdmin_AutorAlvoFilialExternosOuInexistentes_FkCompostaRecusa` (6) | SQLSTATE/FK composta esperados | PostgreSQL real retornou `42P01`, tabela inexistente; FKs individuais não exercitadas. |
| `SqlAdmin_UpdateDeleteTruncate_TriggerRecusaEPreservaRegistro` (3) | Trigger recusa UPDATE/DELETE/TRUNCATE e preserva ledger | PostgreSQL real retornou `42P01`; trigger/imutabilidade não exercitados. |
| `SqlRuntime_EfAdmin_LeiturasIsolamTenantEContextoAusenteFalhaFechado` (1) | Filtro EF e RLS isolam leituras | PostgreSQL real retornou `42P01`; leitura da tabela nova não exercitada. |
| `SqlRuntime_PrivilegiosAuditoria_SomenteSelectInsert` (1) | Role operacional apenas SELECT/INSERT | PostgreSQL real retornou `42P01`; grants da tabela nova não exercitados. |

O Red saudável confirma ausência da migration/tabela e da implementação Append. Não declarar as regras SQL individuais provadas até cada teste falhar pelo SQLSTATE/constraint alvo na candidata incompleta ou passar no Green. Green liberado para implementar o incremento; Domain/Application e migração/DB voltam a rodar focados após as mudanças. Sem Feature completo, commit ou revisão nesta passagem.
## Ajuste QA de dois casos sobrepostos e Green focado

Primeiro Green Integration do Backend: 28/30 passaram, zero skips; os dois casos abaixo retornaram SQLSTATE `23514` por `ck_auditoria_escopo`. Isso já demonstrava rejeição; a expectativa de precedência de constraints no teste estava incorreta.

| Caso/input anterior | Esperado anterior / real | Ajuste autorizado e resultado novo |
| --- | --- | --- |
| `BlockUser`, papel `Unknown`, filial NULL | Esperava `23514` / `ck_auditoria_papel`; real `23514` / `ck_auditoria_escopo` | Papel desconhecido inevitavelmente viola também escopo, cuja expressão enumera todos os papéis válidos. Mantido o input; exigir `23514` sem constraint nomeada. No mesmo teste, consultar catálogo e exigir CHECK validada `ck_auditoria_papel`, contendo a alternativa NULL e os quatro papéis permitidos. Passou a recusa e a prova do catálogo. |
| `BlockUser`, papel NULL, filial UUID vazio | Esperava `23514` / `ck_auditoria_filial_id_nao_vazio`; real `23514` / `ck_auditoria_escopo` | Input passa a `GrantAccess`, papel `Seller`, filial UUID vazio. Escopo é estruturalmente válido e o UUID vazio viola a invariável de ID. Passou exigindo `23514` / `ck_auditoria_filial_id_nao_vazio`. |

A adaptação foi aceita pelo SM. Não foram removidos exemplos, relaxados checks de produção ou modificadas migrations. Backend não editou os testes.

Após slot Domain liberado, QA executou serialmente da pasta backend, fora da sandbox por bloqueio de comunicação VSTest observado anteriormente:

`dotnet test tests/FaturaOtica.Integration.Tests/FaturaOtica.Integration.Tests.csproj --no-restore -c Debug -m:1 --disable-build-servers --filter FullyQualifiedName~IdentityAudit --logger "console;verbosity=normal" --logger "trx;LogFileName=identity-audit-green-corrected.trx" --results-directory ../artifacts/s103b-integration-green-corrected`

Exit 0; compilação do projeto e dependências aprovada; PostgreSQL 17 real no Docker 29.1.3 saudável; TRX `artifacts/s103b-integration-green-corrected/identity-audit-green-corrected.trx`; 30/30 aprovados, zero falhas/skips, 30,3776s totais. Os mesmos métodos/casos da tabela Red acima passaram: transações 9/9 (incluindo pre-cancel, SQL posterior, INSERT inválido, null/divergência e transação externa preservada), migration incremental 1/1, checks 9/9, FKs 6/6, triggers UPDATE/DELETE/TRUNCATE 3/3, EF/RLS 1/1 e privilégios runtime 1/1. Agora esses cenários atingiram as proteções reais do banco e as rotas implementadas.

Domain Green executado pelo Backend antes deste slot: 27/27 aprovados, zero skips, TRX `artifacts/s103b-domain-green/identity-audit-domain-green.trx`. É validação após implementação; não houve Red Domain separado concluído.

## Gate Feature final e limites

Snapshot final: HEAD `ca5e378`, sourceSnapshotHash `cda41539834e77a18111f3392ddd88cffcf6f6040d8469a2f39d94c9ba1731ec`; run `20261006-224137-6492a6ae`. Build Release: 0 avisos/0 erros; Architecture 3/3, Domain 48/48, Application 7/7, Integration 91/91; total 149/149, zero falhas/skips. Cobertura Domain 100% (62/62 linhas). Artefatos: `artifacts/quality/backend/20261006-224137-6492a6ae`.

Revisão independente aprovou o snapshot para integração sem defeito bloqueante. Não foram casos separados: append após wrapper já encerrado por Commit/Dispose e cancelamento de Commit após append bem-sucedido. Não declarar esses dois limites como testados. A suite Integration executou PostgreSQL 17 real via Docker 29.1.3; nenhuma rota, DI operacional, login, SMTP ou UI foi adicionada nesta fatia.
