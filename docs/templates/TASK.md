# Tarefa — <identificador>

- Estado: `refining`
- Tipo: feature / bug / infraestrutura / documentação
- Escopo: frontend / backend / ambos
- Objetivo e limites:
- Referência de autorização existente (mensagem do usuário ou PRD aprovado):
- PRD e ADRs aplicáveis:
- Contrato API e impacto de dados:
- Design/padrão visual aprovado, se aplicável:
- Branch, commit base e checkout:
- Responsáveis: orquestrador / QA / Dev / revisor / release:
- Ambientes e operações já autorizados:

## Critérios de aceite

| ID | Dado / Quando / Então | Teste que comprova | Resultado |
| --- | --- | --- | --- |
| AC-01 | Preencher | Preencher | Pendente |

## Plano de testes

- Suítes e cenários exigidos:
- Limites, erros e permissões:
- Isolamento entre tenants, quando aplicável:
- Contrato e fluxos de front/backend:
- Verificações visuais/acessibilidade, quando aplicáveis:

## Evidências

- Red: comando, revisão, relatório e falha esperada:
- Green: revisão e resultados reais:
- Integração/CI: execução e SHA candidato:
- Revisão independente: responsável, SHA e parecer:
- Homologação: versão, ambiente e smoke tests:
- Produção: autorização aplicável, versão e verificação:

## Bloqueios e passagem entre agentes

Registrar o impedimento concreto, a evidência, o dono, o que falta para retomar e a próxima ação. Cada passagem contém objetivo, critérios, arquivos de responsabilidade, dependências, revisão atual e evidências.

## Frontend — fase atual

Por decisão do usuário, testes automatizados frontend (unitários/componentes) e E2E ficam adiados. Aplicar lint, build, revisão independente e verificação manual dos fluxos disponíveis, com evidências e limitações registradas. Não criar suítes, instalar runners ou exigir relatórios/gate Frontend nesta fase. Registrar Red/Green e cobertura para o backend conforme seu escopo; os requisitos de backend permanecem.
