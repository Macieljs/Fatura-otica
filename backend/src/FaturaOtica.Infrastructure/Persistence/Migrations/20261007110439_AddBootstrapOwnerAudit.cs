using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FaturaOtica.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBootstrapOwnerAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_auditoria_acao",
                schema: "identity",
                table: "auditoria");

            migrationBuilder.DropCheckConstraint(
                name: "ck_auditoria_escopo",
                schema: "identity",
                table: "auditoria");

            migrationBuilder.AlterColumn<Guid>(
                name: "autor_usuario_id",
                schema: "identity",
                table: "auditoria",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateIndex(
                name: "ux_auditoria_bootstrap_tenant_id",
                schema: "identity",
                table: "auditoria",
                column: "tenant_id",
                unique: true,
                filter: "acao = 'BootstrapOwner'");

            migrationBuilder.AddCheckConstraint(
                name: "ck_auditoria_acao",
                schema: "identity",
                table: "auditoria",
                sql: "acao IN ('GrantAccess', 'RevokeAccess', 'BlockUser', 'BootstrapOwner')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_auditoria_autoria",
                schema: "identity",
                table: "auditoria",
                sql: "(acao = 'BootstrapOwner' AND autor_usuario_id IS NULL) OR\r\n(acao IN ('GrantAccess', 'RevokeAccess', 'BlockUser') AND autor_usuario_id IS NOT NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_auditoria_escopo",
                schema: "identity",
                table: "auditoria",
                sql: "(acao = 'BootstrapOwner' AND papel IS NOT NULL AND papel = 'Owner' AND filial_id IS NULL) OR\r\n(acao = 'BlockUser' AND papel IS NULL AND filial_id IS NULL) OR\r\n(acao IN ('GrantAccess', 'RevokeAccess') AND papel IS NOT NULL AND\r\n    ((papel IN ('Owner', 'AccessAdministrator') AND filial_id IS NULL) OR\r\n     (papel IN ('Seller', 'BranchManager') AND filial_id IS NOT NULL)))");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM identity.auditoria WHERE acao = 'BootstrapOwner' OR autor_usuario_id IS NULL) THEN
                        RAISE EXCEPTION 'Cannot downgrade a ledger containing bootstrap events; preserve the audit history';
                    END IF;
                END;
                $$;
                """);
            migrationBuilder.DropIndex(
                name: "ux_auditoria_bootstrap_tenant_id",
                schema: "identity",
                table: "auditoria");

            migrationBuilder.DropCheckConstraint(
                name: "ck_auditoria_acao",
                schema: "identity",
                table: "auditoria");

            migrationBuilder.DropCheckConstraint(
                name: "ck_auditoria_autoria",
                schema: "identity",
                table: "auditoria");

            migrationBuilder.DropCheckConstraint(
                name: "ck_auditoria_escopo",
                schema: "identity",
                table: "auditoria");

            migrationBuilder.AlterColumn<Guid>(
                name: "autor_usuario_id",
                schema: "identity",
                table: "auditoria",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "ck_auditoria_acao",
                schema: "identity",
                table: "auditoria",
                sql: "acao IN ('GrantAccess', 'RevokeAccess', 'BlockUser')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_auditoria_escopo",
                schema: "identity",
                table: "auditoria",
                sql: "(acao = 'BlockUser' AND papel IS NULL AND filial_id IS NULL) OR\r\n(acao IN ('GrantAccess', 'RevokeAccess') AND papel IS NOT NULL AND\r\n    ((papel IN ('Owner', 'AccessAdministrator') AND filial_id IS NULL) OR\r\n     (papel IN ('Seller', 'BranchManager') AND filial_id IS NOT NULL)))");
        }
    }
}
