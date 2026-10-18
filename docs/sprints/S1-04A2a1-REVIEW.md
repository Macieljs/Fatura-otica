# S1-04A2a1 — revisão independente

Data: 2026-10-07. Parecer: **aprovado tecnicamente no recorte local**. Revisão somente leitura; sem alterações de produção, commit, merge ou início de A2a2.

## Resultado

Os achados anteriores foram resolvidos:

- Os 21 testes Domain alcançam a factory e o construtor, validam UUIDv7/UTC/escopo e recusam autor nulo em ações humanas.
- Os 10 testes do writer usam `AppendAsync` real com PostgreSQL/runtime, validam autor NULL persistido para BootstrapOwner e autor humano para GrantAccess, e cobrem wrapper tenant validado, commit, rollback, ausência de autocommit, transação externa e tenant divergente.
- O contrato `backend/docs/IDENTITY_AUDIT.md` reflete a exceção estrita de autoria.
- Migration, mapping, snapshot e designer são coerentes. Somente BootstrapOwner permite autor nulo, exige Owner e filial nula, e o índice parcial mantém um bootstrap por tenant. O ledger existente, FKs, RLS e triggers permanecem preservados. Down impede perda de eventos.

Evidências focadas: schema/migration **12/12**, Domain **21/21**, writer PostgreSQL **10/10**; zero falhas ou testes ignorados nas execuções Green. TRX e logs estão em `artifacts/dev/s1-04a2a1-schema-green/` e `artifacts/qa/s1-04a2a1-direct/`.

## Identidade e limites

A revisão confirmou os testes diretos com hash/snapshot de testes estável `79f8efebf76600fc7ac163a79a67b82db65c625904a901c2a9bdfd579164ba26`; o snapshot documental observado na revisão foi `e37c083ce6b1b8f8e3459abd8c9bee018b90bf1fdc0f8e264bca0e2275f6bcb4`. A correção posterior do relatório de implementação e dos arquivos de status foi documental; nenhum código/teste foi alterado depois da revisão.

Não foram executados gate Feature, cobertura Domain nem downgrade/Down. A aprovação local deste incremento não significa integração em `develop`, conclusão de A2a, sprint ou MVP. A2a2 permanece o próximo incremento.
