# Guia de Deploy em Produção — Fatura Ótica (Vercel & Git)

Este guia orienta a preparação e o deploy imediato do **Fatura Ótica v4.8.2 Enterprise** na plataforma **Vercel** ou qualquer ambiente Node.js / Docker compatível com Next.js 16 (Turbopack).

---

## 1. Status de Prontidão (DoD Validado)

- [x] **100% dos IDs Semânticos Aplicados**: Todos os botões, links, tabelas, inputs e modais possuem identificadores únicos conforme `../.agents/rules/semantic-ids.md`.
- [x] **Responsividade Integral (DoD)**: Todos os componentes, headers e tabelas adaptam-se fluidamente de notebooks 1366x768 até monitores Full HD (1920x1080) e Ultrawide (2560px+).
- [x] **Header Componentizado**: Arquitetura unificada via `components/PageHeader.tsx` e `components/OsStepper.tsx`, eliminando cortes no topo e mantendo safe areas.
- [x] **Compilação Estática Completa**: `npm run build` executado com **Exit Code 0** em 15 rotas estáticas.
- [x] **Higiene de Repositório**: `.gitignore` completo configurado contra caches, logs, arquivos de ambiente e dependências.

---

## 2. Passo a Passo do Deploy via GitHub + Vercel

### Passo 1: Comitar as Alterações no Repositório Local
No terminal da pasta do projeto (`C:\Fatura-ótica`):

```bash
git add .
git commit -m "feat(release): release MVP v4.8.2 Enterprise - headers componentizados, responsividade desktop e governança de IDs"
git branch -M main
```

### Passo 2: Conectar ao Repositório Remoto
Se ainda não configurou o remote do GitHub:
```bash
git remote add origin https://github.com/SEU-USUARIO/fatura-otica.git
git push -u origin main
```

*(Se o repositório já tiver o remote configurado, basta executar `git push`)*.

### Passo 3: Importar na Vercel (One-Click Deploy)
1. Acesse o dashboard da [Vercel](https://vercel.com/new).
2. Clique em **"Add New..." ➔ "Project"**.
3. Selecione o repositório **fatura-otica**.
4. Definições automáticas:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `frontend` (a aplicação Next.js está nesta subpasta do repositório)
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
5. Clique em **"Deploy"**.

A Vercel finalizará a compilação e entregará o domínio HTTPS (ex: `https://fatura-otica.vercel.app`).

---

## 3. Credenciais de Teste e Demonstração (Fast Login)

| Perfil | Identificador / E-mail | Unidade | Acesso & Permissões |
| :--- | :--- | :--- | :--- |
| **Dr. Carlos Ramos (Gerente)** | `carlos.ramos@faturaotica.com.br` | Filial Centro (Matriz) | Visão Executiva completa: faturamento, margens, compras e Kardex. |
| **Mariana Souza (Consultora)** | `mariana.souza@faturaotica.com.br` | Filial Centro (Matriz) | Visão Balcão Clean: emissão de OS, cálculo dióptrico e disparos WhatsApp. |

---

## 4. Auditoria de Rotas de Produção

Todas as rotas compilam como páginas estáticas otimizadas para entrega global via Edge CDN:
- `/` — Dashboard Executivo & Visão Consultor Clean
- `/login` — Autenticação Corporativa & Seleção de Filial
- `/ordens-de-servico` — Nova OS (Wizard Clínico em 4 Passos com Header Componentizado)
- `/ordens-de-servico/fila` — Central de Balcão, Bipagem de Malote e Kanban de Laboratório
- `/ordens-de-servico/detalhes` — Ficha Técnica Dióptrica & Rastreabilidade de Bancada
- `/ordens-de-servico/notificar-whatsapp` — Central de Disparo WhatsApp com Templates Ópticos
- `/estoque` — Catálogo de Armações Livres, Filtros Avançados e Ações em Lote
- `/kardex` — Kardex & Ledger Dióptrico de Lentes
- `/kardex/entrada-nfe` — Conferência de NF-e por Chave de 44 Dígitos / XML
- `/kardex/ajuste-manual` — Apontamento de Avaria & Quebra Técnica
- `/kardex/sugestoes-compra` — Matriz de Compras e Reposição com Cálculo de Sugestão
