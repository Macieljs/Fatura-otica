# S1-04A2a — QA Red do schema de auditoria

Data: 2026-10-07 (America/Fortaleza). Estado: Red funcional de schema/migration comprovado; comando de bootstrap e domínio ainda não testados nesta passagem.

## Escopo e arquivos

QA criou somente:

- `backend/tests/FaturaOtica.Integration.Tests/BootstrapOwnerAuditPersistenceTests.cs` — 11 casos de auditoria/constraints/RLS.
- `backend/tests/FaturaOtica.Integration.Tests/BootstrapOwnerMigrationTests.cs` — 1 caso de upgrade/reaplicação/preservação do ledger humano.

Nenhum código de produção, projeto, pacote, migration ou contrato foi alterado pelo QA. Nenhum commit/push foi realizado. As mudanças documentais do SM já presentes no checkout foram preservadas.

## Ajuste da primeira execução

A primeira execução focalizada executou 12 casos: 1 aprovado, 11 falhos, zero ignorados. Sete falhas eram assertions excessivamente específicas: o schema anterior rejeitava autor nulo por NOT NULL (`23502`) antes de avaliar CHECK/FK (`23514`/`23503`). Essa proteção anterior é válida e não representa ausência de segurança.

QA ajustou somente as assertions de rejeição em `BootstrapOwnerAuditPersistenceTests.cs`: aceitar `23502` exclusivamente quando `ColumnName` é `autor_usuario_id`; caso contrário, exigir o SQLSTATE de CHECK/FK esperado. Erros de SQL, conexão, tabela/coluna ausente e outros NOT NULL não são aceitos. O teste de migração continua exigindo a nova coluna nullable e índice parcial único; o caso positivo continua exigindo inserção válida de BootstrapOwner com autor NULL.

## Execução corrigida

```powershell
dotnet test backend/tests/FaturaOtica.Integration.Tests/FaturaOtica.Integration.Tests.csproj --configuration Debug --filter "FullyQualifiedName~BootstrapOwner" --logger "trx;LogFileName=schema-red.trx" --results-directory artifacts/qa/s1-04a2a-schema-red-corrected --verbosity minimal
```

- Compilação das DLLs novas realizada pelo comando; nenhum `--no-build` sobre DLL obsoleta.
- PostgreSQL 17 real via `IdentityPostgreSqlFixture`/Testcontainers. Runtime sem superuser/BYPASSRLS, conforme fixture existente.
- Total: **12 executados, 8 aprovados, 4 falhos, 0 ignorados**.
- Exit code: **1**, esperado para Red.
- Tempo total capturado: **56,506 s**; duração VSTest aproximada: **3 s**.
- Nenhum erro de compilação, fixture ou SQL malformado na execução corrigida.
- Nenhum gate Feature ou coleta de cobertura executado nesta passagem; não inferir cobertura Domain nem regressão completa a partir desse filtro.

### Falhas funcionais observadas

| Teste | Falha observada | Limite da evidência |
| --- | --- | --- |
| Insert_BootstrapOwnerSistema_PermiteAutorNullEPersisteEscopoExato | `23502` na coluna autor_usuario_id | Schema ainda impede o evento de sistema válido. |
| Insert_SegundoBootstrapNoTenant_IndiceUnicoRecusa | Primeiro INSERT válido é recusado por `23502` | Segundo INSERT/índice ainda não alcançado. |
| Read_BootstrapPorTenant_RuntimeRlsNaoVazaOutroTenant | Seed do primeiro evento válido é recusado por `23502` | Isolamento dos novos eventos ainda não alcançado. |
| Migrate_AuditoriaHumanaExistente_PreservaRegistroELiberaSomenteBootstrapSistema | Coluna continua `is_nullable = NO`, esperado YES | Preservação do evento humano e reaplicação foram alcançadas; novo índice/INSERT ainda não alcançados. |

Os oito casos aprovados demonstram rejeição das entradas inválidas no schema anterior. Alguns foram bloqueados pelo NOT NULL anterior; não comprovam isoladamente as novas restrições de BootstrapOwner após a migration. As assertions posteriores deverão ser alcançadas no Green.

## Identidade e artefatos

- Branch: `feature/s1-04a2-access-grants`.
- HEAD: `5983e23351af78861ab12fd03fffaf50b5aa82bf`.
- Snapshot antes da execução: `dfa61c06ae8d67460fb9c6654e24f7ee395ce7c98283906d4881355f6a1e202f`, workingTreeDirty=true.
- Evidência vigente: `artifacts/qa/s1-04a2a-schema-red-corrected/` com `schema-red.trx`, `schema-red.log`, `execution.json`, `source.json`.
- Evidência inicial histórica, não vigente para as assertions corrigidas: `artifacts/qa/s1-04a2a-schema-red/`.
- Este relatório foi gravado depois da execução e altera o fingerprint documental. Nenhuma fonte de produção ou teste foi alterada depois do filtro corrigido.

## Passagem seguinte

O Red autoriza implementação do schema/migration correspondente pelo Backend, preservando a intenção dos testes. O console, contratos Application e factory Domain precisam de skeletons compiláveis antes dos próximos testes. Não foram criados/executados testes do comando, concorrência de provisionamento, criação atômica tenant+Owner, ausência de listener ou saída do CLI.

Feature, revisão independente, integração em develop e conclusão A2a/Sprint/MVP continuam pendentes.

## Complemento A2a1 — validação direta solicitada pela revisão

Data: 2026-10-07. Após o Green de schema/migration do Backend, a revisão independente identificou falta de testes diretos da factory/constructor e do writer com autor nullable. QA adicionou somente os dois arquivos abaixo; nenhum defeito de produção foi encontrado nesta passagem.

| Arquivo novo | Casos | Resultado |
| --- | ---: | --- |
| backend/tests/FaturaOtica.Domain.Tests/BootstrapOwnerAuditDomainTests.cs | 21 | 21 aprovados, zero falhas/ignorados |
| backend/tests/FaturaOtica.Integration.Tests/BootstrapOwnerAuditWriterTests.cs | 10 | 10 aprovados, zero falhas/ignorados |

Domínio: factory CreateBootstrapOwner gera UUIDv7, tenant/alvo/UTC corretos, ação BootstrapOwner, Owner, autor NULL e filial NULL; constructor válido; rejeição de autor humano/IDs vazios/papel/filial inválidos; ações humanas continuam exigindo autor. Não foi usado reflection nem atribuído número novo ao enum nos testes diretos.

Writer: invocação real de PostgreSqlIdentityAuditWriter.AppendAsync, usando eventos criados pela factory Domain e pelo Create humano. Wrapper tenant válido com conexão runtime sem BYPASSRLS; leitura EF dentro da transação comprova NULL actor, e conexão independente comprova ausência de commit implícito. Commit persiste alteração do usuário + evento exato; dispose/rollback remove ambos. Sem wrapper ou com transação externa, ambos os tipos de evento são recusados sem encerrar a transação do chamador. Evento de outro tenant aborta alteração local e impede commit.

Após commit, a consulta SQL independente confere tenant, ator NULL no evento de sistema/ator autenticado no humano, alvo, ação, horário UTC, papel e filial NULL. Horário constante de teste evita confundir precisão de timestamptz com integridade do evento.

Execuções sequenciais, com compilação das fontes atuais:

```powershell
dotnet test backend/tests/FaturaOtica.Domain.Tests/FaturaOtica.Domain.Tests.csproj --configuration Debug --filter "FullyQualifiedName~BootstrapOwnerAuditDomainTests" --logger "trx;LogFileName=domain-direct.trx" --results-directory artifacts/qa/s1-04a2a1-direct --verbosity minimal
dotnet test backend/tests/FaturaOtica.Integration.Tests/FaturaOtica.Integration.Tests.csproj --configuration Debug --filter "FullyQualifiedName~BootstrapOwnerAuditWriterTests" --logger "trx;LogFileName=writer-direct.trx" --results-directory artifacts/qa/s1-04a2a1-direct --verbosity minimal
```

- Ambos exit0, sem diagnósticos de compilação/warnings nos logs; 31/31 casos no total, zero falhas/skips.
- Domain: 5,379 s de comando, ~267 ms VSTest. Integration: 14,894 s de comando, ~1 s VSTest; PostgreSQL17 real/Testcontainers.
- Snapshot antes dos testes: `79f8efebf76600fc7ac163a79a67b82db65c625904a901c2a9bdfd579164ba26`, HEAD5983e23 e árvore alterada. Identidades antes/depois dos testes em source-before.json/source-after-tests.json.
- Artefatos: `artifacts/qa/s1-04a2a1-direct/` com dois TRX/logs, metadados de tempo/exit e snapshots. Este relatório é atualizado depois dos testes e muda o fingerprint documental.
- Estes casos complementam a evidência Green. Não existe Red anterior separado para os novos testes diretos; o Red histórico é o de schema registrado acima.
- Sem coleta de cobertura ou gate Feature nesta passagem. O runner completo deverá incorporar os novos casos na candidata atual; não somar contagens históricas que se sobrepõem.
- A2a2, comando console, provisionamento de tenant/Owner e concorrência de bootstrap não foram iniciados. Nenhuma alteração de produção, commit, push, integração ou deploy realizada pelo QA.
