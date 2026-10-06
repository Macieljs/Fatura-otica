# S1-03B — Auditoria de alterações de acesso

- Estado: integrado em develop no merge `9fd17be`; tree `c1f160b` igual à tree da branch aprovada. Feature/revisão independentes aprovados e CI remoto verde (Backend/Frontend) no SHA `48716bb`. Nenhum endpoint Identity foi incluído.
- Base: develop ca5e37865a875504c09d51c30603c3f53dbe4011, S1-03A integrado com CI aprovado.
- Branch: feature/s1-03b-audit. Checkout backend reutilizado: work/s1-03a-persistence; nome físico permanece, branch é do novo incremento. Frontend em outro terminal preservado.
- Preflight: Docker29.1.3 e SDK10.0.203 disponíveis; pacotes e imagens reutilizados.
- Responsáveis/modelos: SM aceite/coordenação; Backend, QA do Red e revisor independente usam GPT-6.1 Sol neste incremento por envolver atomicidade, RLS, migration e integridade. GPT-6 Luna fica para tarefas pequenas de baixo risco com aceite fechado, como CRUD comum, testes de regras já decididas e correções localizadas. A seleção e o motivo ficam registrados em `docs/MODEL_ROUTING.md`.
- Objetivo: base interna de auditoria de concessão/revogação de acesso e bloqueio de usuário, conforme AC14 da Sprint01.
- Fora de escopo: endpoints/UI, cadastro/login/SMTP/JWT, administração de acessos efetiva, auditoria de outros módulos, deploy e conclusão da sprint.

## Aceite e cenários

| ID | Dado / Quando / Então |
| --- | --- |
| AU01 | Dado evento válido de concessão, revogação ou bloqueio, quando gravado, então registra ID, tenant, autor, usuário alvo, ação e horário UTC; papel/filial quando pertinentes. |
| AU02 | Dados IDs vazios, ação/papel desconhecido ou combinação inválida de ação/papel/filial, quando criar/persistir, então rejeita; domínio e checks protegem invariantes aplicáveis. |
| AU03 | Dados autor/alvo/filial de outra empresa ou inexistentes, quando registrar, então FK composta/RLS recusam; role runtime sem BYPASSRLS e sem propriedade, banco PostgreSQL real. |
| AU04 | Dado registro persistido, quando tentar UPDATE/DELETE/TRUNCATE, então banco protege o ledger; runtime recebe somente SELECT/INSERT em auditoria. Admin do container testa trigger sem mascaramento por falta de privilégios. |
| AU05 | Dado tenant A, quando consultar auditoria por EF ou SQL direto runtime, então não recebe dadosB; contexto ausente/malformado falha fechado. |
| AU06 | Dada transação validada do chamador, quando mudar estado/acesso e registrar auditoria, então ambos confirmam juntos; rollback/erro/cancelamento não deixa mudança sem registro nem registro de mudança revertida. Writer não confirma transação do chamador nem abre transação autônoma silenciosamente. |
| AU07 | Dado contexto sem wrapper validado ou evento de tenant divergente, quando solicitar append, então recusa antes de persistir. |
| AU08 | Dado evento, quando exposto/persistido, então estrutura tipada não recebe senha/hash/token/e-mail ou payload arbitrário; snapshot/readers existentes seguem sem credenciais expostas. |
| AU09 | Dada migration anterior com dados Identity, quando aplicar migration de auditoria, então preserva dados e reaplicação é segura; snapshot e migration versionados em Persistence/Migrations. Down documentado somente para banco descartável. |

## Ordem e evidências

1. Backend fecha contrato interno/modelagem/assinaturas; QA e revisor conferem antes de produção. Não alterar OpenAPI porque não há endpoint neste recorte.
2. QA escreve cenários e registra Red compilável em PostgreSQL real; erro de compilação/fixture não é Red. NotImplementedException na ação ausente é evidência de comportamento ausente somente com cenário/resultado contratado e fixture saudável; não alegar SQL ainda não executado.
3. Backend implementa mínimo; QA usa testes focados no ciclo e preserva intenções. Builds/testes/grafo serializados no mesmo checkout.
4. Congelar código, atualizar grafo e executar Feature completo uma vez na candidata final; quatro suítes reais, Domain>=90%, build sem warnings, relatório com cenário/resultado/nome, não apenas contagem.
5. Revisão independente, commit/integração em develop e conferência de equivalência das árvores. Se integração mudar código/configuração, repetir verificação afetada. CI remoto da develop executa gates completos sobre SHA limpo.
6. Encerrar apenas S1-03B com resultado e próxima tarefa; main/deploy não autorizados pela entrega.

## Decisões técnicas a fechar pelo contrato

- Campos estritamente tipados, sem JSON/texto livre para dados sensíveis.
- Autor/alvo pertencem ao tenant; papel empresarial e papel de filial preservam os escopos existentes.
- Contexto tenant vem da configuração confiável e do wrapper já validado. Registrar auditoria não equivale a autorizar uma alteração de acesso.
- Chamador futuro autoriza e muda acesso junto com append na mesma transação; esta fatia prova atomicidade da infraestrutura sem fingir que endpoints já existem.

## Graphify: uso observado neste incremento

- Backend consultou `IdentityTenantTransaction persistence identity audit` e conferiu wrapper, contexto e reader no código. A consulta orientou o reuso da transação existente e a recusa de transações avulsas.
- Revisor começou com nomes que não retornaram resultados; o inventário do grafo permitiu corrigir a busca para `IdentityTenantTransaction`/`IdentityDbContext`, localizar `IsValidFor`, `Commit` e `Dispose` e verificar o risco de confirmar alterações após falha de auditoria.
- QA consultou wrapper, contexto e `AccessRole` para localizar política e fixtures; parte da leitura dos fixtures ocorreu antes dessa consulta. Portanto, o uso ainda não foi uniforme como primeira etapa de navegação.
- Consultas ajudam a localizar relações; código e testes confirmam comportamento. Grafo anterior: 961 nós. Atualização final após freeze: 1100 nós, 1761 edges e 85 comunidades; SHA256 de graph.json `6B5B774597E110CB0B8C57207C2BA5047099AFF59238D3E01463874C03ACE946`. Não tratar o número de nós como medida de cobertura ou qualidade.
- Decisão contratual resultante da inspeção: qualquer falha de append aborta o wrapper próprio validado; transação não reconhecida é preservada. O chamador descarta o DbContext após falha porque rollback não restaura entidades rastreadas.

## Implementação Green e revisão

Migration `20261006223501_AddIdentityAudit`, designer e snapshot gerados sem alterar `InitialIdentity`. Evento, writer e modelo implementados no recorte autorizado. QA ajustou dois casos de precedência de CHECK sem relaxar produção; Integration IdentityAudit passou 30/30 no PostgreSQL real (`artifacts/s103b-integration-green-corrected/identity-audit-green-corrected.trx`). Domain focado passou 27/27 após implementação; não houve Red Domain separado.

Gate Feature Release: `20261006-224137-6492a6ae`, SHA candidato `ca5e378`, sourceSnapshotHash `cda41539834e77a18111f3392ddd88cffcf6f6040d8469a2f39d94c9ba1731ec`. Build 0 warnings/0 errors; Architecture 3/3, Domain 48/48 (100% de 62 linhas), Application 7/7, Integration 91/91; 149/149 total, zero skips/falhas. Relatórios em `artifacts/quality/backend/20261006-224137-6492a6ae`.

Revisão técnica independente aprovada para integração, sem defeito bloqueante. Limites explicitados: wrapper encerrado antes de append e cancelamento durante `CommitAsync` após append bem-sucedido não foram cenários separados; não declarar essa cobertura. Aguarda integração/CI em `develop`.
