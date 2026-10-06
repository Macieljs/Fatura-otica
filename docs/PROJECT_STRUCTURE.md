# Organização comum do projeto

## Decisão — 6 de outubro de 2026

A pasta raiz passa a ser o repositório completo. O antigo diretório `fatura-otica/` foi renomeado para `frontend/`, mantendo o projeto Next.js e suas dependências. `backend/` continua contendo a solução .NET.
Os metadados Git foram transferidos do front para a raiz, preservando commits, branches, remote e alterações locais. A reorganização precisa ser registrada em um commit antes de ser enviada ao remoto.

## Agentes

`AGENTS.md` na raiz define o escopo comum e aponta para instruções específicas em `frontend/AGENTS.md` e `backend/AGENTS.md`.
A skill Graphify está em `.agents/skills/graphify/`. As configurações existentes do Claude e do OpenCode foram transferidas para a raiz.
O projeto salvo no aplicativo já aponta para `C:\Fatura-ótica`; novos chats devem usar essa raiz. Chats que tenham guardado o caminho antigo precisam usar `frontend/`.

## Grafo compartilhado

O grafo é gerado a partir da raiz para incluir TypeScript/TSX do frontend e C# do backend. O grafo anterior, restrito ao frontend, foi preservado em `graphify-out/frontend-before-reorganization/` e em um backup local externo ao repositório.
Os artefatos Graphify permanecem ignorados pelo Git. São versionados as instruções, a skill e o script para que outro ambiente com Graphify instalado possa reconstruir o grafo. A ferramenta é instalada no ambiente dos agentes e não integra as dependências do projeto.
A instalação da ferramenta é por ambiente. Consultas escrevem um marcador em `graphify-out/cache/`, portanto exigem escrita nessa pasta. Ambientes somente de leitura devem consultar uma cópia em uma área gravável.

## Execução e deploy

Os comandos existentes do Next.js continuam em `frontend/package.json`; os atalhos da raiz usam `npm --prefix frontend`.
O backend continua usando os mesmos caminhos dentro de sua solução; a versão do SDK é definida por `global.json` na raiz, também encontrado a partir de `backend/`.
Um serviço de frontend na Vercel deve apontar seu Root Directory para `frontend`. Configurações externas que referenciem `fatura-otica/` precisam ser atualizadas para `frontend/` antes do próximo deploy.
Builds do backend devem usar `backend/FaturaOtica.slnx`. Não é necessário publicar o grafo junto com as aplicações.

## Aceite

- [x] Frontend e backend em pastas irmãs com nomes explícitos.
- [x] Git na raiz, mantendo o histórico existente.
- [x] Regras comuns e instruções específicas acessíveis aos agentes.
- [x] Comandos da raiz para front, backend e grafo.
- [x] Grafo antigo preservado e artefatos gerados ignorados pelo Git.
- [x] Grafo reconstruído e consultas de frontend/backend verificadas.
- [x] Build de frontend e verificações de backend executadas após a mudança.

## Resultado da verificação

- Next.js: build de produção concluído, com as 15 páginas estáticas geradas.
- .NET: build concluído com zero erros e zero avisos; os três testes de arquitetura existentes passaram. Os projetos de testes de Domain, Application e Integration ainda não contêm testes executáveis.
- Git: HEAD e branch main preservados; 43 arquivos rastreados do frontend mantêm o conteúdo original. As alterações de conteúdo estão restritas aos quatro documentos de instruções, deploy e especificação.
- Grafo: fontes de 37 arquivos do frontend e 21 do backend, sem node_modules, .next, bin ou obj. Consultas PageHeader e AddInfrastructure localizaram os símbolos corretos nos novos caminhos.
- Nenhum grafo foi enviado a servidor. Artefatos Graphify continuam ignorados pelo Git.
