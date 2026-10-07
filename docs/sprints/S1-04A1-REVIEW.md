# Revisão independente — S1-04A1 perfil pendente

- Resultado: **aprovado para integração técnica do incremento S1-04A1**.
- Revisor: agente independente, GPT-6.1 Sol.
- Base: `3c79faf` (`develop`).
- Snapshot técnico congelado e testado: `f4fa97bc6e34748eac9831cf7fbf617c8cc53a7e146e3e366e383e9ce67d9840`.
- Snapshot após os registros documentais: `d906e722ce4dd52d419d0926b1d91b89b4da1da938b57bd502b233ea16eb5ce1`.
- Evidência de código testado: `artifacts/quality/backend/20261007-003109-90ada1f5/`.
- Verificação independente: 59 hashes técnicos comparados ao snapshot executado; zero divergências.

## Gates conferidos

- Feature: Architecture3/3, Domain48/48, Application7/7, Integration196/196; total **254/254**, zero falhas/ignorados.
- Dentro da Integration estão os 105 casos A1; não somar novamente o filtro focado.
- Build sem warnings/erros; Domain 65/65 linhas (100%). Branches 83/84, portanto cobertura integral de branches não é declarada.
- Reviewer não alterou arquivos nem executou/duplicou gates.

## Critérios e segurança

PEND-01..11 aprovados no snapshot: rota bearer fail-closed; claims `sub` e tenant validados; autorização consulta grants/status atuais; branchId é proveniência sem grant; perfil inicia Pending sem senha/token; migration incremental protege FK/índice/check e preserva legados; normalização `lower(btrim())` e unicidade PostgreSQL; somente a constraint conhecida converte para409; transação reverte falhas; OpenAPI protegido e fechado.

Nenhum achado P0/P1/P2 foi identificado.

## Limites registrados

- `PendingProfileApiTests.cs`: `Task.WhenAll` verifica resultados 201/409 e uma linha, mas não força que os INSERTs coincidam simultaneamente. Não afirmar interleaving determinístico.
- `CreatePendingProfile.cs`: cancelamento é propagado e o wrapper faz rollback ao dispor, mas não há cenário A1 dedicado que cancele entre INSERT e commit. Testes antigos não substituem essa evidência específica.
- O teste de OpenAPI verifica a operação A1; não demonstra equivalência integral com o documento design-first, que também descreve endpoints futuros.
- Configuração real/segredos, sessão persistente S1-05, integração de frontend e deploy ficam fora desta aprovação.

A revisão autoriza somente a integração técnica do snapshot A1 em `develop`, após confirmar checkout limpo, árvore imutável e gates aplicáveis. Não aprova S1-04A2, MVP, sprint completa, `main` ou deploy.

## Integração local

- Branch de feature: `feature/s1-04a-pending-profiles`, commit `9be100d`.
- Merge local em `develop`: `8ec47d9`.
- Árvore do merge e árvore da feature revisada coincidem: `aa6e7922171782d7d0962e522560b243cfe5d1b8`.
- CI remoto Quality #13, run `37553300673`, passou Backend e Frontend para o commit `63a31135ac952d5cec8941374cd87775aa15aa96` (push do merge/documentação). Main não foi alterada.
