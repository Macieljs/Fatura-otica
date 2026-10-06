# Fatura Ótica

Projeto completo do ERP Fatura Ótica, com frontend Next.js e backend .NET 10 em um único repositório.

```text
Fatura-ótica/
├── frontend/             Next.js, componentes, páginas e documentação do front
├── backend/              Solução .NET, domínio, API, infraestrutura e testes
├── .agents/              Regras comuns e skill Graphify
├── docs/                 Organização e documentação compartilhada
├── scripts/              Comandos do projeto
├── graphify-out/         Grafo gerado; ignorado pelo Git
├── AGENTS.md             Instruções comuns para os agentes
└── package.json          Atalhos para executar front, backend e Graphify
```

## Frontend

Instalar dependências com `npm --prefix frontend ci` e iniciar com `npm run dev:frontend`.
Validar a compilação com `npm run build:frontend`. Detalhes da aplicação em `frontend/README.md`; orientações de deploy em `frontend/DEPLOY.md`.

## Backend

Usar o SDK definido em `global.json`. Compilar com `npm run build:backend` e testar com `npm run test:backend`.
O PostgreSQL de desenvolvimento pode ser iniciado com `docker compose -f backend/docker-compose.yml up -d`.
Os testes com Testcontainers precisam de Docker em execução. Decisões de arquitetura estão em `backend/docs/adr/`.

## Graphify

Instalar no ambiente do agente com `python -m pip install graphifyy`.
Gerar ou atualizar o grafo com `npm run graph:update`. Consultar com `npm run graph:query -- "PageHeader"` ou `npm run graph:query -- "AddInfrastructure"`.
O script `scripts/graphify.ps1` permite consultar a partir de qualquer diretório, sempre usando o grafo da raiz.
O grafo cobre o código de frontend e backend e é regenerado localmente, sem depender de um servidor de grafos.

## Agentes e estrutura

Abrir a raiz do projeto para que os agentes recebam `AGENTS.md`, as regras de `.agents/` e acesso ao grafo compartilhado.
Consultar `docs/PROJECT_STRUCTURE.md` para detalhes da reorganização e os ajustes necessários nos ambientes de deploy.
## Workflow de agentes

O processo de testes antes do código, implementação, revisão independente e liberação está em [docs/AGENT_WORKFLOW.md](docs/AGENT_WORKFLOW.md). Os modelos de tarefa, revisão e release ficam em `docs/templates/`.
Executar `npm.cmd run quality:backend:bootstrap` para verificar a infraestrutura inicial, ou `npm.cmd run quality:backend` para o gate completo de uma funcionalidade. O runner compila antes dos testes e registra as evidências da execução.
O CI de PR exige lint/build e relatórios de testes funcionais das duas partes. O estado inicial ainda tem bloqueios de lint e suítes vazias, detalhados no workflow. O pipeline de qualidade não inicia agentes e não publica em produção.