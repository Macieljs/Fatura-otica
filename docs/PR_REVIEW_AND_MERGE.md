# Revisão de PR e merge assistidos

Estado: política proposta; ainda não há agente de review nem auto-merge habilitados neste repositório.

## Estado atual

- `.github/workflows/quality.yml` roda Frontend quality e Backend quality em PRs, pushes em `develop`/`main` e execução manual.
- O token do CI tem somente `contents: read`; o workflow testa, mas não revisa semanticamente, aprova PRs nem faz merge.
- Branch protection, required reviewers, Auto-merge e merge queue não foram verificados nem configurados. A integração S1-03B foi feita pelo orquestrador após autorização anterior, não exigiu que o usuário fizesse pessoalmente o merge.
- GitHub Copilot Code Review pode fazer revisão automática se o recurso estiver disponível/habilitado. O estado de assinatura/configuração desta conta ainda é desconhecido.

## Política-alvo

Separar os papéis:

1. **Revisor IA**: analisa o diff contra critérios e testes, deixa comentário estruturado com achado, severidade, arquivo/linha e evidência. Reavalia cada novo push. Não edita código, não resolve conflitos e não recebe permissão de merge.
2. **CI determinístico**: exige os checks Backend quality e Frontend quality atuais. Backend usa Feature completo; frontend exige lint/build, mantendo testes automatizados e E2E adiados conforme decisão do usuário.
3. **GitHub Auto-merge**: executa o merge nativo somente quando a branch base/proteções e os checks requeridos autorizam. O agente prepara/solicita Auto-merge; não faz push direto a `develop` nem contorna protections. Merge queue pode validar o conjunto combinado quando houver PRs concorrentes.
4. **Humano**: recebe o PR se risco, conflito, falha, revisão incerta ou configuração indisponível impedir a automação.

### Classificação de risco

| Classe | Tratamento |
| --- | --- |
| Baixo risco, escopo pequeno, aceite fechado, sem caminhos sensíveis | Pode chegar a Auto-merge após CI e revisão IA aprovada, quando Copilot/App e regra de aprovação por paths estiverem configurados e validados. |
| Autenticação, autorização, tenant/RLS, migrations/schema, dados pessoais, fiscal/financeiro, segredos, dependências, Actions/workflows, regras de branch ou diff que atravessa camadas | Aprovação humana obrigatória; IA e CI são apoio, não aprovadores suficientes. |
| Agente sem resposta, review incompleta/desatualizada, conflito, teste ausente/falho, comportamento ambíguo ou risco não classificado | Bloquear Auto-merge e pedir análise humana. |

Codificar primeiro uma allowlist pequena de caminhos de baixo risco e uma lista explícita de caminhos críticos. Arquivo fora da allowlist é humano. Caminho sensível prevalece quando um PR toca arquivos de mais de uma classe. Não usar uma pontuação de confiança do modelo como substituto para essa regra.

### Prevenção e tratamento de falsos positivos

Não é possível garantir que um revisor de IA nunca deixe passar um defeito ou nunca aponte um problema inexistente. O workflow reduz a chance de merge incorreto com critérios determinísticos, revisão separada, checks obrigatórios e falha fechada. Um sinal de aprovação da IA nunca substitui testes de comportamento, isolamento por tenant, revisão de migration ou aprovação humana exigida por risco.

Antes de habilitar Auto-merge, rodar um período de observação de **pelo menos 10 PRs de baixo risco**: a IA comenta/classifica, mas humanos ainda fazem o merge. Registrar defeitos omitidos, alertas sem fundamento, findings confirmados e PRs escalados. Só habilitar Auto-merge para a allowlist de baixo risco depois da revisão dessa amostra; qualquer defeito relevante omitido reduz o escopo e reinicia a observação.

Conflito de merge é resultado determinístico de incompatibilidade entre árvores; IA pode explicar os arquivos e linhas em conflito, mas deve parar e deixar a correção com o autor/humano. Depois da correção, rodar review e todos os checks novamente sobre o último SHA. Não pedir à IA que escolha silenciosamente entre versões concorrentes.

## Configuração no GitHub

1. Proteger `develop`: PR obrigatório, proibir force-push/deleção e bypass normal, exigir status checks únicos `Backend quality` e `Frontend quality`, branch atualizada ou merge queue, e dispensar aprovação antiga quando novos commits forem enviados.
2. Configurar `CODEOWNERS`/aprovação humana para caminhos críticos. O padrão mais seguro é um humano aprovar esses PRs.
3. Habilitar Auto-merge nativo no repositório. Preferir squash se compatível com a política de histórico; escolher a estratégia explicitamente.
4. Habilitar revisão automática Copilot somente se houver entitlement administrativo. Por padrão, Copilot publica comentários, não aprovação; aprovações contam para as regras de merge somente quando habilitadas e estão em public preview. Se a conta não permitir aprovação IA restrita por paths, manter aprovação humana obrigatória para todo PR.
5. O job de qualidade continua com `contents: read`. Não adicionar `contents: write` nele. Se futuramente houver integração customizada de IA, usar GitHub App/token separado, privilégio mínimo e job isolado da execução do código do PR.
6. Workflows de PR usam `pull_request` com permissões mínimas. Não executar código do PR sob `pull_request_target` com token write ou secrets; branch e dependências do PR são entrada não confiável.
7. Se habilitar merge queue, adicionar o evento `merge_group` aos workflows de CI para que os checks rodem no conjunto que será integrado.

## Fases e aceitação

- **Preparar**: verificar plano/permissão Copilot, proteções atuais de `develop`, nomes de checks e licença/limites; configurar caminho crítico no `CODEOWNERS`.
- **Observar**: dez PRs de baixo risco com revisão IA automática, sem aprovação IA válida para merge; usuário pode revisar todos durante a coleta se desejar.
- **Piloto**: somente allowlist revisada pode obter aprovação IA e Auto-merge. PR crítico, conflito ou dúvida sempre pede humano.
- **Ampliar**: só após conferir os resultados do piloto e atualizar esta política, os critérios e os paths. Não aumentar permissões do CI para contornar um bloqueio.

Critérios para habilitar: protections efetivas verificadas pela UI/API; checks obrigatórios identificados por fonte; re-review no push mais recente; conflitos bloqueiam; falha/timeout do agente bloqueia; pelo menos dez PRs observados e triados; nenhum caminho sensível na allowlist; plano de desativação de Auto-merge documentado.

## Referências oficiais

- [GitHub Copilot code review](https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/copilot-code-review)
- [Configurar Copilot code review e aprovação por paths](https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/configure-code-review)
- [Auto-merge de pull requests](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/automatically-merging-a-pull-request)
- [Proteção de branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)
- [Segurança de `pull_request_target`](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target)
