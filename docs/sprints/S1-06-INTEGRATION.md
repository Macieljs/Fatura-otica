# S1-06 — integração das telas de identidade

Estado: integrada em `develop`; revisão de código, gate backend, lint/build e smoke manual aprovados em ambiente local descartável. CI remoto ainda pendente.

O usuário autorizou conectar login, ativação e administração neste worktree, preservando o visual existente. A branch `feature/s1-06-identity-integration` partiu de `develop` em `8ffa44c`, commit `83d3344`, e foi integrada em `develop` no commit `1d723db`; o checkout do outro terminal não foi alterado.

## Contrato e sessão

`npm run generate:identity` gera `frontend/generated/identity.ts` do contrato OpenAPI versionado. O transporte usa os métodos e caminhos gerados. Tokens de acesso ficam apenas em memória; refresh fica em cookie HttpOnly do backend. O hook de operador deriva identidade e permissões de `/me`, sem inferências por nome/e-mail ou autoridade em localStorage.

Login autentica antes de mostrar as filiais autorizadas. Sessão com várias filiais exige selecionar uma delas. Administradores sem filial podem entrar na administração de acessos. Toda autorização permanece validada pelo backend. Logout solicita revogação da sessão no servidor.

A emissão de ativação mostra um link temporário ao administrador autorizado para entrega manual. O segredo é colocado no fragmento da URL. A página também aceita o parâmetro legado, removendo-o imediatamente do histórico. Não há envio SMTP nem recuperação autônoma nesta fase.

Administração usa somente os diretórios da API. A criação mantém a filial de proveniência na linha recém inserida; alterações de papel aplicam concessões novas antes de revogar as anteriores. AccessAdministrator pode editar papéis operacionais, mas Owner/Admin só são editáveis pelo Owner. Owner pode reemitir ativação para contas Active; bloqueadas não recebem link.

## Configuração do frontend

Configurar no servidor Next, sem prefixo `NEXT_PUBLIC_`:

| Variável | Desenvolvimento | Produção |
| --- | --- | --- |
| `IDENTITY_API_ORIGIN` | `http://localhost:5000` | Origem privada/pública da API, sem caminho |
| `IDENTITY_PUBLIC_ORIGIN` | `http://localhost:3000` | Origem pública exata do frontend |

As chamadas do navegador usam a mesma origem e o caminho `/api/v1/identity`. O Next encaminha as rotas ao backend. As reescritas são resolvidas na inicialização/build; reconfigurar e reconstruir quando necessário. Em produção não há destino implícito para a API. Configurar também a origem pública na allowlist CSRF do backend. HTTPS é necessário para o cookie Secure de produção.

O navegador omite Origin em GET de mesma origem. Por isso `/api/v1/identity/csrf` tem um proxy restrito que valida Host, Referer, Sec-Fetch-Site e eventual Origin contra a origem pública configurada antes de enviar Origin ao backend. O backend mantém a validação estrita. A rota não armazena respostas em cache nem expõe o cookie ao JavaScript.

## Verificação

- Contrato OpenAPI regenerado: 14 operações e 16 schemas.
- `npm --prefix frontend run lint` passou após as últimas alterações.
- `npm --prefix frontend run build` passou após as últimas alterações; rotas `/login`, `/ativar-conta`, `/admin/usuarios` e proxy CSRF compiladas.
- Revisão independente do diff sem bloqueadores de código.
- Gate backend Feature aprovado no worktree da API: 369/369, zero skips, Domain 100%/72 linhas. Evidência `artifacts/quality/backend/20261018-213328-13def3ec`.
- Graphify das branches de tarefa foi atualizado durante a implementação (backend 1.813 nós/3.741 arestas/136 comunidades; frontend 1.470 nós/2.642 arestas/123 comunidades). Após o smoke e as correções, o grafo atual de `develop` ficou com 1.926 nós/4.002 arestas/154 comunidades; query `IdentitySessionService` encontrou 165 nós em BFS de profundidade 2, entre eles serviço, endpoints, testes e esta documentação.

### Smoke manual local — 18/10/2026

- Ambiente temporário: PostgreSQL 17 sem volume persistente, migrations aplicadas, API e Next em loopback. Foi encerrado após os testes; nenhuma credencial de produção foi usada.
- Owner: login, filial autorizada, diretório, criação de colaborador pendente, concessão seller + filial, exibição do link manual e logout passaram. Endpoint de ativação de Owner e de Vendedor retornaram HTTP 204.
- Vendedor: login, filial e dashboard por papel passaram. A tentativa de abrir `/admin/usuarios` foi negada (403), com redirect e um único aviso após corrigir a repetição do efeito React.
- Restauração da sessão após reload passou via refresh cookie. O fragmento do link foi capturado pela tela de ativação e removido da barra de endereço. SMTP não foi exercitado; envio continua manual.
- O smoke encontrou e corrigiu a recriação da função `toast` a cada render, que repetia efeitos de rota; o aviso também ficou protegido contra execução duplicada no modo estrito. Login e ativação tiveram alegações não verificadas de certificação/compliance substituídas por texto factual.
- Validação final após as correções: `npm run lint` aprovado; `npm run build` aprovado e rotas de identidade compiladas. Não foram adicionados testes frontend/E2E, conforme decisão do PO.
- Limite observado: cards e tabelas do dashboard ainda usam dados demonstrativos. O smoke valida autenticação e autorização, não a integração de ordens, faturamento ou indicadores com a API.

Pendente: conferir CI remoto e regras de proteção antes da promoção para `main`. Para reproduzir localmente, configurar as variáveis de identidade e iniciar PostgreSQL conforme o guia de desenvolvimento; a instância do smoke foi removida.

Testes automatizados frontend/E2E continuam adiados conforme decisão do usuário. Resultados dos módulos isolados não aprovam esta integração.
