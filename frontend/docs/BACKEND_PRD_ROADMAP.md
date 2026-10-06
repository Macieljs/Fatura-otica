# Roadmap de PRDs do Back-end (SaaS B2B Fatura Ótica)

> **Status Geral:** 🟡 RASCUNHO TÉCNICO (DRAFT) — PENDENTE DE APROVAÇÃO DO PO  
> **Data:** 30/09/2026  
> **Papel Responsável:** Scrum Master & Tech Lead  
> **Objetivo:** Mapeamento técnico e conceitual de todos os domínios de regras de negócio para a futura construção do Back-end. Nenhuma implementação de Back-end se inicia sem a aprovação explícita do Product Owner.

---

## 🧭 Visão Geral do Pipeline de PRDs

| Código | Módulo / Domínio | Status de Aprovação | Documento Detalhado |
| :---: | :--- | :---: | :--- |
| **PRD-01** | **Identity, Multi-Tenancy & RBAC Engine** | 🟡 Rascunho / Em Revisão | [`docs/PRD-01-IDENTITY-MULTITENANCY-RBAC.md`](file:///c:/Fatura-ótica/fatura-otica/docs/PRD-01-IDENTITY-MULTITENANCY-RBAC.md) |
| **PRD-02** | **Core Engine de Ordens de Serviço & Dioptrias** | 🟡 Rascunho / Mapeado | *Ver Seção 2 abaixo* |
| **PRD-03** | **Kardex, Estoque Físico & Ingestão NF-e XML** | 🟡 Rascunho / Mapeado | *Ver Seção 3 abaixo* |
| **PRD-04** | **Central de Mensageria & Notificações WhatsApp** | 🟡 Rascunho / Mapeado | *Ver Seção 4 abaixo* |
| **PRD-05** | **Fechamento de Caixa, Formas de Pagamento & DRE** | 🟡 Rascunho / Mapeado | *Ver Seção 5 abaixo* |
| **PRD-06** | **Parametrização do Tenant & Configurações da Loja** | 🟡 Rascunho / Mapeado | *Ver Seção 6 abaixo* |

---

## 1. PRD-01: Identity, Multi-Tenancy & RBAC Engine
*Documento Completo:* [PRD-01-IDENTITY-MULTITENANCY-RBAC.md](file:///c:/Fatura-ótica/fatura-otica/docs/PRD-01-IDENTITY-MULTITENANCY-RBAC.md)
- **Escopo:** Autenticação corporativa (e-mail/CPF + senha hash Argon2/Bcrypt), isolamento rigoroso entre óticas (Row-Level Security no PostgreSQL), suporte a filiais múltiplas (Matriz, Filial Shopping, Laboratório Central), perfis `gerente` (irrestrito) e `consultor` (operacional, sem vazamento de faturamento ou margens), gestão de sessões e recuperação de senha.

---

## 2. PRD-02: Core Engine de Ordens de Serviço & Dioptrias (Draft)
- **Status:** 🟡 Rascunho / Mapeado — Pendente de Aprovação.
- **Domínio:** Wizard de emissão, esteira de bancada, Kanban de laboratório e ficha técnica.
- **Regras de Negócio Mapeadas:**
  1. **Máquina de Estados Finita (State Machine):**
     - Estados: `ORCAMENTO` ➔ `APROVADA_SINAL` ➔ `EM_PRODUCAO_LAB` ➔ `MONTAGEM_BANCADA` ➔ `CONTROLE_QUALIDADE` ➔ `AGUARDANDO_RETIRADA` ➔ `ENTREGUE` (ou `CANCELADA`).
     - Regras de transição autorizadas por perfil e registro de timeline/histórico de quem avançou a etapa.
  2. **Numeração Sequencial Atômica:**
     - Gerador de OS atômico no banco (`#10294`), imune a condições de corrida (*race conditions*).
  3. **Invariantes Clínicos Oftálmicos (Engine Inviolável):**
     - Validação matemática de passos dióptricos estritos em **0.25D**.
     - Obrigatoriedade de Eixo (0° a 180°) quando Cilíndrico for diferente de zero. Se Cilíndrico = 0, Eixo é nulo.
     - Algoritmo de transposição esfero-cilíndrica ($Esf' = Esf+Cil$; $Cil' = -Cil$; $Eixo' = Eixo \pm 90^\circ$).
  4. **Prescrição Médica & Validade:**
     - Validade de receita (alertar se > 6 meses / 1 ano).
     - Armazenamento seguro de arquivo digitalizado (Upload S3).
  5. **Financeiro da OS:**
     - Regra de sinal de balcão (50% ou 100%).
     - Bloqueio ou autorização de entrega com saldo pendente.

---

## 3. PRD-03: Kardex, Estoque Físico & Ingestão NF-e XML (Draft)
- **Status:** 🟡 Rascunho / Mapeado — Pendente de Aprovação.
- **Domínio:** Catálogo livre de armações e lentes, ledger imutável, compras e entrada fiscal.
- **Regras de Negócio Mapeadas:**
  1. **Ingestão e Parser de XML NF-e 4.00:**
     - Leitura das tags da SEFAZ (`<det>`, `<prod>`, `<NCM>`, `<vProd>`, `<vFrete>`, `<vICMSST>`).
     - De-Para de Fornecedor: conversão automática do código do fabricante (cProd/EAN) para o SKU interno da ótica.
     - Fator de conversão tributária para unidade física (ex: cartela com 10 unidades).
  2. **Cálculo de Custo Médio Móvel Ponderado (CMP):**
     - Atualização automática do CMP na entrada de mercadoria com rateio de frete e custos adicionais.
  3. **Imutabilidade do Ledger do Kardex:**
     - Nenhuma movimentação física pode ser editada ou deletada (`DELETE`/`UPDATE` travados no banco). Correções somente via estorno compensatório.
  4. **Algoritmo de Sugestão de Reposição Automática:**
     - $\text{Ponto de Pedido} = (\text{Consumo Médio Diário} \times \text{Lead Time}) + \text{Estoque de Segurança}$.
  5. **Governança de Perdas/Avarias:**
     - Alçada de aprovação: baixas manuais por quebra em laboratório ou avaria acima de valor limite exigem senha/assinatura do Gerente.

---

## 4. PRD-04: Central de Mensageria & Notificações WhatsApp (Draft)
- **Status:** 🟡 Rascunho / Mapeado — Pendente de Aprovação.
- **Domínio:** Notificações de balcão, pós-venda e comunicação com laboratórios externos.
- **Regras de Negócio Mapeadas:**
  1. **Arquitetura Híbrida de Envio:**
     - Modo Balcão: link direto `wa.me` para WhatsApp Web.
     - Modo Automatizado: integração de background via API corporativa (Evolution API, Z-API ou Meta Cloud API).
  2. **Gatilhos por Eventos:**
     - Disparo imediato ao transitar a OS para `AGUARDANDO_RETIRADA` ("Seus óculos estão prontos!").
     - Lembrete de gaveta a cada 7 dias para OSs prontas não retiradas.
     - Pesquisa de adaptação e pós-venda após 30 dias da retirada.
  3. **LGPD & Políticas de Opt-out:**
     - Registro de consentimento no cadastro do cliente e descadastramento automático em caso de "SAIR".

---

## 5. PRD-05: Fechamento de Caixa, Formas de Pagamento & DRE (Draft)
- **Status:** 🟡 Rascunho / Mapeado — Pendente de Aprovação.
- **Domínio:** Frente de caixa, turnos de atendimento, recebimentos e comissionamento.
- **Regras de Negócio Mapeadas:**
  1. **Abertura e Fechamento de Turno/Caixa:**
     - Suprimento inicial de troco.
     - Conferência cega (o operador digita o dinheiro físico contado sem ver o saldo do sistema).
     - Justificativa de sangrias e reforços.
  2. **Pagamentos Múltiplos e Divisão de Meios:**
     - Suporte a PIX, Cartão de Crédito/Débito parcelado, Dinheiro e Carteira Digital na mesma OS.
  3. **Cálculo de Comissão de Consultores:**
     - Regras configuráveis de comissionamento sobre receita líquida ou peças vendidas.

---

## 6. PRD-06: Parametrização do Tenant & Configurações da Loja (Draft)
- **Status:** 🟡 Rascunho / Mapeado — Pendente de Aprovação.
- **Domínio:** Painel Admin (PBI-02) e parametrizações operacionais.
- **Regras de Negócio Mapeadas:**
  1. **Gestão de SLAs de Laboratórios Parceiros:**
     - Prazos contratuais em dias úteis por tipo de tratamento (Surfaçagem, Antirreflexo, Fotossensível).
  2. **Templates Customizados de WhatsApp:**
     - Criação de templates dinâmicos com variáveis `{cliente_nome}`, `{os_numero}`, `{valor_saldo}` por filial.
