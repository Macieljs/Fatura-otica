# Sprint 01 — revisão independente do núcleo S1-02

- Data: 2026-10-06.
- Branch: `feature/sprint-01-identity`, checkout `work/sprint-01-identity`.
- HEAD de base: `b01ea3a37fb7f459e588dd853eac0673e552d621`; implementação e testes novos ainda não versionados na revisão inicial.
- Escopo: `AccessPolicy`, `CurrentAccessAuthorizer` e testes Domain/Application, comparados com spec S1, IDENTITY_MODEL, ADR-0005 e contrato design-first.
- Autor: agente Backend. Revisor: agente independente responsável por este parecer.
- Status: núcleo parcial aprovado por inspeção estática, com Green, Architecture e cobertura conferidos nos relatórios do Dev; build da solução aprovado conforme resultado informado e documentado pelo Dev.

## Achados bloqueantes

Identidade dos arquivos revisados (SHA-256):

| Arquivo | Hash |
| --- | --- |
| AccessPolicy.cs | F3356B4F2F48D37E6E189A98366CDD34DBF3EBE30244DF533ACD80DC36287EA0 |
| CurrentAccessAuthorizer.cs | C239E20E1CE817A7931AED12F3D75112CC0A8CB0FA0ACBFB91DA1F33A9DF1FD5 |
| AccessPolicyTests.cs | 6C11BBAFCD6863EEDD83EAD3F1A14F0404FA607A892917762BFEE237B8A21DCF |
| CurrentAccessAuthorizerTests.cs | A2051A6252BADE2FA90FFE8B3F1A03472032265BCC7BA51A30572DC8A426D236 |

Nenhum bug concreto bloqueante identificado por inspeção na implementação atual do núcleo. Este parecer não declara execução de testes pelo revisor. O Dev executa build/testes sequencialmente; não foram iniciadas execuções concorrentes.

## Verificações estáticas

| Critério | Evidência no código |
| --- | --- |
| Contexto inválido nega acesso | AccessPolicy:18–31 valida nulos, IDs vazios, status/ação desconhecidos e papéis/grants fora dos escopos permitidos. Casts de enums malformados não promovem direitos. |
| Tenant restrito inclusive para Owner | AccessPolicy:24–26 verifica tenant do usuário/alvo; grants de outro tenant são rejeitados em :29–31 antes de qualquer autorização. |
| Pending/Blocked negados | AccessPolicy:33–34 impede qualquer ação antes das permissões de perfil, Owner ou administrador. |
| Separação empresa/filial | Apenas Owner/AccessAdministrator em TenantRoles; apenas Seller/BranchManager em BranchGrants. Admin sem grant operacional não recebe acesso à filial. Gestor não administra acessos. |
| Contexto de filial não concede direitos | AccessPolicy:44–55 exige alvo para ações operacionais e grant explícito, salvo Owner no próprio tenant. Cadastro pendente exige BranchManager/Owner. |
| Snapshot atual na próxima operação | CurrentAccessAuthorizer:28 consulta reader em toda chamada, sem cache nem uso de claims JWT para reconstruir concessões; testes existentes trocam grants/status entre chamadas. |
| Reader não pode trocar identidade | CurrentAccessAuthorizer:32–33 nega snapshot cujo UserId não corresponde ao solicitado. Tenant também passa pela policy. |
| Falha/cancelamento não autoriza | Reader ausente nega; exceções do reader não são transformadas em Allow; cancelamento propagado antes da decisão. |
| Ausência de concessão implícita | A policy avalia snapshots e não cria/muta vínculos. A prova de cadastro que mantém perfil pendente e não concede direitos pertence ao caso de uso S1-04, ainda não implementado. |

Os testes revisados cobrem tenant estrangeiro, grant estrangeiro, papéis em escopo incorreto, enum desconhecido, gestor/vendedor/admin/Owner, filial obrigatória, bloqueio, revogação, reader com identidade divergente e cancelamento. A leitura dos testes não substitui seus resultados executados.

## Limites de segurança do núcleo

BranchScope contém IDs, sem existência/estado da filial. Conforme IDENTITY_MODEL, o adaptador/API deve validar filial existente e ativa antes de fornecer contexto confiável; a policy sozinha não comprova isso. Autenticação/sessão válida também pertence à API. Grants carregados pelo reader devem refletir estado persistido atual; a porta/fake não comprova isolamento PostgreSQL, RLS ou concorrência transacional.

AC-01/03/04/08/09/10 têm cobertura parcial de autorização neste nível. AC-02 depende do cadastro e AC-13 depende do PostgreSQL real. Endpoints, migrations, tokens, SMTP, refresh/logout, cliente e frontend não são qualificados por esta revisão.

## Evidências pendentes e conclusão

QA registrou Red funcional: 21 Domain + 6 Application, todos falhando por NotImplementedException com compilação válida, em `SPRINT-01-QA.md`.

Relatórios Green gerados pelo Dev e conferidos diretamente pelo revisor, sem execução adicional:

| Evidência | Resultado |
| --- | --- |
| artifacts/dev/s1-02-green/domain/domain-green.trx | 21 executados, 21 aprovados, zero falhas/ignorados; TestRun f1a379db-3c77-48f0-ae6d-8ed249d70ade. |
| artifacts/dev/s1-02-green/application/application-green.trx | 6 executados, 6 aprovados, zero falhas/ignorados. |
| artifacts/dev/s1-02-green/architecture/architecture-green.trx | 3 executados, 3 aprovados, zero falhas/ignorados; contadores conferidos diretamente. |
| artifacts/dev/s1-02-green/domain/cadb1a8c-13bb-40ea-871f-977ccd2410a8/coverage.cobertura.xml | FaturaOtica.Domain, cobertura de linhas 100%, 33 cobertas/33 instrumentadas; cobertura de branches aproximada 98,07%. |

SHA-256 do XML de cobertura: `27A3804E0AB1BA020874C4F682AA9F5B2E9DEFD187CB93E7C4C210DDF5F002C3`. Existe cópia byte a byte no diretório de attachment `domain/jefle_BOOK-O4JMJ7MUG4_2026-10-06_12_21_29/In/BOOK-O4JMJ7MUG4/coverage.cobertura.xml`; o TRX referencia esse attachment. Não somar as duas cópias: são 33 linhas, não 66, e não duas execuções independentes de cobertura.

O Dev informou e documentou em `artifacts/dev/s1-02-green/BACKEND_REPORT.md` o build da solução Debug com NoRestore concluído com código 0, zero warnings e zero erros; o revisor não executou esse build. Architecture confirmou 3/3 nos contadores TRX. O núcleo pode permanecer na branch feature como progresso parcial; não representa gate Feature aprovado, sprint concluída, merge para develop/main ou deploy.

Alterações posteriores em produção/testes exigem confirmar novamente as partes afetadas e identificar o snapshot/SHA final. Não houve commit/push nesta revisão.
