# Estratégia de testes do MVP

Objetivo: manter evidência para os riscos reais do ERP e reduzir execuções repetidas durante o desenvolvimento. Esta política mantém o gate do CI e os critérios atuais de cobertura.

## Ciclo local

1. Definir critérios de aceite testáveis e classificar o risco da mudança.
2. Antes de executar, listar o filtro/projeto exato, quais critérios ele cobre e por que entra nesta rodada. Para comportamento novo ou bug, escrever primeiro um conjunto pequeno de testes que represente a fatia. Uma execução Red pode cobrir vários exemplos relacionados; não é preciso delegar e executar um ciclo separado por caso ou arquivo.
3. Implementar e executar apenas os testes do projeto/camada afetados. Não rodar cobertura nem as quatro suítes completas a cada ajuste.
4. Se houver persistência, migration, RLS ou autorização multi-tenant, incluir testes focados com PostgreSQL real. Agrupar cenários relacionados em uma execução para compartilhar build e inicialização do container.
5. Refatorar e repetir apenas o conjunto afetado. A revisão independente confere critérios, testes, diff e riscos.

Em tarefas simples com contrato fechado, o desenvolvedor pode escrever os testes primeiro e QA revisa critérios/casos. Em identidade, permissões, dinheiro, migrations, concorrência ou tenant, QA define ou revisa independentemente os cenários antes do Green. Red deve falhar pelo comportamento ausente, não por compilação ou infraestrutura.

## Comandos e custo de execução

- Usar o runner focado para ver o grupo, os resultados e a duração: `npm run test:backend:focused -- -Project Domain -Filter "FullyQualifiedName~<NomeDaClasse>" -NoRestore`. Opções: `Architecture`, `Domain`, `Application` e `Integration`.
- O runner compila somente o projeto selecionado e suas dependências; não executar um build completo separado antes sem razão concreta. O filtro aparece no resumo, o logger lista os casos e TRX fica junto das evidências.
- Ao informar o resultado, resumir quais grupos/casos rodaram, o que validaram, contagem e duração; não reportar somente um número total de testes.
- Não usar `--no-build` depois de alterar fontes. Usar apenas quando houver build aprovado das mesmas fontes no mesmo checkout.
- Executar testes em sequência na máquina de desenvolvimento. Não iniciar builds paralelos na mesma árvore.
- Executar `Feature` uma vez no candidato final antes da integração. Se o CI validar o mesmo SHA, não duplicar o gate local sem falha ou risco concreto que justifique.
- A revisão e o gate usam artefatos da mesma identidade de código. Alteração posterior em produção invalida as evidências afetadas.
- O revisor independente inspeciona testes e relatórios do mesmo snapshot; não repete todas as suítes se a identidade confere. Mudança em produção exige repetir os testes afetados.

## Verificação final do backend

O gate atual permanece: build sem warnings, Architecture/Domain/Application/Integration aprovados, nenhum teste ignorado e pelo menos **90% de cobertura de linhas em Domain**, com linhas instrumentadas. Coletar cobertura no gate final, não a cada iteração local.

Cada mudança deve ter testes proporcionais ao comportamento e risco; o gate não exige testes artificiais em todos os projetos para cada tarefa. O gate continua executando e validando as quatro suítes existentes. Testes PostgreSQL reais continuam obrigatórios para persistência/RLS e isolamento entre tenants; mocks não os substituem.

No frontend, permanece a decisão vigente: sem testes automatizados ou E2E nesta fase; lint, build, critérios de aceite, revisão e verificação manual continuam obrigatórios.

## Graphify

Usar consultas para localizar relações antes de explorar amplamente o código. Atualizar o grafo uma vez depois que o código da fatia estabilizar e antes da revisão. Não gerar o grafo a cada edição, teste ou atualização só documental; Graphify auxilia navegação, não substitui testes ou revisão.
