using FaturaOtica.Domain.Identity;
using FluentValidation;

namespace FaturaOtica.Application.Identity;

public sealed record CreatePendingProfileCommand(string? Email, string? Name, Guid BranchId);
public sealed record PendingProfileData(Guid Id, Guid TenantId, string Name, string Email,
    Guid ActorUserId, Guid CreatedForBranchId, DateTimeOffset CreatedAt);
public enum PendingProfileOutcome { Created, InvalidInput, AccessDenied, EmailAlreadyExists }
public sealed record CreatePendingProfileResult(PendingProfileOutcome Outcome,
    PendingProfileData? Profile = null, IDictionary<string, string[]>? Errors = null);

public interface IPendingProfileTransaction : IAsyncDisposable
{
    Task CommitAsync(CancellationToken cancellationToken);
}

public interface IPendingProfileStore
{
    Guid ConfiguredTenantId { get; }
    Task<IPendingProfileTransaction> BeginAsync(CancellationToken cancellationToken);
    Task<bool> IsActiveBranchAsync(Guid branchId, CancellationToken cancellationToken);
    Task<string> NormalizeEmailAsync(string email, CancellationToken cancellationToken);
    Task<bool> TryInsertAsync(PendingProfileData profile, CancellationToken cancellationToken);
}

public sealed class CreatePendingProfileValidator : AbstractValidator<CreatePendingProfileCommand>
{
    public CreatePendingProfileValidator()
    {
        RuleFor(command => command.Email).NotEmpty().EmailAddress().OverridePropertyName("email");
        RuleFor(command => command.Name).Must(name => !string.IsNullOrWhiteSpace(name)).OverridePropertyName("name");
        RuleFor(command => command.BranchId).NotEmpty().OverridePropertyName("branchId");
    }
}

public sealed class CreatePendingProfileHandler(IPendingProfileStore store, CurrentAccessAuthorizer authorizer,
    IValidator<CreatePendingProfileCommand> validator, TimeProvider clock)
{
    // actorUserId is supplied by the validated principal adapter, never by the public DTO.
    public async Task<CreatePendingProfileResult> HandleAsync(CreatePendingProfileCommand command,
        Guid actorUserId, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);
        cancellationToken.ThrowIfCancellationRequested();
        var input = command with { Email = command.Email?.Trim(), Name = command.Name?.Trim() };
        var validation = await validator.ValidateAsync(input, cancellationToken).ConfigureAwait(false);
        if (!validation.IsValid)
            return new(PendingProfileOutcome.InvalidInput, Errors: validation.ToDictionary());
        if (actorUserId == Guid.Empty || store.ConfiguredTenantId == Guid.Empty)
            return new(PendingProfileOutcome.AccessDenied);

        await using var transaction = await store.BeginAsync(cancellationToken).ConfigureAwait(false);
        var branch = new BranchScope(store.ConfiguredTenantId, input.BranchId);
        var access = await authorizer.AuthorizeAsync(actorUserId, AccessAction.CreatePendingProfile,
            branch, cancellationToken).ConfigureAwait(false);
        if (!access.Allowed || !await store.IsActiveBranchAsync(input.BranchId, cancellationToken).ConfigureAwait(false))
            return new(PendingProfileOutcome.AccessDenied);

        var email = await store.NormalizeEmailAsync(input.Email!, cancellationToken).ConfigureAwait(false);
        var profile = new PendingProfileData(Guid.CreateVersion7(), store.ConfiguredTenantId,
            input.Name!, email, actorUserId, input.BranchId, clock.GetUtcNow());
        if (!await store.TryInsertAsync(profile, cancellationToken).ConfigureAwait(false))
            return new(PendingProfileOutcome.EmailAlreadyExists);

        await transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
        return new(PendingProfileOutcome.Created, profile);
    }
}
