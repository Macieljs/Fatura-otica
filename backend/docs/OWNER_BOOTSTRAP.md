# Provisionamento do primeiro Owner

O console administrativo cria uma empresa (se ausente), um usuário `Pending`, seu papel `Owner` ativo e um evento `BootstrapOwner` numa transação. Não define senha nem habilita login antes da ativação. A API nunca executa esse provisionamento ao iniciar.

## Instalação

1. Aplicar as migrations versionadas com a conexão administrativa de migrations.
2. Configurar uma role dedicada de bootstrap: LOGIN, NOSUPERUSER, NOBYPASSRLS, NOCREATEDB, NOCREATEROLE, NOINHERIT; sem ownership nem permissão CREATE no schema `identity` e sem associação a roles donas das tabelas.
3. Conceder apenas conexão ao banco, USAGE no schema e os privilégios abaixo. Definir credenciais fora do repositório.

```sql
GRANT USAGE ON SCHEMA identity TO identity_bootstrap;
GRANT SELECT, INSERT ON identity.tenants, identity.usuarios,
    identity.papeis_usuarios, identity.auditoria TO identity_bootstrap;
```

O exemplo usa `identity_bootstrap` como nome da role criada pelo operador. Não conceder UPDATE/DELETE, ownership ou BYPASSRLS ao console.

## Configuração e comando

| Chave lógica | Variável de ambiente | Uso |
| --- | --- | --- |
| `Identity:TenantId` | `Identity__TenantId` | UUID não vazio da empresa |
| `Identity:TenantName` | `Identity__TenantName` | Nome usado somente se a empresa estiver ausente |
| `Identity:OwnerName` | `Identity__OwnerName` | Nome do primeiro dono |
| `Identity:OwnerEmail` | `Identity__OwnerEmail` | E-mail válido, normalizado pelo PostgreSQL |
| `ConnectionStrings:IdentityBootstrap` | `ConnectionStrings__IdentityBootstrap` | Conexão da role DML dedicada |

```powershell
dotnet run --project backend/src/FaturaOtica.Bootstrap -- bootstrap-owner
```

O console lê somente essas variáveis e não usa a conexão `ConnectionStrings__Identity` da API como alternativa. A saída bem-sucedida contém somente o ID do usuário e informa seu estado pendente; não há password/hash/token. Saídas: 0 sucesso, 1 configuração/banco/duplicata recusada, 2 comando inválido, 130 cancelamento.

## Garantias

- Lock transacional por tenant serializa instalações concorrentes mesmo antes de existir a empresa.
- Qualquer papel Owner (inclusive inativo) ou evento BootstrapOwner existente recusa repetição sem alterar dados.
- E-mail duplicado, falha de insert/auditoria ou cancelamento desfazem a unidade de trabalho inteira.
- RLS e o índice único parcial da auditoria continuam ativos; a conexão de banco é recusada se puder ignorá-los por privilégios administrativos/ownership.
- A inicialização preserva os demais tenants e o nome de uma empresa já existente.

## Ativar o primeiro Owner

Após criar o Owner, usar o comando administrativo separado abaixo. Ele só emite para o usuário Pending com papel Owner ativo e evento BootstrapOwner neste tenant; a conexão mantém as mesmas verificações de privilégios do provisionamento. Não permite redefinir a senha de um Owner já ativado.

Configurar `Identity__OwnerUserId` com o ID retornado e `Identity__ActivationOrigin` com a origem pública do frontend (HTTPS, ou HTTP loopback no desenvolvimento). Não são necessários nome/e-mail/tenantName para este comando.

```powershell
dotnet run --project backend/src/FaturaOtica.Bootstrap -- issue-owner-activation
```

A role dedicada também precisa `SELECT, INSERT, UPDATE ON identity.ativacoes` para emitir e revogar links anteriores. Não precisa UPDATE/DELETE da auditoria nem das contas. O console imprime a expiração e um link com segredo no fragmento. Esse comando tem saída sensível: entregar o link ao dono pelo canal combinado e não capturar stdout em logs públicos ou no repositório. Somente o hash fica no banco. Reemissão invalida links anteriores; expiração de 24 horas; uso único.

A conclusão ocorre pela API e define a senha escolhida pelo próprio dono. Filiais e concessões operacionais não são criadas implicitamente pelo console.
