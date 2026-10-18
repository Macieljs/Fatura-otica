# S1-06 — integração das telas de identidade

Estado: integrada em `develop`; revisão de código, gate backend e lint/build aprovados; verificação manual pendente.

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
- Graphify atualizado nos dois worktrees e na integração `develop` (backend 1.813 nós/3.741 arestas/136 comunidades; frontend 1.470 nós/2.642 arestas/123 comunidades; develop 1.924 nós/3.998 arestas/150 comunidades). Query `IdentitySessionService` encontrou serviço, endpoints e testes associados.

Pendente: verificar manualmente login, seleção de filial, ativação, administração, restauração e logout com API configurada; conferir CI remoto e regras de proteção antes da promoção para `main`.

Testes automatizados frontend/E2E continuam adiados conforme decisão do usuário. Resultados dos módulos isolados não aprovam esta integração.
