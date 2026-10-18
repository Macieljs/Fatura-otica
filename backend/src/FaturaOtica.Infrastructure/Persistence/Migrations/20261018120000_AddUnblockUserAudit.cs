using FaturaOtica.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace FaturaOtica.Infrastructure.Persistence.Migrations;

[DbContext(typeof(IdentityDbContext))]
[Migration("20261018120000_AddUnblockUserAudit")]
public partial class AddUnblockUserAudit : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder) => ReplaceChecks(migrationBuilder, true);

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DO $$ BEGIN
                IF EXISTS (SELECT 1 FROM identity.auditoria WHERE acao = 'UnblockUser') THEN
                    RAISE EXCEPTION 'Cannot downgrade a ledger containing unblock events; preserve audit history';
                END IF;
            END $$;
            """);
        ReplaceChecks(migrationBuilder, false);
    }

    private static void ReplaceChecks(MigrationBuilder migrationBuilder, bool includeUnblock)
    {
        foreach (var name in new[] { "ck_auditoria_acao", "ck_auditoria_autoria", "ck_auditoria_escopo" })
            migrationBuilder.DropCheckConstraint(name, "auditoria", "identity");
        var actions = includeUnblock ? "'GrantAccess', 'RevokeAccess', 'BlockUser', 'BootstrapOwner', 'UnblockUser'"
            : "'GrantAccess', 'RevokeAccess', 'BlockUser', 'BootstrapOwner'";
        var humanActions = includeUnblock ? "'GrantAccess', 'RevokeAccess', 'BlockUser', 'UnblockUser'"
            : "'GrantAccess', 'RevokeAccess', 'BlockUser'";
        var statusActions = includeUnblock ? "'BlockUser', 'UnblockUser'" : "'BlockUser'";
        migrationBuilder.AddCheckConstraint("ck_auditoria_acao", "auditoria", $"acao IN ({actions})", "identity");
        migrationBuilder.AddCheckConstraint("ck_auditoria_autoria", "auditoria",
            $"(acao = 'BootstrapOwner' AND autor_usuario_id IS NULL) OR (acao IN ({humanActions}) AND autor_usuario_id IS NOT NULL)", "identity");
        migrationBuilder.AddCheckConstraint("ck_auditoria_escopo", "auditoria", $"""
            (acao = 'BootstrapOwner' AND papel IS NOT NULL AND papel = 'Owner' AND filial_id IS NULL) OR
            (acao IN ({statusActions}) AND papel IS NULL AND filial_id IS NULL) OR
            (acao IN ('GrantAccess', 'RevokeAccess') AND papel IS NOT NULL AND
                ((papel IN ('Owner', 'AccessAdministrator') AND filial_id IS NULL) OR
                 (papel IN ('Seller', 'BranchManager') AND filial_id IS NOT NULL)))
            """, "identity");
    }
}
