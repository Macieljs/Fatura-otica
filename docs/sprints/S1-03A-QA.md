# S1-03A — plano de QA de persistência

- Estado: QA técnico aprovado no snapshot local testado; gate Feature Release verde; revisão independente final pendente. Sem integração/deploy.
- Responsável: QA principal, testes antes da implementação.
- Base observada: `7e0428c7eaba1b0735f0bf95bc74b678ce00a136`, branch `feature/s1-03a-persistence`; snapshot local inclui documentos novos e deve ser identificado de novo em cada execução.
- Escopo: migration Identity, integridade, RLS, filtro EF, reader atual e contexto transacional. Não inclui endpoints, tokens, SMTP ou auditoria append-only.
- Referências: `S1-03A-PERSISTENCE.md`, ADR-0003/0005, `DATABASE_CONVENTIONS.md`, regras QA/TDD e DoD.

## Pré-condições e fixture

Usar xUnit e Testcontainers.PostgreSql já declarados no projeto Integration, PostgreSQL 17 conforme ADR-0003. Container e banco exclusivos desta suíte; porta publicada dinamicamente pelo Testcontainers. Não usar conexão de banco existente, SQLite, InMemory ou mock de banco. Não adicionar pacote ou alterar CI.

A fixture valida conexão e versão antes dos cenários, aplica migrations por conexão administrativa separada e cria role operacional exclusiva do teste, LOGIN, NOSUPERUSER, NOBYPASSRLS, NOINHERIT e sem propriedade das tabelas. Concede somente USAGE no schema e SELECT/INSERT/UPDATE/DELETE nas tabelas Identity necessárias. Não concede papel administrativo, DDL ou TRUNCATE. Senha/connection string não entram em relatório. Teste valida atributos e propriedade no catálogo, além de falha real de tentativa de acesso cruzado; conexão administrativa não é evidência de RLS.

Seed administrativo controlado cria tenants A/B com usuários, filiais e papéis distintos e casos Pending/Blocked, grant inativo e filial inativa. Usar IDs gerados na aplicação, por `Guid.CreateVersion7()`. Os asserts de isolamento operam pela conexão runtime. Asserts de FK composta usam admin somente para não deixar a RLS mascarar falha de integridade. Todas as mutações são de fixture no container descartável. SQL com parâmetros; testes negativos de constraint em transações separadas, rollback após cada erro PostgreSQL.

Execuções locais ficam serializadas por liberação do SM; nenhuma compilação/teste/grafo simultâneo no mesmo checkout. Logs/TRX/cobertura/snapshot em `artifacts/`, nunca relatórios fabricados ou resultados reaproveitados.

## Matriz de aceite

| ID / aceite | Cenário e ação | Resultado verificável |
| --- | --- | --- |
| DB01 / AC1 | Aplicar migration em banco vazio; consultar catálogos e novamente migrar | Schema Identity e tabelas mínimas presentes; histórico migration versionado; reaplicação sem perda de seed. UUID sem default gerador de ID; timestamps timestamptz; tenant obrigatório; nomes conforme convenções. |
| DB02 / AC1 | Mesmo e-mail normalizado em A e B; repetir em A | A/B aceitos; duplicado em A falha `23505`, constraint de e-mail identificada. Sem normalização que permita duplicata por case conforme contrato fechado. |
| DB03 / AC1 | Gravar status/papel desconhecido e papéis no escopo errado; IDs vazios/valores obrigatórios inválidos conforme contrato | Checks/nullability recusam valores, `23514`/`23502`; não tratar qualquer exception como sucesso. |
| FK01 / AC1,2 | Admin tenta grant com tenant A/usuário B; A/filial B; papel A/usuário B | Cada FK composta falha `23503` com constraint específica; vínculos legítimos A/A funcionam. |
| FK02 / AC1,2 | Grant/papel para referência ausente; tentar atualizar tenant ou referência de vínculo existente | Falha FK apropriada; rollback preserva vínculo inicial. Catálogo/definição conferem colunas compostas e índices que iniciam tenant. |
| RLS01 / AC2,5 | Consultar catálogo e identidade da conexão runtime | Role sem superuser/BYPASSRLS, não proprietária e sem herança administrativa; RLS habilitada e forçada em toda tabela tenant-scoped; tenants é exceção documentada. |
| RLS02 / AC2 | SQL direto runtime sob tenant A, sem usar query filter EF | SELECT retorna só A em usuários/filiais/papéis/grants; UPDATE/DELETE por ID de B afetam zero linhas; dados B permanecem intactos. |
| RLS03 / AC2 | INSERT de B sob contexto A e UPDATE de row A mudando tenant para B | WITH CHECK rejeita (`42501`); catálogo não substitui prova funcional; rollback limpa transação. |
| RLS04 / AC2,5 | Runtime sem GUC ou GUC vazio/malformado tenta ler/escrever | Fail closed: nunca retorna dados de A/B nem persiste linha; contrato define zero rows ou erro esperado para contexto ausente/inválido. |
| EF01 / AC2 | Consultar DbSets por EF em contexto A incluindo sem GUC sob admin controlado | Filtro global efetivamente exclui B para todas as entidades com tenant; teste separado de RLS evita que uma camada mascare ausência da outra. |
| READ01 / AC3 | Reader busca usuário A, usuário B e ID inexistente pelo contexto A | Snapshot A exato; B/inexistente null; TenantRoles só Owner/AccessAdministrator do usuário; BranchGrants só Seller/BranchManager ativos ligados a filial existente/ativa. |
| READ02 / AC3 | Inspecionar contrato/resultados do snapshot, seed com senha hash | Snapshot contém apenas identidade/status/papéis/grants previstos; não expõe senha/hash/tokens. Não registrar segredo em assertion output. |
| READ03 / AC4 | Mesma instância de reader/authorizer avalia grant, admin revoga grant e avalia novamente | Primeira operação permitida; próxima negada por ausência do grant. Inclui alterações após consulta para detectar cache/tracking obsoleto. |
| READ04 / AC4 | Após primeira avaliação, bloquear usuário; desativar filial; revogar papel empresarial em cenários separados | Próxima avaliação observa estado atual; Blocked nega; filial inativa remove grant; papel removido deixa de conceder ManageAccess. Pending também nega. |
| TX01 / AC5 | Begin com tenant válido; consultar GUC dentro da transação; tenant vazio/cancelamento | Valor parametrizado igual ao configurado; Guid.Empty rejeitado antes de SQL; cancelamento propagado e nenhum contexto reutilizável. |
| TX02 / AC4,5 | Pool tamanho 1, commit A, abrir sem contexto, Begin B, depois A | Mesmo `pg_backend_pid()` comprova reutilização física; fora da transação contexto ausente/vazio e nenhum dado; B não enxerga A; A não enxerga B. Não depender apenas do reset do pool. |
| TX03 / AC4,5 | Mesma conexão aberta: Dispose sem commit, erro SQL seguido de dispose, commit | Contexto local desaparece após cada encerramento, mutação sem commit não persiste; subsequente contexto B funciona. Check intra-conexão detecta uso incorreto de SET persistente mesmo com reset on close. |
| TX04 / AC5 | Begin quando já existe transação | Comportamento definido no contrato impede substituir contexto/assumir transação externa silenciosamente; contexto inicial permanece intacto até rollback. |
| READ05 / AC3,5 | Reader recebe transação externa sem wrapper, mesmo com GUC correto; contar comandos do snapshot | Rejeita transação não gerenciada; leitura dos dados/vínculos em uma única instrução SQL, sem split, conforme contrato revisto. |
| DB04 / AC1 | Admin tenta UUID vazio nas cinco PKs, quatro tenant_id e referências user_id/branch_id | Falha `23514` com checks explícitos; RLS/FKs não mascaram ausência de validação de UUID vazio. |
| READ06 / AC3,5 | UserId vazio; UserId vazio com token já cancelado | Null sem comando, transação ou abertura de conexão; cancelamento prévio ainda propagado. |
| TX05 / AC4,5 | Bloquear SELECT de usuarios após BEGIN/set_config em conexão admin do container, observar transação/query em pg_stat_activity e cancelar reader | OperationCanceledException; rollback, GUC limpo e mesmo PID reutilizável; leitura seguinte funciona após retirar lock. |

## Contrato alinhado

Proposta Backend: `Infrastructure.Identity.IdentityDbContext(DbContextOptions<IdentityDbContext>, Guid configuredTenantId)` com DbSets Tenants/Users/Branches/TenantRoles/BranchGrants; `PostgreSqlCurrentUserAccessReader(IdentityDbContext)` implementa `ICurrentUserAccessReader.GetAsync(Guid, CancellationToken)` existente; `IdentityTenantTransaction.BeginAsync(IdentityDbContext, CancellationToken)` retorna wrapper IAsyncDisposable com CommitAsync, rollback no dispose e `set_config('app.tenant_id', parâmetro, true)` dentro de transação.

Contrato completo fechado em `backend/docs/IDENTITY_PERSISTENCE.md`: tipos IdentityTenant/User/Branch/TenantRole/BranchGrant; unicidade papel (tenant,user,role) e grant (tenant,user,branch,role); metadados comuns. Guid.Empty rejeitado antes de I/O; Begin rejeita transação ativa; reader cria transação quando nenhuma ativa e reutiliza wrapper caller sem encerrá-lo. Falha sem GUC/valor vazio significa zero rows; GUC malformado falha fechado por cast UUID. Runtime não acessa tenants.

## Red, Green e bloqueio

Red requer testes compiláveis executados contra PostgreSQL real e falha pelo comportamento ausente na ação de um cenário com resultado contratado, com fixture/role/seed saudáveis identificados. A falha pode ser uma assertion de resultado ou exceção da ação ainda não implementada; chamar stub isoladamente ou esperar seu throw não satisfaz. Catálogo ausente foi comprovado por assertion depois de conexão validada. Erro de Docker/conexão/compilação/montagem da fixture nunca é Red. Registrar nome, falha esperada e contagens reais; repassar ao Backend antes da produção correspondente.

Green requer mesmo aceite preservado, build sem warnings, testes reais e gate Feature com Architecture/Domain/Application/Integration não vazios, cobertura Domain >=90%, revisão independente do snapshot candidato. Zero testes, testes skipped e simples exit code zero não aprovam persistência.

No início desta rodada, Integration continha apenas csproj. Na retomada, SM confirmou Docker Engine 29.1.3 e autorizou container PostgreSQL 17 isolado. Red por etapas autorizado pelo SM: catálogo ausente primeiro; reader/transação em seguida, preservando limite de produção justificado por cada Red. Cada execução inicia container próprio com porta dinâmica e o descarta ao fim; containers anteriores do host não são usados.

## Evidência Red catálogo — 2026-10-06

Comando: `dotnet test backend/tests/FaturaOtica.Integration.Tests/FaturaOtica.Integration.Tests.csproj --filter FullyQualifiedName~IdentityMigrationTests --logger "trx;LogFileName=s103a-red-catalog.trx" --results-directory artifacts/s103a/red-catalog --verbosity minimal`, executado fora da sandbox para acesso Docker/VSTest.

- Resultado: exit 1; 2 testes, 2 falhas esperadas, 0 aprovados, 0 ignorados. Fixture concluiu start de PostgreSQL 17, assertions de database/version e conexão runtime NOSUPERUSER/NOBYPASSRLS/NOINHERIT antes dos testes.
- `MigrateAsync_BancoVazio_CriaModeloIdentityVersionadoComRlsForcada`: Assert.Equal, esperadas cinco tabelas Identity, catálogo retornou coleção vazia (linha 44).
- `MigrateAsync_ModeloIdentity_CriaChecksFksCompostasETiposConvencionados`: Assert.Contains, `ck_concessoes_filiais_id_nao_vazio` ausente, catálogo de constraints vazio (linha 73).
- Evidências: `artifacts/s103a/red-catalog/s103a-red-catalog.trx`, `artifacts/s103a/red-catalog-output.log`, `artifacts/s103a/red-catalog/run-source.json`. Manifesto SHA256 `FF89CCE697D933B67DBBF3D6039A921D8CC50C301583AA7413472384C5A9D52C`, HEAD base acima e hashes individuais do snapshot local.
- Backend recebeu evidência e slot para implementar somente modelo/migration/checks/RLS. Reader/wrapper funcionais aguardam Red próprio. Nada integrado/liberado.

Tentativas prévias não funcionais: NETSDK1004 por assets ausentes; depois CS1705/MSB3277 EFCore 10.0.12 vs 10.0.4 e CA1711 no nome de collection de teste. Zero testes nesses passos, não classificados Red. QA corrigiu nome para Definition sem suppressions; Backend, autorizado pelo SM, fixou runtime EF 10.0.12 central e referência propagável. Execução Red final compilou cinco assemblies sem diagnóstico warning/error antes dos testes.

## Green catálogo e Red comportamento — 2026-10-06

Comando Integration completo, mesmos parâmetros de logger/results, sem filtro; resultados em `artifacts/s103a/red-behavior/s103a-red-behavior.trx`, log `artifacts/s103a/red-behavior-output.log`, manifesto `artifacts/s103a/red-behavior/run-source.json` SHA256 `2038B3481CF3B6FB0E8E7A62D4B33C57D294944BFE8B2E97756C8FCA78A491B7`.

- 59 testes, 40 aprovados, 19 falhas esperadas, 0 ignorados; exit 1; duração dos testes 16 s.
- 40 aprovados: IdentityMigrationTests 2, IdentityIntegrityTests 26, IdentityRlsTests 12. Migration aplicada em PostgreSQL 17 real; seed administrativo saudável; UUID/checks/FKs compostas/unicidade testados por SQL admin, RLS CRUD/contexto ausente/malformado por runtime, filtro EF por admin e privilégios runtime comprovados. Nenhuma falha de catálogo/fixture/compilação nessa execução.
- 19 falhas: IdentityReaderTests 12 e IdentityTenantTransactionTests 7. Dezoito cenários reader/wrapper alcançaram ação contratada com banco/seed válidos e falharam em NotImplementedException, antes das assertions posteriores de snapshot/query/cleanup. Transação externa RC/RR/Serializable esperava InvalidOperationException; cancelamento esperava OperationCanceledException. A falha restante foi a assertion do construtor Guid.Empty, que não lançou ArgumentException antes de I/O. Esses 18 Red não demonstram SQL do reader ou cleanup funcionando; isso só foi verificado no Green.
- Red não consiste em esperar stub: os testes preservam resultado final de snapshot exato/uma instrução, revogação na próxima leitura, GUC local, commit/rollback e pooling. Conforme decisão explícita SM, falha da ação ainda ausente dentro de cenário funcional saudável comprova Red; chamar stub isoladamente ou apenas esperar seu throw não comprova.
- Backend recebeu evidência e slot Green reader/wrapper/validação Guid.Empty. QA aguarda implementação para repetir Integration, depois gate Feature/cobertura e revisão independente do candidato. Estes resultados não aprovam a funcionalidade completa.

Revisor/SM acrescentaram verificações necessárias após a primeira execução: contexto B após cache do modelo em A; contador reconhece tabela usuarios com/sem aspas; UserId vazio sem I/O e cancelamento com consulta bloqueada depois de iniciada a transação. Todos estão incluídos nos 61 testes Integration aprovados abaixo.

Antes da execução completa, Backend/SM alinharam também EFCore.Relational 10.0.12 propagável, removendo warning de versões; CA1861 no array de propriedades esperado corrigido pelo QA como static readonly, sem supressão. Nenhuma dessas falhas de preparação foi contabilizada como Red.

## Green e gate Feature Release — 2026-10-06

Após implementação, `dotnet test` Integration em Debug aprovou 61/61, zero falhas/ignorados, exit 0, 12 s. Evidências em `artifacts/s103a/green-integration/` e `artifacts/s103a/green-integration-output.log`.

Gate obrigatório: `pwsh -NoProfile -File scripts/test-backend.ps1 -Level Feature -Configuration Release`, com restore, executado fora da sandbox para Docker/VSTest e com fonte congelada durante toda execução. Build da solução: 0 warnings, 0 erros. Runner exit 0; summary `passed`, blockers/stageFailures vazios.

| Suíte | Executados/aprovados | Falhas/ignorados |
| --- | --- | --- |
| Architecture | 3/3 | 0/0 |
| Domain | 21/21 | 0/0 |
| Application | 6/6 | 0/0 |
| Integration PostgreSQL 17 | 61/61 | 0/0 |
| Total | 91/91 | 0/0 |

Cobertura Domain: 100% de linhas, 31 linhas instrumentadas; acima do mínimo 90%. Nenhuma suíte vazia; nenhum skip/simulação SQLite/InMemory. Green verifica reader snapshot exato em uma instrução SQL, revogação/bloqueio/desativação/papel sob wrapper ReadCommitted reutilizado, transações externas recusadas sem encerramento do chamador, rollback de mutação não confirmada, commit/erro/cancelamento e isolamento de pooling com mesmo PID. Cancelamento real após BEGIN/set_config é exercitado por SELECT bloqueado em container, observado em pg_stat_activity, cancelado e seguido de reset GUC/rollback e nova leitura na mesma conexão.

Execução identificada: `artifacts/quality/backend/20261006-171006-981484a3/`; log `artifacts/s103a/feature-release-output.log`; `summary.json`, quatro TRX e Cobertura produzidos pelo runner. HEAD `7e0428c7eaba1b0735f0bf95bc74b678ce00a136`, workingTreeDirty true, sourceSnapshotHash `233246f6d9d6a3bf28a6d1ce4cfb4522f0581d168837b69793ef2932f55988b1`, identidade conferida antes/depois pelo gate. SHA256 do run-source.json `8FCA888197BCE4011B7B87D21E0543877150E4EFA225F111656D0911C78EDBF4`.

Este registro de evidência foi atualizado somente após o runner encerrar; não alterou código testado. O snapshot é local e sujo, não SHA liberado para publicação. Revisão independente deve identificar código/relatórios e os ajustes documentais posteriores. Nenhum commit, push, integração em develop ou deploy efetuado pelo QA; endpoint/frontend e resto da sprint permanecem fora deste recorte.
