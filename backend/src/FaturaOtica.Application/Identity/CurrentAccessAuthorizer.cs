using FaturaOtica.Domain.Identity;

namespace FaturaOtica.Application.Identity;

public interface ICurrentUserAccessReader
{
    ValueTask<UserAccessSnapshot?> GetAsync(Guid userId, CancellationToken cancellationToken = default);
}

public sealed class CurrentAccessAuthorizer
{
    private readonly ICurrentUserAccessReader reader;
    private readonly Guid configuredTenantId;

    public CurrentAccessAuthorizer(ICurrentUserAccessReader reader, Guid configuredTenantId)
    {
        ArgumentNullException.ThrowIfNull(reader);
        this.reader = reader;
        this.configuredTenantId = configuredTenantId;
    }

    public async ValueTask<AccessDecision> AuthorizeAsync(Guid userId, AccessAction permission,
        BranchScope? targetBranch = null, CancellationToken cancellationToken = default)
    {
        if (userId == Guid.Empty || configuredTenantId == Guid.Empty)
            return new(false, AccessDenialReason.InvalidContext);

        var snapshot = await reader.GetAsync(userId, cancellationToken).ConfigureAwait(false);
        cancellationToken.ThrowIfCancellationRequested();
        if (snapshot is null)
            return new(false, AccessDenialReason.InactiveUser);
        if (snapshot.UserId != userId)
            return new(false, AccessDenialReason.InvalidContext);

        return AccessPolicy.Evaluate(snapshot, configuredTenantId, permission, targetBranch);
    }
}
