# Sprint 01 — correção da leitura de Cobertura

Data: 2026-10-06. Escopo: `scripts/quality-gate.ps1`, leitura de cobertura Backend Feature.

## Impedimento

O collector real gerou `coverage.cobertura.xml` no diretório GUID e uma cópia byte-idêntica nos anexos `In/`. O gate anterior somava os pacotes dessas duas cópias e bloqueava evidência legítima como ambígua.

## Correção

- Calcular SHA256 dos bytes de cada XML antes de parsear.
- Parsear uma única vez cópias com o mesmo SHA256.
- Manter o bloqueio quando houver relatórios de conteúdo distinto, pacote Domain ausente/ambíguo, linhas vazias ou cobertura abaixo de 90%.
- Preservar níveis, suites obrigatórias, identidade de fonte, falhas de etapas e ausência de autorização de deploy.

## Verificação

Fixtures sintéticas em `artifacts/qa/gate-cobertura-fix/`, contendo quatro TRXs individuais mínimos e manifesto da fonte pós-correção. Essas fixtures verificam a mecânica do gate e não representam testes funcionais do produto.

O resultado executado de cada cenário fica em `artifacts/qa/gate-cobertura-fix/verification.json`, junto com o `summary.json` e log de cada execução. Casos: duas cópias idênticas válidas permitem aprovação; relatórios distintos, cobertura 89%, ausência de cobertura e ausência de linhas continuam bloqueados.

A correção não resolve o impedimento de Docker/PostgreSQL nem conclui a Sprint 01.
