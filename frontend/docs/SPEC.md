# Especificação Técnica (Spec-Driven Development) - Fatura Ótica B2B

Este documento orienta o desenvolvimento Front-end do sistema Fatura Ótica (SaaS B2B). Nenhuma tela avança sem validação do PO (Product Owner).

## 1. Stack e Padrões Arquiteturais
- **Framework:** Next.js (App Router)
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS (Design System: *Clinical Precision*)
- **Paleta de Cores (Base & Nova Variação Azul):**
  - Primary (Antiga): `#0F4C81`
  - Nova Paleta Azul (A ser revisada pelo UX): `#021024`, `#052659`, `#5483B3`, `#7DA0CA`, `#C1E8FF`
  - Superfícies: `#FFFFFF`, `#F8FAFC`
  - Erro Crítico: `#B91C1C` / Fundo `#FEF2F2`
  - Sucesso: `#15803D` / Fundo `#F0FDF4`
- **Tipografia:** `Inter` (UI) e `JetBrains Mono` (Tabelas e códigos).

---

## 2. Roadmap de Desenvolvimento por Telas

### Sprint 1: Tela 1 - Dashboard Gerencial (Home)
**Status:** Concluída.

### Sprint 2: Infraestrutura de Navegação e Layout
**Objetivo:** Consolidar roteamento, padding global e navegação dinâmica.
**Status:** Concluída.
- [x] Extrair TopNavBar para um Client Component.
- [x] Implementar active state no menu conforme `usePathname`.
- [x] Unificar o container `max-w-7xl` para o dashboard e kardex.

### Sprint 3: Tela 2 - Catálogo de Estoque Livre
**Objetivo:** Tabela de alta densidade separando Lentes e Armações.
**Status:** Concluída.
**Cenários e Requisitos:**
- [x] Remover KPIs do topo para maximizar espaço visual.
- [x] Sistema de Tabs: "Armações", "Lentes" e "Contato".
- [x] Campo de busca de largura total (Full-width).
- [x] Tabela de armações usando tipografia monoespaçada (SKU, Marca, Modelo, Cor, Tamanho, Qtd, Preço).
- [x] **Validação Visual:** Linhas com Quantidade "1" ou "0" devem apresentar destaque visual vermelho na célula de quantidade.
- [x] **UX/UI - Refinamento Visual (Task UX):** Revisar a nova paleta de azuis (`#021024`, `#052659`, `#5483B3`, `#7DA0CA`, `#C1E8FF`) e aplicá-la ao Design System para dar mais vida ao projeto, além de garantir paddings maiores (`py-4`) para que os elementos das tabelas "respirem" melhor.
- [x] **Correções de Regressão Kardex:** Adicionado `whitespace-nowrap` e largura mínima em botões e valores monetários (R$) no Kardex para prevenir quebra indesejada de texto.
- [x] **Cadastro de Novos Produtos (Dois Fluxos Operacionais):**
  - **Fluxo 1 (Fiscal / Automático):** Botão `#btn-estoque-nova-entrada` conectado como link direto para `/kardex/entrada-nfe` para importação e vínculo via XML de fornecedor.
  - **Fluxo 2 (Manual / Peça Avulsa):** Botão `#btn-estoque-novo-produto` abrindo Modal Corporativo com gerador automático de SKU/EAN, seleção de categoria (armações/lentes/contato), marca, modelo, cor, tamanho, precificação e inserção instantânea no catálogo com feedback via Toast.
  - **Exportação XLSX:** Botão `#btn-estoque-exportar-excel` com disparo de Toast corporativo de sucesso.

### Sprint 4: Identidade Visual Azul & Módulo de Ordens de Serviço (Nova OS)
**Objetivo:** Elevação da marca visual (Blue Spectrum) e Wizard clínico com regras ópticas bloqueantes.
**Status:** Concluída.
**Cenários e Requisitos Entregues:**
- [x] **UX/UI Brand Identity:** Registro no Stitch do Design System `Clinical Precision Optical` (#021024, #052659, #5483B3, #7DA0CA, #C1E8FF) com tons sólidos e flat precision, sem degradês desnecessários.
- [x] **Harmonização Global:** TopNavBar em azul marinho sólido (#052659) com borda (#021024), abas ativas em cápsula sólida (#5483B3), chips e avatares alinhados à identidade. Dashboard e botões de atalho conectados.
- [x] **Wizard de Nova OS:** Estrutura linear em 4 etapas (1. Cliente, 2. Receita Óptica, 3. Armação & Lentes, 4. Resumo & Envio).
- [x] **Matriz Dióptrica Clínica (OD/OE):** Tabela com campos Esf, Cil, Eixo, Add, DNP e Altura.
- [x] **Validação Bloqueante 1 (Eixo do Astigmatismo):** Se Cilíndrico != 0, Eixo é obrigatório (0º a 180º). Se vazio, input fica vermelho com alerta e o botão "Próximo" é bloqueado. Se Cil = 0, Eixo é travado.
- [x] **Validação Bloqueante 2 (Passo Dióptrico 0.25):** Valores que não sejam múltiplos de 0.25 (ex: -1.30) disparam tooltip flutuante e bloqueiam o envio ao laboratório.
- [x] **Integração com Estoque Livre:** Seleção de armações cadastradas diretamente na etapa 3 da OS.
- [x] **Resumo Financeiro & Emissão:** Totalizador automático e emissão com confirmação visual.

### Sprint 5: Subtelas do Kardex & Gestão Fiscal de Estoque
**Objetivo:** Mapeamento e implementação das subtelas do Kardex (Entrada NF-e, Ajustes de Avaria/Laboratório e Sugestões de Reposição), assegurando aderência 100% idêntica aos designs validados no Stitch.
**Status:** Concluída (Entregue & Validada no DoD).

#### Backlog da Sprint 5:
- [x] **Task 5.1 (UX/UI Stitch):** Prototipar no Stitch o fluxo de **Entrada por NF-e (XML)** (`screens/4a2aa7d26b504721b4c80377e720f1bd`) com chave de 44 dígitos, conciliação e custo médio móvel.
- [x] **Task 5.2 (UX/UI Stitch):** Prototipar no Stitch o fluxo de **Ajuste Manual de Estoque & Baixa por Avaria Clínica** (`screens/1d66909557c24ddea6700f812e6a7878`).
- [x] **Task 5.3 (UX/UI Stitch):** Prototipar no Stitch a visão de **Sugestões de Compra & Reposição Automática** (`screens/18646cb1e6514d6f8de07d608a0675a4`).
- [x] **Task 5.4 (Front-end):** Implementar as 3 subtelas no Next.js (`/kardex/entrada-nfe`, `/kardex/ajuste-manual`, `/kardex/sugestoes-compra`) espelhando exatamente os protótipos do Stitch sem gradientes nem invenções.
- [x] **Task 5.5 (Front-end):** Conectar os atalhos e botões no Kardex (`app/kardex/page.tsx`) com rotas ativas e navegáveis.
- [x] **Task 5.6 (QA & DoD):** Análise estática com `npm run build` passando com sucesso (10 páginas estáticas geradas, Exit Code 0).

### Sprint 6: Subtelas de Ordens de Serviço & Padronização de Ícones (Zero Emojis)
**Objetivo:** Mapeamento e navegação de todas as ordens de serviço pendentes da dashboard, criação da Fila Kanban do Laboratório e Ficha Técnica Dióptrica da OS, além da eliminação 100% de emojis genéricos na aplicação, substituídos por ícones corporativos do Google Material Symbols.
**Status:** Concluída (Entregue & Validada no DoD).

#### Backlog da Sprint 6:
- [x] **Task 6.1 (UX/UI Stitch):** Prototipar no Stitch o fluxo da **Fila de Laboratório & Acompanhamento de Ordens de Serviço** (`screens/f8a68eb3655c42b4afc5ba1aa5c900ae`) com colunas Kanban (Triagem, Montagem, Surfaçagem, Controle de Qualidade).
- [x] **Task 6.2 (UX/UI Stitch):** Prototipar no Stitch a **Ficha Técnica e Detalhes da OS #10294** (`screens/ee4d05fd967c4508b45d7ccca95c6cd3`) com dados dióptricos clínicos, rastreabilidade de insumos do Kardex e linha do tempo de produção.
- [x] **Task 6.3 (Front-end):** Implementar as 2 subtelas no Next.js:
  - `/ordens-de-servico/fila`: Kanban interativo completo com 12 OSs, filtros por status, pesquisa de paciente/OS e métricas de bancada.
  - `/ordens-de-servico/detalhes`: Ficha técnica clínica com suporte dinâmico a OSs (#10294, #10298, #10301, #10312), timeline e botões de ação com `Suspense`.
- [x] **Task 6.4 (Front-end - Dashboard Mapeada):** No card "OS Aguardando Laboratório" da Home (`app/page.tsx`):
  - Cada OS agora é um componente `Link` navegável para sua respectiva ficha técnica (`/ordens-de-servico/detalhes?id=...`).
  - O rodapé "Ver todas as 12 ordens de serviço pendentes" direciona para a Fila Kanban (`/ordens-de-servico/fila`).
  - Correção da quebra de linha com `whitespace-nowrap` em `OS #10298` e tags numéricas.
  - Botões de "Pedir Fornecedor" e rodapé de "Armações em Ruptura" direcionam para `/kardex/sugestoes-compra`.
- [x] **Task 6.5 (Padronização Visual - Zero Emojis):** Varredura e substituição completa de emojis genéricos (`⚠️`, `🔴`, `⚠`, `❌`, `✓`) por ícones padronizados do Google Material Symbols (`warning`, `error`, `check_circle`, `cancel`, `verified`), garantindo consistência clínica e corporativa em qualquer sistema operacional.
- [x] **Task 6.6 (QA & DoD):** `npm run build` executado com 100% de sucesso (12 rotas estáticas pré-renderizadas, 0 erros de tipagem TypeScript/Turbopack).

### Sprint 7: Central de Pedidos de Balcão & Subtela Dedicada de WhatsApp (Foco Pequena Ótica)
**Objetivo:** Simplificar a esteira de pedidos para atender diretamente a realidade das micro e pequenas óticas de rua (varejo com laboratório parceiro terceirizado). Separar a experiência de mensageria em uma **subtela dedicada** de disparo de WhatsApp (`/ordens-de-servico/notificar-whatsapp?id=...`), mantendo a tabela de pedidos limpa, sem poluição visual ou sobrecarga de informação, com links diretos `<a>`/`<Link>` para acionamento.
**Status:** Concluída (Entregue & Validada no DoD).

#### Backlog da Sprint 7:
- [x] **Task 7.1 (UX/UI Stitch):** Prototipar no Stitch a tela **Central de Pedidos & Automação de Balcão** (`screens/a3ad6254d1764eb7924e1b229321f6e5`) com tabela limpa, recepção em 1 bip e botões de ação que direcionam para as subtelas.
- [x] **Task 7.2 (UX/UI Stitch):** Prototipar no Stitch a **Subtela Dedicada: Central de Notificação WhatsApp do Paciente** (`screens/4b5fd77878f24bdf844b39fb555daf93`) com dados da OS, seletor de templates, simulador visual do WhatsApp Web e botões de disparo.
- [x] **Task 7.3 (Front-end):** Refatorar `/ordens-de-servico/fila` para a **Central de Balcão & Ações Rápidas**:
  - Tabela limpa e de alta densidade sem poluição visual.
  - Leitor de código de barras/bip rápido do malote (`[F4]`).
  - Botão `[ 📲 Disparar WhatsApp ]` estruturado como tag `<Link>` levando diretamente para `/ordens-de-servico/notificar-whatsapp?id=...`.
- [x] **Task 7.4 (Front-end):** Criar a nova subtela dedicada **[`app/ordens-de-servico/notificar-whatsapp/page.tsx`](file:///C:/Fatura-ótica/frontend/app/ordens-de-servico/notificar-whatsapp/page.tsx)**:
  - Carregamento dinâmico dos dados da OS selecionada (`id`).
  - 4 templates de mensagens (Óculos Pronto, Atraso Justificado, Saldo Restante, Pós-Venda).
  - Preview visual do balão do WhatsApp com link direto `https://wa.me/55...`.
  - Histórico de notificações e botão de retorno rápido para a esteira.
- [x] **Task 7.5 (Front-end):** Implementar gatilhos rápidos de 1 clique:
  - Alerta de laboratórios atrasados com link para cobrança direta do fornecedor.
  - Baixa de retirada e ajuste facial com confirmação.
- [x] **Task 7.6 (QA & DoD):** Análise estática e validação com `npm run build` passando com 100% de sucesso (Exit Code 0).

### Sprint 8: Arquitetura com Sidebar Lateral Global & Dashboard Gerencial Expandido
**Objetivo:** Evoluir a arquitetura de navegação para Sidebar Lateral fixa (`#052659` Dark Navy), liberando espaço vertical e otimizando a ergonomia de todas as telas do sistema. Expandir a Dashboard principal com métricas cruciais para donos e gestores de óticas: curva de vendas vs meta, SLA e aging médio de laboratórios parceiros, saldo a receber na retirada (balcão), ticket médio e ranking de vendedores.
**Status:** Concluída (Entregue & Validada no DoD).

#### Backlog da Sprint 8:
- [x] **Task 8.1 (UX/UI Stitch):** Prototipar no Stitch o **Dashboard Executivo com Sidebar Lateral Global** (`screens/92f5b44dc2ec4254a928b4a5a5b4cc39`) contendo a nova navegação vertical hierárquica, 6 KPIs essenciais, curva gráfica de vendas vs meta, matriz de SLA dos laboratórios externos e ranking de atendentes.
- [x] **Task 8.2 (Front-end - Layout Global):** Criar o componente `components/SidebarNav.tsx` e reestruturar `app/layout.tsx` com grid/flex lateral (`w-64 fixed` + `flex-1 ml-64`), garantindo que todas as rotas atuais (`/`, `/kardex`, `/ordens-de-servico`, `/estoque`, `/ordens-de-servico/fila`, etc.) herdem a navegação lateral sem quebra visual.
- [x] **Task 8.3 (Front-end - Dashboard Expandido):** Refatorar `app/page.tsx` integrando os novos módulos gerenciais:
  - 6 Cards de Alto Impacto: Faturamento Hoje + Projeção, Ticket Médio Geral, Aging Médio de Laboratório, Saldo a Receber na Retirada, Armações em Ruptura, Taxa de Conversão Lente + Armação.
  - Gráfico visual da Curva de Vendas Diárias vs Meta do Mês com dados interativos de Seg a Dom.
  - Tabela/Matriz de Performance e SLA dos Laboratórios Terceirizados (Essilor, Hoya, Zeiss, Brasul Ofta).
  - Ranking de metas da equipe de balcão e atalhos operacionais rápidos (`[F1]`, `[F2]`, WhatsApp).
- [x] **Task 8.4 (QA & DoD):** Análise de regressão de layout em todas as páginas, verificação de responsividade e compilação com `npm run build` com 100% de sucesso (Exit Code 0).

### Sprint 9: Otimização de Densidade e Ergonomia Visual do Kardex (Zero Scroll & Tabelas Compactas)
**Objetivo:** Reduzir o espaçamento excessivo e eliminar o scroll vertical/horizontal da tela do Kardex (`/kardex`), aplicando densidade de instrumentos clínicos (Clinical Precision): padding reduzido de linhas (`py-2`), eliminação da barra de rolagem horizontal nas tabelas de reposição e movimentações, filtros compactos e visualização imediata "at-a-glance" para o gestor de ótica.
**Status:** Concluída (Entregue & Validada no DoD).

#### Backlog da Sprint 9:
- [x] **Task 9.1 (Front-end):** Refatorar `app/kardex/page.tsx` para layout de alta densidade:
  - Redução de espaçamentos gerais (`py-10 space-y-10` -> `p-4 lg:p-6 space-y-4 max-w-[1720px]`).
  - Compactação da Tabela 1 (Sugestões de Reposição Automática): redução de altura das linhas de 64px para ~36px (`py-2 px-3`), eliminação completa de barra de rolagem horizontal.
  - Compactação da Tabela 2 (Ledger de Movimentações): alinhamento mono-espaçado rígido, badges compactos, filtros inline `h-8`.
  - Inclusão de faixa de 4 mini-indicadores operacionais no topo (Total SKUs, Rupturas Críticas, Entradas NF-e Mês, Baixas por OS).
- [x] **Task 9.2 (QA & DoD):** Verificação de responsividade, validação visual no browser e aprovação estática com `npm run build` com 100% de sucesso (Exit Code 0).

### Sprint 10: Autenticação & Gestão de Acessos (Login & Filiais)
**Objetivo:** Implementar fluxo de autenticação multi-tenant com perfil corporativo, controle de sessões, recuperação de credenciais e troca de filial ativa.
**Status:** Concluída (Entregue & Validada no DoD).

#### Backlog da Sprint 10:
- [x] **Task 10.1 (UX/UI Stitch):** Prototipar no Stitch a tela **Autenticação Corporativa & Seleção de Filial** (`screens/b5c85d1e007a41588858e76534db162e`) no padrão split-screen corporativo (Hero técnico à esquerda com ISO 13485, SEFAZ NF-e 4.0, Matriz Dióptrica em Tempo Real e Kardex A1; Painel de login à direita com seleção de unidade ativa).
- [x] **Task 10.2 (Front-end - Arquitetura de Shell):** Criar `components/AppShell.tsx` para isolar a página `/login`, garantindo que em rotas de autenticação a Sidebar global e o rodapé padrão fiquem desabilitados sem alterar a navegação das rotas protegidas.
- [x] **Task 10.3 (Front-end - Tela de Login):** Implementar `app/login/page.tsx`:
  - Formulário completo com E-mail corporativo ou CPF e Senha com máscara e alternância de visibilidade (`visibility` / `visibility_off`).
  - Seletor de Filial / Unidade Multi-Tenant (`Filial Centro - Loja 01 Matriz`, `Filial Shopping Norte - Loja 02`, `Laboratório Central`).
  - Checkbox "Lembrar este dispositivo por 30 dias" com ID de terminal `LAB-09`.
  - Módulo 1-Click Fast Login de Homologação com perfis pré-configurados: Dr. Carlos Ramos (Gerente & Optometrista) e Mariana Souza (Consultora Balcão).
  - Modal interativo de recuperação de acesso ("Esqueci minha senha") com envio e confirmação de token temporário (`FO-8924-OK`).
  - Handshake de autenticação com loading de validação de certificado e feedback visual (Toast de Sucesso).
- [x] **Task 10.4 (Front-end - Integração de Sessão):** Conectar a sessão ativa ao rodapé da `SidebarNav.tsx`, exibindo o nome, cargo e filial do operador autenticado com botão de logout para alternância de terminal.
- [x] **Task 10.5 (QA & DoD):** Análise estática com `npm run build` passando com 100% de sucesso (14 rotas estáticas pré-renderizadas, Exit Code 0) e validação end-to-end de login e redirecionamento no navegador.

### Sprint 11: RBAC MVP — Controle de Acesso por Papel (Gerente e Consultor Clean)
**Objetivo:** Implementar o controle de acesso baseado em papel (RBAC) com abordagem Clean (zero placeholders ou cadeados bloqueados) para os perfis `gerente` e `consultor`. A aplicação adapta dinamicamente sua composição de interface a partir do operador autenticado no `localStorage`, garantindo sigilo de métricas financeiras e custos, enquanto empodera o consultor de balcão com métricas operacionais e fluxo de trabalho individual.
**Status:** Concluída (Entregue & Validada no DoD).

#### Backlog da Sprint 11:
- [x] **Task 11.1 (UX/UI Designer):** Especificação e prototipagem da Visão Consultor Clean no padrão Clinical Precision Enterprise (Header personalizado para Mariana Souza, faixa de 4 KPIs operacionais de balcão, bloco central "Minhas Ordens de Serviço do Dia" com atalho de notificação WhatsApp e Aging dos Meus Pedidos).
- [x] **Task 11.2 (Front-end Developer - Hook de Sessão & Permissões):** Criar `hooks/useOperator.ts` com tipagem TypeScript estrita, leitura do `localStorage` (`fatura_otica_operator`), fallback defensivo para `consultor` (menor privilégio), helpers reativos `isManager`, `isConsultant`, listener para sincronização entre abas e método de mutação.
- [x] **Task 11.3 (Front-end Developer - Navegação & Sidebar Dinâmica):** Adaptar `components/SidebarNav.tsx` para ocultar silenciosamente itens restritos ao Consultor (`/kardex/ajuste-manual` e `/kardex/sugestoes-compra`) e ajustar o agrupamento visual de menu sem quebrar layout.
- [x] **Task 11.4 (Front-end Developer - Dashboard Adaptativo Clean):** Refatorar `app/page.tsx` para renderizar condicionalmente a experiência completa do Gerente (KPIs financeiros, evolução de receita e ranking) ou a experiência do Consultor (KPIs de atendimento, lista "Minhas OSs do Dia", aging e módulos operacionais compartilhados).
- [x] **Task 11.5 (Front-end Developer - Proteção no Estoque & Kardex):**
  - Em `app/estoque/page.tsx`: ocultar colunas de Custo Unitário e Margem/Markup para o perfil Consultor, preservando alinhamento e totalizadores.
  - Em `app/kardex/page.tsx`: ocultar a Tabela 1 (Sugestões de Compra & Custo de Fornecedor) para o Consultor, mantendo o Ledger de Rastreabilidade Físico.
- [x] **Task 11.6 (Front-end Developer - Guardas de Rota):** Implementar verificação de acesso nas páginas `/kardex/sugestoes-compra` e `/kardex/ajuste-manual`, redirecionando consultores para `/kardex` com mensagem defensiva.
- [x] **Task 11.7 (QA & DoD):** Análise estática com `npm run build` (Exit Code 0, 14 rotas estáticas pré-renderizadas), teste automatizado de status HTTP 200 em todas as rotas e conferência estrita de zero vazamento de dados de faturamento.

### Sprint 12: Sistema de Notificações, Toasts & Modais Corporativos (PBI-04)
**Objetivo:** Eliminar 100% dos `window.alert()` arcaicos e bloqueantes do navegador em toda a aplicação, substituindo-os por um sistema corporativo unificado de Notificações (*ToastProvider* com timer animado, auto-dismiss de 4s e pausa em hover) e Modais Corporativos dedicados (*Clinical Precision Enterprise*).
**Status:** Concluída (Entregue & Validada no DoD).

#### Backlog da Sprint 12:
- [x] **Task 12.1 (Front-end - Arquitetura de Notificações):** Criação de `components/ToastProvider.tsx` com Context API, hook `useToast()`, suporte a variantes semânticas (`success`, `error`, `warning`, `info`), barra de progresso com decrescimento sutil, pausa de temporizador em hover, botão manual de dispensa e animações de entrada/saída suaves.
- [x] **Task 12.2 (Front-end - Integração no Root Layout):** Envolvimento de `AppShell` com `<ToastProvider>` em `app/layout.tsx`, permitindo disparo de toasts a partir de qualquer página ou componente do sistema.
- [x] **Task 12.3 (Front-end - Eliminação de Alerts & Modal no Kardex):**
  - Em `app/kardex/sugestoes-compra/page.tsx`:
    - Substituição do alert de exportação XLSX por `toast.success("Prévia de pedidos gerada com sucesso (XLSX).")`.
    - Substituição do alert de cotação PDF por `toast.info("Gerando cotação consolidada em PDF...")`.
    - Substituição do alert de ajuste de reposição por **Modal Corporativo de Parâmetros de Reposição** com campos editáveis de Estoque Mínimo, Quantidade Sugerida de Compra, Lead Time do Fornecedor e persistência no estado local com toast de confirmação.
    - Adicionado toast de sucesso na emissão em lote de Pedidos de Compra automáticos.
  - Em `app/kardex/entrada-nfe/page.tsx`:
    - Substituição do alert de rascunho por `toast.success("Rascunho de conferência de NF-e salvo localmente com sucesso.")`.
    - Adicionado toast de confirmação de lançamento de NF-e com atualização de custos médios.
- [x] **Task 12.4 (Front-end - Eliminação de Alerts & Modal em Ordens de Serviço):**
  - Em `app/ordens-de-servico/detalhes/page.tsx`:
    - Substituição do alert de Job Ticket por `toast.success("Job Ticket da Bandeja enviado com sucesso para a impressora térmica.")`.
    - Substituição do alert de avanço de CQ por `toast.success("OS encaminhada com sucesso para a esteira de Controle de Qualidade (CQ).")`.
    - Substituição do alert de visualização de receita por **Modal Corporativo de Receita Digital Oftalmológica** com autenticação ICP-Brasil (MP 2.200-2/2001), dados do prescritor/paciente, tabela completa de dioptrias OD/OE e ação de download autenticado.
    - Adicionado toast de confirmação no apontamento de montagem física.
  - Em `app/ordens-de-servico/fila/page.tsx`:
    - Substituição do alert de Romaneio por `toast.success("Romaneio de Envio de Malote gerado com sucesso!")`.
    - Adicionado toast reativo de sucesso e alerta na recepção por código de barras em 1 bip (F4).
- [x] **Task 12.5 (QA & DoD):** Auditoria estática com `grep` confirmando **zero** chamadas restantes a `alert(` em todo o código-fonte, build de produção Next.js 16 (`npm run build`) concluído com 100% de sucesso (Exit Code 0 em todas as 14 rotas estáticas).

### Sprint 13: Padronização Semântica de IDs Únicos para Seletores, QA Automatizado e Acessibilidade (PBI-05)
**Objetivo:** Mapear e implementar identificadores únicos semânticos (`id`) em 100% dos elementos interativos (botões, campos de entrada, selects, abas, links de navegação, tabelas e modais) em todas as rotas da aplicação, seguindo a convenção rigorosa `[modulo]-[submodulo-ou-contexto]-[tipo-elemento]-[acao-ou-nome]` para habilitar automação de testes E2E, acessibilidade WCAG/ARIA e telemetria analítica sem colisões no DOM.
**Status:** Concluída (Entregue & Validada no DoD).

#### Backlog da Sprint 13:
- [x] **Task 13.1 (Navegação Global & Componentes Core):**
  - Em `components/SidebarNav.tsx`: `nav-link-brand-home`, `btn-sidebar-mobile-close`, `btn-sidebar-mobile-toggle`, `btn-sidebar-trocar-operador`, e todos os links de menu `nav-link-*`.
  - Em `components/ToastProvider.tsx`: `container-toasts-flutuantes`, `toast-item-${toast.id}`, `btn-toast-fechar-${toast.id}`.
- [x] **Task 13.2 (Autenticação Corporativa):**
  - Em `app/login/page.tsx`: `input-login-identificador`, `input-login-senha`, `btn-login-toggle-senha`, `select-login-filial`, `checkbox-login-lembrar-dispositivo`, `btn-login-recuperar-senha`, `btn-login-entrar`, botões de 1-click login rápido `btn-login-rapido-gerente`, `btn-login-rapido-consultor`, e modal de recuperação `modal-login-recuperar-senha`.
- [x] **Task 13.3 (Dashboard Executivo & Visão Consultor Clean):**
  - Em `app/page.tsx`: botões de filtro de período (`btn-dashboard-periodo-hoje`, `btn-dashboard-periodo-semana`, `btn-dashboard-periodo-mes`), botões de atalho rápido (`btn-dashboard-abrir-caixa`, `link-dashboard-nova-os`, `link-dashboard-notificar-whatsapp`), links dos 6 KPIs analíticos, tabela de SLA dos laboratórios, tabela de vendedores e tabela de pedidos do dia.
- [x] **Task 13.4 (Módulo de Estoque):**
  - Em `app/estoque/page.tsx`: abas de categorias (`tab-estoque-todos`, `tab-estoque-armacoes`, `tab-estoque-lentes`, `tab-estoque-solar`, `tab-estoque-acessorios`), campo de busca `input-estoque-pesquisa`, seletores `select-estoque-filtro-fabricante`, `select-estoque-filtro-status`, botão `btn-estoque-exportar-inventario`, tabela `table-estoque-catalogo`, checkboxes por SKU e controles de paginação.
- [x] **Task 13.5 (Módulo Kardex & Subtelas de Suprimentos):**
  - Em `app/kardex/page.tsx`: links do cabeçalho, tabela de sugestões rápidas `table-kardex-sugestoes-rapidas`, filtros do ledger `input-kardex-pesquisa-sku`, `select-kardex-filtro-tipo`, tabela do ledger `table-kardex-ledger-movimentacoes` e paginação.
  - Em `app/kardex/sugestoes-compra/page.tsx`: abas de fornecedores `tab-sugestoes-fornecedor-*`, campo de pesquisa `input-sugestoes-pesquisa`, botão de exportação `btn-sugestoes-exportar-xlsx`, tabela `table-sugestoes-matriz-compras`, botões de ação e modal `modal-sugestoes-ajuste-parametros`.
  - Em `app/kardex/entrada-nfe/page.tsx`: `input-nfe-chave-acesso`, `btn-nfe-consultar-sefaz`, `btn-nfe-upload-xml`, tabela de conciliação `table-nfe-conciliacao-itens`, campos de conferência de quantidade, parâmetros de armazenagem e botões de rodapé.
  - Em `app/kardex/ajuste-manual/page.tsx`: botões de natureza da operação (`btn-ajuste-natureza-avaria`, `btn-ajuste-natureza-quebra-lab`, `btn-ajuste-natureza-garantia`, `btn-ajuste-natureza-inventario`), campos de OS, técnico, SKU, botões de incremento/decremento de quantidade, justificativa, upload de evidência e tabela de histórico do dia `table-ajuste-historico-dia`.
- [x] **Task 13.6 (Módulo Ordens de Serviço & Subtelas de Balcão):**
  - Em `app/ordens-de-servico/page.tsx`: botões do stepper (`btn-os-step-1` a `btn-os-step-4`), botão salvar rascunho `btn-os-salvar-rascunho`, inputs de identificação do paciente, tabela da matriz dióptrica `table-os-matriz-dioptrica` com todos os campos OD/OE (`input-os-od-*`, `input-os-oe-*`), botão de autocorreção esfero-cilíndrica `btn-os-transposicao-cilindrico`, cards de armação, cards de lentes, botões de tratamentos (`btn-os-tratamento-*`), resumo e botões de navegação.
  - Em `app/ordens-de-servico/detalhes/page.tsx`: botões do cabeçalho (`btn-os-detalhe-imprimir-job-ticket`, `btn-os-detalhe-concluir-montagem`), tabela dióptrica `table-os-detalhe-matriz-dioptrica`, botão `btn-os-detalhe-ver-receita-modal`, botões de rodapé (`link-os-detalhe-footer-voltar-fila`, `btn-os-detalhe-avancar-qc`) e modal `modal-os-detalhe-receita-digital`.
  - Em `app/ordens-de-servico/fila/page.tsx`: leitor de malote `input-fila-bip-codigo`, botão `btn-fila-bipar`, alternadores de visão (`btn-fila-view-tabela`, `btn-fila-view-kanban`), botão `link-fila-nova-os`, botão `btn-fila-imprimir-romaneio`, tabela `table-fila-producao`, links de cobrança de laboratório, links de disparo WhatsApp e cards kanban.
  - Em `app/ordens-de-servico/notificar-whatsapp/page.tsx`: breadcrumbs, links de retorno e ficha, botões de seleção de templates (`btn-notificar-template-*`), checkboxes de QR Code e certificado de garantia, link direto de disparo `link-notificar-disparar-whatsapp`, botão de cópia `btn-notificar-copiar-texto` e tabela `table-notificar-historico-disparos`.
- [x] **Task 13.7 (QA & DoD):** Análise estática com `npm run build` passando com 100% de sucesso (Exit Code 0 em todas as 14 rotas estáticas pré-renderizadas), zero conflito de IDs e conformidade total com o padrão estabelecido.

### Sprint 14: Navegação Contextual do Dashboard & Busca Lógica na Fila de Laboratório (PBI-06 & PBI-07)
**Objetivo:** Eliminar atritos de navegação entre o Dashboard e a Central de Pedidos, implementando deep-link com realce visual (`?destaque=...`) e auto-scroll ao clicar em "Ver" nas OSs prioritárias, corrigir o bug de duplo destaque na barra lateral (Sidebar) e introduzir motor de busca estruturada com suporte a multi-termos (AND) e prefixos (`lab:`, `status:`, `gaveta:`, `os:`).
**Status:** Concluída (Entregue & Validada no DoD).

#### Backlog da Sprint 14:
- [x] **Task 14.1 (Front-end - Correção de Duplo Destaque na Sidebar):**
  - Ajustar `components/SidebarNav.tsx` configurando `exact: true` estrito em `nav-link-nova-os` (`/ordens-de-servico`) e refinando `isItemActive()` para isolar com exatidão `/ordens-de-servico/fila` e seus detalhes, eliminando a seleção simultânea indevida no menu lateral.
- [x] **Task 14.2 (Front-end - Deep-Link & Destaque Visual de OS a partir do Dashboard - PBI-06):**
  - Em `app/page.tsx`: atualizar botões "Ver" (`btn-dash-prioritaria-ver-*` e `btn-dash-consultor-prioritaria-ver-*`) para navegar passando o parâmetro contextual `href="/ordens-de-servico/fila?destaque=${order.id}"`.
  - Em `app/ordens-de-servico/fila/page.tsx`:
    - Adicionar suporte a `useSearchParams()` envolvido em `<Suspense>`.
    - Efeito de auto-scroll suave (`scrollIntoView`) centralizando a OS selecionada.
    - Banner informativo de destaque no topo da fila (`#banner-os-destacada`) com botão para limpar foco (`#btn-remover-destaque-os`).
    - Borda pulsante, anel de realce (`ring-2 ring-amber-500`) e badge `[DESTAQUE]` nas linhas da tabela e nos cards do kanban.
    - Sincronização dos mock data com as ordens do Dashboard (`10287`, `10279`, `10274`).
- [x] **Task 14.3 (Front-end - Motor de Busca Lógica & Filtros Avançados - PBI-07):**
  - Em `app/ordens-de-servico/fila/page.tsx`:
    - Algoritmo de busca estruturada em memória com avaliação multi-termo (AND lógico).
    - Suporte a prefixos: `lab:[termo]`, `status:[termo]`, `gaveta:[termo]`, `os:[termo]`.
    - Normalização diacrítica imune a acentos e maiúsculas/minúsculas.
    - Faixa de chips de atalho rápido de busca (`+lab:essilor`, `+lab:hoya`, `+status:atrasado`, `+status:pronto`, `+gaveta:g-01`).
    - Botão de limpeza rápida de pesquisa inline e empty state com botão `Limpar Filtros e Pesquisa`.
- [x] **Task 14.4 (QA & DoD):** Análise estática com `npm run build` passando com 100% de sucesso (Exit Code 0 em todas as 14 rotas estáticas pré-renderizadas), zero erros no Turbopack e DoD plenamente satisfeito.

### Sprint 15: Painel Administrativo & Parametrização da Empresa (Admin Settings)
**Objetivo:** Permitir ao lojista configurar sua marca, canais de mensageria (WhatsApp Gateway), templates dinâmicos de mensagens, regras comerciais e cadastro de fornecedores/laboratórios.
**Status:** Planejada / Backlog.

---

### 🗂️ PBI-02: Painel Administrativo (Admin Settings / Parametrização de Tenant)


**Motivação:**
O sistema é SaaS B2B — cada ótica cliente precisa configurar sua própria identidade, gateways de mensageria, templates e regras comerciais sem depender de código.

**Perguntas abertas:**
1. Quais configurações são por **filial** e quais são por **empresa (tenant)**?
2. O Painel Admin é uma rota protegida separada (ex: `/admin`) ou está embutido nas telas existentes?
3. Quais campos são editáveis no MVP? (sugestão: Logo, nome da ótica, WhatsApp gateway, templates de mensagem, SLAs de laboratório).

**Pré-requisitos:** Debate com PO + definição do escopo mínimo (MVP) antes de qualquer sprint.

---

### 📭 PBI-03: Empty States & Comportamento com Dados Vazios

**Motivação:**
Toda a aplicação usa dados mockados. Antes de qualquer integração real, é necessário definir como cada componente se comporta quando não há dados — para evitar telas em branco ou crashes silenciosos.

**Perguntas abertas:**
1. Qual é a estratégia visual? (skeleton loader? mensagem inline? componente reutilizável?)
2. Quem define o copy de cada empty state? (ex: "Sem ordens hoje — bom trabalho! 🎉" vs. "Nenhum registro encontrado.")
3. Empty state é sprint separada ou checklisted dentro de cada sprint de feature?

**Mapa inicial de componentes que precisam de empty state:**
| Componente | Estado vazio esperado |
|:--- |:--- |
| KPI Strip (Dashboard) | `--` com label "Sem dados no período" |
| Gráfico de Faturamento | Ícone + "Nenhum movimento registrado" |
| Tabela SLA Laboratórios | "Nenhuma OS em laboratório externo" |
| Acompanhamento Prioritário | "Sem ordens prioritárias — bom trabalho! 🎉" |
| Kardex — Tabela de Estoque | Skeleton + "Faça a primeira entrada de NF-e" |
| Fila de OS (Kanban) | Coluna vazia com ícone inbox |
| Estoque — Busca sem resultado | Inline: "Nenhum item encontrado" + limpar filtro |

**Pré-requisitos:** Validação da convenção visual com o PO antes de qualquer implementação.

---

### 🔔 PBI-04: Sistema de Notificações, Toasts & Modais Corporativos (Substituição de Alerts Nativos)

**Status:** Concluído (Entregue na Sprint 12 & Validado no DoD).

**Motivação:**
Atualmente, ações rápidas de tela (exportações, impressões de etiquetas de malote, ajustes rápidos de parâmetros de compra e avanço de etapas) utilizam `window.alert()` nativo do navegador. O alert nativo:
1. Bloqueia a thread JavaScript e a renderização do browser.
2. Não possui identidade visual da ótica nem estilização do Design System *Clinical Precision Enterprise*.
3. Transmite percepção de software legado/arcaico.

**Mapeamento de Pontos Críticos com Alerts Nativos:**
| Tela / Rota | Ação que dispara Alert | Solução Moderna Proposta |
|:--- |:--- |:--- |
| `app/kardex/sugestoes-compra/page.tsx` | Ajustar parâmetros de reposição por SKU | Modal compacto inline de parâmetros (Min/Max/Lead Time) |
| `app/kardex/sugestoes-compra/page.tsx` | Exportar prévia de pedidos (XLSX) | Toast flutuante de sucesso com ícone e auto-dismiss (4s) |
| `app/kardex/sugestoes-compra/page.tsx` | Gerar cotação consolidada em PDF | Toast de processamento com barra de progresso sutil |
| `app/ordens-de-servico/detalhes/page.tsx` | Imprimir Job Ticket da Bandeja da OS | Toast de envio para spooler de impressão térmica |
| `app/ordens-de-servico/detalhes/page.tsx` | Visualizar Receita ICP-Brasil | Modal de visualização de PDF / Viewer criptografado |
| `app/ordens-de-servico/detalhes/page.tsx` | Avançar OS para Controle de Qualidade | Toast de transição de status com ação de desfecho |
| `app/kardex/entrada-nfe/page.tsx` | Salvar rascunho de conferência de NF-e | Toast discreto de auto-save no canto inferior direito |
| `app/ordens-de-servico/fila/page.tsx` | Gerar Romaneio de Envio de Malote | Drawer/Modal com protocolo de remessa para motoboy |

**Arquitetura do Componente Proposto:**
* Criação de `components/ToastProvider.tsx` e hook `useToast()`:
  - Variantes semânticas: `toast.success()`, `toast.warning()`, `toast.error()`, `toast.info()`.
  - Timer visual de auto-dismiss com pausa ao passar o mouse (`hover`).
  - Posicionamento fixo no topo direito (`top-5 right-5 z-50`).
  - Suporte a botões de ação inline (ex: *"Desfazer"*, *"Abrir Arquivo"*).

---

### 🏷️ PBI-05: Padronização Semântica de IDs Únicos para Seletores, QA Automatizado e Acessibilidade

**Status:** Concluído (Entregue na Sprint 13 & Validado no DoD).

**Motivação:**
Atualmente, botões, inputs, abas, tabelas e modais da aplicação não possuem atributos `id` sistemáticos ou possuem apenas classes de estilo. A ausência de IDs únicos e descritivos:
1. Impossibilita automação robusta de testes E2E (Playwright, Cypress e Agentes Autônomos de Browser).
2. Dificulta acessibilidade (WCAG / ARIA), como associação de `label for="id"` e `aria-describedby`.
3. Prejudica rastreamento de eventos e telemetria analítica de cliques do operador no balcão e no laboratório.

**Padrão Arquitetural de Nomenclatura Estabelecido:**
`[modulo]-[submodulo-ou-contexto]-[tipo-elemento]-[acao-ou-nome]`

| Categoria | Formato do ID | Exemplos no Sistema |
| :--- | :--- | :--- |
| **Botões de Ação** | `btn-[tela]-[acao]` | `btn-kardex-exportar-xlsx`<br>`btn-os-avancar-cq`<br>`btn-login-submit`<br>`btn-os-concluir-montagem`<br>`btn-fila-emitir-romaneio` |
| **Campos de Entrada** | `input-[tela]-[campo]` | `input-kardex-busca`<br>`input-login-email`<br>`input-os-od-esferico`<br>`input-os-filtro-busca`<br>`input-malote-bip` |
| **Seletores & Dropdowns** | `select-[tela]-[campo]` | `select-login-filial`<br>`select-estoque-filtro-categoria`<br>`select-fila-laboratorio` |
| **Abas & Filtros de Estado** | `tab-[tela]-[aba]` | `tab-estoque-armacoes`<br>`tab-estoque-lentes`<br>`tab-fila-tabela`<br>`tab-fila-kanban` |
| **Modais & Diálogos** | `modal-[tela]-[finalidade]` | `modal-kardex-ajuste-parametros`<br>`modal-os-receita-digital`<br>`modal-login-recuperar-senha` |
| **Tabelas & Containers Core** | `table-[tela]-[nome]` | `table-kardex-sugestoes`<br>`table-os-fila-laboratorio`<br>`table-estoque-catalogo` |
| **Navegação Global** | `nav-link-[item]` | `nav-link-dashboard`<br>`nav-link-ordens-servico`<br>`nav-link-kardex`<br>`nav-link-estoque` |

**Critérios de Aceite para Execução:**
- [x] 100% dos elementos interativos (todos os `button`, `input`, `select`, `textarea`, modais e links de menu) mapeados com IDs semânticos.
- [x] Zero duplicação de IDs no DOM da mesma página.
- [x] Validação estática (`npm run build` com Exit Code 0) e auditoria no DOM via browser.

---

### 🔍 PBI-06: Deep-Link & Destaque Visual de OS a partir do Dashboard

**Status:** Concluído (Entregue na Sprint 14 & Validado no DoD).

**Motivação:**
No card "Acompanhamento Prioritário de Balcão" do Dashboard principal (`app/page.tsx`), o operador/gestor visualiza as ordens de serviço mais críticas da loja (atrasos de laboratório, VIPs e prontas para entrega). Ao clicar no botão `Ver` (`btn-dash-prioritaria-ver-${order.id}`), a navegação não deve simplesmente abrir a listagem geral sem contexto: ela deve conduzir o operador diretamente à OS consultada com destaque visual imediato.

**Comportamento Especificado:**
1. **Destino Direto com Foco:** O link de ação deve navegar com o identificador da OS na rota:
   - Alternativa A (Ficha Técnica): Redirecionar para `/ordens-de-servico/detalhes?id=${order.id}` exibindo a ficha completa e a matriz dióptrica.
   - Alternativa B (Fila com Highlight): Redirecionar para `/ordens-de-servico/fila?destaque=${order.id}`, aplicando autofiltro ou scroll automático com highlight de borda pulsante na linha correspondente da tabela/kanban.
2. **Consistência de Papéis (RBAC):** Funcional tanto na visão Gerente quanto na visão Consultor Clean do Dashboard.

**Critérios de Aceite:**
- [x] O botão "Ver" do Acompanhamento Prioritário passa o parâmetro `id` na navegação (`/ordens-de-servico/fila?destaque=${order.id}`).
- [x] A tela de destino reconhece o parâmetro e aplica realce visual de alto contraste e foco sutil (auto-scroll e realce de cor na linha/card).
- [x] **UX Intuitiva & Sem Ruído:** O efeito de destaque de cor desvanece automaticamente após 3.5s sem necessidade de banner explicativo ou botões de fechar, preservando a fluidez e usabilidade ágil do atendente.

---

### ⚡ PBI-07: Motor de Busca Lógica & Filtros Avançados na Fila de Laboratório (`#input-fila-pesquisa`)

**Status:** Concluído (Entregue na Sprint 14 & Validado no DoD).

**Motivação:**
Atualmente, o campo de busca da Fila de Laboratório e Balcão (`app/ordens-de-servico/fila/page.tsx` com ID `#input-fila-pesquisa`) utiliza apenas correspondência simples de texto (`includes` plano). Para o dia a dia acelerado de uma ótica de rua, o atendente precisa localizar pedidos por critérios combinados (ex: saber todos os pedidos atrasados da Essilor ou buscar por número de gaveta), mesmo na arquitetura atual pré-banco de dados (in-memory/client-side).

**Especificação da Busca Lógica em Memória:**
1. **Multi-termo (AND Lógico):** Palavras separadas por espaço são avaliadas cumulativamente (ex: `joao varilux` encontra a OS de João que contém lente Varilux).
2. **Sintaxe de Filtro por Prefixo:**
   - `lab:[nome]` (ex: `lab:essilor`, `lab:hoya`, `lab:lux`).
   - `status:[tipo]` (ex: `status:atrasado`, `status:pronto`, `status:producao`).
   - `gaveta:[codigo]` (ex: `gaveta:g-01`, `gaveta:transito`).
   - `os:[numero]` ou `#[numero]` (ex: `#10294`).
3. **Resiliência:** Normalização de string com remoção de acentos (`normalize("NFD")`) e busca case-insensitive.
4. **Empty State com 1-Click Clear:** Caso a busca não retorne resultados, exibir mensagem descritiva amigável com botão "Limpar Busca".

**Critérios de Aceite:**
- [x] Suporte a busca multi-termo e tokens lógicos estruturados no estado client-side.
- [x] Faixa de chips de atalho rápido de busca com adição com 1 clique (`+lab:essilor`, `+status:atrasado`, etc.).
- [x] Atualização instantânea da tabela e do kanban conforme digitação e empty state amigável com reset.
- [x] Validação automatizada (`npm run build` com Exit Code 0) e zero impacto na performance de renderização.

---

### 🛡️ PBI-08: Blindagem Cadastral do Cliente & Governança Estrita do Wizard de Nova OS

**Status:** Concluído (Entregue na Sprint 15 & Validado no DoD).

**Motivação:**
Na Etapa 1 do Wizard de Nova Ordem de Serviço (`app/ordens-de-servico/page.tsx`), a ausência de máscaras de entrada e validações de tamanho permitia digitação descontrolada (ex: strings infinitas de nomes, CPF e telefones inválidos), além de quebrar o layout horizontal do cabeçalho quando o nome do cliente era longo. Adicionalmente, o stepper do topo permitia que qualquer atendente pulasse direto para as etapas seguintes sem preencher os dados obrigatórios da etapa anterior, violando a integridade transacional de uma emissão de OS.

**Especificação Técnica:**
1. **Máscaras e Limites de Entrada (Etapa 1):**
   - **Nome Completo (`#input-os-cliente-nome`):** `maxLength={70}`, sem placeholder desnecessário, obrigatório.
   - **CPF (`#input-os-cliente-cpf`):** `maxLength={14}`, máscara dinâmica `000.000.000-00`, validação estrutural de 11 dígitos numéricos com placeholder `000.000.000-00` (permite preenchimento com zeros para testes rápidos de balcão).
   - **Telefone / WhatsApp (`#input-os-cliente-telefone`):** `maxLength={15}`, máscara dinâmica `(00) 00000-0000`, validação por tamanho (10 a 11 dígitos com DDD) e placeholder `(00) 00000-0000`.
2. **Blindagem do Header contra Quebra de Layout:**
   - Adição de `truncate` e `max-w-[200px] md:max-w-[240px]` no nome do cliente exibido no cabeçalho fixo, impedindo qualquer empurrão ou quebra de linha no Stepper central.
3. **Governança Sequencial das Etapas da OS & Feedback via Toast Sem Jargões Técnicos:**
   - **Linguagem Natural:** Remoção de jargões técnicos em inglês como "wizard" em favor de termos operacionais de ótica ("etapas da Ordem de Serviço").
   - **Regra de Avanço:** Só é permitido avançar para a etapa seguinte se os dados obrigatórios da etapa atual estiverem preenchidos:
     - Etapa 1 -> Etapa 2: Nome, CPF (11 dígitos) e Telefone (DDD + número). Se incompleto, bloqueia e exibe Toast de alerta (`toast.warning`).
     - Etapa 2 -> Etapa 3: Prescrição óptica sem bloqueios clínicos (`!hasErrors`). Se houver erro de 0.25D ou eixo, bloqueia e exibe Toast.
     - Etapa 3 -> Etapa 4: Armação e Lente selecionadas. Se pendente, bloqueia e exibe Toast.
   - **Regra de Retorno:** Retorno livre e irrestrito para etapas anteriores já concluídas/visitadas (`targetStep < currentStep`), sem emissão de toasts.

**Critérios de Aceite:**
- [x] Máscaras dinâmicas de CPF e Telefone em tempo real e placeholders consistentes com zeros.
- [x] Nome do cliente limpo, sem placeholder e com limitação de 70 caracteres.
- [x] Validação permissiva para digitação de testes com zeros no CPF e Telefone sem bloqueios indevidos.
- [x] Toasts e alertas redigidos em linguagem clara e natural de ótica (sem menção ao jargão "wizard").
- [x] Nome longo no cliente com corte elegante (`truncate`) no cabeçalho sem quebrar a barra.
- [x] Tentativa de avançar etapas com dados pendentes bloqueada com emissão de Toasts corporativos explicativos.
- [x] Botões de avanço e Stepper com bloqueio visual explícito (fundo neutro, cursor not-allowed e ícone de cadeado lock) quando houver pendências ou inconsistências clínicas.
- [x] Navegação reversa para etapas anteriores 100% fluida.
- [x] `npm run build` com Exit Code 0 em todas as 14 rotas.

---

### 💎 Sprint 16: Refinamento Visual Premium & Microinterações de Interface (Visual Polish)

**Status:** Concluído (Entregue na Sprint 16 & Validado no DoD).

**Motivação:**
Com base no relatório de consultoria de UX/UI, implementar uma elevação visual incremental (sem alterações bruscas no layout e sem adição de bibliotecas externas pesadas), refinando o acabamento profissional, a legibilidade de dados densos e a agilidade nas rotinas diárias sob o Design System *Clinical Precision*.

**Especificação Técnica:**
1. **Containeres & Cards Suavizados:**
   - Padronização dos cartões e painéis para cantos arredondados modernos `rounded-xl`, borda suave `border-[#C1E8FF]/60` e elevação limpa `shadow-sm`, com hover refinado `hover:shadow-md transition-shadow`.
   - Aplicado em: Dashboard (Home), Estoque Livre, Kardex & Rastreabilidade, Fila de Ordens de Serviço, Detalhes da OS e Subtela de Disparo WhatsApp.
2. **Tabelas de Alta Densidade (Sticky Header & Microinteração de Linha):**
   - Cabeçalhos de tabela (`<thead>`) fixados com `sticky top-0 z-10 bg-[#F0F6FC] border-b border-[#C1E8FF]/80`, garantindo contexto permanente durante rolagem de inventários e relatórios extensos.
   - Microinteração de hover em linhas de tabela com realce sutil `hover:bg-[#C1E8FF]/15 transition-colors duration-150 cursor-default`.
   - Aplicado em: Catálogo de Estoque, Tabelas do Kardex (Sugestões e Ledger), Fila de Ordens de Serviço, Tabelas de SLA e Ranking da Dashboard, e Histórico de Disparos de WhatsApp.
3. **Campos de Busca com Focus Glow Clínico:**
   - Efeito visual de foco com anel suave `focus:ring-2 focus:ring-[#5483B3]/40 focus:border-[#5483B3] transition-all` nos campos de busca de Estoque, Kardex e Fila de OS.
4. **Sidebar Navigation & Operador Ativo:**
   - Implementação de avatar circular com iniciais do operador logado (`CR` para Dr. Carlos Ramos, `MS` para Mariana Souza) gerado dinamicamente via `getInitials(name)`.
   - Feedback de hover aprimorado nos itens de menu da barra lateral com `hover:bg-[#5483B3]/25 transition-colors`.
5. **Dashboard Gerencial & Badges de Tendência:**
   - Inclusão de micro-badges visuais de tendência (`trending_up` / `trending_down`) com cores semânticas (verde/vermelho) nos cards de indicadores executivos.
6. **Wizard de Nova OS (Etapa 1 - Clientes Frequentes de Balcão):**
   - Eliminação de áreas vazias na Etapa 1 do Wizard através da seção "Clientes Frequentes de Balcão (Acesso Rápido)" com 3 cartões de preenchimento instantâneo (`Roberto Mendes`, `Beatriz Fagundes`, `Claudio Nogueira`).
   - 1-clique preenche automaticamente nome, CPF mascarado e telefone, com feedback visual via Toast corporativo e IDs semânticos únicos (`#btn-os-cliente-rapido-1`, etc.).

**Critérios de Aceite:**
- [x] Cards e containeres globais atualizados com `rounded-xl`, `border-[#C1E8FF]/60` e `shadow-sm`.
- [x] Sticky headers e microinterações de hover aplicados em todas as tabelas de alta densidade.
- [x] Inputs de busca equipados com anel de foco suave (`focus:ring-2 focus:ring-[#5483B3]/40`).
- [x] Avatar de iniciais do operador na Sidebar nos modos expandido e colapsado.
- [x] Badges de tendência no Dashboard gerencial.
- [x] Clientes frequentes de balcão na Etapa 1 do Wizard de OS.
- [x] 100% de conformidade com IDs semânticos (`semantic-ids.md`).
- [x] `npm run build` executado com Exit Code 0 em todas as 14 rotas.

---

### 🎨 Sprint 17: Governança Visual, Despoluição Cromática & Separação Arquitetural do Kardex

**Status:** Concluído (Entregue na Sprint 17 & Validado no DoD).

**Motivação:**
Após feedback dos usuários e Product Owner sobre fadiga visual causada por excesso simultâneo de cores concorrentes (badges de status multicoloridos, 15 botões verdes repetitivos de WhatsApp por tela, cards destoantes no Dashboard) e pela sobrecarga cognitiva no Kardex (mistura indevida do extrato de movimentações com tabelas de compras), foi estabelecida a governança visual rigorosa para resgatar a elegância clínica, a paleta oficial azul e o foco funcional de cada tela.

**Especificação Técnica:**
1. **Reativação da Identidade da Paleta Azul nos Cabeçalhos Estruturais:**
   - **Âncoras de Marca:** Aplicação consistente dos tokens Deep Navy (`#052659`), Cerulean (`#5483B3`), Sky Accent (`#7DA0CA`), Crystal Ice (`#C1E8FF`) e Ice Surface (`#F0F6FC`) nos Breadcrumbs, títulos `h1`, badges de contagem e botões de ação nas rotas de Balcão e Kardex.
   - **Cabeçalhos de Tabelas (`<thead>`):** Fundo suave `#F0F6FC`, borda divisória `#C1E8FF` e rótulos em caixa alta com `#052659` font-bold.
2. **Padronização dos Indicadores de Balcão no Dashboard (`app/page.tsx`):**
   - Harmonização visual do card "Prontos p/ Retirada": ícone superior e número principal em Deep Navy (`#052659`), eliminando o verde excessivo que quebrava o padrão dos outros 5 cards de KPI.
   - Micro-indicador discreto com ponto verde de 1.5px e texto `#5483B3`.
3. **Separação Arquitetural e Limpeza do Kardex (`app/kardex/page.tsx`):**
   - **Remoção da Tabela de Compras:** Eliminado o bloco amarelo de reposição em lote da tela do Kardex, centralizando a rotina de compras na rota dedicada `/kardex/sugestoes-compra`.
   - **Destaque Cromático Apenas nas Setas Direcionais:**
     - Entrada (`↓`): Seta em verde esmeralda (`text-emerald-600`), texto em neutro de alto contraste (`text-slate-800`).
     - Saída (`↑`): Seta em coral/rose suave (`text-rose-500`), texto em neutro (`text-slate-800`).
     - Ajuste/Avaria (`⇄`): Ícone direcional em âmbar (`text-amber-500`), texto em neutro (`text-slate-800`).
   - Cards superiores do Kardex simplificados em 4 KPIs (SKUs Ativos, Entradas NF-e, Saídas Balcão/OS e Ponto de Reposição com link direto).
4. **Governança de IDs Semânticos & Responsividade:**
   - 100% dos elementos interativos preservam IDs únicos conforme `semantic-ids.md`.
   - Layouts com suporte a telas de balcão (1366px) até Ultrawide (2560px).

**Critérios de Aceite:**
- [x] Cabeçalhos, breadcrumbs e ações restaurados com a paleta oficial de azuis (#052659, #5483B3, #7DA0CA, #C1E8FF).
- [x] Tabela de compras e checkboxes removidos de `/kardex`, deixando a tela 100% focada no Ledger de movimentações.
- [x] Cor semântica na coluna Operação do Kardex restrita estritamente às setas direcionais, sem badges coloridos pesados.
- [x] Card de Prontos p/ Retirada no Dashboard harmonizado com Deep Navy (#052659).
- [x] 100% de conformidade com IDs semânticos únicos (`semantic-ids.md`).
- [x] `npm run build` executado com Exit Code 0 (15 rotas estáticas pré-renderizadas sem erros).

---

### 📐 Sprint 18: Padronização de Tabelas pelo Padrão Ouro do Catálogo & Despoluição do Dashboard

**Status:** Concluído (Entregue na Sprint 18 & Validado no DoD).

**Motivação:**
Com o crescimento das funcionalidades de balcão e gestão, algumas tabelas do sistema apresentavam tipografia excessivamente reduzida (`text-xs`), densidade claustrofóbica e sobrecarga de informações duplicadas no Dashboard (seção redundante para o perfil Consultor). Foi solicitada a padronização global com base na tabela de Catálogo de Estoque (`/estoque`), reconhecida pelo usuário como a mais legível, visual e clara do sistema.

**Especificação Técnica:**
1. **Padronização Global pelo Modelo Ouro do Catálogo (`/estoque`):**
   - **Tipografia:** Dados primários de títulos, clientes e produtos padronizados em `text-sm` (14px font-bold/font-semibold), metadados secundários em `text-xs font-mono` (`#5483B3` / `#7DA0CA`), e cabeçalhos em `text-[11px] font-bold uppercase` com `bg-[#F0F6FC]` e borda `#C1E8FF`.
   - **Espaçamento e Respiração de Linhas:** Altura padronizada de linhas (`py-3.5` a `py-4`, ~56px), eliminando sensação de aperto e proporcionando leitura ágil em telas de balcão.
   - **Status Discretos com Indicador Ponto:** Substituição de caixas sólidas coloridas por pontos semânticos (`w-2 h-2 rounded-full`) acompanhados de rótulo tipográfico legível e sutil.
   - **Ações de Balcão:** Botões refinados com cantos arredondados (`rounded-xl`), altura confortável (`h-8` a `h-8.5`), com alto contraste e respeito estrito à paleta azul oficial.
2. **Despoluição Operacional do Dashboard (`app/page.tsx`):**
   - No perfil **Consultor de Balcão**, eliminação da Seção 3 duplicada que repetia ordens atrasadas/prontas e tabelas de SLA de laboratórios sob a Seção 2.
   - Foco total nas Minhas Ordens Ativas (Seção 2) com tabela ampla, tipografia `text-sm`, status limpos e botões diretos de "Notificar WhatsApp", "Validar DNP" e "Ficha Técnica".
   - No perfil **Gerente**, Seção 3 mantida e padronizada com o novo layout `text-sm` e `py-3.5`.
3. **Harmonização da Fila de Produção (`app/ordens-de-servico/fila/page.tsx`):**
   - Tabela `table-fila-producao` elevada de `text-xs` para `text-sm`.
   - Nomes de pacientes em `text-sm font-bold text-[#052659]`.
   - Armações e lentes com tipografia respirada e botões de ação em pílula `rounded-xl`.
4. **Harmonização do Extrato e Cards Executivos do Kardex (`app/kardex/page.tsx`):**
   - **Cards de KPI com Vida e Presença Executiva:** Substituição dos mini-cards horizontais compactos por 4 cards executivos verticais no mesmo formato do Dashboard (`p-5`), métrica proeminente (`text-3xl font-mono font-bold`), ícones em squircles suaves com gradiente (`from-[#F0F6FC] to-[#C1E8FF]/50`, `from-emerald-50`, `from-amber-50`), micro-indicadores dinâmicos de tendência (`+18 novos itens`, `12 notas fiscais importadas`, `Abaixo do estoque de segurança`) e rodapés com links de ação direta (*Ver estoque*, *Importar XML*, *Ver fila OS*, *Pedir agora*).
   - **Ledger de Movimentações:** Tabela `table-kardex-ledger-movimentacoes` ajustada para `py-3.5` em todas as células, com descrição do SKU em `text-sm font-bold text-[#052659]` e saldo em destaque mono.
5. **Governança de IDs Semânticos & Compilação:**
   - 100% de conformidade com IDs semânticos únicos (`semantic-ids.md`).
   - `npm run build` executado com Exit Code 0 (15 rotas estáticas pré-renderizadas).

**Critérios de Aceite:**
- [x] Tabela de Fila de Produção e Dashboard Consultor promovidas para tipografia `text-sm` com padding `py-3.5`.
- [x] Seção 3 duplicada do Dashboard despoluída no perfil Consultor, eliminando redundância visual.
- [x] Tabela do Kardex com espaçamento generoso `py-3.5` e alinhamento visual com o padrão Catálogo.
- [x] Cards superiores do Kardex ampliados e enriquecidos com a mesma estrutura vertical, presença executiva e dinamismo do Dashboard.
- [x] Identidade visual da paleta azul da aplicação preservada sem perda de sofisticação (avaliada por UX).
- [x] 100% de conformidade com IDs semânticos únicos.
- [x] Compilação estática de produção bem-sucedida sem erros (`npm run build`).

---

### 📱 Sprint 19: Estúdio Interativo de Comunicação WhatsApp & Simulador Conversacional Vivo

**Status:** Concluído (Entregue na Sprint 19 & Validado no DoD).

**Motivação:**
A tela de Notificação WhatsApp (`/ordens-de-servico/notificar-whatsapp`) apresentava uma visualização estática e desprovida de dinamismo, limitando a capacidade da consultora de balcão de antecipar a experiência real do paciente. O usuário solicitou maior dinamismo, presença e vida para a interface.

**Especificação Técnica:**
1. **Simulador Conversacional WhatsApp Vivo (`app/ordens-de-servico/notificar-whatsapp/page.tsx`):**
   - **Papel de Parede Autêntico:** Fundo autêntico WhatsApp (`#EFEAE2`) com textura sutil e divisor de data em chip flutuante.
   - **Anexos Visuais Ricos no Chat:** Quando ativados os seletores digitais, a bolha de mensagem renderiza cards visuais ricos de verdade:
     - **Card de Ticket QR Code:** Matriz escaneável com número da OS, gaveta e tag "VALIDADO" para bipe no balcão.
     - **Card de Certificado Digital:** Card em PDF com escudo de autenticidade e validade de 12 meses.
     - **Card de Guia de Higienização:** Manual prático de microfibra e água fria.
   - **Simulação da Resposta do Paciente:** Toggle de simulação que insere uma bolha branca realista de resposta do paciente confirmando o horário de retirada na ótica.
2. **Estúdio de Personalização com Alternância de Modo:**
   - Abas de controle `[Simulador Visual]` e `[Personalizar Mensagem]`, permitindo que o operador customize o texto ou insira tags rápidas (`+ {cliente}`, `+ #{os}`, `+ {gaveta}`).
3. **Barra de Troca Rápida de Ordem (Quick OS Switcher):**
   - Pílulas interativas no topo para testar instantaneamente ordens com status distintos (`#10294 João`, `#10298 Maria`, `#10301 Carlos`, `#10280 Amanda`, `#10312 Renata`) sem depender de recarregar a URL.
4. **Dossiê Clínico do Paciente com Indicador de Pulso:**
   - Avatar com iniciais em gradiente Deep Navy, status com ponto pulsante (beacon dot), atalho de chat direto e cards dedicados para Armação, Lente e Saldo Restante.
5. **Padronização da Tabela de Histórico de Envios:**
   - Tabela promovida ao padrão Catálogo (`text-sm`, células em `py-3.5`, status de entrega com duplo check azul `done_all` e botão de Reenvio rápido).
6. **Governança de IDs Semânticos & Compilação:**
   - 100% de conformidade com IDs semânticos únicos (`semantic-ids.md`).
   - `npm run build` executado com Exit Code 0 (15 rotas estáticas pré-renderizadas).

**Critérios de Aceite:**
- [x] Simulador WhatsApp transformado em experiência conversacional viva com papel de parede e bolhas com duplo check azul.
- [x] Anexos digitais (QR Code de balcão e Certificado) renderizados como cards visuais ricos dentro da conversa.
- [x] Funcionalidade de simulação de resposta do paciente integrada.
- [x] Modo de edição rápida de texto com inserção de tags operacionais.
- [x] Seletor rápido de OSs no topo para navegação dinâmica instantânea.
- [x] Tabela de histórico de envios padronizada com o padrão ouro do Catálogo (`text-sm`, `py-3.5`).
- [x] 100% de conformidade com IDs semânticos únicos.
- [x] `npm run build` executado com Exit Code 0.

---

### 🌟 Sprint 20: Padronização Global da Micro-Animação de Elevação dos Cards (Hover Lift Effect)

**Status:** Concluído (Entregue na Sprint 20 & Validado no DoD).

**Motivação:**
Após o aprimoramento dos cards executivos do Kardex na Sprint 18 com micro-animação de flutuação e elevação tátil no hover (`hover:-translate-y-0.5 hover:shadow-md hover:border-[#5483B3] transition-all duration-200` acompanhado de micro-zoom suave no ícone `group-hover:scale-105`), o usuário destacou a excelência da experiência sensorial e solicitou a padronização global desse comportamento para todos os cards operacionais e executivos do sistema.

**Especificação Técnica:**
1. **Padrão Sensorial Global Unificado:**
   - **Container do Card:** `transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#5483B3] group` aplicado aos contêineres de cards, conferindo sensação tátil de física óptica e profundidade sutil sem quebra ou salto de layout (*zero layout shift*).
   - **Ícone / Squircle Reativo:** `group-hover:scale-105 transition-transform duration-200` (ou `scale-110` para glifos inline), adicionando vida aos elementos visuais quando o cursor passa sobre o bloco.
2. **Dashboard Geral & RBAC (`app/page.tsx`):**
   - **6 Cards Gerenciais (Dr. Carlos Ramos):** Faturamento Hoje, Ticket Médio Geral, Aging Laboratórios, Saldo a Receber Balcão, Armações em Ruptura Crítica, Conversão Lentes + Armação.
   - **4 Cards Operacionais do Consultor (Mariana Souza):** Minhas Vendas Hoje, Minhas OSs Ativas no Laboratório, Prontos p/ Retirada (Gavetas), Óculos Entregues Hoje.
3. **Fila de Produção e Balcão (`app/ordens-de-servico/fila/page.tsx`):**
   - **4 Cards de Topo Executivos:** Total Ordens em Aberto, Em Trânsito / Laboratório, Prontos p/ Retirada Balcão, Atrasadas / Cobrança Urgente.
   - **Cards de Gavetas de Balcão (Kanban):** Cards individuais de gavetas de entrega (`#card-fila-gaveta-${item.id}`) atualizados com a elevação suave e borda azulada no hover.
4. **Subtela WhatsApp (`app/ordens-de-servico/notificar-whatsapp/page.tsx`):**
   - **Dossiê Clínico do Paciente:** Card de cabeçalho do paciente com avatar e dados de armação/lente integrado com a transição tátil de elevação.
5. **Kardex — Sugestões de Compra (`app/kardex/sugestoes-compra/page.tsx`):**
   - **4 Cards de Topo Atualizados:** Ruptura Crítica, Ponto de Pedido, Investimento Total e Lead Time Médio promovidos para o padrão executivo completo com squircles em gradiente, badges dinâmicos e micro-animação de hover lift.
6. **Governança de IDs Semânticos & Compilação:**
   - 100% de conformidade com IDs semânticos únicos (`semantic-ids.md`).
   - `npm run build` executado com Exit Code 0 (15 rotas estáticas pré-renderizadas).
   - Validação visual realizada no navegador com gravação em vídeo e capturas de tela.

**Critérios de Aceite:**
- [x] Padrão de hover lift suave (`hover:-translate-y-0.5 hover:shadow-md hover:border-[#5483B3]`) padronizado em todas as telas principais.
- [x] Todos os 10 cards do Dashboard (visão Gerente e Consultor) animados de forma consistente.
- [x] Cards executivos e cards de gavetas da Fila de Produção harmonizados.
- [x] Cards de Sugestões de Compra do Kardex modernizados e elevados ao padrão do sistema.
- [x] 100% de conformidade com IDs semânticos únicos mantidos.
- [x] `npm run build` executado com Exit Code 0 sem warnings ou erros.
- [x] Validação visual via browser recording e screenshots aprovada.

---

### 🎨 Sprint 21: Governança do Design System (AGENTS.md), Despoluição Visual & Padronização Sistêmica de Telas

**Status:** Concluído (Entregue na Sprint 21 & Validado no DoD).

**Motivação:**
O usuário/PO pontuou a necessidade de alinhamento visual rigoroso entre as telas do sistema, alertando sobre a presença de poluição visual na tela de Notificação WhatsApp (excesso de emojis, gradientes extravagantes, molduras pesadas e excesso de informações fora do padrão da ferramenta). Além disso, cobrou a governança contínua do projeto com a alimentação formal do `AGENTS.md` para documentar grandes alterações e estabelecer padrões invioláveis de arquitetura e design, unificação de headers em todas as rotas e eliminação de inconsistências visuais em cards e ícones.

**Especificação Técnica:**
1. **Governança & Documentação Viva (`AGENTS.md`):**
   - Criação e manutenção do `AGENTS.md` na raiz do repositório (`c:\Fatura-ótica\AGENTS.md`) e sincronização em `frontend/AGENTS.md`.
   - Definição formal do Design System **Clinical Precision Enterprise**:
     - Paleta cromática estrita: Deep Navy (`#052659`), Active Cerulean (`#5483B3`), Soft Steel Blue (`#7DA0CA`), Clinical Ice Blue (`#C1E8FF`) e Background Neutro (`#F0F6FC`). Proibição expressa de cores arbitrárias (roxos, rosas, laranjas, neons).
     - Proibição absoluta de emojis de brinquedo/infantis (`📍`, `⏰`, `🏷️`, `💳`, `🙏`, `👓`, etc.).
     - Proibição de gradientes fora da identidade e texturas poluídas.
     - Contrato de componentes: Page Header Standard (`PageHeader.tsx`), Card Hover Lift Standard, SelectableCard sem ícones decorativos forçados (`SelectableCard.tsx`) e Table Standard (modelo ouro do Catálogo).
     - Regra inegociável de 100% de IDs semânticos únicos (`semantic-ids.md`).
2. **Despoluição da Subtela WhatsApp (`app/ordens-de-servico/notificar-whatsapp/page.tsx`):**
   - **Remoção de Emojis:** Todos os 4 modelos de mensagens oficiais limpos de emojis informais, utilizando marcadores clínicos discretos (`• Local de Retirada: ...`, `• Horário: ...`, `• OS: ...`).
   - **Remoção de Gradientes:** Substituição de `bg-gradient-to-br from-emerald-50...` e degradês por blocos sólidos corporativos (`#052659` Deep Navy e `#F0F6FC`).
   - **Visualizador Clínico Limpo:** Eliminação do padrão de papel de parede de pontos; container limpo em fundo neutro clínico (`bg-[#F8FAFC] border border-[#C1E8FF]`).
   - **Anexos Compactos:** Substituição de caixas pretas pesadas de QR Code por barras compactas de validação de balcão.
   - **Eliminação de Excesso de Informação:** Remoção do card de dicas redundante no rodapé.
   - **Resposta Simulada Profissional:** Diálogo limpo e realista sem gírias ou emojis.
3. **Padronização Sistêmica Unificada em 100% das Telas (`PageHeader.tsx`):**
   - **Migração para PageHeader Global:**
     - `/estoque`: Header migrado para `<PageHeader />` com breadcrumb `Dashboard / Estoque & Logística / Catálogo Livre`.
     - `/kardex`: Header migrado para `<PageHeader />` com breadcrumbs e badge de versão.
     - `/kardex/ajuste-manual`: Header migrado para `<PageHeader />`.
     - `/kardex/entrada-nfe`: Header migrado para `<PageHeader />`.
     - `/kardex/sugestoes-compra`: Header migrado para `<PageHeader />`.
     - `/ordens-de-servico/fila`: Header migrado para `<PageHeader />`.
     - `/ordens-de-servico/detalhes`: Header migrado para `<PageHeader />`.
     - `/ordens-de-servico/notificar-whatsapp`: Header migrado para `<PageHeader />`.
   - **Remoção de Gradientes e Padronização de Squircles de Ícones:**
     - Squircles de cards executivos padronizados em `w-9 h-9 rounded-xl bg-[#F0F6FC] text-[#5483B3] border border-[#C1E8FF]` (sem gradientes carnavalescos).
   - **Cartões de Seleção Limpos (`SelectableCard.tsx`):**
     - Na Etapa 3 do Wizard de OS, cartões limpos e horizontais sem ícones decorativos forçados, com foco na marca, preço mono e especificações técnicas.
4. **Governança de IDs Semânticos & Compilação:**
   - 100% de conformidade com IDs semânticos únicos preservada.
   - `npm run build` executado com Exit Code 0 (15 rotas estáticas pré-renderizadas sem erros).
   - Auditoria visual aprovada no navegador através de subagent gravado em WebP.

**Critérios de Aceite:**
- [x] Arquivo `AGENTS.md` criado e detalhado na raiz com todas as diretrizes de governança e design system.
- [x] Tela de Notificar WhatsApp despoluída (zero emojis, zero gradientes extravagantes, zero texturas poluídas, anexos compactos).
- [x] Mensagens de templates formatadas com sobriedade clínica corporativa.
- [x] Remoção de cards informativos redundantes.
- [x] 100% de conformidade com IDs semânticos únicos mantida.
- [x] `PageHeader.tsx` integrado em todas as telas (`/`, `/estoque`, `/kardex`, `/kardex/*`, `/ordens-de-servico`, `/ordens-de-servico/*`).
---

### 💎 Sprint 22: Unificação Arquitetural de Cabeçalhos e Padronização Universal de Cards (Zero Layout Shift)

**Status:** Concluído (Entregue na Sprint 22 & Validado no DoD).

**Motivação:**
O usuário/PO pontuou que, ao transitar entre o Dashboard e as demais telas do sistema, sentia uma diferença de ergonomia visual: a organização dos cabeçalhos era heterogênea (algumas telas continham ícone sem breadcrumb, outras continham breadcrumb sem ícone, gerando saltos de posição ao navegar), e o tamanho, padding e anatomia dos cards variava expressivamente (Dashboard com cards compactos `p-4` sem squircle para o ícone versus Fila/Kardex com cards `p-5` e squircles `w-9 h-9`, além da tela de Estoque sem faixa de indicadores).

**Especificação Técnica:**
1. **Padronização Estrutural de Cabeçalhos (Zero Layout Shift):**
   - Altura mínima estabilizada em `min-h-[72px]` em `PageHeader.tsx`.
   - Adoção obrigatória de **Breadcrumb Clínico** e **Squircle de Ícone Institucional** (`w-9 h-9 rounded-xl bg-[#052659] text-white`) em 100% das páginas do ERP:
     - Dashboard (`/`): `icon="domain"` (Gerente) / `icon="badge"` (Consultor) com breadcrumbs `Dashboard / Visão Operacional`.
     - Central de Pedidos / Fila (`/ordens-de-servico/fila`): `icon="assignment"` com breadcrumbs `Dashboard / Ordens de Serviço / Central de Pedidos & Balcão`.
     - Catálogo de Estoque (`/estoque`): `icon="inventory_2"` com breadcrumbs `Dashboard / Estoque & Logística / Catálogo Livre`.
     - Kardex & Ledger (`/kardex`): `icon="swap_horiz"` com breadcrumbs `Dashboard / Estoque & Logística / Kardex & Ledger`.
     - Entrada NF-e (`/kardex/entrada-nfe`): `icon="receipt_long"`.
     - Ajuste Manual (`/kardex/ajuste-manual`): `icon="tune"`.
     - Sugestões de Compra (`/kardex/sugestoes-compra`): `icon="shopping_cart"`.
     - Detalhes da OS (`/ordens-de-servico/detalhes`): `icon="visibility"`.
     - Notificar WhatsApp (`/ordens-de-servico/notificar-whatsapp`): `icon="chat"`.
     - Nova OS (`/ordens-de-servico`): `icon="add_circle"`.
2. **Criação do Componente Universal de Cards (`components/KpiCard.tsx`):**
   - Criação do componente reutilizável `KpiCard.tsx` com 100% de IDs semânticos únicos, tipagem estrita TypeScript e tokens do Design System.
   - Padrão arquitetural: `rounded-2xl border border-[#C1E8FF] bg-white p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#5483B3] transition-all duration-200 group flex flex-col justify-between`.
   - Squircle de ícone no canto superior direito (`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`).
   - Métrica em `font-mono text-2xl sm:text-3xl font-bold text-[#052659]`.
   - Rodapé com linha divisora `border-t border-[#F0F6FC]` e link de ação rápida.
3. **Adoção Universal do KpiCard nas Telas Principais:**
   - **Dashboard (`/`):** Substituição dos markups customizados de cartões pelos componentes `<KpiCard />` no modo Gerente (6 KPIs) e Consultor (4 KPIs).
   - **Fila de Pedidos (`/ordens-de-servico/fila`):** Substituição dos 4 cards manuais por `<KpiCard />`.
   - **Kardex (`/kardex`):** Substituição dos 4 cards manuais por `<KpiCard />`.
   - **Catálogo de Estoque (`/estoque`):** Inclusão da faixa de 4 `<KpiCard />` no topo do inventário (Armações em Estoque, Lentes em Estoque, Alerta de Reposição e Valor em Inventário), eliminando a assimetria visual de abertura.
4. **Governança de IDs Semânticos & Compilação:**
   - 100% de IDs semânticos únicos preservados.
   - `npm run build` executado com Exit Code 0 (15 rotas estáticas pré-renderizadas).
   - Validação visual via browser subagent com capturas comprovando ausência de layout shift e uniformidade métrica entre Dashboard, Fila, Estoque e Kardex.

**Critérios de Aceite:**
- [x] Componente `components/KpiCard.tsx` criado e documentado.
- [x] Altura e alinhamento de `PageHeader.tsx` padronizados com `min-h-[72px]`.
- [x] 100% das páginas com Ícone Institucional e Breadcrumb Clínico integrados.
- [x] Zero Layout Shift auditado ao navegar entre Dashboard, Fila, Estoque e Kardex.
- [x] Dashboard, Fila, Estoque e Kardex utilizando `<KpiCard />` com padding `p-5`, cantos `rounded-2xl` e squircles idênticos.
- [x] Faixa de KPIs adicionada no Catálogo de Estoque para consistência com o restante do ERP.
- [x] `npm run build` compilado com Exit Code 0.
- [x] Atualização dos documentos `SPEC.md` e `AGENTS.md`.

---

### 🚀 Sprint 23: Sistema de Destaque, Contraste e Affordance de Botões (*Clinical Action System*)

**Status:** Concluído (Entregue na Sprint 23 & Validado no DoD).

**Motivação:**
O usuário/PO relatou que os botões da aplicação em geral estavam sem destaque visual suficiente, camuflando-se com os fundos claros e dificultando a rápida identificação de ações no balcão da ótica.

**Especificação Técnica:**
1. **Componentização Reutilizável (`components/Button.tsx`):**
   - Criação do componente padrão universal com suporte a `href` (polimorfismo com `<Link>`), ícones Material Symbols e atalhos de teclado visuais (`[F1]`, `[F2]`).
   - Matriz de 5 variantes: `primary` (Deep Navy com anel e sombra), `accent` (Esmeralda para WhatsApp), `secondary` (Branco com borda 2px `#5483B3`), `danger` (Carmim para atrasos) e `ghost`.
2. **Erradicação do "Botão Camaleão":**
   - Botões secundários (`[F1] Atualizar`, `Exportar Excel`, `Emitir Romaneio`) agora possuem borda sólida dupla `border-2 border-[#5483B3]` sobre fundo branco puro, eliminando o desaparecimento visual contra o background `#F0F6FC`.
3. **Destaque Operacional em Tabelas (1 Clique):**
   - **Central de Pedidos (`/ordens-de-servico/fila`):** Botão `Notificar WhatsApp` convertido para pílula verde esmeralda sólida (`bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs`) e botão `Cobrar Lab` convertido para carmim sólido (`bg-rose-600 text-white font-bold`).
   - **Dashboard (`/`):** Botão `Notificar` na lista de OSs de balcão convertido para esmeralda sólido (`bg-emerald-600`) e botão `Validar DNP` para âmbar sólido.
   - **Estoque (`/estoque`):** Botão `Kardex` com contorno de 2px e hover invertido Deep Navy.
4. **Governança & IDs Semânticos:**
   - 100% de IDs semânticos únicos preservados em todos os botões refatorados.
   - `npm run build` executado com Exit Code 0 (15 rotas estáticas pré-renderizadas).

**Critérios de Aceite:**
- [x] Componente `components/Button.tsx` criado e tipado.
- [x] Botões primários com elevação e anel (`shadow-sm hover:shadow-md active:scale-95`).
- [x] Botões secundários com contorno contrastante de 2px contra fundos claros.
- [x] Ações de WhatsApp destacadas em verde esmeralda em toda a esteira de pedidos.
- [x] Ações de cobrança destacadas em vermelho carmim nas OSs em atraso.
- [x] Exit Code 0 no `npm run build` e conformidade com `AGENTS.md`.

---

### 🚀 Sprint 24: Affordance de Links (`<a>`), Chips Clínicos (`<span>`) e Ações de Cabeçalho

**Status:** Concluído (Entregue na Sprint 24 & Validado no DoD).

**Motivação:**
Após o aprimoramento dos botões principais, o usuário/PO identificou que o botão `<button id="btn-fila-imprimir-romaneio">` ainda parecia desajustado por conta do fundo branco vazado no PageHeader, e solicitou atenção especial para elementos estruturais fundamentais de navegação rápida: tags `<a>` (links de ação) e tags `<span>` (metadados clínicos, gavetas físicas e status operacionais).

**Especificação Técnica:**
1. **Ajuste Conclusivo de `btn-fila-imprimir-romaneio` e Ações Secundárias:**
   - Botão de Romaneio (`/ordens-de-servico/fila`), botão `[F1] Atualizar` (`/`) e `Exportar Excel` (`/estoque`) ajustados para preenchimento sólido **Cerulean `#5483B3`** (`bg-[#5483B3] hover:bg-[#052659] text-white font-bold ring-2 ring-[#5483B3]/25 shadow-sm hover:shadow-md`) com ícone branco puro, erradicando a sensação de botão vazado ou desbotado contra o PageHeader branco.
2. **Elevação das Tags `<a>` / `<Link>` (Action Chip Links):**
   - **Identificadores Clínicos (`#10294` e SKUs):** Deixaram de ser textos planos e passaram a ser Action Chip Links (`px-2.5 py-1 rounded-lg font-mono font-bold text-xs bg-[#F0F6FC] hover:bg-[#052659] text-[#052659] hover:text-white border border-[#C1E8FF] transition-all inline-flex items-center gap-1 shadow-2xs group`) com ícones institucionais `tag` e `qr_code`.
   - **Links "Ver Ficha":** Estilizados como pílulas de ação com micro-animação de deslocamento de seta (`group-hover:translate-x-0.5`).
   - **Footer Links de Cards Executivos e Tabelas:** Links de balcão completo e fila convertidos em pílulas estruturadas com borda sutil e preenchimento `#F0F6FC` com hover para Deep Navy.
3. **Elevação das Tags `<span>` (Pílulas Clínicas & Chips de Gaveta):**
   - **Pílulas de Status com Indicador Circular Iluminado:** Status operacionais (`Atrasado 2 dias`, `Pronto Retirada`, `Em Produção`) receberam container em pílula completa com bordas nítidas e ponto iluminado com anel de foco (`w-2 h-2 rounded-full ring-2`), conferindo máxima legibilidade visual no escaneamento de balcão.
   - **Chips de Gaveta Física (`shelves`):** Gaveteiro de balcão (`Gaveta Transit Lab`, `Bancada 01`) padronizado com squircle/chip dedicado, ícone `shelves` institucional do Google Material Symbols e tipografia mono.
   - **Badges de Cabeçalho:** Indicadores de pedidos ativos no PageHeader com ponto pulsante verde (`animate-pulse`) sobre Deep Navy sólido.
4. **Governança & Análise Estática:**
   - 100% de conformidade com `semantic-ids.md`.
   - `npm run build` executado com **Exit Code 0** (zero warnings e 15 rotas estáticas pré-renderizadas com sucesso).

**Critérios de Aceite:**
- [x] Botão `btn-fila-imprimir-romaneio` ajustado com Cerulean sólido e contraste reforçado.
- [x] Números de OS (`#10294`) e SKUs elevados para Action Chip Links clicáveis.
- [x] Status operacionais transformados em pílulas clínicas com pontos circulares iluminados.
- [x] Gavetas físicas com chips dedicados contendo ícone institucional `shelves`.
- [x] Links de rodapé de tabelas e dashboards transformados em action pills.
---

### 🚀 Sprint 25: Blindagem do Front-end — Prevenção de Duplo Clique, Auto-lock e Resiliência de Ações

**Status:** Concluído com Sucesso (Build & Lint Exit Code 0, Branch feature/frontend-sprint-25).

**Motivação:**
Em ambiente de balcão e retaguarda de ótica, operadores frequentemente realizam cliques múltiplos e rápidos em botões de ação ("duplo clique"), o que pode gerar requisições concorrentes duplicadas, como emissão duplicada de OS (#10294 e #10295), dupla baixa no Kardex de estoque, disparos repetidos de mensagens no WhatsApp e inserções financeiras incorretas.

**Especificação Técnica:**
1. **Componente Universal `components/Button.tsx` com Blindagem Atômica:**
   - Interceptação inteligente de `onClick`: suporte nativo a handlers assíncronos (`async/await` / Promises) com auto-lock instantâneo (`isLoading = true`) enquanto a Promise estiver pendente.
   - Debounce atômico de proteção (500ms): rejeição síncrona imediata via refs de múltiplos cliques acidentais no mesmo botão.
   - Estado visual de carregamento integrado com spinner animado (`animate-spin`), preservando a largura do botão sem causar Layout Shift.
   - Propriedade `disabled` ativada imediatamente no primeiro evento com `pointer-events-none` e cursor apropriado (`cursor-not-allowed`).
2. **Criação do Hook Utilitário `hooks/useAsyncAction.ts`:**
   - Hook desacoplado e reutilizável para gerenciar ações com trava de concorrência (`isLoading`, `execute`, `error`, `reset`), garantindo que apenas 1 ciclo execute por vez com notificações clínicas integradas.
3. **Refatoração das Ações de Mutação Crítica nas Telas:**
   - **Emissão de OS (`/ordens-de-servico`):** Blindagem dos botões de emissão e envio (`btn-os-emitir-ordem-resumo` e `btn-os-finalizar-enviar-lab`), impedindo criação duplicada da ordem.
   - **Kardex Entrada NF-e (`/kardex/entrada-nfe`):** Blindagem dos botões `btn-nfe-confirmar-entrada` e `btn-nfe-salvar-rascunho`.
   - **Kardex Ajuste Manual (`/kardex/ajuste-manual`):** Blindagem do botão de confirmação de baixa por avaria/laboratório (`btn-ajuste-registrar-termo`).
   - **Notificação WhatsApp (`/ordens-de-servico/notificar-whatsapp`):** Bloqueio de cliques repetidos na cópia de mensagem (`btn-notificar-copiar-texto`).
   - **Catálogo de Estoque (`/estoque`):** Blindagem do botão de salvar produto no modal manual (`btn-modal-novo-produto-salvar`).
   - **Fila de Pedidos (`/ordens-de-servico/fila`):** Blindagem da submissão rápida de malote (`btn-fila-bipar`).
4. **Governança & IDs Semânticos:**
   - 100% de conformidade com `semantic-ids.md`.
   - Build e Lint 100% aprovados (`npm run build:frontend` e `npm run lint:frontend`).

**Critérios de Aceite:**
- [x] Auto-lock e debounce integrados nativamente em `components/Button.tsx`.
- [x] Hook `hooks/useAsyncAction.ts` criado e tipado.
- [x] Ações críticas de escrita (Emissão de OS, Entrada NF-e, Ajuste Manual, Modal de Produto, Bip de Malote e Ações de WhatsApp) protegidas contra duplo clique.
- [x] Spinner e transição visual suave sem Layout Shift durante o processamento.
- [x] `npm run lint:frontend` executado com Exit Code 0.
- [x] `npm run build:frontend` executado com Exit Code 0.
- [x] Validação visual e teste de cliques repetidos verificado.

---

### 🚀 Sprint 26: Painel Administrativo de Identidade, Gestão de Operadores e Filiais (Alinhamento Backend Sprint 01)

**Status:** Concluído com Sucesso (Build & Lint Exit Code 0, Branch feature/frontend-sprint-26).

**Motivação & Contexto Empresarial:**
Alinhamento direto entre a interface Next.js e o contrato oficial de API do backend .NET 10 (`backend/docs/contracts/identity.openapi.yaml` e `docs/sprints/SPRINT-01-IDENTITY.md`).
Em uma rede ótica com múltiplas lojas e laboratório central, a concessão de acessos precisa ser rigorosamente segregada:
1. Gestores de filial podem cadastrar novos funcionários para sua unidade, mas **nunca criam nem visualizam senhas**. O perfil nasce com status `pending`.
2. O Administrador de Acessos da empresa (ou o Dono da rede) é o único autorizado a conceder papéis (`seller`, `branchManager`, `accessAdministrator`, `owner`) e filiais permitidas.
3. O novo colaborador recebe convite seguro para ativar sua conta e definir sua própria senha em uma tela de primeiro acesso (`/ativar-conta`).
4. Enquanto os endpoints HTTP da Sprint 01 do backend estão sendo finalizados em C#/PostgreSQL, o front-end implementa uma camada de **Design-First com Mock Service Layer**, garantindo 100% de testabilidade, fidelidade aos DTOs e zero retrabalho futuro.

**Especificação Técnica das Telas e Componentes:**

#### 1. Página de Gestão de Usuários e Acessos (`/admin/usuarios`):
- **Cabeçalho:** `PageHeader` (`header-admin-usuarios`) com breadcrumbs (`Dashboard > Administração > Colaboradores & Acessos`).
- **Cards de Indicadores (KPIs):**
  - `card-kpi-total-usuarios`: Total de colaboradores cadastrados na organização.
  - `card-kpi-usuarios-ativos`: Colaboradores ativos e homologados.
  - `card-kpi-usuarios-pendentes`: Convites pendentes de primeiro acesso/ativação.
  - `card-kpi-usuarios-bloqueados`: Acessos revogados/bloqueados por auditoria.
- **Barra de Filtros & Ações:**
  - Campo de busca textual (`input-admin-busca-usuario`): filtra por nome, e-mail ou CPF.
  - Filtro por Filial (`select-admin-filtro-filial`): lista filiais da rede ou "Todas as Filiais" (restrito se o usuário logado for gestor local).
  - Pílulas de filtro de status: `btn-filtro-status-todos`, `btn-filtro-status-ativos`, `btn-filtro-status-pendentes`, `btn-filtro-status-bloqueados`.
  - Botão de Ação Primária: `btn-admin-novo-usuario` (+ Novo Colaborador), abre o modal de cadastro rápido.
- **Tabela de Operadores (`table-admin-usuarios`):**
  - Colunas:
    1. **Colaborador:** Nome completo, e-mail corporativo normalizado e avatar com iniciais.
    2. **Filial de Lotação:** Nome da loja e chip de identificação.
    3. **Papéis Concedidos:** Badges clínicos indicando `Vendedor`, `Gestor`, `Admin Acessos` ou `Dono`.
    4. **Status do Perfil:**
       - `badge-status-ativo`: Verde esmeralda (Ativo e operando).
       - `badge-status-pendente`: Amarelo âmbar (Aguardando ativação pelo colaborador).
       - `badge-status-bloqueado`: Rosa avermelhado (Acesso suspenso).
    5. **Ações:**
       - `btn-usuario-gerenciar-acessos-{id}`: Abre gaveta lateral de concessões.
       - `btn-usuario-reenviar-convite-{id}`: Disponível para pendentes, dispara reenvio de token.
       - `btn-usuario-toggle-bloqueio-{id}`: Alterna bloqueio/desbloqueio imediato.

#### 2. Modal de Cadastro Rápido pelo Gestor (`modal-admin-novo-usuario`):
- **Campos:**
  - Nome Completo (`input-modal-usuario-nome`): `required`, mínimo 3 caracteres.
  - E-mail Corporativo (`input-modal-usuario-email`): `required`, formato email normalizado.
  - Filial de Lotação (`select-modal-usuario-filial`): seleção da unidade.
  - Cargo/Função (`input-modal-usuario-cargo`): texto descritivo (ex: "Consultor Óptico Balcão", "Técnico de Surfaçagem").
- **Garantia de Segurança:** Nenhum campo de senha no formulário. Alerta informativo institucional explicando que um token de ativação seguro (24h de validade) será enviado para o e-mail cadastrado.
- **Botões:** `btn-modal-usuario-cancelar` e `btn-modal-usuario-salvar` (com proteção anti-duplo clique e feedback de sucesso via toast).

#### 3. Gaveta Lateral de Concessões e Permissões (`drawer-admin-permissoes-usuario`):
- Exibe os dados do colaborador selecionado e suas credenciais.
- **Matriz de Papéis (`GrantRequest.role`):**
  - `seller` (Vendedor): Opera OS nas filiais autorizadas.
  - `branchManager` (Gestor de Filial): Visualiza relatórios locais e cadastra novos perfis na sua unidade.
  - `accessAdministrator` (Admin de Acessos): Concede/revoga papéis e filiais a terceiros.
  - `owner` (Dono): Acesso irrestrito a todas as filiais e visão consolidada.
- **Matriz de Filiais Autorizadas (`GrantRequest.branchId`):** Lista todas as filiais com checkboxes individuais.
- **Ações:**
  - Salvar Concessões (`btn-drawer-salvar-concessoes`): Salva os novos papéis e filiais.
  - Bloquear / Desbloquear (`btn-drawer-toggle-status`): Altera o estado entre `active` e `blocked`.
  - Reenviar E-mail de Ativação (`btn-drawer-reenviar-ativacao`): Gera novo token de 24h para o usuário.

#### 4. Tela de Primeiro Acesso & Ativação de Senha (`/ativar-conta`):
- Acessada via link com token: `/ativar-conta?token=FO-ACT-2026-X89`
- Exibe os dados pré-cadastrados (Nome e E-mail da ótica).
- **Campos de Senha:**
  - Nova Senha (`input-ativar-senha`): tipo password com toggle de visualização.
  - Confirmação de Senha (`input-ativar-confirmar-senha`).
  - Checklist Dinâmico de Segurança: Mínimo 8 caracteres, pelo menos 1 número, 1 letra maiúscula e 1 caractere especial.
- **Submissão (`btn-ativar-conta-submit`):**
  - Dispara ativação atômica com validação de token.
  - Altera status para `active` e redireciona para `/login` com toast de boas-vindas.

#### 5. Camada de Tipagem e Mock Adapter (`types/identity.ts` e `services/identityService.ts`):
- Modelagem TypeScript 100% aderente a `identity.openapi.yaml`:
  - `Profile`, `Branch`, `Grant`, `Session`, `Me`, `Problem`.
- Mock Adapter desacoplado com latência simulada de 300ms, persistência em `localStorage` e retorno padronizado para testes rápidos no navegador.

**Critérios de Aceite:**
- [x] Modelagem de tipos em `types/identity.ts` conforme schemas de `identity.openapi.yaml`.
- [x] Mock Service Adapter em `services/identityMockService.ts` implementando usuários padrão, filiais e ações de CRUD.
- [x] Página `/admin/usuarios` criada com listagem de colaboradores, badges de status, filtros e KPIs.
- [x] Modal de criação rápida de colaborador sem exposição de senha e com auto-lock.
- [x] Gaveta lateral de concessões para Administrador de Acessos alterar filiais e papéis.
- [x] Página `/ativar-conta` para primeiro acesso e definição de senha com checklist visual de segurança.
- [x] 100% de conformidade com `semantic-ids.md` em todos os botões, inputs e elementos interativos.
- [x] `npm run lint:frontend` executado com Exit Code 0 (0 errors, 0 warnings).
- [x] `npm run build:frontend` executado com Exit Code 0.
- [x] Validação visual completa no navegador.

---

Para garantir que o **Fatura Ótica** seja escalável como SaaS B2B e adaptável a diferentes óticas sem comprometer a integridade clínica, estabelecemos três camadas rígidas de responsabilidade:

| Camada | Escopo | Quem Define | Exemplos no Sistema |
| :--- | :--- | :--- | :--- |
| **1. Parametrizável (Admin / Tenant)** | Regras de negócio, branding e políticas comerciais customizáveis por cada ótica. | **Lojista / Gestor** (via Painel Admin) | • Templates de WhatsApp com tags dinâmicas (`{nome}`, `{os}`, `{valor}`).<br>• Gateway de envio (Web Link, Meta API, Z-API/Evolution).<br>• Margem comercial/Markup e regra de sinal de balcão (50% ou 100%).<br>• SLAs contratuais de laboratórios parceiros.<br>• Logo da ótica, dados fiscais e gestão de filiais/usuários. |
| **2. Invariante Clínico (Core Engine)** | Leis da física óptica oftálmica e normativas regulatórias (ANVISA/ABNT ISO). Imutáveis pelo lojista. | **Sistema / Motor Óptico** (Código Rígido) | • Validação de passos dióptricos estritos de **0.25D**.<br>• Regra de obrigatoriedade do Eixo (0° a 180°) quando Cilíndrico != 0.<br>• Cálculo matemático de transposição esfero-cilíndrica ($Esf' = Esf+Cil$).<br>• Invariante de adição (positiva para presbiopia).<br>• Validação estrutural de XML NF-e 4.00 (Chave de 44 dígitos). |
| **3. Preditivo / Algorítmico (IA & Automação)** | Previsões baseadas em histórico operacional e otimizações automáticas. | **Algoritmos do Sistema** (Calculado) | • Sugestão de reposição no Kardex (Lead Time × Consumo Diário + Estoque Segurança).<br>• Smart Routing de Laboratórios (recomendação do laboratório mais rápido/barato).<br>• Classificação automática de tipo de lente (Monofocal, Bifocal, Multifocal). |


## Organização conjunta de frontend e backend — 6 de outubro de 2026

O diretório da aplicação foi renomeado de `fatura-otica/` para `frontend/`. O repositório Git, as regras comuns dos agentes e o grafo Graphify passam a usar a raiz `C:\Fatura-ótica`, ao lado de `backend/`.
Os componentes e as rotas do Next.js mantêm seus caminhos relativos dentro do frontend. Os comandos comuns estão no `package.json` da raiz. A decisão e os critérios de aceite estão em `../../docs/PROJECT_STRUCTURE.md`, relativo a este documento.