# S1-04A2b — implementação

Estado em 2026-10-18: implementação e filtro local verdes; revisão independente e gate de integração pendentes. Branch compartilhada `feature/s1-04a2-access-grants`; alterações anteriores preservadas; sem commit pelo autor.

Endpoints implementados conforme contrato: POST grants (201), DELETE grants/{grantId} (204), PUT status (200). Payloads fechados, tenant configurado e autor do JWT validado, autoridade consultada novamente nas tabelas. Owner administra todos os papéis; AccessAdministrator somente papéis de filial e não altera status de Owner/AccessAdministrator. Alvo e filial pertencem ao tenant e filial precisa estar ativa. Grants Pending não criam hash nem ativam perfil; vínculo inativo é reutilizado. Alteração e auditoria humana compartilham transação RLS.

Todas as mutações administrativas usam `pg_advisory_xact_lock(hashtextextended(tenantId.ToString(),0))` antes das leituras. Revogação/bloqueio preservam um Owner ativo distinto inclusive em concorrência. Status active rejeita Pending e usuário sem hash. Repetição sem transição retorna 409 `identity.state_conflict`.

`UnblockUser = 5` exige ator humano e escopo nulo no domínio e banco. Migration incremental `20261018120000_AddUnblockUserAudit` altera somente três checks; mantém ledger, RLS, índices e triggers. Down recusa eventos UnblockUser existentes. Designer e snapshot atualizados. Nenhuma migration histórica foi reescrita.

## Evidência test-first

- Primeiro arquivo escrito: `backend/tests/FaturaOtica.Integration.Tests/AccessAdministrationTests.cs`, antes da implementação. Cenários críticos independentes fornecidos pelo orquestrador antes do Green.
- Red funcional: filtro AccessAdministrationTests, PostgreSQL 17 real e WebApplicationFactory/JWT assinados, 18 falhas/18 por HTTP 404 nas rotas ausentes. TRX `artifacts/qa/s1-04a2b-red/access-administration-red.trx`. Tentativas iniciais bloqueadas por sandbox/analisadores/stubs de outro incremento não contam como Red.
- Green inicial: 18/18. Ampliação focada: revogação concorrente de dois Owners, JWT/payload fechado e OpenAPI. Green final: 21 aprovados, zero falhas/ignorados, duração 3s. TRX `artifacts/qa/s1-04a2b-green/access-administration-green.trx`.
- Comando final: `dotnet test backend/tests/FaturaOtica.Integration.Tests --filter FullyQualifiedName~AccessAdministrationTests --no-restore --logger "trx;LogFileName=access-administration-green.trx" --results-directory artifacts/qa/s1-04a2b-green`.
- Execução elevada por IPC local VSTest/Docker bloqueado pelo sandbox; `DOCKER_HOST=npipe://./pipe/dockerDesktopLinuxEngine`. Nenhum Feature completo executado pelo autor. Graphify consolidado pelo orquestrador.

## Arquivos deste incremento

- Novos: `PostgreSqlAccessAdministration.cs`, `AccessAdministrationEndpoints.cs`, `AccessAdministrationTests.cs`, migration AddUnblockUserAudit + Designer e este relatório.
- Extensões delimitadas: enum/invariante `IdentityAuditEvent`, checks de `IdentityDbContext`/snapshot, registro em Infrastructure DependencyInjection, mapeamento em Api Program e schema/segurança em IdentityOpenApi.

Revisão deverá validar o snapshot combinado com autenticação/ativação antes do gate final da sprint. Feature, cobertura Domain e integração ficam sob coordenação do orquestrador.
