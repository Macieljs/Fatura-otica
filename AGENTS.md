<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 👓 AGENTS.md — Governança, Padrões Técnicos e Design System do Fatura Ótica

> **Status:** Documento Vivo de Arquitetura & Diretrizes Corporativas  
> **Última Atualização:** Outubro / 2026 (Sprint 21)  
> **Escopo:** Módulo Principal `fatura-otica` (ERP Óptico & Gestão Clínica B2B)

---

## 1. Visão do Produto & Filosofia Arquitetural

O **Fatura Ótica** é um sistema B2B corporativo de missão crítica projetado para redes e pequenas óticas de varejo, optometristas e laboratórios ópticos terceirizados.  
Nosso princípio orientador é a **Precisão Clínica (Clinical Precision Enterprise)**: a interface deve transmitir rigor técnico, sobriedade médica, máxima legibilidade de dados dióptricos e ergonomia de alta velocidade para o balcão.

### 🚫 O que NUNCA fazer (Antipatterns Absolutos):
- **Zero Emojis Infantis / Brinquedo:** Não utilizar emojis como `📍`, `⏰`, `🏷️`, `💳`, `🙏`, `👓`, `🚀`, `🔥` em interfaces, balões de chat, headers ou mensagens automáticas. Usar ícones institucionais do Google Material Symbols (`location_on`, `schedule`, `badge`, `credit_card`).
- **Zero Gradientes Carnavalescos:** Nunca usar gradientes fora da paleta oficial ou degradês saturados (roxo, rosa, laranja, neon). Toda a base cromática deve ancorar no **Deep Navy `#052659`** e tons clínicos suaves.
- **Zero Over-Design / Poluição de Informações:** Menos é mais. Evitar adicionar cards explicativos desnecessários ("Dicas da Consultora"), ilustrações falsas, molduras pesadas ou elementos não solicitados.
- **Zero Mudanças de Layout Inesperadas (Zero Layout Shift):** Animações devem ser micro-interações funcionais (`duration-200`, translações sutis de 2px `hover:-translate-y-0.5`), nunca saltos bruscos.

---

## 2. Design System Oficial: *Clinical Precision Enterprise*

### 2.1 Paleta Cromática Rígida
A aplicação utiliza estritamente o sistema de cores do Fatura Ótica:

| Token / Cor | Hexadecimal | Uso Obrigatório | Proibições |
| :--- | :--- | :--- | :--- |
| **Deep Navy (Primária)** | `#052659` | Títulos `h1/h2`, Sidebar global, botões primários, texto de maior hierarquia. | Não substituir por preto puro `#000` nem por cinza genérico. |
| **Active Navy / Cerulean** | `#5483B3` | Ícones secundários, links hover, bordas ativas, foco de inputs, subtítulos técnicos. | Não usar azul saturado elétrico. |
| **Soft Steel Blue** | `#7DA0CA` | Bordas secundárias, badges neutros, texto de metadados clínicos. | Não utilizar como fundo primário de texto claro. |
| **Clinical Ice Blue** | `#C1E8FF` | Bordas de cards, divisores de tabela, anéis de foco sutil, backgrounds de destaque leve. | Não usar com opacidade que cause baixo contraste. |
| **Background Neutro** | `#F0F6FC` | Fundo geral da página (`body`), cabeçalhos de tabela (`th`), backgrounds de inputs desabilitados. | Não usar cinza amarelado ou bege. |
| **Superfície / Cards** | `#FFFFFF` | Fundo de cards executivos, tabelas, gavetas e modais. | Manter limpo, sem sombras exageradas (`shadow-xs` ou `shadow-sm`). |

#### Cores Semânticas de Apoio (Uso Exclusivo e Discreto)
- **Sucesso / Pronto / Ativo:** Fundo `bg-emerald-50`, texto `text-emerald-800`, borda `border-emerald-300`, indicador de ponto `bg-emerald-500`.
- **Atenção / Reprogramação / Saldo:** Fundo `bg-amber-50`, texto `text-amber-800`, borda `border-amber-300`, ponto `bg-amber-500`.
- **Crítico / Ruptura / Erro:** Fundo `bg-rose-50`, texto `text-rose-800`, borda `border-rose-300`, ponto `bg-rose-500`.
- *Qualquer outra cor (roxo, laranja, fúcsia) é expressamente proibida.*

---

### 2.2 Padrão Tipográfico & Escala
- **Fonte Primária:** Sans-serif moderna e legível (`Inter`, `system-ui`).
- **Fonte Numérica & Clínica (Mono):** `font-mono` para OSs (`#10294`), SKUs, valores monetários (`R$ 450,00`), dioptrias (`-2.75`), eixos (`180°`), DNP (`31.5mm`) e datas/horas.
- **Títulos de Página:** `text-xl md:text-2xl font-extrabold text-[#052659] tracking-tight`.
- **Tabelas Operacionais:** Linhas em `text-sm font-semibold text-[#021024]`, células com altura confortável (`py-3.5` a `py-4`), cabeçalhos em `text-[11px] font-bold uppercase tracking-wider text-[#052659] bg-[#F0F6FC] border-b border-[#C1E8FF]`.

---

### 2.3 Padrão Ouro de Componentes

#### A. Cabeçalho de Página Padronizado (Page Header Standard - Zero Layout Shift)
- Componente oficial: `components/PageHeader.tsx`
- Altura estabilizada e compacta: `min-h-[64px]` fixa em todas as rotas com `py-2.5` para erradicar totalmente o Layout Shift na navegação e maximizar a área útil de trabalho.
- 1. **Breadcrumb Clínico Obrigatório:** Link de retorno com seta discreta (`arrow_back`) + caminho hierárquico em `text-xs text-[#5483B3]`.
- 2. **Squircle Institucional & Título:** Squircle sólido `w-8 h-8 rounded-lg bg-[#052659] text-white flex items-center justify-center shrink-0 shadow-2xs` + Título em `text-base sm:text-lg lg:text-xl font-extrabold text-[#052659] tracking-tight`.
- 3. **Barra de Ações Rápidas à Direita:** Botão secundário (`bg-white border-[#7DA0CA] text-[#052659]`) e botão primário (`bg-[#052659] text-white`).

#### B. Padrão de Cards Executivos & KPIs (Componente Universal KpiCard)
- Componente oficial: `components/KpiCard.tsx`
- Container compacto e ergonômico: `rounded-xl border border-[#C1E8FF] bg-white p-3.5 sm:p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#5483B3] transition-all duration-200 group flex flex-col justify-between`.
- Squircle de ícone: `w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200` posicionado no topo à direita.
- Métricas: `font-mono text-xl sm:text-2xl font-bold text-[#052659] leading-tight` com distância reduzida para subtítulos e tendências.
- Rodapé compacto: linha divisora `border-t border-[#F0F6FC] mt-2.5 pt-2` com métricas secundárias ou links rápidos, eliminando vácuos verticais e garantindo que as tabelas de trabalho fiquem 100% visíveis *above the fold*.
- Variantes semânticas: `neutral`, `primary`, `warning`, `danger`, `success`.

#### C. Padrão Ouro de Tabelas (Baseado no Catálogo `/estoque`)
- Sem tabelas apertadas com `text-xs` para dados primários.
- Nomes de clientes e produtos em `text-sm font-bold text-[#052659]`.
- Status em pílulas suaves com ponto indicador (`w-2 h-2 rounded-full`).
- Padding vertical de células: `py-3.5` a `py-4` (~56px de linha) para conforto de toque e leitura em balcão.

#### D. Padrão de Cards de Seleção & Configuração (`SelectableCard`)
- Componente oficial: `components/SelectableCard.tsx`
- Container: `rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer group flex flex-col justify-between`.
- Estado Padrão: `bg-white border-[#C1E8FF] hover:border-[#5483B3] hover:shadow-md hover:-translate-y-0.5`.
- Estado Selecionado: `bg-[#F0F6FC] border-[#052659] ring-2 ring-[#052659]/30 shadow-md -translate-y-0.5`.
- Squircle institucional com ícone de categoria (`eyeglasses`, `lens`, `auto_awesome`).
- Indicador circular de check/radio no canto superior direito.
- Preço em `font-mono text-base sm:text-lg font-bold text-[#052659]`.
- Badge de disponibilidade/estoque em pílula mono sutil.

#### E. Padrão de Destaque e Hierarquia de Botões (`components/Button.tsx`)
- Componente oficial: `components/Button.tsx` (suporta `asLink` via prop `href`).
- **Primary CTA (`variant="primary"`):** `bg-[#052659] hover:bg-[#021024] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 ring-2 ring-[#052659]/20 font-bold`.
- **Secondary CTA / Cabeçalho (`variant="secondary"` ou Cerulean Sólido):** Para botões como `btn-fila-imprimir-romaneio`, `btn-dash-atualizar` e `btn-estoque-exportar-excel`, usar preenchimento sólido Cerulean `bg-[#5483B3] hover:bg-[#052659] text-white font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 ring-2 ring-[#5483B3]/25` com ícone branco, erradicando botões vazados/camaleões contra o cabeçalho.
- **Accent / Conversão (`variant="accent"`):** `bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 font-bold` para WhatsApp e entregas.
- **Danger (`variant="danger"`):** `bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-md active:scale-95 font-bold` para cobranças e atrasos.
- **Tabela / Linhas (`h-8 px-3.5 rounded-lg text-xs font-bold`):** Ações de 1 clique em pílulas sólidas com micro-lift.

#### F. Padrão de Links de Ação (Tags `<a>` e `<Link>`)
- **Action Chip Links (Códigos de OS e SKUs):** Números de OS (`#10294`) e códigos SKU não são textos inertes. Devem ser renderizados como chips de navegação com affordance explícita: `px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-[#F0F6FC] hover:bg-[#052659] text-[#052659] hover:text-white border border-[#C1E8FF] hover:border-[#052659] shadow-2xs hover:shadow-xs transition-all inline-flex items-center gap-1 group cursor-pointer` acompanhados do ícone `tag` ou `qr_code`.
- **Pílulas de Ação Rápida ("Ficha", "Ver"):** `px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F0F6FC] hover:bg-[#052659] text-[#052659] hover:text-white border border-[#5483B3]/40 hover:border-[#052659] transition-all inline-flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer` com micro-deslocamento de seta (`group-hover:translate-x-0.5`).
- **Footer Links de Cards e Tabelas:** Links de rodapé ("Abrir Balcão Completo", "Abrir Fila de Ordens Completa") devem usar pílulas estruturadas com borda sutil, hover em Deep Navy e translação de seta, erradicando links sublinhados desbotados.

#### G. Padrão de Pílulas Clínicas e Chips de Balcão (Tags `<span>`)
- **Pílula de Status com Ponto Pulsante / Iluminado:** Status operacionais (`Atrasado`, `Em Produção`, `Pronto p/ Entrega`) são envolvidos em pílulas completas `px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs` com indicador de ponto circular iluminado (`w-2 h-2 rounded-full ring-2`), usando exclusivamente cores semânticas autorizadas (`bg-emerald-50 text-emerald-800 border-emerald-300`, `bg-amber-50 text-amber-800 border-amber-300`, `bg-rose-50 text-rose-800 border-rose-300`).
- **Chip de Gaveta Física de Balcão:** Localização física de armações (`Gaveta G-01`, `Bancada 01`) deve portar ícone `shelves` institucional, tipografia mono e fundo `#F0F6FC` com borda `#C1E8FF`: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#F0F6FC] text-[#052659] border border-[#C1E8FF] shadow-2xs`.
- **Badges de Cabeçalho Institucional:** Badges de totalização nos PageHeaders devem usar fundo Deep Navy com ponto pulsante verde (`animate-pulse`) ou ícone temático (`storefront`, `inventory_2`).
- **Chips de Inventário e Margem:** Quantidades em estoque usam pílulas mono com sinalizador crítico em âmbar e normal em esmeralda. Margens comerciais usam chips mono `#F0F6FC` com borda suave.

---

## 3. Regra Obrigatória e Inegociável: IDs Semânticos Únicos (100%)

Nenhum elemento interativo ou estrutural pode ir para produção sem um **ID Semântico Único** em `kebab-case`.  
Formato: `[modulo]-[submodulo-ou-contexto]-[tipo-elemento]-[acao-ou-nome]`

### Exemplos Válidos:
- Botões: `btn-notificar-disparar-whatsapp`, `btn-kardex-ajuste-confirmar`, `btn-pdv-finalizar-venda`
- Links: `link-header-voltar-fila`, `link-notificar-ficha-tecnica`
- Entradas: `input-filtro-busca-cliente`, `select-os-laboratorio-parceiro`, `textarea-notificar-mensagem`
- Tabelas & Cards: `table-kardex-ledger`, `card-kardex-kpi-ruptura`, `table-notificar-historico-disparos`

*Qualquer PR ou tarefa entregue sem 100% de IDs semânticos é reprovada sumariamente no QA.*

---

## 4. Definition of Done (DoD) & Ciclo de Sprints

Antes de qualquer conclusão de tarefa ou entrega ao PO/usuário:
1. **Auditoria de Design & Fidelidade:** O layout respeita a sobriedade clínica, a paleta `#052659` e zero elementos fora de padrão.
2. **IDs Semânticos Auditados:** 100% de conformidade verificada.
3. **Análise Estática & Build de Produção:** O comando `npm run build` deve compilar com **Exit Code 0** (zero erros de TypeScript, zero rotas estáticas quebradas).
4. **Registro Formal em `SPEC.md`:** A sprint correspondente deve estar devidamente descrita, com motivação, especificação técnica detalhada e critérios de aceite marcados.
5. **Atualização do `AGENTS.md`:** Toda alteração de grande porte, padrão de tela ou decisão arquitetural deve ser registrada neste documento.
6. **Back-end (.NET + TDD):** testes de aceite escritos antes do código, `dotnet build` sem warnings, `dotnet test` 100% verde, cobertura do Domínio ≥ 90% e testes de isolamento entre tenants (ver `.agents/rules/back-end-developer.md`).

---

## 5. Histórico e Registro de Decisões Arquiteturais (ADRs)

| Sprint | Escopo | Decisão Chave |
| :--- | :--- | :--- |
| **Sprint 10** | Autenticação & AppShell | Isolamento do layout `/login` via `AppShell.tsx` com desativação controlada da sidebar. |
| **Sprint 11** | RBAC MVP | Criação do hook `useOperator.ts` para alternância limpa entre Gerente (médico) e Consultora (balcão). |
| **Sprint 14** | Ficha Clínica & Receituário | Motor matemático de validação dióptrica estrita (0.25D, transposição e cilindro/eixo). |
| **Sprint 18** | Padronização de Tabelas | Definição do modelo de Catálogo (`/estoque`) com `text-sm` e `py-3.5` como padrão áureo do ERP. |
| **Sprint 20** | Micro-Animação de Cards | Padronização global do hover lift suave (`hover:-translate-y-0.5 hover:shadow-md`) e micro-zoom nos ícones. |
| **Sprint 21** | Padronização Sistêmica, Governança & Despoluição | Adoção compulsória de `PageHeader.tsx` em 100% das rotas, padronização de `SelectableCard.tsx` com layout clean e sem ícones decorativos forçados, erradicação total de gradientes e emojis, e governança viva do Design System em `AGENTS.md`. |
| **Sprint 22** | Unificação de Cabeçalhos & Cards (`KpiCard.tsx`) | Estabilização de `PageHeader.tsx` com `min-h-[64px]`, inclusão obrigatória de breadcrumbs e squircle institucional em 100% das páginas, erradicando Layout Shift na navegação. Criação do componente universal `components/KpiCard.tsx` com padronização visual completa no Dashboard, Fila, Catálogo de Estoque e Kardex. |
| **Sprint 22 (Back)** | Stack de Back-end & TDD | Adoção de **.NET 10 (LTS) / ASP.NET Core + EF Core + PostgreSQL** em Clean Architecture (Domain/Application/Infrastructure/Api) em `backend/`. Motivação: `decimal` nativo para financeiro, DFe.NET para NF-e 4.00, testabilidade (xUnit + Testcontainers). TDD/BDD obrigatório com QA escrevendo os testes de aceite antes do Dev. Contratos via OpenAPI com client TS gerado para o front. ADRs detalhados em `backend/docs/adr/`. |
| **Sprint 23** | Destaque, Contraste & Affordance de Botões (`Button.tsx`) | Fim dos "botões camaleões" desbotados. Matriz de 5 variantes (`primary`, `secondary`, `accent`, `danger`, `outline`), elevação e bordas nítidas de 2px `border-[#5483B3]`, destaque verde esmeralda sólido (`bg-emerald-600`) para WhatsApp e vermelho carmim sólido (`bg-rose-600`) para cobranças de laboratório atrasado. |
| **Sprint 24** | Affordance de Links (`<a>`), Chips Clínicos (`<span>`) e Botões de Ação de Cabeçalho | Ajuste do botão `btn-fila-imprimir-romaneio` e ações secundárias de cabeçalho (`btn-dash-atualizar`, `btn-estoque-exportar-excel`) para Cerulean sólido (`#5483B3`) com ícone branco e anel de foco. Elevação de números de OS e SKUs para Action Chip Links (`<a>` com ícone e hover lift), transformação de status e gavetas físicas em pílulas clínicas estruturadas com indicador de ponto circular iluminado e ícone `shelves`. |
