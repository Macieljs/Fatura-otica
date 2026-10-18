# S1-04A2a1 — Implementação do schema de auditoria bootstrap

Data: 2026-10-07 (America/Fortaleza). Estado: verificações focadas concluídas, aguardando re-revisão independente. Não representa conclusão A2a/Sprint/MVP.

## Mudanças

- Domain: ação BootstrapOwner = 4; ActorUserId nullable; exclusivamente bootstrap exige autor nulo, papel Owner e filial nula. Ações humanas preservam autor obrigatório e invariantes anteriores. Factory CreateBootstrapOwner fornece o evento de sistema, sem identidade humana inventada.
- EF: coluna autor_usuario_id nullable; checks de autoria/ação/escopo; índice único parcial ux_auditoria_bootstrap_tenant_id para um BootstrapOwner por tenant.
- Migration incremental AddBootstrapOwnerAudit e snapshot/designer gerados pelo EF 10.0.12. Up altera metadados/checks/índice, sem backfill UPDATE, DELETE ou recriação da tabela. FK composta de autor/alvo, RLS, filtro e triggers append-only preservados.
- Down recusa quando houver bootstrap/autor nulo; removido default Guid.Empty gerado no scaffold para impedir qualquer preenchimento artificial do ledger. Downgrade não foi executado nesta passagem.
- Writer usa parâmetro Npgsql explicitamente UUID, com DBNull.Value para autor nulo, dentro da transação tenant existente. Além do filtro de schema, QA executou testes diretos do writer descritos abaixo.

## Evidência Red → Green

Red QA documentado em S1-04A2a-QA.md: 12executados,8pass/4fail esperados,0skip, PostgreSQL17 real.

```powershell
dotnet test backend/tests/FaturaOtica.Integration.Tests/FaturaOtica.Integration.Tests.csproj --configuration Debug --filter "FullyQualifiedName~BootstrapOwner" --logger "trx;LogFileName=schema-green.trx" --results-directory artifacts/dev/s1-04a2a1-schema-green --verbosity minimal
```

Green: **12executados,12pass,0fail,0skip**, exit0. O comando recompilou os projetos; sem erro de compilação. TRX em artifacts/dev/s1-04a2a1-schema-green/schema-green.trx. Os casos positivos, unicidade, RLS e preservação/upgrade antes falhos foram alcançados e passaram; inputs inválidos seguem rejeitados.

A geração inicial EF em sandbox retornou buildfailure com0warnings/0errors; a execução escalated funcionou sem mudar regras. Nenhum teste de intenção QA foi alterado.

## Verificação direta adicionada após revisão

A revisão independente encontrou uma lacuna: os 12 casos iniciais exercitavam SQL/schema, sem alcançar diretamente a factory Domain ou o writer. QA adicionou testes comportamentais específicos, sem alterar produção:

- Domain `BootstrapOwnerAuditDomainTests`: **21/21**, zero falhas/ignorados; cobre factory/construtor, UUIDv7, campos do bootstrap, rejeição de autoria/papel/filial inválidos e exigência de autor nas ações humanas.
- Integration `BootstrapOwnerAuditWriterTests`: **10/10**, zero falhas/ignorados, PostgreSQL 17 real; cobre BootstrapOwner e GrantAccess humano no writer, autor NULL persistido, wrapper tenant validado, commit, rollback por dispose, rejeição sem wrapper e tenant divergente.
- Execuções e TRX em `artifacts/qa/s1-04a2a1-direct/`; relatório consolidado em `docs/sprints/S1-04A2a-QA.md`.
- Graphify reextraído após a inclusão dos testes diretos: 1.444 nós, 2.588 arestas e 110 comunidades. Grafo/cache são locais e ignorados pelo Git.

## Limites

Foram executados filtros focados de schema, domínio e writer. Não foi executado gate Feature, suíte completa nem coleta de cobertura. Portanto, não inferir ausência de regressões gerais nem conclusão do módulo A2a. Bootstrap CLI, configuração/conexão dedicada, criação atômica tenant+Owner e concorrência do comando pertencem a A2a2; não foram implementados. Nenhum commit, push, merge ou deploy realizado.

Console, configuração bootstrap, criação tenant+Owner, concorrência do provisionamento, rollback do handler e endpointsgrant/revoke continuam fora desta passagem. Sem commit/push/merge/deploy.
