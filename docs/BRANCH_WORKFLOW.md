# Integração em develop e estabilidade em main

O usuário autorizou `develop` como integração de frontend/backend e `main` para a candidata estável. Essa autorização permite organizar e integrar o código conforme os critérios abaixo; publicação em ambiente continua dependendo da autorização aplicável. A Sprint 01 não inclui deploy.

## Caminho da entrega

1. Criar uma branch de tarefa e um worktree próprio a partir da base acordada de `develop`. Registrar base, dono dos arquivos, critérios e dependências. Na Sprint 01, `feature/sprint-01-identity` é a branch de implementação do backend; a frente frontend coordena sua própria branch.
2. Implementar no worktree da tarefa. Backend exige QA Red antes de Green, build sem warnings, quatro suítes com testes reais e Domain >=90%, incluindo PostgreSQL real para isolamento. Frontend exige lint/build, revisão e verificação manual dos fluxos disponíveis; testes automatizados frontend/E2E permanecem adiados.
3. Submeter diff e evidências da revisão candidata a um revisor independente. Corrigir bloqueios e confirmar a revisão sobre o código resultante. Alterações posteriores invalidam as evidências afetadas.
4. Integrar entregas revisadas em `develop` no checkout de integração. Resolver conflitos com os donos, atualizar o cliente do contrato quando aplicável e validar a combinação. Evidência das branches isoladas não aprova a integração.
5. Abrir a promoção de `develop` para `main` somente quando a candidata estiver estável: frontend lint/build e verificação manual aprovados; backend Feature aprovado; critérios BDD cumpridos; revisão independente da integração; checkout limpo e SHA identificado. Executar o CI da candidata e conferir o resultado da revisão de PR. Preservar correspondência entre a árvore testada e a árvore promovida; conflitos ou mudanças exigem nova validação.
6. Registrar o SHA em `main` e conferir o CI disparado pelo push. Falha mantém a candidata sem aprovação de estabilidade; coordenar a correção ou reversão. Merge em `main` não significa aplicação publicada.

## Coordenação e checkout existente

Progresso parcial de contrato, testes e núcleo de domínio pode ser registrado e revisado na branch de tarefa sem concluir todo o módulo. O núcleo S1-02 pode permanecer em `feature/sprint-01-identity` após Green e revisão; isso não equivale à aprovação da candidata funcional em `develop`. Documentação e configuração do workflow podem ser integradas como preparação, com limitações explícitas; nunca usar esse avanço para aprovar funcionalidades com gate Feature pendente.

O checkout de integração desta execução é `C:\Users\jefle\Documents\Codex\2026-10-06\por\work\develop`, branch `develop`. O terminal frontend existente em `C:\Fatura-ótica` pertence à outra frente: este workflow não muda sua branch nem altera seu frontend. A frente frontend coordena a entrega por branch/PR e informa SHA, revisão e resultados. Não integrar mudanças locais incompletas por cópia de arquivos.

Cada implementação concorrente usa seu próprio worktree. Contrato, migrations, lockfiles e CI têm dono coordenado. Não executar instalações/builds simultâneos no mesmo checkout. O grafo e os artefatos de teste pertencem a cada checkout e permanecem ignorados pelo Git.

## CI e proteções

`quality.yml` executa em PRs, pushes em `develop`/`main` e acionamento manual. Frontend executa instalação, lint e build. Backend executa restore e o runner que compila a solução e aplica `Feature`; Bootstrap não substitui esse gate. O CI não faz merge nem deploy.

Proteções remotas ainda não foram verificadas. Antes da promoção, conferir no provedor se `develop` e `main` exigem revisão independente e os checks `Frontend quality`/`Backend quality`, além de nova revisão quando o diff mudar. O YAML não configura essas proteções. Enquanto não houver comprovação, o coordenador aplica os gates manualmente e registra a limitação; nunca declara a integração automaticamente protegida.

## Impedimentos da Sprint 01

| Impedimento | Efeito e condição para avançar |
| --- | --- |
| Motor Docker/PostgreSQL indisponível na verificação inicial | Contrato e domínio podem avançar. Integração com PostgreSQL real, RLS e DoD funcional dependem de banco/role operacional disponíveis; não substituir por SQLite/InMemory nem ignorar testes. |
| Suítes Domain/Application/Integration inicialmente vazias | O gate Feature bloqueia a candidata até testes reais e cobertura exigida passarem. Architecture/Bootstrap verde não basta. |
| SMTP real sem configuração | Adaptador e fluxo podem ser verificados com captura local. Não afirmar entrega a destinatário real nem prontidão de envio em homologação/produção sem configuração e evidência do destino. |
| Frontend desenvolvido em outra conversa/terminal | Backend pronto não conclui a sprint. Integrar a entrega coordenada e registrar verificação manual dos fluxos completos antes de promover a candidata. |
| Proteções e CI remoto sem comprovação | Registrar resultados remotos quando a configuração for versionada/enviada e conferir políticas do provedor; validação local não comprova execução remota. |

Referências: [workflow de agentes](AGENT_WORKFLOW.md), [spec Sprint 01](sprints/SPRINT-01-IDENTITY.md) e [revisão do workflow](sprints/SPRINT-01-WORKFLOW-REVIEW.md).
