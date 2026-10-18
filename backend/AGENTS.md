# Backend Fatura Ótica

Ler `../AGENTS.md`, `../.agents/rules/back-end-developer.md`, `../.agents/rules/qa-testing.md` e `../.agents/rules/dod.md`.

Esta pasta contém a solução `FaturaOtica.slnx` (.NET 10). A arquitetura separa Domain, Application, Infrastructure e Api em `src/`; os testes ficam em `tests/`. Decisões estão em `docs/adr/` e convenções do banco em `docs/DATABASE_CONVENTIONS.md`.

Seguir o PRD aprovado e os critérios de aceite antes de implementar funcionalidades. Aplicar testes test-first focados e a estratégia em `../docs/TESTING_STRATEGY_MVP.md`; executar Feature/cobertura no candidato final. Endpoints devem comprovar isolamento entre tenants com PostgreSQL real.
Durante o ciclo, executar projeto/filtro afetado; não repetir build completo e todas as suítes a cada ajuste. Feature continua obrigatório antes da integração quando o CI não tiver validado o mesmo SHA. Testes de integração que usam Testcontainers dependem de Docker disponível.

O grafo é compartilhado com o front em `../graphify-out/`. A partir desta pasta, usar `../scripts/graphify.ps1 query "<pergunta>"` ou `../scripts/graphify.ps1 update .`. O script sempre trabalha na raiz do projeto.
Para refinar identidade, filiais, papéis e responsabilidade comercial da OS, ler também ../docs/IDENTITY_ACCESS_DECISIONS.md. O registro contém decisões confirmadas e pontos pendentes; não equivale à aprovação integral do PRD.
