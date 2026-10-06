using FaturaOtica.Application.Identity;
using FaturaOtica.Domain.Identity;

namespace FaturaOtica.Application.Tests;

public sealed class CurrentAccessAuthorizerTests
{
    private static readonly Guid Tenant = Guid.NewGuid();
    private static readonly Guid UserId = Guid.NewGuid();
    private static readonly Guid BranchId = Guid.NewGuid();

    [Fact]
    public async Task AuthorizeAsync_ConcessaoRevogada_LêSnapshotAtualENegaProximaOperacao()
    {
        var reader = new MutableReader { Snapshot = Seller() };
        var sut = new CurrentAccessAuthorizer(reader, Tenant);
        var first = await sut.AuthorizeAsync(UserId, AccessAction.OperateBranch, new(Tenant, BranchId));
        reader.Snapshot = Seller() with { BranchGrants = [] };
        var second = await sut.AuthorizeAsync(UserId, AccessAction.OperateBranch, new(Tenant, BranchId));
        Assert.True(first.Allowed);
        Assert.False(second.Allowed);
        Assert.Equal(AccessDenialReason.BranchNotGranted, second.Reason);
        Assert.Equal(2, reader.Calls);
    }

    [Fact]
    public async Task AuthorizeAsync_BloqueioDuranteSessao_NegaProximaOperacao()
    {
        var reader = new MutableReader { Snapshot = Seller() };
        var sut = new CurrentAccessAuthorizer(reader, Tenant);
        Assert.True((await sut.AuthorizeAsync(UserId, AccessAction.ReadOwnProfile)).Allowed);
        reader.Snapshot = Seller() with { Status = UserStatus.Blocked };
        var result = await sut.AuthorizeAsync(UserId, AccessAction.ReadOwnProfile);
        Assert.False(result.Allowed);
        Assert.Equal(AccessDenialReason.InactiveUser, result.Reason);
        Assert.Equal(2, reader.Calls);
    }

    [Fact]
    public async Task AuthorizeAsync_UsuarioAusente_Nega()
    {
        var sut = new CurrentAccessAuthorizer(new MutableReader(), Tenant);
        var result = await sut.AuthorizeAsync(UserId, AccessAction.ReadOwnProfile);
        Assert.False(result.Allowed);
        Assert.Equal(AccessDenialReason.InactiveUser, result.Reason);
    }

    [Fact]
    public async Task AuthorizeAsync_ReaderRetornaOutraIdentidade_Nega()
    {
        var reader = new MutableReader { Snapshot = Seller() with { UserId = Guid.NewGuid() } };
        var result = await new CurrentAccessAuthorizer(reader, Tenant).AuthorizeAsync(UserId, AccessAction.ReadOwnProfile);
        Assert.False(result.Allowed);
        Assert.Equal(AccessDenialReason.InvalidContext, result.Reason);
    }

    [Fact]
    public async Task AuthorizeAsync_ReaderRetornaOutroTenant_Nega()
    {
        var reader = new MutableReader { Snapshot = Seller() with { TenantId = Guid.NewGuid(), BranchGrants = [] } };
        var result = await new CurrentAccessAuthorizer(reader, Tenant).AuthorizeAsync(UserId, AccessAction.ReadOwnProfile);
        Assert.False(result.Allowed);
        Assert.Equal(AccessDenialReason.TenantMismatch, result.Reason);
    }

    [Fact]
    public async Task AuthorizeAsync_Cancelamento_PropagaSemAutorizar()
    {
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        var reader = new MutableReader { Snapshot = Seller() };
        await Assert.ThrowsAnyAsync<OperationCanceledException>(async () =>
            await new CurrentAccessAuthorizer(reader, Tenant).AuthorizeAsync(UserId, AccessAction.ReadOwnProfile, cancellationToken: cancellation.Token));
        Assert.Equal(cancellation.Token, reader.LastCancellation);
    }

    private static UserAccessSnapshot Seller() => new(UserId, Tenant, UserStatus.Active, [], [new(Tenant, BranchId, AccessRole.Seller)]);

    private sealed class MutableReader : ICurrentUserAccessReader
    {
        public UserAccessSnapshot? Snapshot { get; set; }
        public int Calls { get; private set; }
        public CancellationToken LastCancellation { get; private set; }

        public ValueTask<UserAccessSnapshot?> GetAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            Calls++;
            LastCancellation = cancellationToken;
            cancellationToken.ThrowIfCancellationRequested();
            Assert.Equal(UserId, userId);
            return ValueTask.FromResult(Snapshot);
        }
    }
}
