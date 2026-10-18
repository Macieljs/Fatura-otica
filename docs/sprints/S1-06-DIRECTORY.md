# Directory S1-06

Escopo: GET /api/v1/identity/users e GET /api/v1/identity/branches para administração existente. Sem commit ou gate Feature neste módulo.

Modelo principal herdado; risco crítico de autorização e isolamento. Graphify query Directory: nenhum nó encontrado. Atualização final conjunta do grafo atribuída ao orquestrador para evitar escrita concorrente.

## Contrato e autorização

Actor Active; Owner/AccessAdministrator com papel empresarial ativo consultam tenant atual. BranchManager ativo consulta perfis cuja CreatedForBranchId pertence a filial ativa gerenciada e lista apenas essas filiais. Seller não consulta. GrantsMap inclui somente IDs de profiles e concessões ativas (filiais ativas no caso de branch grant). Projeções explícitas não incluem senha/hash/token. Identidade e tenant vêm do JWT validado, nunca de body/query. Consultas usam filtros EF e IdentityTenantTransaction para RLS PostgreSQL.

GET users retorna UsersDirectory: profiles com DirectoryProfileResponse (id/name/email/status/branchId), grantsMap com arrays Grant. branchId de proveniência é nullable obrigatório e aparece null para Owner inicial sem lotação. GET branches retorna array Branch (id/name). Ambos incluem Cache-Control: no-store. Status: 200,401,403,500; role/status atuais são consultados no banco.

## TDD e revisão

IdentityDirectoryTests escrito antes implementação. Cenários revisados independentemente pelo orquestrador antes Green: Owner/Admin, tenant estrangeiro, ausência JWT, Seller, actor bloqueado, papel inativo, manager com grant inativo/filial inativa, filtro por proveniência mesmo quando target possui grant na filial gerenciada, grantsMap restrito aos profiles, filiais inativas/estrangeiras omitidas, contrato sem credenciais.

Red funcional: 9/9 falharam HTTP405 porque GET users ainda não existia. PostgreSQL17 real/Testcontainers, JWT real. Evidência: artifacts/quality/backend/focused/20261018-165851-fa65d3c2/FaturaOtica.Integration.Tests/FaturaOtica.Integration.Tests.trx. O runner invalidou o snapshot por alterações concorrentes de outras fontes durante a rodada; esse Red documenta comportamento ausente e não constitui gate de aceite. A primeira tentativa no sandbox não gerou TRX; .NET precisava acesso Service Control Manager/Docker, resolvido com execução autorizada fora do sandbox.

Green: agente identity_sessions executou grupo combinado 35/35 incluindo IdentityDirectoryTests9/9 após ligar DI/Program e DTO branchId/no-store. Depois a revisão detectou que BranchManager ainda recebia concessões de filiais fora de seu escopo. A consulta passou a filtrar grants de filial por `scope.Branches`; `IdentityDirectoryTests` foi ajustado para cobrir uma filial ativa não gerenciada no mesmo tenant e passou 9/9 em `artifacts/quality/backend/focused/20261018-212352-ed5591c5`. Uma preparação anterior falhou por FK no fixture, antes de alcançar o handler, e não é contada como teste funcional. O gate final candidato e a atualização Graphify ficam com o orquestrador.

## Arquivos e hooks

- backend/src/FaturaOtica.Infrastructure/Identity/PostgreSqlIdentityDirectory.cs
- backend/src/FaturaOtica.Api/Identity/IdentityDirectoryEndpoints.cs
- backend/tests/FaturaOtica.Integration.Tests/IdentityDirectoryTests.cs

Hooks services.AddScoped<PostgreSqlIdentityDirectory>() e app.MapIdentityDirectory() aplicados pelo agente responsável por DI/Program. OpenAPI/schema/cliente são responsabilidade do agente auth e orquestrador; detalhes dos DTOs foram enviados ao agente.
