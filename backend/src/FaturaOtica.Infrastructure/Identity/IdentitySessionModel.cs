using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FaturaOtica.Infrastructure.Identity;

public static class IdentitySessionModel
{
    public static void Configure(ModelBuilder model, IdentityDbContext context)
    {
        var activation = model.Entity<IdentityActivationToken>();
        ConfigureToken(activation, "ativacoes", context);
        activation.Property(x => x.UsedAt).HasColumnName("usado_em");
        var session = model.Entity<IdentitySessionToken>();
        ConfigureToken(session, "sessoes", context);
        session.Property(x => x.FamilyId).HasColumnName("familia_id");
        session.Property(x => x.CsrfHash).HasColumnName("csrf_hash").HasMaxLength(64);
        session.Property(x => x.ConsumedAt).HasColumnName("consumido_em");
        session.Property(x => x.ActiveBranchId).HasColumnName("filial_ativa_id");
        session.ToTable("sessoes", "identity", t =>
        {
            t.HasCheckConstraint("ck_sessoes_familia_id_nao_vazio", "familia_id <> '00000000-0000-0000-0000-000000000000'::uuid");
            t.HasCheckConstraint("ck_sessoes_csrf_hash", "csrf_hash IS NULL OR csrf_hash ~ '^[0-9a-f]{64}$'");
        });
        session.HasIndex(x => new { x.TenantId, x.FamilyId }).HasDatabaseName("ix_sessoes_tenant_id_familia_id");
        session.HasIndex(x => new { x.TenantId, x.ActiveBranchId }).HasDatabaseName("ix_sessoes_tenant_id_filial_ativa_id");
        session.HasOne<IdentityBranch>().WithMany().HasForeignKey(x => new { x.TenantId, x.ActiveBranchId })
            .HasPrincipalKey(x => new { x.TenantId, x.Id }).OnDelete(DeleteBehavior.NoAction).HasConstraintName("fk_sessoes_filiais");
    }

    private static void ConfigureToken<T>(EntityTypeBuilder<T> entity, string table, IdentityDbContext context)
        where T : TenantIdentityRecord
    {
        entity.HasBaseType((Type?)null);
        entity.ToTable(table, "identity", t =>
        {
            t.HasCheckConstraint($"ck_{table}_id_nao_vazio", "id <> '00000000-0000-0000-0000-000000000000'::uuid");
            t.HasCheckConstraint($"ck_{table}_tenant_id_nao_vazio", "tenant_id <> '00000000-0000-0000-0000-000000000000'::uuid");
            t.HasCheckConstraint($"ck_{table}_usuario_id_nao_vazio", "usuario_id <> '00000000-0000-0000-0000-000000000000'::uuid");
            t.HasCheckConstraint($"ck_{table}_token_hash", "token_hash ~ '^[0-9a-f]{64}$'");
            t.HasCheckConstraint($"ck_{table}_validade", "expira_em > criado_em");
        });
        entity.HasKey(x => x.Id).HasName($"pk_{table}");
        entity.Property(x => x.Id).HasColumnName("id").ValueGeneratedNever();
        entity.Property(x => x.TenantId).HasColumnName("tenant_id");
        entity.Property(x => x.CreatedAt).HasColumnName("criado_em").HasColumnType("timestamptz").HasDefaultValueSql("now()");
        entity.Property(x => x.CreatedBy).HasColumnName("criado_por");
        entity.Property(x => x.UpdatedAt).HasColumnName("atualizado_em").HasColumnType("timestamptz");
        entity.Property(x => x.UpdatedBy).HasColumnName("atualizado_por");
        entity.Property<Guid>("UserId").HasColumnName("usuario_id");
        entity.Property<string>("TokenHash").HasColumnName("token_hash").HasMaxLength(64);
        entity.Property<DateTimeOffset>("ExpiresAt").HasColumnName("expira_em").HasColumnType("timestamptz");
        entity.Property<DateTimeOffset?>("RevokedAt").HasColumnName("revogado_em").HasColumnType("timestamptz");
        entity.HasOne<IdentityUser>().WithMany().HasForeignKey("TenantId", "UserId")
            .HasPrincipalKey(x => new { x.TenantId, x.Id }).OnDelete(DeleteBehavior.NoAction).HasConstraintName($"fk_{table}_usuarios");
        entity.HasOne<IdentityTenant>().WithMany().HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.NoAction).HasConstraintName($"fk_{table}_tenants");
        entity.HasIndex("TenantId", "TokenHash").IsUnique().HasDatabaseName($"ux_{table}_tenant_id_token_hash");
        entity.HasIndex("TenantId", "UserId").HasDatabaseName($"ix_{table}_tenant_id_usuario_id");
        entity.HasQueryFilter(x => x.TenantId == context.ConfiguredTenantId);
    }
}
