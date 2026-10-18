using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable
#pragma warning disable CA1861 // EF-generated one-time migration column arrays.

namespace FaturaOtica.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIdentitySessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateTable(
                name: "ativacoes",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    expira_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    usado_em = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    revogado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    criado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    criado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    atualizado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    atualizado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ativacoes", x => x.id);
                    table.CheckConstraint("ck_ativacoes_id_nao_vazio", "id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_ativacoes_tenant_id_nao_vazio", "tenant_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_ativacoes_token_hash", "token_hash ~ '^[0-9a-f]{64}$'");
                    table.CheckConstraint("ck_ativacoes_usuario_id_nao_vazio", "usuario_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_ativacoes_validade", "expira_em > criado_em");
                    table.ForeignKey(
                        name: "fk_ativacoes_tenants",
                        column: x => x.tenant_id,
                        principalSchema: "identity",
                        principalTable: "tenants",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_ativacoes_usuarios",
                        columns: x => new { x.tenant_id, x.usuario_id },
                        principalSchema: "identity",
                        principalTable: "usuarios",
                        principalColumns: new[] { "tenant_id", "id" });
                });

            migrationBuilder.CreateTable(
                name: "sessoes",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    familia_id = table.Column<Guid>(type: "uuid", nullable: false),
                    token_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    csrf_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    filial_ativa_id = table.Column<Guid>(type: "uuid", nullable: true),
                    expira_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    consumido_em = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    revogado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    criado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    criado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    atualizado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    atualizado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sessoes", x => x.id);
                    table.CheckConstraint("ck_sessoes_csrf_hash", "csrf_hash IS NULL OR csrf_hash ~ '^[0-9a-f]{64}$'");
                    table.CheckConstraint("ck_sessoes_familia_id_nao_vazio", "familia_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_sessoes_id_nao_vazio", "id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_sessoes_tenant_id_nao_vazio", "tenant_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_sessoes_token_hash", "token_hash ~ '^[0-9a-f]{64}$'");
                    table.CheckConstraint("ck_sessoes_usuario_id_nao_vazio", "usuario_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_sessoes_validade", "expira_em > criado_em");
                    table.ForeignKey(
                        name: "fk_sessoes_filiais",
                        columns: x => new { x.tenant_id, x.filial_ativa_id },
                        principalSchema: "identity",
                        principalTable: "filiais",
                        principalColumns: new[] { "tenant_id", "id" });
                    table.ForeignKey(
                        name: "fk_sessoes_tenants",
                        column: x => x.tenant_id,
                        principalSchema: "identity",
                        principalTable: "tenants",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_sessoes_usuarios",
                        columns: x => new { x.tenant_id, x.usuario_id },
                        principalSchema: "identity",
                        principalTable: "usuarios",
                        principalColumns: new[] { "tenant_id", "id" });
                });

            migrationBuilder.AddCheckConstraint(
                name: "ck_auditoria_acao",
                schema: "identity",
                table: "auditoria",
                sql: "acao IN ('GrantAccess', 'RevokeAccess', 'BlockUser', 'BootstrapOwner', 'UnblockUser', 'IssueActivation', 'ActivateUser', 'BootstrapOwnerActivation')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_auditoria_autoria",
                schema: "identity",
                table: "auditoria",
                sql: "(acao IN ('BootstrapOwner', 'BootstrapOwnerActivation') AND autor_usuario_id IS NULL) OR\r\n(acao IN ('GrantAccess', 'RevokeAccess', 'BlockUser', 'UnblockUser', 'IssueActivation', 'ActivateUser') AND autor_usuario_id IS NOT NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_auditoria_escopo",
                schema: "identity",
                table: "auditoria",
                sql: "(acao IN ('BootstrapOwner', 'BootstrapOwnerActivation') AND papel IS NOT NULL AND papel = 'Owner' AND filial_id IS NULL) OR\r\n(acao IN ('BlockUser', 'UnblockUser', 'IssueActivation', 'ActivateUser') AND papel IS NULL AND filial_id IS NULL) OR\r\n(acao IN ('GrantAccess', 'RevokeAccess') AND papel IS NOT NULL AND\r\n    ((papel IN ('Owner', 'AccessAdministrator') AND filial_id IS NULL) OR\r\n     (papel IN ('Seller', 'BranchManager') AND filial_id IS NOT NULL)))");

            migrationBuilder.CreateIndex(
                name: "ix_ativacoes_tenant_id_usuario_id",
                schema: "identity",
                table: "ativacoes",
                columns: new[] { "tenant_id", "usuario_id" });

            migrationBuilder.CreateIndex(
                name: "ux_ativacoes_tenant_id_token_hash",
                schema: "identity",
                table: "ativacoes",
                columns: new[] { "tenant_id", "token_hash" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_sessoes_tenant_id_familia_id",
                schema: "identity",
                table: "sessoes",
                columns: new[] { "tenant_id", "familia_id" });

            migrationBuilder.CreateIndex(
                name: "ix_sessoes_tenant_id_filial_ativa_id",
                schema: "identity",
                table: "sessoes",
                columns: new[] { "tenant_id", "filial_ativa_id" });

            migrationBuilder.CreateIndex(
                name: "ix_sessoes_tenant_id_usuario_id",
                schema: "identity",
                table: "sessoes",
                columns: new[] { "tenant_id", "usuario_id" });

            migrationBuilder.CreateIndex(
                name: "ux_sessoes_tenant_id_token_hash",
                schema: "identity",
                table: "sessoes",
                columns: new[] { "tenant_id", "token_hash" },
                unique: true);
            foreach (var table in new[] { "ativacoes", "sessoes" })
            {
                migrationBuilder.Sql($"""
                    ALTER TABLE identity.{table} ENABLE ROW LEVEL SECURITY;
                    ALTER TABLE identity.{table} FORCE ROW LEVEL SECURITY;
                    CREATE POLICY tenant_isolation ON identity.{table}
                    USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
                    WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
                    """);
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DO $$ BEGIN
                  IF EXISTS (SELECT 1 FROM identity.auditoria WHERE acao IN ('IssueActivation','ActivateUser','BootstrapOwnerActivation')) THEN
                    RAISE EXCEPTION 'Cannot downgrade a ledger containing activation events; preserve audit history';
                  END IF;
                END $$;
                """);
            migrationBuilder.DropTable(
                name: "ativacoes",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "sessoes",
                schema: "identity");

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

            migrationBuilder.AddCheckConstraint(
                name: "ck_auditoria_acao",
                schema: "identity",
                table: "auditoria",
                sql: "acao IN ('GrantAccess', 'RevokeAccess', 'BlockUser', 'BootstrapOwner', 'UnblockUser')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_auditoria_autoria",
                schema: "identity",
                table: "auditoria",
                sql: "(acao = 'BootstrapOwner' AND autor_usuario_id IS NULL) OR\r\n(acao IN ('GrantAccess', 'RevokeAccess', 'BlockUser', 'UnblockUser') AND autor_usuario_id IS NOT NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_auditoria_escopo",
                schema: "identity",
                table: "auditoria",
                sql: "(acao = 'BootstrapOwner' AND papel IS NOT NULL AND papel = 'Owner' AND filial_id IS NULL) OR\r\n(acao IN ('BlockUser', 'UnblockUser') AND papel IS NULL AND filial_id IS NULL) OR\r\n(acao IN ('GrantAccess', 'RevokeAccess') AND papel IS NOT NULL AND\r\n    ((papel IN ('Owner', 'AccessAdministrator') AND filial_id IS NULL) OR\r\n     (papel IN ('Seller', 'BranchManager') AND filial_id IS NOT NULL)))");
        }
    }
}
