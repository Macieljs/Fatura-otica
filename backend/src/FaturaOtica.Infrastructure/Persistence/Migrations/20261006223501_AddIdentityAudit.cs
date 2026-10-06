using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FaturaOtica.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddIdentityAudit : Migration
    {
        private static readonly string[] TenantKeyColumns = ["tenant_id", "id"];
        private static readonly string[] TargetColumns = ["tenant_id", "alvo_usuario_id"];
        private static readonly string[] ActorColumns = ["tenant_id", "autor_usuario_id"];
        private static readonly string[] BranchColumns = ["tenant_id", "filial_id"];
        private static readonly string[] TimeColumns = ["tenant_id", "ocorrido_em"];
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "auditoria",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false),
                    autor_usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    alvo_usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    acao = table.Column<string>(type: "text", nullable: false),
                    ocorrido_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    papel = table.Column<string>(type: "text", nullable: true),
                    filial_id = table.Column<Guid>(type: "uuid", nullable: true),
                    criado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    criado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    atualizado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    atualizado_por = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_auditoria", x => x.id);
                    table.CheckConstraint("ck_auditoria_acao", "acao IN ('GrantAccess', 'RevokeAccess', 'BlockUser')");
                    table.CheckConstraint("ck_auditoria_alvo_usuario_id_nao_vazio", "alvo_usuario_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_auditoria_autor_usuario_id_nao_vazio", "autor_usuario_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_auditoria_escopo", "(acao = 'BlockUser' AND papel IS NULL AND filial_id IS NULL) OR\n(acao IN ('GrantAccess', 'RevokeAccess') AND papel IS NOT NULL AND\n    ((papel IN ('Owner', 'AccessAdministrator') AND filial_id IS NULL) OR\n     (papel IN ('Seller', 'BranchManager') AND filial_id IS NOT NULL)))");
                    table.CheckConstraint("ck_auditoria_filial_id_nao_vazio", "filial_id IS NULL OR filial_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_auditoria_id_nao_vazio", "id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_auditoria_metadados_imutaveis", "criado_por IS NULL AND atualizado_em IS NULL AND atualizado_por IS NULL");
                    table.CheckConstraint("ck_auditoria_papel", "papel IS NULL OR papel IN ('Owner', 'AccessAdministrator', 'Seller', 'BranchManager')");
                    table.CheckConstraint("ck_auditoria_tenant_id_nao_vazio", "tenant_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.ForeignKey(
                        name: "fk_auditoria_filiais",
                        columns: x => new { x.tenant_id, x.filial_id },
                        principalSchema: "identity",
                        principalTable: "filiais",
                        principalColumns: TenantKeyColumns);
                    table.ForeignKey(
                        name: "fk_auditoria_tenants",
                        column: x => x.tenant_id,
                        principalSchema: "identity",
                        principalTable: "tenants",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_auditoria_usuarios_alvo",
                        columns: x => new { x.tenant_id, x.alvo_usuario_id },
                        principalSchema: "identity",
                        principalTable: "usuarios",
                        principalColumns: TenantKeyColumns);
                    table.ForeignKey(
                        name: "fk_auditoria_usuarios_autor",
                        columns: x => new { x.tenant_id, x.autor_usuario_id },
                        principalSchema: "identity",
                        principalTable: "usuarios",
                        principalColumns: TenantKeyColumns);
                });

            migrationBuilder.CreateIndex(
                name: "ix_auditoria_tenant_id",
                schema: "identity",
                table: "auditoria",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "ix_auditoria_tenant_id_alvo_usuario_id",
                schema: "identity",
                table: "auditoria",
                columns: TargetColumns);

            migrationBuilder.CreateIndex(
                name: "ix_auditoria_tenant_id_autor_usuario_id",
                schema: "identity",
                table: "auditoria",
                columns: ActorColumns);

            migrationBuilder.CreateIndex(
                name: "ix_auditoria_tenant_id_filial_id",
                schema: "identity",
                table: "auditoria",
                columns: BranchColumns);

            migrationBuilder.CreateIndex(
                name: "ix_auditoria_tenant_id_ocorrido_em",
                schema: "identity",
                table: "auditoria",
                columns: TimeColumns);

            migrationBuilder.Sql("""
                ALTER TABLE identity.auditoria ENABLE ROW LEVEL SECURITY;
                ALTER TABLE identity.auditoria FORCE ROW LEVEL SECURITY;
                CREATE POLICY tenant_isolation ON identity.auditoria
                USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
                WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);

                CREATE FUNCTION identity.fn_bloquear_alteracao() RETURNS trigger
                LANGUAGE plpgsql AS $$
                BEGIN
                    RAISE EXCEPTION 'Identity audit ledger is immutable';
                END;
                $$;
                CREATE TRIGGER tr_auditoria_bloquear_alteracao
                    BEFORE UPDATE OR DELETE ON identity.auditoria
                    FOR EACH ROW EXECUTE FUNCTION identity.fn_bloquear_alteracao();
                CREATE TRIGGER tr_auditoria_bloquear_truncate
                    BEFORE TRUNCATE ON identity.auditoria
                    FOR EACH STATEMENT EXECUTE FUNCTION identity.fn_bloquear_alteracao();
                REVOKE ALL ON identity.auditoria FROM PUBLIC;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Destructive rollback is restricted to disposable databases, never a live ledger.
            migrationBuilder.DropTable(
                name: "auditoria",
                schema: "identity");
            migrationBuilder.Sql("DROP FUNCTION identity.fn_bloquear_alteracao();");
        }
    }
}
