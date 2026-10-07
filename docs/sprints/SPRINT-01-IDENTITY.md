# Sprint 01 — Identidade e acesso empresarial

- Data: 2026-10-06 (America/Fortaleza).
- Estado: `implementing`. S1-01/02/03A/03B integrados em develop; S1-03B passou Feature (149/149), revisão independente e CI remoto (Backend/Frontend success). A contagem antiga 3/7 (≈43%) é somente referência histórica, sem previsão de esforço. MVP replanejado em `MVP-SCOPE-DECISION-2026-10-06.md`; S1-04A1 passou Feature 254/254 e revisão independente, merge local `8ec47d9` em develop com CI remoto pendente. Cadastro pendente/autorizações após A1, ativação, login/sessões e integração de rotas ainda não concluídos. Acompanhar `docs/sprints/SPRINT-01-STATUS.md`.
- Autorização: usuário confirmou iniciar esta sprint, atualizar specs e delegar execução na conversa de 06/10/2026. Reutilizar essa autorização no escopo descrito; não aprovar módulos futuros ou publicação por inferência.
- Base: `f412f5194b07fb263a1d95f259a25cacea06197f`.
- Integração: `develop`; incremento atual em `feature/s1-03b-audit`; estabilidade/release em `main`.
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
- Decisão de escopo do MVP em 2026-10-06: adiar a integração SMTP para reduzir custo e tempo até a primeira entrega funcional. O fluxo de ativação permanece; o sistema gera link/token temporário de uso único, que um administrador autorizado copia e entrega por um canal externo já utilizado pela empresa. Exibir o segredo uma única vez, guardar somente hash, nunca registrar em logs e permitir emissão/revogação administrativa auditada. Não implementar entrega automática nesta sprint.
- Proposta técnica reversível: ativação 24h; recuperação 15min; JWT 15min conforme ADR; refresh rotativo com validade absoluta de 7 dias, logout revoga sessão. Confirmar/documentar esses parâmetros no contrato, configuráveis, sem implementar remember-device com validade ilimitada.
- Senhas Argon2id conforme ADR; sem senha/hash/token em DTOs comuns, logs ou listagem de usuários.
- Recuperação self-service fica fora do MVP. Para restabelecer acesso inicialmente, o administrador autorizado revoga tokens pendentes e emite um novo link de ativação/definição de senha, sem visualizar ou definir a senha do usuário. Não expor se um e-mail existe em endpoints públicos quando a recuperação for retomada.

## Matriz mínima de autorização

| Papel/capacidade | Escopo | Permissões da sprint |
| --- | --- | --- |
| Vendedor | Filiais explicitamente concedidas | Perfil próprio; escolher filial autorizada |
| Gestor de filial | Filiais explicitamente concedidas | Perfil próprio; cadastrar perfil pendente na filial autorizada |
| Dono | Todas as filiais do próprio tenant | Operar nas filiais; cadastrar perfis; administrar acessos |
| Administrador de acessos | Próprio tenant | Conceder/revogar papéis e filiais; bloquear usuário; emitir ativação autorizada |

Administrador de acessos é capacidade explícita, não privilégio automático de todo gestor. Cadastro não autoriza promoção de papéis. Filial ativa é contexto operacional, não fonte de direitos. Usuário sem filial operacional pode administrar acessos se autorizado para essa capacidade.

## Recorte do MVP após replanejamento — 2026-10-06

Em decisão do Product Owner, os itens de automação de e-mail e recuperação self-service foram movidos para depois da primeira entrega. O objetivo imediato é entregar identidade empresarial funcional com ativação manual segura, sem reduzir os requisitos de autorização, isolamento de tenant ou auditoria.

**Incluído no MVP:** criação de perfil pendente pelo gestor; concessão explícita de papel/filiais por administrador de acessos ou dono autorizado; ativação por link/token de uso único com senha definida pelo próprio usuário; login e autorização por tenant/filial; auditoria das mudanças de acesso; fluxo mínimo de sessão/logout conforme critérios de segurança da sprint.

**Adiado:** SMTP automático de ativação, recuperação self-service por e-mail, multi-tenant SaaS/subdomínios e testes automatizados/E2E de frontend. O mecanismo manual não pode introduzir senha fixa, senha revelada ao gestor, token persistido em claro ou token reutilizável.

O percentual anterior de 3/7 (≈43%) era uma contagem uniforme de marcos, sem estimativas de esforço. Com o recorte revisado, essa porcentagem não serve como previsão de esforço nem de proximidade do MVP; recalcular progresso por critérios funcionais verificáveis após decompor os itens restantes.

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
| AC-12 (pós-MVP) | Dada solicitação de recuperação, quando informar e-mail existente ou inexistente, então resposta pública não revela existência; token válido troca senha e revoga sessões antigas. Não implementado no MVP. |
| AC-13 | Dados registros de outro tenant no PostgreSQL, quando a aplicação consultar com role operacional, então RLS/filtro/integridade bloqueiam vazamento. Teste com banco real e role sem BYPASSRLS. |
| AC-14 | Dada concessão/revogação/bloqueio, quando persistir a mudança, então auditoria registra autor, tenant, alvo e horário, sem senha/token. |

## Backlog e dependências

| Item | Entrega | Estado inicial | Dependência |
| --- | --- | --- | --- |
| S1-01 | Contrato OpenAPI e modelo Identity, alinhamento ADR/PRD | entregue na branch feature | Esta spec |
| S1-02 | Políticas de domínio: usuário ativo, papéis e filiais | núcleo validado e integrado | Red → Green → revisão comprovados |
| S1-03 | Persistência/migrations/RLS e auditoria | 03A/03B integrados em develop; CI remoto verde | PostgreSQL + QA Red + revisão independente |
| S1-04A1 | Cadastro de perfil pendente pelo gestor | Incremento ativo; critérios em `S1-04A1-PENDING-PROFILE.md` | S1-02/03; sem concessão implícita |
| S1-04A2 | Concessão explícita de papéis/filiais | Próximo após A1 | Administrador de acessos/dono autorizado |
| S1-04B | Ativação manual e definição de senha | Planejado para MVP | Token seguro, hash/uso único/expiração; sem dependência de SMTP |
| S1-05 | Login, sessão, refresh/logout | Planejado para MVP após S1-04 | S1-02/03/04 |
| S1-05D (pós-MVP) | Recuperação self-service | Adiado | SMTP e fluxo de recuperação revisado |
| S1-04C (pós-MVP) | Envio SMTP de ativação | Adiado | Adaptador/configuração SMTP; pode substituir o repasse manual sem alterar semântica do token |
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
- SMTP foi explicitamente adiado para depois do MVP em 2026-10-06; não é impedimento para ativação manual com token de uso único.
- PRD antigo em frontend/docs ainda descreve Node/Drizzle e modelos incompatíveis. Esta spec governa somente a Sprint 01; módulos futuros permanecem em refinamento.
- Proteções remotas de develop/main e ambiente de homologação não configurados/verificados. YAML não impõe revisão nem deploy automaticamente.


## Execução em incrementos — refinamento do plano

Por decisão do usuário, cada run executa somente um incremento pequeno. Os itens03/04/05 estão decompostos em `docs/INCREMENTAL_EXECUTION.md`; S1-01/02/03A/03B foram entregues e integrados com as evidências registradas. Incremento validado, integração e sprintDone são estados distintos. SMTP e recuperação self-service foram adiados do MVP, sem remoção dos requisitos de segurança de ativação, autorização ou auditoria. Nenhum gate técnico do backend foi removido.
