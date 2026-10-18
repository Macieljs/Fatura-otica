using FaturaOtica.Infrastructure.Identity;

namespace FaturaOtica.Integration.Tests;

public sealed class IdentityCredentialsTests
{
    [Fact]
    public async Task Hash_SamePassword_UsesRandomSaltAndVerifies()
    {
        var hasher = new IdentityCredentialHasher();
        var first = await hasher.HashAsync("safe-password-123");
        var second = await hasher.HashAsync("safe-password-123");
        Assert.NotEqual(first, second);
        Assert.StartsWith("$argon2id$v=19$m=19456,t=2,p=1$", first);
        Assert.True(await hasher.VerifyAsync("safe-password-123", first));
        Assert.False(await hasher.VerifyAsync("wrong-password", first));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(11)]
    [InlineData(129)]
    public async Task Hash_InvalidPasswordLength_Rejects(int length)
        => await Assert.ThrowsAsync<ArgumentException>(() => new IdentityCredentialHasher().HashAsync(new string('x', length)));

    [Theory]
    [InlineData("test-only-hash")]
    [InlineData("$argon2id$v=19$m=2147483647,t=3,p=4$AA==$AA==")]
    [InlineData("$argon2id$v=16$m=65536,t=3,p=4$AA==$AA==")]
    public async Task Verify_UntrustedHash_RejectsWithoutAllocatingWork(string hash)
        => Assert.False(await new IdentityCredentialHasher().VerifyAsync("safe-password-123", hash));

    [Fact]
    public void Token_RandomSecret_OnlyHashIsStable()
    {
        var first = IdentitySecrets.Generate();
        var second = IdentitySecrets.Generate();
        Assert.Equal(43, first.Length);
        Assert.NotEqual(first, second);
        Assert.Equal(64, IdentitySecrets.Hash(first).Length);
        Assert.NotEqual(first, IdentitySecrets.Hash(first));
    }
}
