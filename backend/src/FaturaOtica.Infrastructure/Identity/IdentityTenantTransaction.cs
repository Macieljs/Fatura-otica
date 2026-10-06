using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace FaturaOtica.Infrastructure.Identity;

public sealed class IdentityTenantTransaction : IAsyncDisposable
{
    private readonly IdentityDbContext context;
    private readonly IDbContextTransaction transaction;
    private bool completed;
    private bool disposed;

    private IdentityTenantTransaction(IdentityDbContext context, IDbContextTransaction transaction)
    {
        this.context = context;
        this.transaction = transaction;
    }

    public static async Task<IdentityTenantTransaction> BeginAsync(IdentityDbContext context,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(context);
        cancellationToken.ThrowIfCancellationRequested();
        if (context.Database.CurrentTransaction is not null || context.TenantTransactionScope is not null)
            throw new InvalidOperationException("A tenant transaction is already active.");

        var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken)
            .ConfigureAwait(false);
        try
        {
            await context.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT set_config('app.tenant_id', {context.ConfiguredTenantId.ToString()}, true)", cancellationToken)
                .ConfigureAwait(false);
            cancellationToken.ThrowIfCancellationRequested();
            var wrapper = new IdentityTenantTransaction(context, transaction);
            context.TenantTransactionScope = wrapper;
            return wrapper;
        }
        catch
        {
            try
            {
                await transaction.RollbackAsync(CancellationToken.None).ConfigureAwait(false);
            }
            finally
            {
                await transaction.DisposeAsync().ConfigureAwait(false);
            }
            throw;
        }
    }

    internal bool IsValidFor(IdentityDbContext candidate)
        => !completed && !disposed && ReferenceEquals(context, candidate) &&
           ReferenceEquals(transaction, candidate.Database.CurrentTransaction) &&
           transaction.GetDbTransaction().IsolationLevel == IsolationLevel.ReadCommitted;

    public async Task CommitAsync(CancellationToken cancellationToken = default)
    {
        if (!IsValidFor(context))
            throw new InvalidOperationException("The tenant transaction is no longer active.");
        try
        {
            await transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
            completed = true;
            context.TenantTransactionScope = null;
        }
        catch
        {
            await DisposeAsync().ConfigureAwait(false);
            throw;
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (disposed)
            return;
        disposed = true;
        try
        {
            if (!completed && ReferenceEquals(transaction, context.Database.CurrentTransaction))
                await transaction.RollbackAsync(CancellationToken.None).ConfigureAwait(false);
        }
        finally
        {
            if (ReferenceEquals(context.TenantTransactionScope, this))
                context.TenantTransactionScope = null;
            await transaction.DisposeAsync().ConfigureAwait(false);
        }
    }
}
