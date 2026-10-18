using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

namespace FaturaOtica.Infrastructure.Identity;

public sealed class IdentityCredentialHasher
{
    // Fixed profile prevents a stored/compromised PHC string requesting unbounded work.
    // OWASP Password Storage Cheat Sheet: Argon2id 19 MiB, t=2, p=1.
    private const string Prefix = "$argon2id$v=19$m=19456,t=2,p=1$";
    private readonly string profilePrefix = Prefix;
    public async Task<string> HashAsync(string password)
    {
        if (password is null || password.Length is < 12 or > 128)
            throw new ArgumentException("Password must have between 12 and 128 characters.", nameof(password));
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = await DeriveAsync(password, salt).ConfigureAwait(false);
        return profilePrefix + Convert.ToBase64String(salt) + "$" + Convert.ToBase64String(hash);
    }

    public async Task<bool> VerifyAsync(string password, string? encoded)
    {
        if (password is null || password.Length is < 12 or > 128 || encoded is null ||
            encoded.Length > 150 || !encoded.StartsWith(profilePrefix, StringComparison.Ordinal)) return false;
        var parts = encoded[profilePrefix.Length..].Split('$');
        if (parts.Length != 2) return false;
        byte[] salt; byte[] expected;
        try { salt = Convert.FromBase64String(parts[0]); expected = Convert.FromBase64String(parts[1]); }
        catch (FormatException) { return false; }
        if (salt.Length != 16 || expected.Length != 32) return false;
        var actual = await DeriveAsync(password, salt).ConfigureAwait(false);
        return CryptographicOperations.FixedTimeEquals(expected, actual);
    }

    private static async Task<byte[]> DeriveAsync(string password, byte[] salt)
    {
        var bytes = Encoding.UTF8.GetBytes(password);
        try
        {
            using var argon = new Argon2id(bytes) { Salt = salt, MemorySize = 19456, Iterations = 2, DegreeOfParallelism = 1 };
            return await argon.GetBytesAsync(32).ConfigureAwait(false);
        }
        finally { CryptographicOperations.ZeroMemory(bytes); }
    }
}

public static class IdentitySecrets
{
    public static string Generate() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    public static string Hash(string raw) => Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(raw)));
}
