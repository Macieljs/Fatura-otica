using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FaturaOtica.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPendingProfileProvenance : Migration
    {
        private static readonly string[] ProvenanceColumns = ["tenant_id", "criado_para_filial_id"];
        private static readonly string[] BranchKeyColumns = ["tenant_id", "id"];
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "criado_para_filial_id",
                schema: "identity",
                table: "usuarios",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_usuarios_tenant_id_criado_para_filial_id",
                schema: "identity",
                table: "usuarios",
                columns: ProvenanceColumns);

            migrationBuilder.AddCheckConstraint(
                name: "ck_usuarios_criado_para_filial_id_nao_vazio",
                schema: "identity",
                table: "usuarios",
                sql: "criado_para_filial_id IS NULL OR criado_para_filial_id <> '00000000-0000-0000-0000-000000000000'::uuid");

            migrationBuilder.AddForeignKey(
                name: "fk_usuarios_filiais_proveniencia",
                schema: "identity",
                table: "usuarios",
                columns: ProvenanceColumns,
                principalSchema: "identity",
                principalTable: "filiais",
                principalColumns: BranchKeyColumns);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_usuarios_filiais_proveniencia",
                schema: "identity",
                table: "usuarios");

            migrationBuilder.DropIndex(
                name: "ix_usuarios_tenant_id_criado_para_filial_id",
                schema: "identity",
                table: "usuarios");

            migrationBuilder.DropCheckConstraint(
                name: "ck_usuarios_criado_para_filial_id_nao_vazio",
                schema: "identity",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "criado_para_filial_id",
                schema: "identity",
                table: "usuarios");
        }
    }
}
