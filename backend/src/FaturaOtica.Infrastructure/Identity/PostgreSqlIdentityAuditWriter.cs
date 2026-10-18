using FaturaOtica.Application.Identity;
using FaturaOtica.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;

namespace FaturaOtica.Infrastructure.Identity;

public sealed class PostgreSqlIdentityAuditWriter : IIdentityAuditWriter
{
    private readonly IdentityDbContext context;

    public PostgreSqlIdentityAuditWriter(IdentityDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);
        this.context = context;
    }

    public async ValueTask AppendAsync(IdentityAuditEvent auditEvent, CancellationToken cancellationToken = default)
    {
        var scope = context.TenantTransactionScope;
        if (scope?.IsValidFor(context) != true)
            throw new InvalidOperationException("The audit writer requires a validated tenant transaction.");
        try
        {
            ArgumentNullException.ThrowIfNull(auditEvent);
            if (auditEvent.TenantId != context.ConfiguredTenantId)
                throw new InvalidOperationException("The audit event belongs to another tenant.");
            cancellationToken.ThrowIfCancellationRequested();
            var role = auditEvent.Role?.ToString();
            var actor = new NpgsqlParameter("actor", NpgsqlDbType.Uuid)
            {
                Value = (object?)auditEvent.ActorUserId ?? DBNull.Value,
            };
            await context.Database.ExecuteSqlInterpolatedAsync($"""
                INSERT INTO identity.auditoria
                    (id, tenant_id, autor_usuario_id, alvo_usuario_id, acao, ocorrido_em, papel, filial_id)
                VALUES ({auditEvent.Id}, {auditEvent.TenantId}, {actor}, {auditEvent.TargetUserId},
                    {auditEvent.Action.ToString()}, {auditEvent.OccurredAt}, {role}, {auditEvent.BranchId})
                """, cancellationToken).ConfigureAwait(false);
            cancellationToken.ThrowIfCancellationRequested();
        }
        catch
        {
            await scope.DisposeAsync().ConfigureAwait(false);
            throw;
        }
    }
}
