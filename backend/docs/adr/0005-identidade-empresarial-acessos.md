# ADR-0005 — Identidade empresarial e autorização por escopo

- Status: Aceito para Sprint 01 conforme autorização e decisões registradas na spec.
- Data: 2026-10-06.

## Decisão

Uma empresa por ambiente, URL única e tenant definido em configuração confiável do servidor; sem código de empresa/subdomínio no login. Preservar TenantId nos dados, FKs compostas, filtros EF e RLS para isolamento e evolução futura.

Owner tem administração de acessos e operação em todas as filiais válidas do próprio tenant. AccessAdministrator é capacidade empresarial delegável, sem acesso operacional implícito. Seller/BranchManager recebem concessões por filial. Gestor cria perfil pendente; administrador concede acesso; usuário define senha via ativação enviada automaticamente por SMTP. Sem autorregistro público ou senha padrão.

Autorização consulta estado atual na próxima operação; claims role/filial do JWT são informativos/contexto e nunca suficientes para autorizar. Tenant do token deve corresponder ao ambiente configurado; contexto RLS deriva do ambiente autenticado e validado, sem confiar em cabeçalho/tenant do payload.

RLS usa `app.tenant_id` com escopo transacional (`SET LOCAL`/set_config local em transação), não estado de conexão reaproveitada. Esta decisão substitui o trecho de ADR-0003 sobre SET persistente e origem somente token. Pooling não pode transportar contexto de uma transação para outra.

JWT 15min; refresh rotativo 7dias absolutos; ativação 24h; recuperação 15min: defaults configuráveis da sprint. Tokens de uso único/refresh armazenados como hash; SMTP local captura mensagens, sem envio real sem configuração. Datas UTC.

## Consequências

Login mais simples para ambiente dedicado; não confundir isolamento de empresa com escopo de filial. Revogação não aguarda JWT expirar. Operações de alteração de acesso/auditoria exigem transação e concorrência; verificar sessão atual e estado da conta. OpenAPI design-first deve convergir ao exportado pelo backend antes de gerar cliente.

O acesso amplo do Owner não dispensa integridade, proteção de senha, auditoria ou isolamento. OS, comissões e etapas de entrega fora desta sprint.

## Transporte de sessão definido para S1-05

Refresh opaco somente em cookie HttpOnly, host-only, SameSite=Lax, Secure obrigatório em produção HTTPS, Path=/api/v1/identity; não retorna no JSON. Access JWT15min retornado no body e mantido apenas em memória no frontend, sem localStorage. POST refresh/logout exige token anti-CSRF vinculado à sessão e validação Origin allowlist. GET /csrf fornece token associado à sessão com no-store/Origin permitido; resposta nunca habilita CORS wildcard. Login também valida Origin e recebe proteção contra login-CSRF na implementação.

Browser usa preferencialmente mesma origem via proxy /api; destinos runtime ainda configuráveis. Não mudar para SameSite=None sem nova decisão de deployment. Nenhuma implementação S1-05 nesta tarefa.

- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
