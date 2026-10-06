# ADR-0003 — PostgreSQL, EF Core e Multi-Tenancy com RLS

- **Status:** Aceito
- **Data:** 05/10/2026 (Sprint 22)

## Decisão
- **Banco:** PostgreSQL 17, banco único, **tabela compartilhada com `tenant_id`** (shared schema).
- **Defesa em profundidade:**
  1. **RLS** em toda tabela de negócio: `USING (tenant_id = current_setting('app.tenant_id')::uuid)`.
  2. **Filtro global do EF Core** (`HasQueryFilter`) por `TenantId`.
  3. Um interceptor de conexão executa `SET app.tenant_id` a cada transação a partir do tenant do token.
- A aplicação conecta com role **sem** `BYPASSRLS`; migrations usam role separada.
- **EF Core + Npgsql**, nomes em `snake_case` via `EFCore.NamingConventions`, migrations versionadas em `Infrastructure/Persistence/Migrations`.
- **Schemas PostgreSQL por módulo:** `identity`, `os`, `estoque`, `mensageria`, `financeiro`, `config`.
- **Ledgers append-only** (Kardex, caixa, auditoria): trigger que rejeita `UPDATE`/`DELETE`.
- **Concorrência otimista** via coluna de sistema `xmin`.
- **Numeração de OS** por tenant em tabela de sequência com `UPDATE ... RETURNING` em transação (evita gaps globais entre tenants).

## Consequências
- (+) Vazamento entre óticas exige falha simultânea em duas camadas.
- (−) Testes de integração precisam de PostgreSQL real (Testcontainers).
- Padrões detalhados em [`DATABASE_CONVENTIONS.md`](../DATABASE_CONVENTIONS.md).
