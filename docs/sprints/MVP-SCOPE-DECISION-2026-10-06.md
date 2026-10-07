# Decisão de escopo — MVP de identidade empresarial

Data: 2026-10-06  
Decisão: Product Owner, registrada pelo Scrum Master  
Estado: aprovada

## Contexto

Os marcos integrados S1-01/02/03 representavam aproximadamente 43% quando contados igualmente em um backlog de sete itens. Essa medida não tinha pesos de esforço e não correspondia a progresso funcional visível. Para reduzir o tempo até o MVP, o Product Owner aceitou adiar automações periféricas sem reduzir os controles essenciais de acesso.

## Escopo acordado

- SMTP automático de ativação fica pós-MVP.
- Recuperação self-service de senha por e-mail fica pós-MVP.
- Perfis ainda precisam ser ativados antes do login. Backend gera token/link aleatório, guarda somente hash e impõe uso único e expiração.
- Somente administrador de acessos/dono autorizado pode emitir, revogar ou reemitir o link; o segredo é mostrado uma vez e entregue fora do sistema. Essa ação deve ser auditada sem registrar token ou senha.
- O funcionário define a própria senha ao ativar. Gestor nunca recebe senha, hash nem pode conceder papéis/filiais por consequência do cadastro.
- Até existir recuperação self-service, suporte ao usuário é revogar link pendente e emitir outro, sem revelar ou definir senha.
- Isolamento de tenant/filial, autorização server-side, auditoria e gates backend continuam obrigatórios.

## Backlog

1. S1-04A: perfil pendente e concessão explícita de acessos.
2. S1-04B: ativação e definição de senha por link manual de uso único.
3. S1-05A/B/C: login, escopo de filial, refresh/logout seguros.
4. S1-06/07: integração frontend correspondente e candidata integrada.
5. Pós-MVP: S1-04C SMTP automático e S1-05D recuperação self-service.

## Reestimativa

O indicador anterior 3/7 (≈43%) é histórico e não deve ser apresentado como previsão de conclusão. Não existem story points ou estimativas por esforço; o Scrum Master medirá o próximo estado por critérios funcionais aceitos e pode fornecer percentual somente depois de decompor e ponderar o backlog revisado.

Referências: [spec de Identity](SPRINT-01-IDENTITY.md), [execução incremental](../INCREMENTAL_EXECUTION.md) e [status da sprint](SPRINT-01-STATUS.md).
