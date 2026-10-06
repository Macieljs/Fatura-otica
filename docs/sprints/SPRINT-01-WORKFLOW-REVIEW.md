# Sprint 01 — revisão de workflow e pipeline

- Data: 2026-10-06.
- Escopo: revisão independente de `SPRINT-01-IDENTITY.md`, critérios de integração e triggers do CI.
- Checkout: `work/develop`, branch `develop`. Nenhuma alteração de branch no terminal frontend existente.
- Autorização aplicável: integrar frontend/backend em `develop` e promover para `main` quando estável; sem deploy na Sprint 01.
- Estado: workflow preparado; aprovação funcional da candidata depende das evidências abaixo.

## Parecer sobre a spec

Não foram identificadas inconsistências bloqueantes no escopo da spec revisada. Tenant configurado no servidor, administrador de acessos como capacidade distinta, ausência de concessão implícita no cadastro, revogação na próxima operação, recuperação sem enumeração e integração real de tenant estão refletidos nos critérios AC-01 a AC-14. A única empresa por ambiente não elimina a necessidade de testar registros de outro tenant no PostgreSQL.

Os prazos de ativação/recuperação/refresh são propostas técnicas explicitamente configuráveis e devem ser fechados no contrato S1-01 antes da implementação; não representam autorização para sessão ilimitada. O envio SMTP tem captura local para desenvolvimento e configuração externa para destinos reais. O PRD legado Node/Drizzle não governa esta sprint; a precedência da spec S1 deve acompanhar a delegação e a revisão do contrato.

## Bloqueios da candidata, sem alteração dos gates

| Condição observada/registrada | Impacto | Evidência necessária para resolver |
| --- | --- | --- |
| Docker Linux indisponível na verificação de início | S1-03, AC-13 e integração real não podem ser declarados aprovados. | PostgreSQL real disponível, role sem BYPASSRLS e testes de isolamento/constraints executados. |
| Domain/Application/Integration inicialmente vazios | CI backend Feature bloqueia a aprovação funcional. | Quatro suítes executadas/aprovadas, Domain >=90% e build sem warnings sobre a candidata. |
| SMTP real sem host/remetente/credenciais configurados | Entrega real de e-mail e prontidão do destino não comprovadas. | Captura local para desenvolvimento; configuração externa e evidência de entrega para cada destino real autorizado. |
| Frontend em outra frente | Backend isolado não comprova login/ativação/seleção de filial completos. | Entrega frontend coordenada, contrato integrado, lint/build, revisão e evidências manuais aplicáveis. |
| Proteções/CI remoto ainda não verificados | Não há comprovação de imposição automática dos gates. | Resultado remoto da revisão candidata e verificação das regras de develop/main; registrar limitações. |

Ausência de testes automatizados frontend/E2E não é bloqueante nesta fase. Falhas de lint/build e critérios manuais não atendidos continuam bloqueantes. Não instalar runners frontend nem substituir Feature por Bootstrap para aprovar a sprint.

## Alteração do pipeline

Push agora aciona `Quality` em `develop` e `main`; PR permanece sem filtro de branch. Jobs preservados: frontend instalação/lint/build; backend restore, runner Feature e upload de evidências. Não foi introduzido merge ou deploy automático.

## Validação e limites

YAML carregado com `js-yaml` já disponível no ambiente frontend, sem instalação. Asserções confirmaram push em develop/main, PR sem filtro, acionamento manual, comandos frontend limitados a instalação/lint/build e runner backend Feature preservado. `git diff --check` passou. Essa verificação não valida políticas do provedor nem disponibilidade remota das actions.

Não houve commit, push, execução de CI remoto ou promoção para main nesta tarefa. A revisão do workflow não substitui QA do código de identidade, cobertura, PostgreSQL real nem verificação manual frontend. O progresso parcial do núcleo S1-02 pode ser registrado após Green e revisão na branch de tarefa, sem declarar concluído o módulo nem aprovar sua candidata funcional. Consultar [BRANCH_WORKFLOW](../BRANCH_WORKFLOW.md) para os critérios de promoção.
