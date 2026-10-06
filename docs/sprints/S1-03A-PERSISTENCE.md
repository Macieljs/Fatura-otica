# S1-03A — Persistência Identity e isolamento

- Estado: incremento e integração local em develop aprovados. Candidata7d2c205 validada/revisada; publicação remota e resultado CI tratados no fechamento.
- Escopo autorizado: Sprint01, próximo incremento de persistência, conforme pedido de continuidade do usuário.
- Branch: feature/s1-03a-persistence; base55ea2cd (autorização validada) incorporada com develop5154670.
- Responsáveis: SM coordenação/spec; Backend contrato/produção principal; QA testes principal; revisor principal independente; Luna diagnóstico de ambiente delimitado.
- Objetivo desta execução: persistir usuários, filiais, papéis/concessões e carregar snapshot atual com isolamento entre empresas.
- Fora de escopo: endpoints de cadastro/login, SMTP, refresh/recuperação, UI, auditoria append-only (S1-03B), OS e comissões.

## Aceite do recorte

1. Migration versionada cria modelo Identity mínimo conforme convenções e ADR0005, com tipos/checks/FKs compostas, unicidade e-mail+tenant e IDs gerados na aplicação.
2. Usuário/filial/grant de empresas diferentes não podem formar vínculos persistidos; RLS/filtro impedem leitura/escrita cruzadas usando role operacional sem BYPASSRLS/proprietário.
3. Reader atual retorna somente usuário do tenant configurado e concessões ativas para filiais existentes/ativas, sem senha/tokens expostos em snapshot.
4. Remover grant/bloquear usuário afeta a próxima avaliação via reader; pooling/transações não reutilizam contexto de outro tenant.
5. Contexto de tenant local à transação, parametrizado e validado; migrations/admin role separados da conexão operacional. Banco de teste isolado, sem tocar bancos existentes.
6. QA registra Red funcional em PostgreSQL real antes do Green; falha Docker/compile não é Red. Build/regressão/coverage e revisão do incremento reais.

## Passagens e impedimentos

- Backend prepara desenho/assinaturas/modelagem antes do QA; skeletons só após alinhamento, sem lógica de produção antes Red.
- QA escreve/roda testes de RLS, integridade, reader e pooling com PostgreSQL real; escopo/porta ficam explícitos.
- Ambiente: verificação inicial falhou por ausência do pipe DockerDesktopLinuxEngine. Após iniciar Docker Desktop, `docker info --format '{{.ServerVersion}}'` retornou `29.1.3`, confirmado novamente na retomada de 2026-10-06. Testcontainers PostgreSQL 17 isolado autorizado; disponibilidade do Docker ainda não comprova testes de banco.
- Nenhuma rota está disponível para integração frontend neste incremento: persistência é infraestrutura interna. SM sinalizará readiness por endpoint em tarefa futura, com contrato, branch/SHA, configuração e evidências.
- Se ambiente continuar indisponível, registrar causa comprovada/próxima ação e delimitar contrato entregue/implementação bloqueada; não iniciar toda a sprint.

## Retomada em 2026-10-06

- Backend e QA interrompidos anteriormente pelo limite de uso foram retomados com o modelo principal e seus arquivos preservados.
- Ordem: fechar contrato/skeletons → QA Red funcional → implementação → gate Feature → revisão independente.
- Builds e testes serializados no mesmo checkout. Frontend permanece no checkout de seu terminal.


## Passagem QA → Backend (modelo/migration)

- QA executou 2 testes reais: 2 falhas de assertion por tabelas/checks ausentes, 0 aprovados, 0 skipped; fixture validou banco/versão e role operacional. Evidências em artifacts/s103a/red-catalog no checkout da tarefa.
- SM liberou somente Green de mappings/migration/RLS/checks. Reader/contexto transacional aguardam testes comportamentais próprios.
- NETSDK1004 inicial era ausência de restore; MSB3277/CS1705 eram versões EF runtime10.0.4 vs Design10.0.12. Pin explícito Microsoft.EntityFrameworkCore10.0.12 em Infrastructure resolveu compilação; nenhum desses erros contou como Red.
- Revisão preliminar independente refinou checks UUID vazio, leitura coerente em single statement e rejeição de transação externa não validada. Aprovação final ainda pendente.


## Passagem QA → Backend (reader/transações)

- PostgreSQL17 real: 59 testes, 40 aprovados (catálogo2, integridade26, RLS/EF/role12), 19 falhas funcionais de comportamento ainda ausente (reader12, wrapper/context7), 0 skipped.
- Fixture e seed saudáveis; nenhum erro de compilação/conexão contado como Red. Manifesto fonte SHA256 2038B3481CF3B6FB0E8E7A62D4B33C57D294944BFE8B2E97756C8FCA78A491B7; evidências artifacts/s103a/red-behavior.
- SM liberou Green reader/wrapper/rejeição de tenant vazio. Red por NotImplementedException na ação contratada é aceito quando o cenário e asserts de resultado existem e a fixture real está saudável; teste que apenas espera o stub lançar não prova comportamento.
- Revisão parcial da migration não encontrou bloqueante; revisão final aguarda Green e verificações de cancelamento após início da transação, leitor com UserId vazio sem I/O e filtro tenant B após cache do modelo EF.


## Validação do incremento

- Green Integration: 61/61 aprovados, 0 falhas, 0 skipped, PostgreSQL17 real. Inclui cancelamento de SELECT iniciado e bloqueado, rollback/resetGUC/mesmoPID, contextos A/B com modelo cacheado, UserId vazio sem I/O e query única de snapshot.
- Gate Feature Release 20261006-171006-981484a3: build0warnings0errors; Architecture3, Domain21, Application6, Integration61 (91/91); Domain100%31linhas instrumentadas; blockers/stageFailures vazios.
- Snapshot local testado: 233246f6d9d6a3bf28a6d1ce4cfb4522f0581d168837b69793ef2932f55988b1, base7e0428c com mudanças locais. Somente documentação foi atualizada após o gate; código/testes permanecem congelados.
- Apoio inicial de ambiente: Luna; Backend, QA e revisão de isolamento: modelo principal. Falhas de sandbox foram diagnosticadas sem substituir o banco real ou enfraquecer o gate.


## Revisão independente final

- Parecer aprovado em docs/sprints/S1-03A-CODE-REVIEW.md; hashes de produção/testes/pins conferidos contra a evidência Green. Sem achados bloqueantes de funcionamento.
- Red comportamento detalhado: 18 falhas NotImplementedException na ação ausente, antes dos asserts finais, e 1 assertion do construtor; 40 testes de banco já passavam. O Green, e não esses18stubs, comprova SQL funcional do reader/wrapper.
- Incremento concluído no recorte interno. Integração em develop requer validar a combinação; main, rotas/frontend e deploy não estão liberados por esta conclusão.

## Integração validada

- Feature publicada6033823. Merge local develop7d2c2052680994a8143c150cc3f8e0618e192499 sem conflitos ou alteração de frontend.
- GateFeatureRelease na candidata limpa: run20261006-173451-a4338108;91/91,0skips,build0warnings0errors,Domain31/31=100%; snapshotb310ddf8ef3a68e5cdc839a46d578ae19d78dac20ac0390afeb82ad926a90ab8.
- Frontendlint/build passaram. Backendtreebc5b6e688bc9090b1fba34d114e1809ad7ddfd0d preservada da feature; frontendtreeed6ce0c41305fc0f4f07ed0f0ad649a813fddae4 preservada da base.
- Revisão da combinação aprovada em S1-03A-INTEGRATION-REVIEW.md. Fechamento posterior altera apenas documentos, sem mudança de produção/testes.
- Criação PR pelo conector GitHub recusada403 Resource not accessible by integration; nenhum PR criado. Branchfeature remota e pareceres versionados disponíveis. Não contornar proteção de branch; pushdevelop será normal, semforce.
- Próximo incremento pronto: S1-03B auditoria. Rotas Identity ainda indisponíveis para integração de telas; sprint/main/deploy permanecem pendentes.
