# ADR-0004 — API REST, Contratos OpenAPI, Erros e Autenticação

- **Status:** Aceito
- **Data:** 05/10/2026 (Sprint 22)

## Decisão
- **Estilo:** REST com Minimal APIs agrupadas por módulo, prefixo versionado `/api/v1/{modulo}`.
- **Contrato:** documento OpenAPI (`Microsoft.AspNetCore.OpenApi`) é a fonte única; UI de documentação com Scalar em `/docs` (apenas Development). O front gera o client TypeScript a partir dele.
- **JSON:** `camelCase`; valores monetários e dioptrias trafegam como **string decimal** (`"450.00"`, `"-2.75"`) para não perder precisão no JavaScript; datas em ISO-8601 UTC.
- **Erros:** `application/problem+json` (RFC 9457) com `type`, `title`, `status`, `detail`, `traceId` e `errors` para validação. Códigos de erro de domínio estáveis (ex: `os.transicao_invalida`).
- **Resultados de domínio:** padrão `Result<T>` — exceções só para falhas inesperadas.
- **Autenticação:** JWT de acesso curto (15 min) + refresh token rotativo armazenado com hash; senhas com Argon2id. Claims mínimas: `sub`, `tenant_id`, `filial_id`, `role`.
- **Logs:** Serilog estruturado, sem dados sensíveis (CPF mascarado, nunca senha/token).
