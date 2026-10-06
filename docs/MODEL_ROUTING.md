# Política de modelos na orquestração

Status: adotada por decisão do usuário em 2026-10-06. Aplicável ao workflow de frontend e backend.

## Seleção por tarefa

| Classe | Modelo solicitado | Exemplos |
| --- | --- | --- |
| Apoio simples, objetivo verificável e escopo pequeno | `gpt-6-luna` | Localizar arquivos, consultar documentação, resumir logs, conferir referências, atualizar registros com fatos fornecidos. |
| Correção pequena com causa conhecida, aceite fechado e sem impacto crítico | `gpt-6-luna` | Ajustes locais de documentação/formatação e mudanças reversíveis delimitadas; exigir validação adequada. |
| Implementação crítica ou ampla | Modelo principal do orquestrador, herdado | Autenticação, sessões, permissões, RLS, migrations, integridade, financeiro/fiscal, contratos e integrações com decisões abertas. |
| Revisão crítica independente | Modelo principal do orquestrador, herdado | Segurança, arquitetura, regra de negócio, dados, revisão de candidata integrada e liberação. |

Classificar a tarefa, não somente o papel. Um QA pode usar Luna para extrair contagens de um relatório, mas os cenários de autorização e a revisão de isolamento exigem o modelo principal. Não definir Luna como padrão global para todos os agentes.

## Responsabilidade do Scrum Master

1. Antes de delegar, registrar risco, escopo, modelo solicitado e motivo. Em caso de dúvida sobre criticidade, usar o modelo principal.
2. Solicitar `gpt-6-luna` explicitamente na ferramenta de criação para tarefas simples. Uma persona no prompt não altera o modelo por si só.
3. No runtime atual, um agente com modelo diferente deve ser criado com contexto novo/recortado (`fork_turns: none` ou histórico parcial) e parâmetro `model: gpt-6-luna`. Histórico completo herda o modelo principal. Para apoio simples, solicitar esforço `medium`, suportado por Luna; não mudar o esforço das tarefas críticas por esta política.
4. Para tarefas críticas, omitir override de modelo/esforço e herdar o modelo principal. Manter autor e revisor em agentes distintos.
5. Se Luna não estiver disponível ou a criação rejeitar a configuração, usar o modelo principal e registrar o fallback. Não afirmar que o modelo mudou se a ferramenta rejeitou o pedido.
6. Não trocar retroativamente agentes já em execução. Uma escalada cria uma nova delegação para o modelo principal ou encaminha o trabalho a um agente desse modelo.
7. Registrar o modelo solicitado e a confirmação da ferramenta quando disponível. Não inventar preço, uso ou modelo efetivo se o runtime não o informa.

## Contexto mínimo de delegação

Enviar objetivo, critérios de aceite, caminhos exatos/checkout/branch, dono dos arquivos, decisões aplicáveis, dependências, evidências relevantes e formato esperado da saída. Acrescentar limites de ferramentas/escrita. Não copiar toda a conversa ou todo o repositório para uma checagem pequena; não omitir requisitos de autorização/tenant/DoD necessários à tarefa.

Agente de apoio devolve fatos verificáveis, arquivos/linhas e limites. Não redefine escopo nem aprova negócio/release. O orquestrador confere o resultado e continua responsável pela integração.

## Escalonamento

Escalar imediatamente ao modelo principal se surgir ambiguidade de negócio, mudança de contrato/arquitetura, risco de segurança/dados ou necessidade de alterar autenticação, permissões, RLS, migrations, financeiro ou fiscal.

Para tarefa simples sem risco crítico, permitir no máximo uma tentativa de correção após resultado inválido ou falha da validação. Persistindo o problema, escalar com objetivo, diff, evidências, tentativas e pergunta concreta. O agente não reduz testes, critérios ou cobertura para terminar.

Falha de ambiente (Docker, rede, credenciais, sandbox) é impedimento técnico, não prova de incapacidade do modelo. Registrar e tratar o ambiente; escalar o diagnóstico apenas quando necessário. Não repetir chamadas indefinidamente.

## Evidência e qualidade

Registrar tarefa/agente, classe de risco, modelo solicitado, motivo, contexto enviado, resultado, validação e eventuais fallback/escaladas. Se houver telemetria de custo/tokens, registrar os números disponíveis; sem telemetria não alegar economia medida.

A escolha de modelo não altera DoD: backend mantém TDD/testes/cobertura/isolamento e revisão independente; frontend/E2E automatizados continuam adiados nesta fase, com lint/build e revisão/verificação manual aplicáveis. A política orienta o orquestrador e deve ser aplicada na chamada da ferramenta; o Markdown não inicia nem roteia agentes sozinho.

Referência: [documentação oficial de subagentes](https://learn.chatgpt.com/docs/agent-configuration/subagents).
