# Sprint 01 — Identidade e acesso empresarial

- Data: 2026-10-06 (America/Fortaleza).
- Estado: `ready` para contrato/modelagem e primeira tarefa de autorização; integração depende de Docker/PostgreSQL.
- Autorização: usuário confirmou iniciar esta sprint, atualizar specs e delegar execução na conversa de 06/10/2026. Reutilizar essa autorização no escopo descrito; não aprovar módulos futuros ou publicação por inferência.
- Base: `f412f5194b07fb263a1d95f259a25cacea06197f`.
- Integração: `develop`; implementação em `feature/sprint-01-identity`; estabilidade/release em `main`.
- SM: agente coordenador desta conversa. Frontend/UX: terminal separado, com trabalho preservado.

## Objetivo

Disponibilizar a base de identidade empresarial: perfil cadastrado, acesso autorizado, ativação inicial, autenticação e escopo de filiais. Uma empresa por ambiente nesta primeira entrega, URL única e tenant configurado no servidor; login sem subdomínio ou código da empresa. Manter tenant explícito nos dados e autorização para isolamento e futura evolução.

## Decisões de escopo aprovadas

- Backend .NET 10/EF Core/PostgreSQL conforme ADRs aceitos; frontend Next.js conforme telas existentes.
- Dono com operações válidas em todas as filiais da empresa e administração de acessos, podendo delegar essa capacidade a administrador da empresa. Não pode acessar outra empresa, expor senha ou violar invariantes.
- Gestor de filial pode cadastrar perfil dentro de sua filial; concessão de acesso é uma capacidade distinta, reservada ao administrador de acessos.
- Vendedor consulta OS da equipe nas filiais autorizadas. A implementação do módulo de OS fica para outra sprint.
- Metas comerciais pertencem ao vendedor da venda; continuidade não muda atribuição. Finalização da OS é entrega ao cliente. Máquina de estados/transferência/comissões fora desta sprint.
- Gestor cadastra perfil pendente; administrador concede papel/filiais; usuário conclui cadastro e define sua própria senha com acesso temporário.
- Login por e-mail nesta entrega; CPF no login adiado. E-mail normalizado e único dentro do tenant.
- Uma filial operacional autorizada: seleção automática. Várias: seleção entre autorizadas. Sem acesso aprovado: nenhuma operação de negócio.
- Revogação/bloqueio deve valer na próxima operação autorizada; JWT válido sozinho não mantém permissão removida.
- Frontend/E2E automatizados adiados. Exigir lint/build, revisão independente e verificação manual aplicável. Nenhum agente deste backend altera telas/UX do outro terminal sem coordenação.

## Primeiro acesso e sessão

- Primeiro dono/admin provisionado por comando administrativo explícito, sem cadastro público e sem senha padrão versionada. Comando deve respeitar tenant configurado e ser idempotente ou rejeitar duplicata de forma segura.
- Token de ativação/recuperação aleatório, armazenado somente por hash, de uso único, com expiração e revogação. Não é sessão operacional; não dá acesso a endpoints de negócio.
- Canal de entrega do token: decisão pendente do usuário. Avançar com porta de entrega e lógica independente do provedor; não enviar e-mail, divulgar token em logs ou assumir credenciais externas.
- Proposta técnica reversível: ativação 24h; recuperação 15min; JWT 15min conforme ADR; refresh rotativo com validade absoluta de 7 dias, logout revoga sessão. Confirmar/documentar esses parâmetros no contrato, configuráveis, sem implementar remember-device com validade ilimitada.
- Senhas Argon2id conforme ADR; sem senha/hash/token em DTOs comuns, logs ou listagem de usuários.
- Recuperação pública retorna resposta genérica para existência/inexistência de conta; rate limiting e auditoria sem credenciais.

## Matriz mínima de autorização

| Papel/capacidade | Escopo | Permissões da sprint |
| --- | --- | --- |
| Vendedor | Filiais explicitamente concedidas | Perfil próprio; escolher filial autorizada |
| Gestor de filial | Filiais explicitamente concedidas | Perfil próprio; cadastrar perfil pendente na filial autorizada |
| Dono | Todas as filiais do próprio tenant | Operar nas filiais; cadastrar perfis; administrar acessos |
| Administrador de acessos | Próprio tenant | Conceder/revogar papéis e filiais; bloquear usuário; emitir ativação autorizada |

Administrador de acessos é capacidade explícita, não privilégio automático de todo gestor. Cadastro não autoriza promoção de papéis. Filial ativa é contexto operacional, não fonte de direitos. Usuário sem filial operacional pode administrar acessos se autorizado para essa capacidade.

## Critérios BDD

| ID | Dado / Quando / Então |
| --- | --- |
| AC-01 | Dado o tenant configurado, quando usuário de outro tenant tentar autenticar/acessar recurso, então não recebe sessão/dados daquele ambiente. |
| AC-02 | Dado gestor autorizado à filial A, quando cadastrar perfil, então perfil fica pendente sem senha exposta e sem concessão implícita de papéis/filiais. |
| AC-03 | Dado gestor sem administrar-acessos, quando conceder papel/filial, então a operação é negada. |
| AC-04 | Dado admin/dono do tenant A, quando conceder filial de B ou papel fora de sua autoridade, então a operação é negada sem alteração persistida. |
| AC-05 | Dado perfil autorizado e token de ativação válido, quando definir senha/completar cadastro, então conta ativa; token não permite segundo uso. |
| AC-06 | Dado token expirado/revogado/inválido, quando ativar/recuperar, então nenhuma senha/conta é alterada. |
| AC-07 | Dada credencial correta de conta ativa, quando entrar, então recebe sessão/perfil e somente filiais autorizadas. Conta pendente/bloqueada não opera. |
| AC-08 | Dado usuário com filial A, quando selecionar B não autorizada ou enviar ID de B diretamente, então o backend nega acesso. |
| AC-09 | Dado dono do tenant A, quando operar em filiais de A, então permite; quando acessar B, então nega. |
| AC-10 | Dada concessão removida/conta bloqueada durante sessão, quando fizer a próxima operação, então a operação é negada mesmo com JWT ainda válido. |
| AC-11 | Dado refresh válido, quando renovar, então token anterior deixa de valer; logout revoga a sessão. Concorrência/reutilização não gera sessões adicionais válidas. |
| AC-12 | Dada solicitação de recuperação, quando informar e-mail existente ou inexistente, então resposta pública não revela existência; token válido troca senha e revoga sessões antigas. |
| AC-13 | Dados registros de outro tenant no PostgreSQL, quando a aplicação consultar com role operacional, então RLS/filtro/integridade bloqueiam vazamento. Teste com banco real e role sem BYPASSRLS. |
| AC-14 | Dada concessão/revogação/bloqueio, quando persistir a mudança, então auditoria registra autor, tenant, alvo e horário, sem senha/token. |

## Backlog e dependências

| Item | Entrega | Estado inicial | Dependência |
| --- | --- | --- | --- |
| S1-01 | Contrato OpenAPI e modelo Identity, alinhamento ADR/PRD | ready | Esta spec |
| S1-02 | Políticas de domínio: usuário ativo, papéis e filiais | ready após contrato | QA Red antes do Dev |
| S1-03 | Persistência/migrations/RLS e auditoria | ready após contrato | Docker/PostgreSQL + QA Red |
| S1-04 | Cadastro pendente, concessão e ativação | ready após contrato | Canal de entrega + S1-02/03 |
| S1-05 | Login, sessão, refresh/logout e recuperação | ready após contrato | S1-02/03/04 |
| S1-06 | Cliente TS gerado e passagem para frente UX/frontend | aguardando contrato | Sem implementação visual neste checkout |
| S1-07 | Integração, revisão independente e candidata develop | aguardando entregas | Gate Feature completo |

## DoD e evidências

- Contrato/modelagem antes de implementação; Red funcional pelo QA antes do Green.
- Architecture, Domain, Application e Integration com testes reais executados; Domain >=90%; build sem warnings.
- PostgreSQL real para RLS/tenant/constraints; não substituir por InMemory/SQLite nem ignorar testes para passar CI.
- Revisor independente confirma diff, critérios, riscos e evidências da versão candidata.
- CI em develop e PRs; integrar branches de tarefa, executar novamente sobre candidata combinada.
- Backend pronto para integração não equivale a sprint completa: frontend integrado/manual e demais critérios aplicáveis precisam ser comprovados.
- Sem deploy nesta autorização. Main recebe develop estável por integração revisada; não fazer merge se gate/evidências pendentes.

## Coordenação entre terminais

- `develop` recebe entregas revisadas de frontend e backend. Cada tarefa usa branch e worktree próprios; nunca mudar branch no checkout do outro terminal.
- Donos: SM specs/estado; backend contrato/modelo/produção; QA testes; revisor parecer; frente frontend suas telas/SPEC/design. CI e lockfiles compartilhados têm dono explicitamente coordenado.
- Não escrever em `C:\Fatura-ótica\frontend` a partir deste workflow. O terminal frontend deverá basear novas tarefas em develop e integrar sua branch após revisão.
- Graphify é local a cada checkout, ignorado. Logs em artifacts/; registros de decisões/estado versionados.

## Impedimentos iniciais

- Docker instalado, motor Linux indisponível na verificação de início. Integração real e DoD bloqueados até servidor Docker/PostgreSQL estar disponível.
- Canal de entrega de ativação/recuperação pendente. Independência de provedor permite avançar em contrato/domínio.
- PRD antigo em frontend/docs ainda descreve Node/Drizzle e modelos incompatíveis. Esta spec governa somente a Sprint 01; módulos futuros permanecem em refinamento.
- Proteções remotas de develop/main e ambiente de homologação não configurados/verificados. YAML não impõe revisão nem deploy automaticamente.
