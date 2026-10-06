---
trigger: model_decision
description: Aplicar ao organizar e executar tarefas com agentes, testes, revisão e liberação.
---

# Execução com agentes

Ler `docs/AGENT_WORKFLOW.md` a partir da raiz do checkout atual e usar os modelos em `docs/templates/`.

1. O orquestrador registra escopo, critérios e autorização já existente. Atualiza spec/backlog, status geral e registro especializado a cada transição (contrato, Red, Green, impedimento, revisão e integração), com evidência observada e próxima ação; não deixa as docs para o fechamento da sprint. Não pedir a mesma aprovação novamente em cada etapa.
2. Delegar testes ao QA e implementação aos agentes da área. Quando houver ferramentas de subagentes, usar agentes internos da tarefa, mantendo o contexto necessário e donos claros para os arquivos.
3. Depois da implementação, delegar a revisão a um agente independente do autor, com o diff e as evidências da revisão candidata.
4. Para comportamento novo de backend, registrar Red funcional antes de Green. No frontend, testes automatizados e E2E ficam adiados por decisão do usuário; aplicar lint, build, revisão independente e verificação manual nesta fase. Falhas de compilação/infraestrutura precisam ser identificadas separadamente.
5. CI e relatórios têm precedência sobre afirmações de sucesso. Zero testes ou relatório ausente bloqueiam as suítes exigidas do backend. No frontend atual, ausência de testes automatizados/E2E não bloqueia; lint, build e aceite continuam obrigatórios. Não executar o gate Frontend preparado para a fase futura como requisito atual.
6. Modo Bootstrap valida apenas preparação do backend. Entregas funcionais exigem o gate Feature, cenários de aceite e revisão independente.
7. Isolar implementações concorrentes em branches/checkouts; não fazer escritas concorrentes no mesmo lockfile, migration ou contrato. Integrar e testar a candidata combinada.
8. Graphify é uma ferramenta do ambiente. Atualizar o grafo do checkout de trabalho e usá-lo para localizar código; resultados do grafo não aprovam testes nem revisão.
9. Release exige SHA imutável, checkout limpo, evidências correspondentes e autorização aplicável ao ambiente. Seguir `release-manager.md`.
10. Não remover testes, enfraquecer critérios ou editar um PRD para fingir aprovação. Registrar bloqueio e condição de retomada.

O CI executa verificações; não inicia os agentes nem publica as aplicações. Um orquestrador precisa executar as delegações e acompanhar as etapas.

## Política de modelos na delegação

Seguir `docs/MODEL_ROUTING.md`. O padrão para backend cotidiano de baixo risco com contrato fechado (CRUD/endpoints comuns, testes e validações de regras decididas, correções locais) é solicitar `gpt-6-luna` com contexto recortado. Arquitetura, autenticação, permissões, RLS, migrations, integridade crítica e revisão independente crítica usam `gpt-6.1-sol` ou modelo principal herdado. Registrar classe de risco, modelo solicitado, motivo, validação e fallback/escalada. Ambiguidade ou risco crítico exige escalada imediata; tarefa simples tem no máximo uma tentativa de correção antes de escalar. Falhas de ambiente precisam de diagnóstico, não troca automática de modelo. Não definir Luna como padrão global nem fingir seleção apenas pela persona.

## Um incremento por execução

Seguir `docs/INCREMENTAL_EXECUTION.md`. Selecionar uma tarefa pronta pequena; registrar aceite, fora de escopo, dependências e modelos. Encerrar após validar/revisar o incremento ou registrar bloqueio concreto; entregar próxima ação. Não exigir toda a sprint para registrar um incremento concluído em sua branch e não iniciar outro incremento automaticamente nessa run. Gate de integração/release e DoD da sprint permanecem. Usar a autorização de escopo existente ao retomar.
