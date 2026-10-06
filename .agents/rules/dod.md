---
trigger: model_decision
description: Aplicar para entender quando uma Tarefa ou Sprint pode ser considerada formalmente concluída pelo time.
---

# Definition of Done (DoD) - Fatura Ótica

Para que qualquer agente autônomo (UX, Front-end ou Back-end) considere uma tarefa "Done" (Concluída) e pare o ciclo de execução, os seguintes critérios devem ser atingidos:

## 1. Funil de Design (UX/UI)
- O protótipo da tela deve ter sido gerado via ferramenta (Stitch) garantindo a identidade corporativa do projeto.
- O link do código HTML do design deve ter sido repassado com sucesso ao Front-end.

## 2. Código e Implementação (Front-end)
- A tela foi implementada no Next.js (`app/nome-da-rota/page.tsx`).
- O Front-end utilizou o código extraído do UX, não "invenções" próprias de CSS.
- **IDs Semânticos Obrigatórios**: 100% dos elementos interativos (botões, inputs, selects, tabs, modais, links e tabelas) possuem IDs semânticos únicos seguindo o padrão da regra `semantic-ids.md`.
- **Responsividade Obrigatória**: 100% dos componentes, headers, tabelas, modais e layouts de tela devem ser estritamente responsivos e adaptáveis a múltiplos tamanhos de tela (desde notebooks de balcão de 1366x768 até monitores Full HD 1080p e Ultrawide 2560px+), sem cortes no topo, elementos "engolidos", quebras de layout ou sobreposição de textos.
- O comando de análise estática (`npm run build` ou similar) deve passar sem erros fatais no terminal.

## 2.1 Código e Implementação (Back-end .NET)
- O PRD correspondente está **aprovado pelo PO** e possui critérios de aceite testáveis (Given/When/Then ou tabela de exemplos).
- Testes de aceite escritos **antes** da implementação (evidência do estado Red registrada).
- `dotnet build` sem erros nem warnings e `dotnet test` 100% verde.
- Cobertura de linhas do projeto `Domain` ≥ 90%.
- Testes de integração com PostgreSQL real (Testcontainers) cobrindo isolamento entre tenants para todo endpoint novo.
- Contrato OpenAPI atualizado e client TS do front regenerado quando houver mudança de contrato.

## 3. Revisão (QA)
- O QA analisou o código em relação ao `SPEC.md`.
- O QA validou que todos os elementos interativos e modais possuem seus respectivos IDs semânticos (reprovação imediata se faltar ID).
- O QA validou a responsividade e adaptação dos componentes em resoluções de tela distintas (1366px, 1440px, 1920px), reprovando entregas com componentes quebrados, cortados ou não responsivos.
- Nenhuma falha de arquitetura, loop infinito ou erro de roteamento está presente.

Se a tarefa cumpre esses critérios, o Scrum Master declara "Done" e finalmente chama o usuário (PO) para visualização final. Não interromper o PO antes disso.


## Aplicabilidade e qualidade da entrega

Aplicar os critérios ao escopo da tarefa conforme `docs/AGENT_WORKFLOW.md`. UX e verificação visual são exigidos para alterações de tela/fluxo; componentes e estados já aprovados podem ser reutilizados como referência. Tarefas de backend/infraestrutura sem mudança de interface não exigem um novo protótipo no Stitch.
Build verde não equivale a testes funcionais. No backend, uma feature exige os testes previstos, contagens não vazias e gate Feature; Bootstrap só comprova preparação técnica. No frontend, por decisão do usuário nesta fase, testes automatizados de componentes/unitários e E2E ficam adiados: exigir lint e build aprovados, critérios de aceite atendidos, revisão independente e verificação manual dos fluxos disponíveis, registrando evidências e limitações. Não exigir o gate Frontend nem relatórios de testes para concluir tarefas frontend nesta fase.
Entrega de código concluída e aplicação publicada são estados distintos: a publicação exige autorização de ambiente, revisão imutável e smoke tests após o deploy, segundo `release-manager.md`.