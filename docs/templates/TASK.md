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

## Delegação e modelos

| Subtarefa/agente | Risco | Modelo solicitado | Motivo | Contexto/caminhos enviados | Resultado/validação | Fallback/escalada |
| --- | --- | --- | --- | --- | --- | --- |
| Preencher | baixo / crítico | Luna / principal | Preencher | Preencher | Pendente | Nenhum |

Seguir `docs/MODEL_ROUTING.md`; registrar confirmação do runtime quando disponível. Sem telemetria, não declarar economia medida.

## Recorte desta execução

- ID do incremento e item/módulo da sprint:
- Resultado verificável desta execução:
- Fora de escopo:
- Dependências e commit que as contém:
- DoD aplicável ao incremento:
- Estado do incremento: pendente / em execução / validado / bloqueado
- Estado da integração: pendente / integrada e verificada
- Próximo incremento pronto ou impedimento a resolver:

Seguir `docs/INCREMENTAL_EXECUTION.md`. O término desta tarefa não declara a sprint concluída nem autoriza release.
