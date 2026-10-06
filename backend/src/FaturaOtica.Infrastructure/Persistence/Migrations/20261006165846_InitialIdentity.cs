using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FaturaOtica.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialIdentity : Migration
    {
        private static readonly string[] TenantIdColumns = ["tenant_id", "id"];
        private static readonly string[] TenantBranchColumns = ["tenant_id", "filial_id"];
        private static readonly string[] TenantUserColumns = ["tenant_id", "usuario_id"];
        private static readonly string[] GrantUniqueColumns = ["tenant_id", "usuario_id", "filial_id", "papel"];
        private static readonly string[] RoleUniqueColumns = ["tenant_id", "usuario_id", "papel"];
        private static readonly string[] EmailUniqueColumns = ["tenant_id", "email_normalizado"];
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "identity");

            migrationBuilder.CreateTable(
                name: "tenants",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "text", nullable: false),
                    criado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    criado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    atualizado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    atualizado_por = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tenants", x => x.id);
                    table.CheckConstraint("ck_tenants_id_nao_vazio", "id <> '00000000-0000-0000-0000-000000000000'::uuid");
                });

            migrationBuilder.CreateTable(
                name: "filiais",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "text", nullable: false),
                    ativa = table.Column<bool>(type: "boolean", nullable: false),
                    criado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    criado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    atualizado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    atualizado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_filiais", x => x.id);
                    table.UniqueConstraint("ux_filiais_tenant_id_id", x => new { x.tenant_id, x.id });
                    table.CheckConstraint("ck_filiais_id_nao_vazio", "id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_filiais_tenant_id_nao_vazio", "tenant_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.ForeignKey(
                        name: "fk_filiais_tenants",
                        column: x => x.tenant_id,
                        principalSchema: "identity",
                        principalTable: "tenants",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nome = table.Column<string>(type: "text", nullable: false),
                    email_normalizado = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    senha_hash = table.Column<string>(type: "text", nullable: true),
                    criado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    criado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    atualizado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    atualizado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_usuarios", x => x.id);
                    table.UniqueConstraint("ux_usuarios_tenant_id_id", x => new { x.tenant_id, x.id });
                    table.CheckConstraint("ck_usuarios_email_normalizado", "length(email_normalizado) > 0 AND email_normalizado = lower(btrim(email_normalizado))");
                    table.CheckConstraint("ck_usuarios_id_nao_vazio", "id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_usuarios_senha_hash", "senha_hash IS NULL OR length(btrim(senha_hash)) > 0");
                    table.CheckConstraint("ck_usuarios_status", "status IN ('Pending', 'Active', 'Blocked')");
                    table.CheckConstraint("ck_usuarios_tenant_id_nao_vazio", "tenant_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.ForeignKey(
                        name: "fk_usuarios_tenants",
                        column: x => x.tenant_id,
                        principalSchema: "identity",
                        principalTable: "tenants",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "concessoes_filiais",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    filial_id = table.Column<Guid>(type: "uuid", nullable: false),
                    papel = table.Column<string>(type: "text", nullable: false),
                    ativo = table.Column<bool>(type: "boolean", nullable: false),
                    criado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    criado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    atualizado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    atualizado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_concessoes_filiais", x => x.id);
                    table.CheckConstraint("ck_concessoes_filiais_filial_id_nao_vazio", "filial_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_concessoes_filiais_id_nao_vazio", "id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_concessoes_filiais_papel", "papel IN ('Seller', 'BranchManager')");
                    table.CheckConstraint("ck_concessoes_filiais_tenant_id_nao_vazio", "tenant_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_concessoes_filiais_usuario_id_nao_vazio", "usuario_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.ForeignKey(
                        name: "fk_concessoes_filiais_filiais",
                        columns: x => new { x.tenant_id, x.filial_id },
                        principalSchema: "identity",
                        principalTable: "filiais",
                        principalColumns: TenantIdColumns);
                    table.ForeignKey(
                        name: "fk_concessoes_filiais_tenants",
                        column: x => x.tenant_id,
                        principalSchema: "identity",
                        principalTable: "tenants",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_concessoes_filiais_usuarios",
                        columns: x => new { x.tenant_id, x.usuario_id },
                        principalSchema: "identity",
                        principalTable: "usuarios",
                        principalColumns: TenantIdColumns);
                });

            migrationBuilder.CreateTable(
                name: "papeis_usuarios",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    papel = table.Column<string>(type: "text", nullable: false),
                    ativo = table.Column<bool>(type: "boolean", nullable: false),
                    criado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false, defaultValueSql: "now()"),
                    criado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    atualizado_em = table.Column<DateTimeOffset>(type: "timestamptz", nullable: true),
                    atualizado_por = table.Column<Guid>(type: "uuid", nullable: true),
                    tenant_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_papeis_usuarios", x => x.id);
                    table.CheckConstraint("ck_papeis_usuarios_id_nao_vazio", "id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_papeis_usuarios_papel", "papel IN ('Owner', 'AccessAdministrator')");
                    table.CheckConstraint("ck_papeis_usuarios_tenant_id_nao_vazio", "tenant_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.CheckConstraint("ck_papeis_usuarios_usuario_id_nao_vazio", "usuario_id <> '00000000-0000-0000-0000-000000000000'::uuid");
                    table.ForeignKey(
                        name: "fk_papeis_usuarios_tenants",
                        column: x => x.tenant_id,
                        principalSchema: "identity",
                        principalTable: "tenants",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_papeis_usuarios_usuarios",
                        columns: x => new { x.tenant_id, x.usuario_id },
                        principalSchema: "identity",
                        principalTable: "usuarios",
                        principalColumns: TenantIdColumns);
                });

            migrationBuilder.CreateIndex(
                name: "ix_concessoes_filiais_tenant_id",
                schema: "identity",
                table: "concessoes_filiais",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "ix_concessoes_filiais_tenant_id_filial_id",
                schema: "identity",
                table: "concessoes_filiais",
                columns: TenantBranchColumns);

            migrationBuilder.CreateIndex(
                name: "ix_concessoes_filiais_tenant_id_usuario_id",
                schema: "identity",
                table: "concessoes_filiais",
                columns: TenantUserColumns);

            migrationBuilder.CreateIndex(
                name: "ux_concessoes_filiais_tenant_id_usuario_id_filial_id_papel",
                schema: "identity",
                table: "concessoes_filiais",
                columns: GrantUniqueColumns,
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_filiais_tenant_id",
                schema: "identity",
                table: "filiais",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "ix_papeis_usuarios_tenant_id",
                schema: "identity",
                table: "papeis_usuarios",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "ix_papeis_usuarios_tenant_id_usuario_id",
                schema: "identity",
                table: "papeis_usuarios",
                columns: TenantUserColumns);

            migrationBuilder.CreateIndex(
                name: "ux_papeis_usuarios_tenant_id_usuario_id_papel",
                schema: "identity",
                table: "papeis_usuarios",
                columns: RoleUniqueColumns,
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_usuarios_tenant_id",
                schema: "identity",
                table: "usuarios",
                column: "tenant_id");

            migrationBuilder.CreateIndex(
                name: "ux_usuarios_tenant_id_email_normalizado",
                schema: "identity",
                table: "usuarios",
                columns: EmailUniqueColumns,
                unique: true);

            foreach (var table in new[] { "usuarios", "filiais", "papeis_usuarios", "concessoes_filiais" })
            {
                // Identifiers are fixed migration constants, never request/configuration input.
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
            migrationBuilder.DropTable(
                name: "concessoes_filiais",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "papeis_usuarios",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "filiais",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "usuarios",
                schema: "identity");

            migrationBuilder.DropTable(
                name: "tenants",
                schema: "identity");
        }
    }
}


