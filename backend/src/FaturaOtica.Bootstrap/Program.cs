using System.Data.Common;
using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

if (args.Length != 1 || args[0] is not ("bootstrap-owner" or "issue-owner-activation"))
{
    Console.Error.WriteLine("Uso: dotnet run --project backend/src/FaturaOtica.Bootstrap -- bootstrap-owner | issue-owner-activation");
    return 2;
}

using var cancellation = new CancellationTokenSource();
Console.CancelKeyPress += (_, eventArgs) => { eventArgs.Cancel = true; cancellation.Cancel(); };
try
{
    if (!Guid.TryParse(Required("Identity__TenantId"), out var tenant) || tenant == Guid.Empty)
        throw new InvalidOperationException("TenantId must be a nonempty UUID.");
    // Deliberately no fallback to the API runtime or migrations connection.
    var connection = Required("ConnectionStrings__IdentityBootstrap");
    var options = new DbContextOptionsBuilder<IdentityDbContext>().UseNpgsql(connection).Options;
    await using var context = new IdentityDbContext(options, tenant);
    if (args[0] == "issue-owner-activation")
    {
        if (!Guid.TryParse(Required("Identity__OwnerUserId"), out var target) || target == Guid.Empty)
            throw new InvalidOperationException("OwnerUserId must be a nonempty UUID.");
        var origin = new Uri(Required("Identity__ActivationOrigin"), UriKind.Absolute);
        if ((origin.Scheme != Uri.UriSchemeHttps && !(origin.Scheme == Uri.UriSchemeHttp && origin.IsLoopback)) ||
            origin.AbsolutePath != "/" || origin.Query.Length != 0 || origin.Fragment.Length != 0 || origin.UserInfo.Length != 0)
            throw new InvalidOperationException("ActivationOrigin must be an HTTPS origin, or HTTP loopback for local development.");
        var secret = await new IdentitySessionService(context, new IdentityCredentialHasher())
            .IssueInitialOwnerActivationAsync(target, cancellation.Token);
        if (secret is null) throw new InvalidOperationException("Only the pending bootstrapped Owner can receive this activation.");
        Console.WriteLine($"Expira em: {secret.ExpiresAt:O}");
        Console.WriteLine($"{origin.GetLeftPart(UriPartial.Authority)}/ativar-conta#token={Uri.EscapeDataString(secret.Token)}");
        return 0;
    }
    var tenantName = Required("Identity__TenantName");
    var ownerName = Required("Identity__OwnerName");
    var email = Required("Identity__OwnerEmail");
    var userId = await new PostgreSqlOwnerBootstrapper(context).ProvisionAsync(
        tenantName, ownerName, email, cancellation.Token);
    Console.WriteLine($"Owner pendente criado: {userId}. A senha será definida pelo fluxo de ativação.");
    return 0;
}
catch (OperationCanceledException)
{
    Console.Error.WriteLine("Inicialização cancelada; nenhuma transação incompleta foi confirmada.");
    return 130;
}
catch (Exception error) when (error is ArgumentException or InvalidOperationException or DbException or DbUpdateException or TimeoutException)
{
    // Never echo database exceptions, configuration values or credential-bearing connection strings.
    Console.Error.WriteLine("Inicialização recusada. Verifique configuração, migrations, privilégios e se já existe um Owner. Nenhuma senha foi criada.");
    return 1;
}

static string Required(string key)
    => !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(key))
        ? Environment.GetEnvironmentVariable(key)!
        : throw new InvalidOperationException($"Missing configuration: {key}");
