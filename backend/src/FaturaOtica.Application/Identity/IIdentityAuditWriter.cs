using FaturaOtica.Domain.Identity;

namespace FaturaOtica.Application.Identity;

public interface IIdentityAuditWriter
{
    ValueTask AppendAsync(IdentityAuditEvent auditEvent, CancellationToken cancellationToken = default);
}
