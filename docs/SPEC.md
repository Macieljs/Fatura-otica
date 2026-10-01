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
- [x] **Task 7.4 (Front-end):** Criar a nova subtela dedicada **[`app/ordens-de-servico/notificar-whatsapp/page.tsx`](file:///C:/Fatura-ótica/fatura-otica/app/ordens-de-servico/notificar-whatsapp/page.tsx)**:
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

Para garantir que o **Fatura Ótica** seja escalável como SaaS B2B e adaptável a diferentes óticas sem comprometer a integridade clínica, estabelecemos três camadas rígidas de responsabilidade:

| Camada | Escopo | Quem Define | Exemplos no Sistema |
| :--- | :--- | :--- | :--- |
| **1. Parametrizável (Admin / Tenant)** | Regras de negócio, branding e políticas comerciais customizáveis por cada ótica. | **Lojista / Gestor** (via Painel Admin) | • Templates de WhatsApp com tags dinâmicas (`{nome}`, `{os}`, `{valor}`).<br>• Gateway de envio (Web Link, Meta API, Z-API/Evolution).<br>• Margem comercial/Markup e regra de sinal de balcão (50% ou 100%).<br>• SLAs contratuais de laboratórios parceiros.<br>• Logo da ótica, dados fiscais e gestão de filiais/usuários. |
| **2. Invariante Clínico (Core Engine)** | Leis da física óptica oftálmica e normativas regulatórias (ANVISA/ABNT ISO). Imutáveis pelo lojista. | **Sistema / Motor Óptico** (Código Rígido) | • Validação de passos dióptricos estritos de **0.25D**.<br>• Regra de obrigatoriedade do Eixo (0° a 180°) quando Cilíndrico != 0.<br>• Cálculo matemático de transposição esfero-cilíndrica ($Esf' = Esf+Cil$).<br>• Invariante de adição (positiva para presbiopia).<br>• Validação estrutural de XML NF-e 4.00 (Chave de 44 dígitos). |
| **3. Preditivo / Algorítmico (IA & Automação)** | Previsões baseadas em histórico operacional e otimizações automáticas. | **Algoritmos do Sistema** (Calculado) | • Sugestão de reposição no Kardex (Lead Time × Consumo Diário + Estoque Segurança).<br>• Smart Routing de Laboratórios (recomendação do laboratório mais rápido/barato).<br>• Classificação automática de tipo de lente (Monofocal, Bifocal, Multifocal). |

