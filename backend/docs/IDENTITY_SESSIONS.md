# Operação de identidade e sessões

A aplicação exige `Identity:TenantId`, `ConnectionStrings:Identity`, `Identity:Jwt:Issuer`, `Identity:Jwt:Audience`, `Identity:Jwt:SigningKey` e `Identity:Jwt:AllowedAlgorithms`. Não há credencial ou chave padrão. A conexão da API usa role DML sem propriedade, DDL ou BYPASSRLS; migrations usam credencial administrativa separada.

Configure `Identity:AllowedOrigins` com origens completas (por exemplo `https://erp.example.com`), sem barra final, caminho ou wildcard. GET `/api/v1/identity/csrf` exige Origin permitido e cookie refresh válido. POST refresh/logout exige também `X-CSRF-Token`. Cliente mantém JWT/CSRF em memória. Refresh permanece no cookie HttpOnly host-only, SameSite=Lax, Path=/api/v1/identity e Secure fora de Development. Respostas de identidade são no-store.

Browser mesma origem pode omitir Origin em GET: o proxy Next deve validar origem/referência e encaminhar a origem confiável ao backend no endpoint CSRF. Não liberar CORS wildcard ou confiar em cabeçalho de tenant/filial do cliente.

Rate limit do MVP: login e conclusão de ativação permitem 30 chamadas/minuto por IP visto pelo backend. CSRF, refresh e logout permitem 600 chamadas/minuto por IP, limitando também tentativas anônimas com cookies arbitrários. Os limitadores são locais à instância; em múltiplas instâncias, cada instância aplica seu próprio limite. A instalação por trás de um proxy compartilhado mantém um limite comum por rota para seus usuários; aumente ou substitua esses limites por uma política distribuída com IP original confiável antes de operação com alto volume.

No MVP: ativação expira em 24 horas, JWT em 15 minutos, família refresh tem expiração absoluta de sete dias. Rotação conserva histórico de gerações consumidas. Reutilização com CSRF válido revoga a família inteira, incluindo o JWT pelo sid. Logout revoga a família. Alteração de senha revoga todas as sessões do usuário. Bloqueio ou revogação de concessões vale na próxima operação porque o backend consulta direitos atuais.

Ativação é emitida por Owner ou AccessAdministrator atual; Admin não redefine credenciais de Owner/Admin. A resposta administrativa 202 expõe `{token,expiresAt}` uma vez para entrega manual. Nenhum token fica em claro no banco. Pending ativa pelo token; Active pode redefinir senha pelo mesmo fluxo autorizado; Blocked não desbloqueia por ativação. Senha: 12 a 128 caracteres, Argon2id, sal aleatório 16 bytes, saída 32 bytes, memória 19456 KiB, duas iterações e paralelismo um. O verificador aceita somente esse perfil limitado.

O Owner inicial é provisionado pelo comando explícito de bootstrap. Em seguida, `IssueInitialOwnerActivationAsync` permite emissão administrativa somente para o Pending Owner comprovado pelo evento BootstrapOwner no tenant configurado. Exige role DML e grava BootstrapOwnerActivation com autor de sistema nulo. Não há endpoint público para esse procedimento.

Fontes dos parâmetros: [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) e [API da biblioteca Konscious Argon2](https://github.com/kmaragon/Konscious.Security.Cryptography). SMTP e recuperação pública estão fora do MVP.
