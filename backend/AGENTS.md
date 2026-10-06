# Backend Fatura Ótica

Ler `../AGENTS.md`, `../.agents/rules/back-end-developer.md`, `../.agents/rules/qa-testing.md` e `../.agents/rules/dod.md`.

Esta pasta contém a solução `FaturaOtica.slnx` (.NET 10). A arquitetura separa Domain, Application, Infrastructure e Api em `src/`; os testes ficam em `tests/`. Decisões estão em `docs/adr/` e convenções do banco em `docs/DATABASE_CONVENTIONS.md`.

Seguir o PRD aprovado e os critérios de aceite antes de implementar funcionalidades. Escrever testes de aceite antes do código. Alterações de domínio exigem a cobertura definida nas regras; endpoints devem comprovar isolamento entre tenants com PostgreSQL real.
Executar `dotnet build FaturaOtica.slnx` e `dotnet test FaturaOtica.slnx` nesta pasta. Testes de integração que usam Testcontainers dependem de Docker disponível.

O grafo é compartilhado com o front em `../graphify-out/`. A partir desta pasta, usar `../scripts/graphify.ps1 query "<pergunta>"` ou `../scripts/graphify.ps1 update .`. O script sempre trabalha na raiz do projeto.
Para refinar identidade, filiais, papéis e responsabilidade comercial da OS, ler também ../docs/IDENTITY_ACCESS_DECISIONS.md. O registro contém decisões confirmadas e pontos pendentes; não equivale à aprovação integral do PRD.
