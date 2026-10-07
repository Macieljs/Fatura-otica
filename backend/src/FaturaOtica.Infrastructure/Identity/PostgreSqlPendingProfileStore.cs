using FaturaOtica.Application.Identity;
using FaturaOtica.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FaturaOtica.Infrastructure.Identity;

public sealed class PostgreSqlPendingProfileStore(IdentityDbContext context) : IPendingProfileStore
{
    public Guid ConfiguredTenantId => context.ConfiguredTenantId;

    public async Task<IPendingProfileTransaction> BeginAsync(CancellationToken cancellationToken)
        => new ProfileTransaction(await IdentityTenantTransaction.BeginAsync(context, cancellationToken).ConfigureAwait(false));

    public Task<bool> IsActiveBranchAsync(Guid branchId, CancellationToken cancellationToken)
        => context.Branches.AsNoTracking().AnyAsync(branch => branch.Id == branchId && branch.Active, cancellationToken);

    public Task<string> NormalizeEmailAsync(string email, CancellationToken cancellationToken)
        // Use the database collation that enforces ck_usuarios_email_normalizado, including Unicode.
        => context.Database.SqlQuery<string>($"SELECT lower(btrim({email})) AS \"Value\"")
            .SingleAsync(cancellationToken);

    public async Task<bool> TryInsertAsync(PendingProfileData profile, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(profile);
        if (profile.TenantId != context.ConfiguredTenantId || context.TenantTransactionScope?.IsValidFor(context) != true)
            throw new InvalidOperationException("Profile insertion requires the current tenant transaction.");
        context.Users.Add(new IdentityUser
        {
            Id = profile.Id, TenantId = context.ConfiguredTenantId,
            Name = profile.Name, EmailNormalized = profile.Email, Status = UserStatus.Pending,
            PasswordHash = null, CreatedBy = profile.ActorUserId, CreatedAt = profile.CreatedAt,
            CreatedForBranchId = profile.CreatedForBranchId,
        });
        try
        {
            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            return true;
        }
        catch (DbUpdateException error) when (error.InnerException is PostgresException
            { SqlState: PostgresErrorCodes.UniqueViolation, ConstraintName: "ux_usuarios_tenant_id_email_normalizado" })
        {
            // The caller disposes the transaction and scoped context; no retries with tracked rows.
            return false;
        }
    }

    private sealed class ProfileTransaction(IdentityTenantTransaction transaction) : IPendingProfileTransaction
    {
        public Task CommitAsync(CancellationToken cancellationToken) => transaction.CommitAsync(cancellationToken);
        public ValueTask DisposeAsync() => transaction.DisposeAsync();
    }
}
