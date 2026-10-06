# Sprint 01 — evidências QA

Data: 2026-10-06. Escopo executado: S1-02, políticas de domínio e autorização com snapshot atual. Não equivale à Sprint 01 concluída.

## Pré-flight

- .NET SDK 10.0.203 disponível. `dotnet --info` no sandbox encontrou acesso negado ao Service Control Manager ao enumerar workloads; restore/test com execução autorizada funcionam.
- `dotnet restore backend/FaturaOtica.slnx --verbosity minimal`: aprovado, os oito projetos restaurados sem alterar dependências.
- Docker client 29.1.3 disponível; daemon `desktop-linux` indisponível (`dockerDesktopLinuxEngine` inexistente).
- Tentativa reversível `docker desktop start` permaneceu sem saída por mais de cinco minutos e foi interrompida. `docker desktop status` retornou 1; `docker info` retornou 1 por pipe inexistente. Não foram instalados componentes nem substituído PostgreSQL por banco em memória.

## Red funcional antes da implementação

Contrato/skeleton combinado com Backend: `AccessPolicy.Evaluate` e `CurrentAccessAuthorizer.AuthorizeAsync`, usando `AccessAction`. Métodos ainda lançavam `NotImplementedException` indicando comportamento não implementado.

| Suite | Executados | Aprovados | Falhas | Ignorados |
| --- | ---: | ---: | ---: | ---: |
| Domain | 21 | 0 | 21 | 0 |
| Application | 6 | 0 | 6 | 0 |

Ambas as suites compilaram. Falhas funcionais ocorreram ao chamar métodos sem implementação. Logs/TRX locais preservados em `artifacts/qa/s1-02-red/`; não versionar esses arquivos.

Comandos, executados sequencialmente:

```powershell
dotnet test backend/tests/FaturaOtica.Domain.Tests/FaturaOtica.Domain.Tests.csproj --no-restore --logger "trx;LogFileName=domain-red.trx" --results-directory artifacts/qa/s1-02-red --verbosity minimal
dotnet test backend/tests/FaturaOtica.Application.Tests/FaturaOtica.Application.Tests.csproj --no-restore --logger "trx;LogFileName=application-red.trx" --results-directory artifacts/qa/s1-02-red --verbosity minimal
```

### Critérios cobertos

- AC-01/04/09: tenant configurado, usuário de outro tenant, filial de outra empresa, dono restrito à sua empresa.
- AC-03: gestor não administra acessos; administrador com capacidade explícita, independente de filial operacional.
- AC-07/08: pendente/bloqueado não opera; vendedor somente nas filiais concedidas; perfil próprio permitido sem filial operacional.
- AC-02 parcialmente: política permite cadastro pendente somente ao gestor/dono no escopo autorizado. O caso de uso de cadastro ainda não foi implementado/testado.
- AC-10: revogação de concessão e bloqueio alteram a próxima autorização; reader consultado a cada operação, sem cache implícito de JWT.
- Robustez: IDs vazios, enum desconhecido, grants/papéis em escopo inválido, snapshot com identidade divergente e cancelamento.

### Impedimentos encontrados e tratados

1. Contrato inicial `AccessPermission` disparava analyzer CA1711. Backend renomeou para `AccessAction` sem reduzir análise. Falha de compilação não foi contabilizada como Red.
2. Compilação simultânea de suites sobre o mesmo Domain.dll causou CS2012/arquivo bloqueado. QA serializou as execuções; não suprimiu testes nem mudou comportamento. Evitar builds paralelos no mesmo checkout/output.

## Próximas verificações e limites

- QA conferiu diretamente TRX/Cobertura após implementação: Domain 21/21 aprovados, Application 6/6 aprovados, zero falhas/ignorados; cobertura de linhas Domain 100% (33/33 instrumentadas). Evidências em `artifacts/dev/s1-02-green/domain/domain-green.trx`, `artifacts/dev/s1-02-green/application/application-green.trx` e `domain/cadb1a8c-13bb-40ea-871f-977ccd2410a8/coverage.cobertura.xml`.
- O runner gerou uma cópia adicional desse XML em `TestResults/In` (mesmo horário, 33/33). Ela não é uma segunda execução e não deve ser somada; o relatório acima usa somente o XML no diretório GUID identificado.
- Revisão de leitura da policy/authorizer: nenhum achado bloqueante no núcleo; tenant/papéis/filiais validados e snapshot relido em cada operação. A porta ainda não possui adaptador persistente, nem comprova autorização HTTP/RLS.
- Build sem warnings e Architecture devem ser comprovados na candidata final pelo Backend/SM. CI/gate Feature completo continua obrigatório para a sprint.
- Integração PostgreSQL real obrigatória para S1-03 e isolamento HTTP/RLS; permanece bloqueada pelo daemon Docker ausente.
- S1-04/05 ainda exigem testes de tokens, primeiro acesso, SMTP de captura, login/refresh/logout e recuperação.
- Nenhum teste frontend/E2E foi criado, conforme decisão do usuário.
- QA Red permite iniciar Green do núcleo; não autoriza merge em develop/main nem deploy.
