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
| S1-02 | Núcleo de autorização | Validado em feature/sprint-01-identity:30testes, Domain100%, revisão; integração pendente. |
| S1-03A | Persistência básica Identity e isolamento | Usuários/filiais/concessões, migration, role operacional, RLS/filtro e reader atual; QA com PostgreSQL real antes do Green. |
| S1-03B | Auditoria de alterações de acesso | Persistência append-only e evidência de quem/quando/alvo, sem credenciais; depende03A. |
| S1-04A | Cadastro pendente e concessão de acessos | Gestor cadastra sem conceder; admin/dono autoriza escopo; contratos/HTTP e testes negativos. |
| S1-04B | Token de primeiro acesso e ativação | Token hash/uso único/expiração, senha Argon2id e conta ativa somente após conclusão válida. |
| S1-04C | Envio SMTP de ativação | Adaptador, captura local e tratamento de falha/reenvio; sem envio real sem destino configurado. |
| S1-05A | Login e perfil autenticado | Conta ativa, tenant configurado, filiais autorizadas e JWT15min. |
| S1-05B | Seleção/troca de filial | Validação server-side da filial e leitura atual das concessões. |
| S1-05C | Refresh e logout | Rotação/revogação atômicas, cookie e CSRF conforme contrato. |
| S1-05D | Recuperação de senha | Resposta pública genérica, token único, SMTP e revogação de sessões antigas. |
| S1-06 | Integração frontend em fatias correspondentes | Cliente gerado + cada fluxo acordado com a frente UX/frontend; lint/build/revisão/manual, sem E2E automatizado. |
| S1-07 | Candidata integrada e encerramento da sprint | Feature completo, combinação front/back e revisão; main apenas quando estável. |

Antes de executar qualquer linha ampla, o SM a divide novamente se não houver aceite pequeno e verificável. Estes IDs refinam os itens03/04/05 existentes; não acrescentam funcionalidades de OS/comissões ou outros módulos.

## Dependências de branches

Cada nova tarefa registra o commit base que contém suas dependências. Como o núcleo S1-02 ainda está na feature e não em develop, S1-03A precisa incorporar explicitamente essa base revisada (`55ea2cd`) e as atualizações de workflow de develop, em checkout próprio. Não começar a partir de develop presumindo que esse código já foi integrado. O SM coordena integração das dependências e repete validações afetadas pela combinação.

## Passagem de uma execução

Usar o modelo TASK: incremento, objetivo, aceite, fora de escopo, dependências, arquivos/donos, base/branch, modelos escolhidos conforme MODEL_ROUTING, evidências e próxima ação. Manter STATUS da sprint atualizado sem tratar progresso parcial como sprintDone.
