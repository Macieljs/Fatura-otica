---
trigger: model_decision
description: Aplicar obrigatoriamente em todo desenvolvimento, refatoração ou revisão de componentes e telas no projeto para garantir IDs semânticos únicos em 100% dos elementos.
---

# Regra Obrigatória: IDs Semânticos Únicos em Telas e Componentes

Esta regra é **inegociável e permanente** para todo o time autônomo (Scrum Master, Front-end Developer, UX/UI Designer e QA / Code Reviewer).

## 1. Princípio Fundamental
Nenhum elemento interativo (botão, input, select, textarea, checkbox, tab, link, card clicável), container estrutural ou modal pode ser criado sem um **ID semântico único**. Isso viabiliza testes automatizados end-to-end, rastreabilidade no DOM, integração com ferramentas de automação e telemetria.

## 2. Padrão de Nomenclatura Oficial
Todos os IDs devem ser grafados em `kebab-case` e seguir estritamente a convenção:
```
[modulo]-[submodulo-ou-contexto]-[tipo-elemento]-[acao-ou-nome]
```

### Exemplos Válidos:
- **Botões:**
  - `btn-estoque-novo-produto`
  - `btn-modal-novo-produto-salvar`
  - `btn-modal-novo-produto-fechar`
  - `btn-pdv-finalizar-venda`
  - `btn-os-avancar-step-2`
- **Campos de Entrada (Inputs / Selects / Textareas):**
  - `input-modal-produto-marca`
  - `input-modal-produto-sku`
  - `input-cliente-cpf`
  - `select-receita-tipo-lente`
- **Modais e Containers:**
  - `modal-estoque-novo-produto`
  - `modal-pdv-condicoes-pagamento`
- **Abas e Filtros:**
  - `tab-estoque-categoria-armacoes`
  - `tab-estoque-categoria-lentes`
- **Tabelas e Cards:**
  - `table-estoque-kardex`
  - `card-metricas-faturamento`

## 3. Matriz de Responsabilidades
- **Scrum Master:** Ao redigir e delegar qualquer tarefa de Front-end, deve incluir obrigatoriamente o critério de aceite: *"Todos os novos elementos visuais e interativos devem possuir IDs semânticos no padrão oficial"*.
- **Front-end Developer:** Deve implementar os IDs semânticos no JSX/TSX durante o desenvolvimento. Nunca postergar ou criar elementos com IDs genéricos ou repetidos.
- **QA / Code Reviewer:** Deve inspecionar o código da tela/componente e **REPROVAR AUTOMATICAMENTE** a entrega caso encontre botões, inputs ou modais sem atributo `id` padronizado.
- **Definition of Done (DoD):** Nenhuma tarefa ou sprint de front-end atinge 100% sem a validação formal de IDs semânticos.
