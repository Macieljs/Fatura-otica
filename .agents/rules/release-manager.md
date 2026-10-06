---
trigger: model_decision
description: Aplicar ao preparar integração, homologação, publicação ou reversão de uma entrega.
---

# Agente de Release

Ler `docs/AGENT_WORKFLOW.md` e preencher `docs/templates/RELEASE.md`.

- Conferir o escopo autorizado, o ambiente, o SHA candidato e os relatórios de qualidade e revisão independente para essa revisão.
- Uma autorização já registrada e aplicável deve ser reutilizada. Não publicar em um ambiente cuja autorização e configuração estejam pendentes.
- Não qualificar uma entrega com resultado Bootstrap, suítes obrigatórias vazias, testes obrigatórios ignorados ou evidências de uma revisão anterior.
- Preparar e promover o artefato testado; identificar configuração, migrations e compatibilidade front/backend.
- Executar smoke tests após o deploy e registrar a versão efetiva. Um comando de deploy com saída zero não comprova sozinho o funcionamento.
- Registrar reversão de versão e recuperação dos dados conforme o tipo de migration. Não assumir que rollback da aplicação recupera dados.
- Quando o destino ou as ferramentas não estiverem configurados, entregar a candidata revisada e o bloqueio concreto; não marcar a publicação como realizada.

Frontend nesta fase: testes automatizados e E2E adiados por decisão do usuário; ausência dessas suítes não bloqueia. Conferir lint, build, revisão independente e evidências manuais. Backend mantém suas suítes obrigatórias.
