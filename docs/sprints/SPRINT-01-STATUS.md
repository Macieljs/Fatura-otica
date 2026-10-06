# Sprint 01 — acompanhamento do Scrum Master

Data: 2026-10-06. Estado da sprint: em execução; conclusão funcional ainda bloqueada.

## Base e execução

- Base empresarial/spec: `docs/sprints/SPRINT-01-IDENTITY.md`, autorização do usuário registrada.
- `develop` criada e publicada em origin; commit inicial do workflow `8a60e57692f2abcfc8cb63c6331e26a41465d7cc`.
- Checkout de integração: `work/develop`. Implementação: `work/sprint-01-identity`, branch `feature/sprint-01-identity`.
- Checkout frontend original preservado em main; a frente frontend precisa usar branch de tarefa/worktree próprio a partir de develop para as próximas entregas.
- Papéis ativos: SM coordenador; Backend contrato/produção; QA test-first; revisor independente workflow/código.

## Passagens comprovadas

1. Spec/BDD autorizados e versionados.
2. Contrato/modelagem S1-01 entregues pelo backend; OpenAPI planejado, não endpoints funcionando.
3. QA Red S1-02: Domain21 executados/21falhas; Application6/6falhas; sem skipped. Compilação aprovada, falhas NotImplementedException de comportamento ausente. Logs/TRX em artifacts/qa/s1-02-red no checkout da tarefa.
4. SM liberou Green somente para o núcleo de políticas de acesso S1-02. Implementação validada: Domain21/21, Application6/6 e Architecture3/3; build0warnings0errors; Domain100%33/33linhas.
5. Revisão independente do workflow aprovada sem inconsistência bloqueante da spec; revisão independente do núcleo S1-02 aprovada, com hashes e evidências no parecer da branch feature.

## CI remoto observado

Execução: https://github.com/Macieljs/Fatura-otica/actions/runs/37485593867
SHA: `8a60e57692f2abcfc8cb63c6331e26a41465d7cc`.
Frontend quality: success. Backend quality: failure na etapa Behavioral tests and coverage, exit1. Os logs completos exigiram autenticação (API403); não afirmar causa detalhada apenas pela anotação. Suítes funcionais vazias na base são um impedimento local conhecido e o gate Feature permanece obrigatório. Vercel Preview Comments: success não comprova deploy da API.

## Obstáculos detectados e tratamento

| Obstáculo | Tratamento/estado |
| --- | --- |
| Analyzer CA1711 no nome AccessPermission | Backend e QA renomearam contrato para AccessAction. Compilação passou; erro de build não foi aceito como Red. |
| Builds simultâneos compartilhando DLL no checkout | QA passou a executar suites em sequência. Dev aguarda QA encerrar antes do próprio build. Worktree separa frontend/backend, não torna builds simultâneos na mesma árvore seguros. |
| Docker Desktop sem motor Linux | Tentativa start sem progresso interrompida; status/info continuam sem servidor. PostgreSQL real/AC13 e conclusão funcional bloqueados. |
| SMTP real sem configuração | Canal automático SMTP aprovado. Contrato pode avançar; host/porta/remetente/segredos externos e captura local/entrega real ainda precisam ser configurados e verificados. |
| Integração frontend em outro terminal | Entregar contrato e critérios à frente; não editar suas telas. Cliente gerado/fluxo integrado/manual ainda pendentes. |
| Proteções de branches sem comprovação | CI aciona develop/main; revisão obrigatória/proteções precisam ser configuradas/verificadas no provedor antes de promover candidata estável. |

## Próximos passos

- Núcleo S1-02 concluído nesta etapa de início: código testado/revisado e publicado em feature/sprint-01-identity, commit55ea2cd. Não representa endpoints ou sprintDone.
- Persistência/RLS com PostgreSQL real, cadastro/ativação SMTP, autenticação/sessão/recuperação e integração frontend seguem no backlog da sprint.
- Código parcial permanece na branch de tarefa; não promover candidata funcional a develop/main sem gates aplicáveis e evidências da combinação.
- Não houve merge de develop para main ou publicação autorizada pelo SM nesta sprint.

## Verificações finais desta etapa

- Red → Green → QA → revisão independente executados para o núcleo de autorização.
- Branch feature publicada, sem merge funcional para develop/main. Contrato amplo possui14operações planejadas; nenhuma dessas operações HTTP foi implementada nesta etapa.
- Coletor de cobertura produz cópia de attachment do mesmoXML. O gate foi corrigido pelo QA para deduplicar por SHA256 antes de parse, mantendo ambiguidade para conteúdos distintos.5fixtures do mecanismo verificadas, revisão independente aprovada; não são testes funcionais.
- A restrição de comunicação local VSTest/datacollector no sandbox causou timeout90s. Executar as suites com permissão adequada resolveu; testes/gates não foram enfraquecidos.
- Modelo: agentes desta etapa herdaram o modelo do chat. É possível escolher modelos por tarefa mediante instrução do usuário; nenhuma troca de modelo foi aplicada nesta etapa.
- Próximo passo: disponibilizar PostgreSQL real (Docker local ou execução remota controlada) e implementar S1-03/04/05 com QA Red, incluindo SMTP com captura local. Entrega real de e-mail requer configuração de destino externo; não confundir falta de credenciais de produção com impossibilidade de testar o adaptador.