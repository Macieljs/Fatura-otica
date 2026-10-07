# Execução por incrementos

Adotada por decisão do usuário em 2026-10-06. A sprint permanece como objetivo geral; cada execução entrega um incremento pequeno verificável e encerra esse recorte após revisão ou bloqueio concreto. Não tentar executar toda a sprint em uma única run por padrão.

## Unidade de trabalho

- Uma execução = uma tarefa pequena ou conjunto mínimo inseparável com objetivo, critérios, dependências e dono claros.
- Um módulo pode exigir vários incrementos. Uma sprint pode conter vários módulos; conclusão de um incremento não conclui o módulo ou a sprint.
- Selecionar uma tarefa pronta, registrar o que está fora do recorte e executar o mesmo ciclo: spec/contrato → QA Red quando aplicável → Dev Green → verificações → revisão independente → evidências/passagem.
- Evitar misturar diagnóstico do ambiente, persistência, SMTP, login e integração visual na mesma execução. Dependências obrigatórias são explícitas, não simuladas para afirmar conclusão.
- Encerrar com resultado, commit/branch, evidências, bloqueios e próxima tarefa pronta. Não iniciar automaticamente outro incremento de implementação na mesma run; isso não exige renovar a aprovação do escopo já concedida. O próximo prompt pode indicar o ID ou solicitar que o SM selecione a próxima tarefa pronta.

## Conclusão e integração

Um incremento pode ser concluído na sua branch de tarefa quando seu aceite e verificações aplicáveis estão comprovados. Exemplo: núcleo de autorização Domain/Application com build, testes, cobertura e revisão independentes; isso não comprova login HTTP, persistência ou SMTP.

Registrar separadamente:

1. Incremento validado: aceite do recorte concluído e evidências disponíveis.
2. Integração: inclusão em develop e validação da combinação, conforme BRANCH_WORKFLOW.
3. Sprint concluída: todos os critérios e dependências da sprint atendidos, incluindo frontend quando aplicável.
4. Release: candidata estável e autorização de ambiente aplicável.

O CI backend atual continua exigindo Feature com quatro suítes reais e cobertura. Esta divisão não modifica o YAML, não substitui Feature por Bootstrap e não torna CI vermelho verde. Enquanto o gate de integração não passar, o incremento pode ficar validado na branch de tarefa com integração pendente.

Mudanças de persistência/RLS exigem PostgreSQL real; ausência do banco impede concluir esse incremento. Testes de autorização sem banco não substituem esse requisito. O SM pode escolher um diagnóstico de ambiente delimitado antes do incremento dependente, registrando os resultados sem inventar testes de produto.

## Planejamento da Sprint 01

| Incremento | Recorte | Dependência/aceite resumido |
| --- | --- | --- |
| S1-01 | Contrato/modelagem de Identity | Entregue; operações HTTP permanecem planejadas. |
| S1-02 | Núcleo de autorização | Validado inicialmente com30testes e revisão; incorporado à candidata local develop7d2c205 com Feature91/91. |
| S1-03A | Persistência básica Identity e isolamento | Validado: migration, RLS/filtro/FKs/reader/transações; PostgreSQL17 real,61Integration e Feature91/91 na candidata local develop7d2c205. Publicação remota registrada no STATUS. |
| S1-03B | Auditoria de alterações de acesso | Persistência append-only e evidência de quem/quando/alvo, sem credenciais; depende03A. |
| S1-04A1 | Cadastro de perfil pendente | Green Feature 254/254 e revisão independente aprovados; integração em develop/CI remoto pendentes. Parecer em `docs/sprints/S1-04A1-REVIEW.md`. |
| S1-04A2 | Concessão de acessos | Administrador de acessos/dono autorizado concede e revoga papéis/filiais; testes negativos e auditoria. |
| S1-04B | Token de primeiro acesso e ativação | Token hash/uso único/expiração; link repassado manualmente pelo administrador; senha Argon2id; conta ativa somente após conclusão válida. |
| S1-04C (pós-MVP) | Envio SMTP de ativação | Adiado. Integrar entrega automática do link sem alterar geração, hash, validade ou uso único do token. |
| S1-05A | Login e perfil autenticado | Conta ativa, tenant configurado, filiais autorizadas e JWT15min. |
| S1-05B | Seleção/troca de filial | Validação server-side da filial e leitura atual das concessões. |
| S1-05C | Refresh e logout | Rotação/revogação atômicas, cookie e CSRF conforme contrato. |
| S1-05D (pós-MVP) | Recuperação self-service de senha | Adiado. Inicialmente administrador autorizado pode revogar e emitir novo link; nunca visualizar/definir a senha. |
| S1-06 | Integração frontend em fatias correspondentes | Cliente gerado + cada fluxo acordado com a frente UX/frontend; lint/build/revisão/manual, sem E2E automatizado. |
| S1-07 | Candidata integrada e encerramento da sprint | Feature completo, combinação front/back e revisão; main apenas quando estável. |

Antes de executar qualquer linha ampla, o SM a divide novamente se não houver aceite pequeno e verificável. Estes IDs refinam os itens03/04/05 existentes; não acrescentam funcionalidades de OS/comissões ou outros módulos.

## Dependências de branches

Cada nova tarefa registra o commit base que contém suas dependências. S1-03A/03B estão integrados em `develop`, e o CI remoto passou conforme `SPRINT-01-STATUS.md`. S1-04A1 inicia a partir do HEAD de develop após registrar esta mudança de escopo; o SM coordena integração e repete validações afetadas pela combinação.

## Passagem de uma execução

Usar o modelo TASK: incremento, objetivo, aceite, fora de escopo, dependências, arquivos/donos, base/branch, modelos escolhidos conforme MODEL_ROUTING, evidências e próxima ação. Manter STATUS da sprint atualizado sem tratar progresso parcial como sprintDone.
