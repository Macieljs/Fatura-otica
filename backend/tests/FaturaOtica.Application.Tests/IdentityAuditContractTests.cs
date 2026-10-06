using FaturaOtica.Application.Identity;
using FaturaOtica.Domain.Identity;

namespace FaturaOtica.Application.Tests;

public sealed class IdentityAuditContractTests
{
    [Fact]
    public void AuditWriter_ContratoAppend_TipadoSemPayloadLivreOuCredenciais()
    {
        var method = Assert.Single(typeof(IIdentityAuditWriter).GetMethods());
        Assert.Equal("AppendAsync", method.Name);
        Assert.Equal(typeof(ValueTask), method.ReturnType);
        Assert.Equal(new[] { typeof(IdentityAuditEvent), typeof(CancellationToken) }, method.GetParameters().Select(x => x.ParameterType));
    }
}
