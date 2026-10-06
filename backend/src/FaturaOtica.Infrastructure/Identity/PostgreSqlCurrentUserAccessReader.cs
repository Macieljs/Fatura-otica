using FaturaOtica.Application.Identity;
using FaturaOtica.Domain.Identity;
using Microsoft.EntityFrameworkCore;

namespace FaturaOtica.Infrastructure.Identity;

public sealed class PostgreSqlCurrentUserAccessReader : ICurrentUserAccessReader
{
    private readonly IdentityDbContext context;

    public PostgreSqlCurrentUserAccessReader(IdentityDbContext context)
    {
        ArgumentNullException.ThrowIfNull(context);
        this.context = context;
    }

    public async ValueTask<UserAccessSnapshot?> GetAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (userId == Guid.Empty)
            return null;
        if (context.Database.CurrentTransaction is not null || context.TenantTransactionScope is not null)
        {
            if (context.TenantTransactionScope?.IsValidFor(context) != true)
                throw new InvalidOperationException("The reader requires a validated tenant transaction.");
            return await ReadSnapshotAsync(userId, cancellationToken).ConfigureAwait(false);
        }

        await using var scope = await IdentityTenantTransaction.BeginAsync(context, cancellationToken).ConfigureAwait(false);
        var snapshot = await ReadSnapshotAsync(userId, cancellationToken).ConfigureAwait(false);
        await scope.CommitAsync(cancellationToken).ConfigureAwait(false);
        return snapshot;
    }

    private async Task<UserAccessSnapshot?> ReadSnapshotAsync(Guid userId, CancellationToken cancellationToken)
    {
        // Flatten both optional collections in one SQL statement. Projection excludes credentials.
        var rows = await (
            from user in context.Users.AsNoTracking()
            where user.Id == userId
            from role in context.TenantRoles.AsNoTracking()
                .Where(role => role.UserId == user.Id && role.TenantId == user.TenantId && role.Active)
                .DefaultIfEmpty()
            from grant in (
                from grant in context.BranchGrants.AsNoTracking()
                join branch in context.Branches.AsNoTracking()
                    on new { grant.TenantId, Id = grant.BranchId } equals new { branch.TenantId, branch.Id }
                where grant.UserId == user.Id && grant.TenantId == user.TenantId && grant.Active && branch.Active
                select grant).DefaultIfEmpty()
            select new
            {
                user.Id,
                user.TenantId,
                user.Status,
                TenantRole = (AccessRole?)role.Role,
                BranchId = (Guid?)grant.BranchId,
                BranchRole = (AccessRole?)grant.Role,
            }).AsSingleQuery().ToListAsync(cancellationToken).ConfigureAwait(false);

        if (rows.Count == 0)
            return null;
        var first = rows[0];
        var roles = rows.Where(row => row.TenantRole.HasValue).Select(row => row.TenantRole!.Value).Distinct().ToArray();
        var grants = rows.Where(row => row.BranchId.HasValue && row.BranchRole.HasValue)
            .Select(row => new BranchGrant(first.TenantId, row.BranchId!.Value, row.BranchRole!.Value)).Distinct().ToArray();
        return new UserAccessSnapshot(first.Id, first.TenantId, first.Status, roles, grants);
    }
}
