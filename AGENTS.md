# Fatura Ótica — instruções comuns aos agentes

Este é o projeto completo do ERP Fatura Ótica. A raiz contém um único repositório Git.

## Estrutura e escopo

- `frontend/`: aplicação Next.js. Ler `frontend/AGENTS.md` antes de alterar telas, componentes ou comportamento do front. O design system e as regras de IDs semânticos estão nesse documento.
- `backend/`: solução .NET 10, com `src/`, `tests/` e `docs/adr/`. Ler `backend/AGENTS.md` e `.agents/rules/back-end-developer.md` antes de trabalhar no backend.
- `.agents/rules/`: regras compartilhadas de desenvolvimento, QA e Definition of Done.
- `.agents/skills/graphify/`: skill Graphify disponível no projeto para os agentes que suportam skills neste diretório.
- `docs/`: documentação que envolve frontend, backend e ferramentas do projeto.
- `scripts/`: comandos executados a partir da raiz, independentemente do diretório atual.
- `graphify-out/`: grafo gerado do projeto completo, ignorado pelo Git.

Os caminhos de componentes citados no design system são relativos a `frontend/`.
Preservar as alterações locais de outros agentes. Antes de concluir uma tarefa, consultar `.agents/rules/dod.md` e validar a parte alterada.

## Graphify para frontend e backend

O grafo principal é `graphify-out/graph.json`, na raiz deste repositório. Não gerar grafos separados dentro de `frontend/` ou `backend/` por padrão.

Executar os comandos na raiz ou usar `scripts/graphify.ps1`, que resolve a raiz pelo próprio caminho:

```powershell
.\scripts\graphify.ps1 query "PageHeader" --budget 1200
.\scripts\graphify.ps1 query "AddInfrastructure" --budget 1200
.\scripts\graphify.ps1 explain "PageHeader"
.\scripts\graphify.ps1 path "A" "B"
.\scripts\graphify.ps1 update .
```

Para perguntas sobre código, consultar o grafo antes de navegar amplamente pelos arquivos e conferir o código nos caminhos e linhas retornados. Usar `path` para relações e `explain` para um conceito. Ler `GRAPH_REPORT.md` para visão geral quando a consulta não for suficiente.

Após modificar código, executar uma atualização a partir da raiz. O comando `update` usa extração AST, sem chamadas de LLM. O grafo representa relações estáticas encontradas no código; uma relação entre frontend e backend não deve ser presumida se ainda não houver contrato ou chamada implementada.

O Graphify deve estar instalado no ambiente do agente: `python -m pip install graphifyy`. A instalação local de uma máquina não acompanha o clone do repositório.
As consultas também gravam um marcador de uso no cache do grafo. Agentes precisam de escrita em `graphify-out/`, inclusive para consultar. Se o ambiente permitir apenas leitura do projeto, consultar uma cópia do grafo em uma área gravável; não insistir em um comando bloqueado.

Não versionar o grafo, caches, marcadores com caminhos da máquina ou arquivos HTML gerados. As instruções e os scripts são versionados. Graphify é uma ferramenta do ambiente dos agentes, sem declaração de dependência neste projeto. Em um novo clone, executar `scripts/graphify.ps1 update .` para gerar o grafo.

## Verificação e registro

- Frontend: `npm run build:frontend` na raiz.
- Backend: `npm run build:backend` e `npm run test:backend` na raiz. Mudanças de domínio e endpoints seguem os requisitos de TDD, cobertura e isolamento de tenants em `.agents/rules/`.
- Mudanças que afetam contrato exigem OpenAPI atualizado e atualização do cliente TypeScript quando existir.
- Registrar alterações funcionais do front em `frontend/docs/SPEC.md`; decisões do backend em `backend/docs/adr/`; organização comum em `docs/`.
- A reorganização em `frontend/` e `backend/`, com Git e Graphify na raiz, está descrita em `docs/PROJECT_STRUCTURE.md`.
## Workflow de agentes

Para tarefas de desenvolvimento e liberação, ler `docs/AGENT_WORKFLOW.md` e `.agents/rules/agent-workflow.md`. O orquestrador delega testes, implementação e revisão independente; usa os modelos em `docs/templates/` para registrar escopo autorizado, estado e evidências.
O workflow exige identidade da revisão/snapshot e critérios de liberação. Backend mantém testes realmente executados. No frontend atual, por decisão do usuário, testes automatizados e E2E ficam adiados; aplicar lint, build, revisão independente e verificação manual, sem exigir o gate Frontend ou instalar runners. O modo Bootstrap do backend valida preparação e não autoriza entrega funcional. O CI local está em `.github/workflows/quality.yml`; só haverá execução remota depois de versionar e enviar essa configuração ao repositório.
Registros, logs e relatórios de execução ficam em `artifacts/`, ignorado pelo Git e pelo grafo. A liberação segue `.agents/rules/release-manager.md` e a autorização aplicável ao ambiente.
## Sprint ativa e integração

A Sprint 01 de backend está definida em `docs/sprints/SPRINT-01-IDENTITY.md`, com autorização registrada e escopo empresarial de identidade. Esse documento governa o recorte atual; o PRD legado Node/Drizzle em frontend/docs não deve orientar a implementação desta sprint.

Seguir `docs/BRANCH_WORKFLOW.md`: branches de tarefa/worktrees próprios → revisão e gates → `develop`; candidata estável revisada → `main`. Não alterar a branch ou arquivos do checkout de outro terminal. Esta sprint não autoriza deploy.

## Modelos por tarefa

O Scrum Master deve aplicar `docs/MODEL_ROUTING.md`: solicitar `gpt-6-luna` para apoio simples e tarefas pequenas de risco baixo; herdar o modelo principal para implementação/revisão críticas. Classificar antes de delegar, enviar contexto delimitado e registrar modelo solicitado/resultado/escaladas. Escolher o modelo na ferramenta; persona textual não muda o runtime.

## Execuções pequenas

Seguir `docs/INCREMENTAL_EXECUTION.md`: cada run entrega um incremento delimitado com aceite, testes/verificações aplicáveis e revisão. Registrar conclusão do incremento, integração e conclusão da sprint separadamente. Não tentar fechar todos os módulos em uma única execução nem iniciar outro incremento automaticamente ao encerrar o recorte.
