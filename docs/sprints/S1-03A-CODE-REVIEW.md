# Revisão independente — S1-03A persistência Identity

- Autor: Backend principal; testes: QA principal; coordenação: SM.
- Revisor independente: agente persistence_review, modelo principal herdado; risco crítico de segurança e isolamento de dados.
- Data: 2026-10-06.
- Base HEAD: `7e0428c7eaba1b0735f0bf95bc74b678ce00a136`, branch `feature/s1-03a-persistence`, checkout com alterações locais.
- Snapshot do Gate Feature: `233246f6d9d6a3bf28a6d1ce4cfb4522f0581d168837b69793ef2932f55988b1`.
- Conclusão: **aprovado para o recorte interno S1-03A**. Sem achados bloqueantes de funcionamento no código revisado.

## Evidências verificadas

Gate Feature Release em `artifacts/quality/backend/20261006-171006-981484a3`: summary `passed`, blockers e stageFailures vazios. TRXs conferidos diretamente: Architecture 3/3, Domain 21/21, Application 6/6, Integration 61/61, total 91 aprovados, zero falhas e zero skips. Cobertura Domain: 100%, 31 linhas instrumentadas. Build sem warnings conforme execução QA/runner; não foi executado build ou teste adicional pelo revisor.

Green Integration anterior: `artifacts/s103a/green-integration/s103a-green-integration.trx`, 61 executados/aprovados, zero falhas/skips. Os hashes backend de seu `run-source.json` foram comparados aos arquivos revisados sem divergência. O runner Feature validou identidade de origem antes/depois. O parecer registra o snapshot executado; este novo documento e o fechamento editorial posterior não integravam aquele snapshot.

Red catálogo: PostgreSQL 17 real e fixture saudável, 2 testes executados, 2 falhas de assertions de catálogo, zero skips, antes de modelo/migration. Evidência em `artifacts/s103a/red-catalog`.

Red comportamento: `artifacts/s103a/red-behavior`, 59 executados, 40 cenários de banco aprovados e 19 falhas. Destas, 18 ocorreram na ação ainda ausente por NotImplementedException do skeleton; uma foi assertion do construtor com Guid.Empty sem a exceção esperada. Não se afirma que os 18 cenários alcançaram assertions finais ou executaram SQL funcional do reader/wrapper. Os testes exigiam resultados contratados e estavam escritos antes da implementação; o critério explícito do SM para aceitar falha na ação ausente em cenário saudável está registrado em S1-03A-PERSISTENCE, seção de passagem reader, e no contrato de persistência. Não houve reconstrução retrospectiva do Red. Esta é uma limitação factual da evidência, preservada no parecer.

## Critérios revisados

1. Modelo, migration versionada e snapshot: cinco tabelas identity; nomes, UUID sem default gerador, timestamptz, enums text/check, e-mail normalizado único por tenant, metadados e índices tenant-first. Checks recusam IDs essenciais vazios. FKs compostas usuario/filial com tenant e NO ACTION impedem vínculos cruzados mesmo como admin.
2. RLS: ENABLE e FORCE nas quatro tabelas operacionais; USING e WITH CHECK usam app.tenant_id local. Fixture cria runtime NOSUPERUSER/NOBYPASSRLS/NOINHERIT sem membership privilegiada/ownership, com grants limitados; tenants não é acessível por DML runtime. Testes funcionais SQL direto provam leitura/escrita cruzadas recusadas e ausência/contexto malformado fechado. Admin pertence somente ao container descartável.
3. EF filters: propriedade imutável do contexto, nas quatro entidades; teste separado sob admin evita RLS mascarar filtro ausente e consulta A/B após cache do modelo.
4. Reader: consulta única com projeção sem credenciais, AsNoTracking e vínculos ativos; join composto filtra filial ativa/existente do tenant, deduplicando os resultados. ID vazio retorna null sem I/O; outro tenant/ausente retorna null; Pending/Blocked preservados para a policy negar. Teste confere uma instrução e ChangeTracker vazio.
5. Estado atual: revogação de grant/papel, bloqueio, Pending e filial inativa aparecem na próxima avaliação, incluindo mesma instância/contexto e wrapper ReadCommitted ainda aberto.
6. Wrapper: Begin parametrizado com set_config local em ReadCommitted; recusa transação ativa, reader aceita somente wrapper válido para contexto/CurrentTransaction. Transações EF diretas RC/RR/Serializable são recusadas sem encerramento do chamador. Commit/dispose limpam registro; rollback sem commit e após erro SQL comprovados. Reader não confirma mutações do chamador.
7. Pooling/cancelamento: testes conferem mesmo backend PID, limpeza de GUC e ausência de visibilidade sem contexto após commit/rollback/reuso. Cancelamento durante consulta comprovadamente bloqueada por lock após BEGIN reverte e limpa a mesma conexão; nova leitura funciona. Pré-cancelamento também coberto.

## Achados e limites

Não há achados bloqueantes de código no snapshot acima. Os pontos preliminares sobre transação externa, consistência do snapshot, UUID vazio, contexto B cacheado, contador SQL e cancelamento durante I/O foram resolvidos e conferidos nos testes atuais.

Owner para BranchScope sintaticamente válido permanece limite documentado da policy anterior: GetAsync não recebe filial alvo. O futuro endpoint deve validar existência/estado da filial alvo também para Owner. O presente reader filtra suas concessões e não implementa essa borda.

Escopo aprovado: infraestrutura de persistência Identity interna. DI de runtime, endpoints, login, sessão/tokens, SMTP, frontend, auditoria append-only e deploy não fazem parte desta aprovação. Critérios UI/OpenAPI/client TS não se aplicam porque nenhuma interface ou endpoint foi alterado. Não é Sprint Done nem aprovação de integração em develop ou deploy. A integração exige validação da candidata combinada; publicação exige SHA limpo/imutável e autorização correspondente. Alterações posteriores de produção/testes invalidam o parecer afetado e exigem nova verificação.

## Arquivos do backend aprovados — SHA256

Hashes dos arquivos de produção/testes/pacotes revisados, preservados após o Green. Documentos de fechamento podem ser atualizados editorialmente pelo QA/SM após o runner.

| Arquivo | SHA256 |
| --- | --- |
| backend/src/FaturaOtica.Infrastructure/Identity/IdentityDbContext.cs | E51D938B477BE547F4FF4A0CC3BC19A776DEBCD63034435247952453C4180C5B |
| backend/src/FaturaOtica.Infrastructure/Identity/IdentityDesignTimeDbContextFactory.cs | 39D7062256D8E2C33409E845E23C471C847C9F10350C89EC25EF7786F1665862 |
| backend/src/FaturaOtica.Infrastructure/Identity/IdentityRecords.cs | D1B57E4EA91EBE02E25E2AC53EDFEA49B046ACC93E3E32B5C7F72FD515459756 |
| backend/src/FaturaOtica.Infrastructure/Identity/IdentityTenantTransaction.cs | 1D7DA5A59E796F40B26FD86664E277E7A707FAD1BC573E7A99CFF84F59DC4ED6 |
| backend/src/FaturaOtica.Infrastructure/Identity/PostgreSqlCurrentUserAccessReader.cs | CB94AE47BF8FD5DCB507A5D240273D081668035CC24E4CC05E5985321E10C0BA |
| backend/src/FaturaOtica.Infrastructure/Persistence/Migrations/20261006165846_InitialIdentity.Designer.cs | 6BF45D3666E0ED9BEB1821D86EF9F6D9E1CB7B7BD5B000E8F5C5B2F77FE09736 |
| backend/src/FaturaOtica.Infrastructure/Persistence/Migrations/20261006165846_InitialIdentity.cs | AB0E4ADBA9F4B71185F7749178870F1B8CBF938C66091B626F8E7E7765B157EE |
| backend/src/FaturaOtica.Infrastructure/Persistence/Migrations/IdentityDbContextModelSnapshot.cs | AC482511B8EB21E9FACF85831FACE0C4C3B26EEBC68A9C794D2A9ADD15D28C56 |
| backend/tests/FaturaOtica.Integration.Tests/IdentityIntegrityTests.cs | 54B1AE0DD73CECBA2939C7721C6FF6B6A3609A5E3977A90C6A2415444F34E719 |
| backend/tests/FaturaOtica.Integration.Tests/IdentityMigrationTests.cs | F633E1EB3D7B1B614BA74FD2D1B7F9C351F5A12C542AD3BADA82BC9E1757D6A4 |
| backend/tests/FaturaOtica.Integration.Tests/IdentityPostgreSqlFixture.cs | 77B0FED7881BD21742975A9CB1B14AF55ADD81838119D9F674CFD23801D55F95 |
| backend/tests/FaturaOtica.Integration.Tests/IdentityReaderTests.cs | 3870F4A1DD8083B05E0C8191BACEEB3B151A0EB2A48BEF08F130D7E5E97EA7FB |
| backend/tests/FaturaOtica.Integration.Tests/IdentityRlsTests.cs | ABF1B985A5D83EB9E9E9F7AE120E4F58FF8E9C366A4B6C892901EA74F5814A0A |
| backend/tests/FaturaOtica.Integration.Tests/IdentityTenantTransactionTests.cs | 0D131BEB9BA93FEE4F0411A2C5C6DAE1ADE1DFAADFF67A9495AE4F082DE17FE7 |
| backend/tests/FaturaOtica.Integration.Tests/IdentityTestData.cs | 3975DBFE8A1CE39A07A6BD07B7B59B3DC8960CC4ED59EF97A8EBE3631BAE97FA |
| backend/Directory.Packages.props | 8219AFE70468719D864E2722CB6606283EC118D7E291170EED86E12EA4F2CA0F |
| backend/src/FaturaOtica.Infrastructure/FaturaOtica.Infrastructure.csproj | DAA9A67B789202E91DFDFF8D8503439065080E163D0688B2FE2A602F62246E12 |
