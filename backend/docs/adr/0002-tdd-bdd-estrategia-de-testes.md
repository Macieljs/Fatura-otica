# ADR-0002 — TDD/BDD e Estratégia de Testes

- **Status:** Aceito
- **Data:** 05/10/2026 (Sprint 22)

## Decisão
- Todo comportamento nasce de um cenário BDD (`Dado / Quando / Então`) no PRD aprovado e de um **teste falhando** (Red → Green → Refactor).
- **Ferramentas:** xUnit, AwesomeAssertions (fork Apache-2.0 do FluentAssertions — a v8 do FluentAssertions exige licença comercial), NSubstitute, Testcontainers (PostgreSQL), `WebApplicationFactory`, Respawn, NetArchTest, coverlet.

## Pirâmide

| Projeto | Escopo | I/O | Meta |
| :--- | :--- | :--- | :--- |
| `Domain.Tests` | Value Objects, entidades, máquinas de estado | Nenhum | Cobertura ≥ 90% |
| `Application.Tests` | Casos de uso com portas mockadas | Nenhum | Todos os cenários BDD |
| `Integration.Tests` | API + EF Core + PostgreSQL real (RLS, constraints, migrations) | Docker | Isolamento de tenant em todo endpoint |
| `Architecture.Tests` | Regras de dependência entre camadas | Nenhum | 100% verde |

## Convenções
- Nome do teste: `Metodo_Cenario_ResultadoEsperado`.
- Cenários com tabela de exemplos → `[Theory]` + `[InlineData]`/`[MemberData]`.
- Proibido SQLite/InMemory para validar regras de banco.
- O cenário BDD do PRD é a fonte da verdade em caso de conflito entre teste e implementação.
