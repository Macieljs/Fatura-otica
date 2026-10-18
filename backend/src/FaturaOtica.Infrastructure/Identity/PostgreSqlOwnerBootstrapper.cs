using System.Net.Mail;
using FaturaOtica.Domain.Identity;
using Microsoft.EntityFrameworkCore;

namespace FaturaOtica.Infrastructure.Identity;

public sealed class PostgreSqlOwnerBootstrapper(IdentityDbContext context)
{
    public async Task<Guid> ProvisionAsync(string tenantName, string ownerName, string ownerEmail,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantName);
        ArgumentException.ThrowIfNullOrWhiteSpace(ownerName);
        ArgumentException.ThrowIfNullOrWhiteSpace(ownerEmail);
        var email = ownerEmail.Trim();
        if (!MailAddress.TryCreate(email, out var address) || address.Address != email ||
            email.Contains('\r') || email.Contains('\n'))
            throw new ArgumentException("A valid Owner email is required.", nameof(ownerEmail));
        cancellationToken.ThrowIfCancellationRequested();

        // Installation uses a dedicated DML role, never migration/owner credentials.
        var privileged = await context.Database.SqlQuery<bool>($"""
            SELECT (r.rolsuper OR r.rolbypassrls OR r.rolcreaterole OR r.rolcreatedb
              OR has_schema_privilege(current_user, 'identity', 'CREATE')
              OR EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                WHERE n.nspname='identity' AND pg_has_role(current_user, c.relowner, 'MEMBER')))
              AS "Value"
            FROM pg_roles r WHERE r.rolname=current_user
            """).SingleAsync(cancellationToken).ConfigureAwait(false);
        if (privileged)
            throw new InvalidOperationException("Bootstrap requires a dedicated role without ownership, DDL or RLS bypass.");

        await using var transaction = await IdentityTenantTransaction.BeginAsync(context, cancellationToken).ConfigureAwait(false);
        var tenant = context.ConfiguredTenantId;
        // Held until commit/rollback, including when the tenant row does not exist yet.
        await context.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT pg_advisory_xact_lock(hashtextextended({tenant.ToString()}, 0))", cancellationToken).ConfigureAwait(false);
        if (await context.TenantRoles.AnyAsync(role => role.Role == AccessRole.Owner, cancellationToken).ConfigureAwait(false) ||
            await context.AuditEvents.AnyAsync(audit => audit.Action == IdentityAuditAction.BootstrapOwner, cancellationToken).ConfigureAwait(false))
            throw new InvalidOperationException("The tenant has already been initialized.");

        var now = DateTimeOffset.UtcNow;
        if (!await context.Tenants.AnyAsync(row => row.Id == tenant, cancellationToken).ConfigureAwait(false))
            context.Tenants.Add(new IdentityTenant { Id = tenant, Name = tenantName.Trim(), CreatedAt = now });
        email = await context.Database.SqlQuery<string>($"SELECT lower(btrim({email})) AS \"Value\"")
            .SingleAsync(cancellationToken).ConfigureAwait(false);
        var userId = Guid.CreateVersion7();
        context.Users.Add(new IdentityUser
        {
            Id = userId, TenantId = tenant, Name = ownerName.Trim(), EmailNormalized = email,
            Status = UserStatus.Pending, PasswordHash = null, CreatedAt = now,
        });
        context.TenantRoles.Add(new IdentityTenantRole
        {
            Id = Guid.CreateVersion7(), TenantId = tenant, UserId = userId,
            Role = AccessRole.Owner, Active = true, CreatedAt = now,
        });
        await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        await new PostgreSqlIdentityAuditWriter(context).AppendAsync(
            IdentityAuditEvent.CreateBootstrapOwner(tenant, userId, now), cancellationToken).ConfigureAwait(false);
        await transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
        return userId;
    }
}
