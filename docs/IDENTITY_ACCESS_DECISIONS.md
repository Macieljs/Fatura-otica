# Decisões de acesso e responsabilidade comercial

Data: 2026-10-06.
Fonte: definições do usuário durante o refinamento do escopo.
Status: decisões abaixo confirmadas; pontos em aberto continuam pendentes. Este registro não aprova integralmente o PRD-01 ainda em rascunho.

## Empresa e acesso

- Fase atual: URL única. Subdomínio fica para evolução futura conforme necessidade dos clientes.
- A forma de informar/selecionar a empresa no login ainda precisa ser fechada; código da empresa é uma proposta.
- O backend acompanha os fluxos e telas existentes do frontend. Mapear telas, ações e estados para contratos e critérios de aceite antes de implementar.
- Filiais autorizadas limitam o escopo de cada usuário. Permissão para consultar OS de equipe não concede acesso a filiais adicionais.

## OS e metas

- O vendedor realiza e cadastra a OS.
- Vendedores podem consultar todas as OS das filiais às quais têm acesso, permitindo continuidade quando outro vendedor faltar.
- Metas e atribuição comercial contabilizam a OS para o vendedor que realizou a venda. Consultar ou acompanhar a OS não transfere o crédito.
- Recomenda-se distinguir responsável comercial, autor do cadastro e autores das ações/histórico. São conceitos distintos mesmo quando inicialmente a mesma pessoa preenche os três.
- Ainda definir quais ações de alteração/andamento outro vendedor pode realizar e como tratar correção de responsável, cancelamento, devolução e comissionamento.

## Cadastro de usuários e proteção de credenciais

- O gestor pode cadastrar usuários.
- Senhas e demais credenciais devem ficar protegidas; cadastro não concede leitura de senha nem alteração arbitrária de credenciais.
- Somente o admin do sistema pode alterar os acessos (papéis e filiais).
- Criar usuário e conceder/alterar acesso são capacidades distintas. Falta definir como o primeiro acesso será autorizado após cadastro pelo gestor.
- Proposta técnica: ativação/recuperação com token de uso único para o próprio usuário definir sua senha, sem expor senha ao gestor.
- Confirmado: admin do sistema é o administrador da empresa cliente com permissão específica de gestão de acessos. Essa permissão atua somente dentro do próprio tenant; não concede administração da plataforma ou acesso a outras empresas.

## Gestor de filial e dono

- O gestor de filial pode consultar custo, margem e faturamento local conforme os fluxos já mapeados nas telas, respeitando suas filiais autorizadas.
- O dono pode operar nas filiais da sua empresa e não possui restrições operacionais por perfil dentro dela; inclui visão consolidada.
- A responsabilidade por suas decisões não remove validações de integridade, regras de negócio, histórico/auditoria ou isolamento entre empresas.
- A relação entre poderes do dono e a exclusividade do admin para alterar acessos precisa ser confirmada; não presumir que dono e admin são o mesmo papel.

## Cenários de aceite confirmados

1. Dado um vendedor autorizado à filial Centro, quando consultar a lista de OS, então visualiza as OS de todos os vendedores do Centro.
2. Dado um vendedor sem acesso à filial Shopping, quando tentar consultar uma OS do Shopping, então o acesso é negado.
3. Dada uma OS comercialmente atribuída à vendedora Ana, quando Bruno consultar ou acompanhar essa OS, então sua atribuição para metas permanece com Ana.
4. Dado um gestor com permissão de cadastro, quando cadastrar um usuário, então nenhuma senha/hash/token de credencial é exposto na resposta ou interface de gestão.
5. Dado um gestor sem papel de admin, quando tentar alterar os papéis ou filiais autorizadas de um usuário, então o acesso é negado pelo backend.
6. Dado um dono, quando operar ou consultar faturamento nas filiais da sua empresa, então o perfil permite as operações válidas; dados de outra empresa permanecem inacessíveis.

## Próximos refinamentos

- Definir se o dono recebe também a permissão específica de administrar acessos; o papel de dono tem acesso operacional amplo, mas a administração de acessos é uma capacidade separada.
- Fluxo cadastro → autorização inicial de acesso → ativação.
- Permissões para alteração/andamento de OS criada por outro vendedor.
- Fonte e regras de cálculo de metas/comissões, incluindo exceções.
- Inventário dos fluxos frontend que servirá como base dos contratos backend.


## Conclusão da OS — definição confirmada

- Finalizar a OS significa registrar a entrega ao cliente, última etapa do andamento.
- OS pronta/aguardando retirada ainda não está concluída.
- O responsável pela conclusão é o usuário que registra a entrega; essa ação não transfere a atribuição comercial da venda.
- As etapas anteriores devem ser refinadas a partir das telas existentes. A sequência completa e suas transições ainda não estão aprovadas.
- Observação do frontend atual: a fila agrupa `aguardando_lab`, `surfacagem`, `controle_qualidade` e `pronto`; a tela de detalhes apresenta montagem e avanço para controle de qualidade. Esses agrupamentos visuais precisam ser reconciliados com os estados do domínio antes de implementar a máquina de estados.
- Proposta para o registro de entrega: OS, autor autenticado, data/hora do servidor e histórico da transição, preservando o vendedor da venda.
- Pontos pendentes: entrega com saldo devedor; identificação de quem retirou; entrega parcial; correção/reabertura de entrega; regras para assumir a continuidade antes de alterações.
