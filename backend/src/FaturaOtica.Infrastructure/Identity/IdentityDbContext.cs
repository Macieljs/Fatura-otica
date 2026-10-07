using FaturaOtica.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FaturaOtica.Infrastructure.Identity;

public sealed class IdentityDbContext : DbContext
{
    private static readonly string[] AuditRequiredIdentifierColumns = ["id", "tenant_id", "autor_usuario_id", "alvo_usuario_id"];
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options, Guid configuredTenantId)
        : base(options)
    {
        if (configuredTenantId == Guid.Empty)
            throw new ArgumentException("A configured tenant is required.", nameof(configuredTenantId));
        ConfiguredTenantId = configuredTenantId;
    }

    public Guid ConfiguredTenantId { get; }
    internal IdentityTenantTransaction? TenantTransactionScope { get; set; }
    public DbSet<IdentityTenant> Tenants => Set<IdentityTenant>();
    public DbSet<IdentityUser> Users => Set<IdentityUser>();
    public DbSet<IdentityBranch> Branches => Set<IdentityBranch>();
    public DbSet<IdentityTenantRole> TenantRoles => Set<IdentityTenantRole>();
    public DbSet<IdentityBranchGrant> BranchGrants => Set<IdentityBranchGrant>();
    public DbSet<IdentityAuditEvent> AuditEvents => Set<IdentityAuditEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("identity");
        modelBuilder.Ignore<IdentityRecord>();
        modelBuilder.Ignore<TenantIdentityRecord>();
        ConfigureAudit(modelBuilder.Entity<IdentityAuditEvent>());
        ConfigureRecord(modelBuilder.Entity<IdentityTenant>(), "tenants");
        ConfigureTenantRecord(modelBuilder.Entity<IdentityUser>(), "usuarios");
        ConfigureTenantRecord(modelBuilder.Entity<IdentityBranch>(), "filiais");
        ConfigureTenantRecord(modelBuilder.Entity<IdentityTenantRole>(), "papeis_usuarios");
        ConfigureTenantRecord(modelBuilder.Entity<IdentityBranchGrant>(), "concessoes_filiais");

        modelBuilder.Entity<IdentityTenant>().Property(e => e.Name).HasColumnName("nome").HasColumnType("text");
        var users = modelBuilder.Entity<IdentityUser>();
        users.Property(e => e.Name).HasColumnName("nome").HasColumnType("text");
        users.Property(e => e.EmailNormalized).HasColumnName("email_normalizado").HasColumnType("text");
        users.Property(e => e.Status).HasColumnName("status").HasConversion<string>().HasColumnType("text");
        users.Property(e => e.PasswordHash).HasColumnName("senha_hash").HasColumnType("text");
        users.Property(e => e.CreatedForBranchId).HasColumnName("criado_para_filial_id");
        users.HasIndex(e => new { e.TenantId, e.CreatedForBranchId }).HasDatabaseName("ix_usuarios_tenant_id_criado_para_filial_id");
        users.HasOne<IdentityBranch>().WithMany().HasForeignKey(e => new { e.TenantId, e.CreatedForBranchId })
            .HasPrincipalKey(e => new { e.TenantId, e.Id }).OnDelete(DeleteBehavior.NoAction)
            .HasConstraintName("fk_usuarios_filiais_proveniencia");
        users.HasAlternateKey(e => new { e.TenantId, e.Id }).HasName("ux_usuarios_tenant_id_id");
        users.HasIndex(e => new { e.TenantId, e.EmailNormalized }).IsUnique().HasDatabaseName("ux_usuarios_tenant_id_email_normalizado");
        users.ToTable("usuarios", t =>
        {
            t.HasCheckConstraint("ck_usuarios_status", "status IN ('Pending', 'Active', 'Blocked')");
            t.HasCheckConstraint("ck_usuarios_email_normalizado", "length(email_normalizado) > 0 AND email_normalizado = lower(btrim(email_normalizado))");
            t.HasCheckConstraint("ck_usuarios_senha_hash", "senha_hash IS NULL OR length(btrim(senha_hash)) > 0");
            t.HasCheckConstraint("ck_usuarios_criado_para_filial_id_nao_vazio", "criado_para_filial_id IS NULL OR criado_para_filial_id <> '00000000-0000-0000-0000-000000000000'::uuid");
        });

        var branches = modelBuilder.Entity<IdentityBranch>();
        branches.Property(e => e.Name).HasColumnName("nome").HasColumnType("text");
        branches.Property(e => e.Active).HasColumnName("ativa");
        branches.HasAlternateKey(e => new { e.TenantId, e.Id }).HasName("ux_filiais_tenant_id_id");

        var roles = modelBuilder.Entity<IdentityTenantRole>();
        roles.Property(e => e.UserId).HasColumnName("usuario_id");
        roles.Property(e => e.Role).HasColumnName("papel").HasConversion<string>().HasColumnType("text");
        roles.Property(e => e.Active).HasColumnName("ativo");
        roles.HasIndex(e => new { e.TenantId, e.UserId }).HasDatabaseName("ix_papeis_usuarios_tenant_id_usuario_id");
        roles.HasIndex(e => new { e.TenantId, e.UserId, e.Role }).IsUnique().HasDatabaseName("ux_papeis_usuarios_tenant_id_usuario_id_papel");
        roles.HasOne<IdentityUser>().WithMany().HasForeignKey(e => new { e.TenantId, e.UserId })
            .HasPrincipalKey(e => new { e.TenantId, e.Id }).OnDelete(DeleteBehavior.NoAction).HasConstraintName("fk_papeis_usuarios_usuarios");
        roles.ToTable("papeis_usuarios", t =>
        {
            t.HasCheckConstraint("ck_papeis_usuarios_papel", "papel IN ('Owner', 'AccessAdministrator')");
            t.HasCheckConstraint("ck_papeis_usuarios_usuario_id_nao_vazio", "usuario_id <> '00000000-0000-0000-0000-000000000000'::uuid");
        });

        var grants = modelBuilder.Entity<IdentityBranchGrant>();
        grants.Property(e => e.UserId).HasColumnName("usuario_id");
        grants.Property(e => e.BranchId).HasColumnName("filial_id");
        grants.Property(e => e.Role).HasColumnName("papel").HasConversion<string>().HasColumnType("text");
        grants.Property(e => e.Active).HasColumnName("ativo");
        grants.HasIndex(e => new { e.TenantId, e.UserId }).HasDatabaseName("ix_concessoes_filiais_tenant_id_usuario_id");
        grants.HasIndex(e => new { e.TenantId, e.BranchId }).HasDatabaseName("ix_concessoes_filiais_tenant_id_filial_id");
        grants.HasIndex(e => new { e.TenantId, e.UserId, e.BranchId, e.Role }).IsUnique().HasDatabaseName("ux_concessoes_filiais_tenant_id_usuario_id_filial_id_papel");
        grants.HasOne<IdentityUser>().WithMany().HasForeignKey(e => new { e.TenantId, e.UserId })
            .HasPrincipalKey(e => new { e.TenantId, e.Id }).OnDelete(DeleteBehavior.NoAction).HasConstraintName("fk_concessoes_filiais_usuarios");
        grants.HasOne<IdentityBranch>().WithMany().HasForeignKey(e => new { e.TenantId, e.BranchId })
            .HasPrincipalKey(e => new { e.TenantId, e.Id }).OnDelete(DeleteBehavior.NoAction).HasConstraintName("fk_concessoes_filiais_filiais");
        grants.ToTable("concessoes_filiais", t =>
        {
            t.HasCheckConstraint("ck_concessoes_filiais_papel", "papel IN ('Seller', 'BranchManager')");
            t.HasCheckConstraint("ck_concessoes_filiais_usuario_id_nao_vazio", "usuario_id <> '00000000-0000-0000-0000-000000000000'::uuid");
            t.HasCheckConstraint("ck_concessoes_filiais_filial_id_nao_vazio", "filial_id <> '00000000-0000-0000-0000-000000000000'::uuid");
        });
    }

    private void ConfigureAudit(EntityTypeBuilder<IdentityAuditEvent> audit)
    {
        audit.ToTable("auditoria", table =>
        {
            const string empty = "'00000000-0000-0000-0000-000000000000'::uuid";
            foreach (var column in AuditRequiredIdentifierColumns)
                table.HasCheckConstraint($"ck_auditoria_{column}_nao_vazio", $"{column} <> {empty}");
            table.HasCheckConstraint("ck_auditoria_filial_id_nao_vazio", $"filial_id IS NULL OR filial_id <> {empty}");
            table.HasCheckConstraint("ck_auditoria_acao", "acao IN ('GrantAccess', 'RevokeAccess', 'BlockUser')");
            table.HasCheckConstraint("ck_auditoria_papel", "papel IS NULL OR papel IN ('Owner', 'AccessAdministrator', 'Seller', 'BranchManager')");
            table.HasCheckConstraint("ck_auditoria_escopo", """
                (acao = 'BlockUser' AND papel IS NULL AND filial_id IS NULL) OR
                (acao IN ('GrantAccess', 'RevokeAccess') AND papel IS NOT NULL AND
                    ((papel IN ('Owner', 'AccessAdministrator') AND filial_id IS NULL) OR
                     (papel IN ('Seller', 'BranchManager') AND filial_id IS NOT NULL)))
                """);
            table.HasCheckConstraint("ck_auditoria_metadados_imutaveis", "criado_por IS NULL AND atualizado_em IS NULL AND atualizado_por IS NULL");
        });
        audit.HasKey(e => e.Id).HasName("pk_auditoria");
        audit.Property(e => e.Id).HasColumnName("id").ValueGeneratedNever();
        audit.Property(e => e.TenantId).HasColumnName("tenant_id");
        audit.Property(e => e.ActorUserId).HasColumnName("autor_usuario_id");
        audit.Property(e => e.TargetUserId).HasColumnName("alvo_usuario_id");
        audit.Property(e => e.Action).HasColumnName("acao").HasConversion<string>().HasColumnType("text");
        audit.Property(e => e.OccurredAt).HasColumnName("ocorrido_em").HasColumnType("timestamptz");
        audit.Property(e => e.Role).HasColumnName("papel").HasConversion<string>().HasColumnType("text");
        audit.Property(e => e.BranchId).HasColumnName("filial_id");
        audit.Property<DateTimeOffset>("CreatedAt").HasColumnName("criado_em").HasColumnType("timestamptz").HasDefaultValueSql("now()");
        audit.Property<Guid?>("CreatedBy").HasColumnName("criado_por");
        audit.Property<DateTimeOffset?>("UpdatedAt").HasColumnName("atualizado_em").HasColumnType("timestamptz");
        audit.Property<Guid?>("UpdatedBy").HasColumnName("atualizado_por");
        audit.HasOne<IdentityTenant>().WithMany().HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.NoAction).HasConstraintName("fk_auditoria_tenants");
        audit.HasOne<IdentityUser>().WithMany().HasForeignKey(e => new { e.TenantId, e.ActorUserId })
            .HasPrincipalKey(e => new { e.TenantId, e.Id }).OnDelete(DeleteBehavior.NoAction).HasConstraintName("fk_auditoria_usuarios_autor");
        audit.HasOne<IdentityUser>().WithMany().HasForeignKey(e => new { e.TenantId, e.TargetUserId })
            .HasPrincipalKey(e => new { e.TenantId, e.Id }).OnDelete(DeleteBehavior.NoAction).HasConstraintName("fk_auditoria_usuarios_alvo");
        audit.HasOne<IdentityBranch>().WithMany().HasForeignKey(e => new { e.TenantId, e.BranchId })
            .HasPrincipalKey(e => new { e.TenantId, e.Id }).OnDelete(DeleteBehavior.NoAction).HasConstraintName("fk_auditoria_filiais");
        audit.HasIndex(e => e.TenantId).HasDatabaseName("ix_auditoria_tenant_id");
        audit.HasIndex(e => new { e.TenantId, e.ActorUserId }).HasDatabaseName("ix_auditoria_tenant_id_autor_usuario_id");
        audit.HasIndex(e => new { e.TenantId, e.TargetUserId }).HasDatabaseName("ix_auditoria_tenant_id_alvo_usuario_id");
        audit.HasIndex(e => new { e.TenantId, e.BranchId }).HasDatabaseName("ix_auditoria_tenant_id_filial_id");
        audit.HasIndex(e => new { e.TenantId, e.OccurredAt }).HasDatabaseName("ix_auditoria_tenant_id_ocorrido_em");
        audit.HasQueryFilter(e => e.TenantId == ConfiguredTenantId);
    }

    private static void ConfigureRecord<T>(EntityTypeBuilder<T> entity, string table) where T : IdentityRecord
    {
        entity.HasBaseType((Type?)null);
        entity.ToTable(table, t => t.HasCheckConstraint($"ck_{table}_id_nao_vazio", "id <> '00000000-0000-0000-0000-000000000000'::uuid"));
        entity.HasKey(e => e.Id).HasName($"pk_{table}");
        entity.Property(e => e.Id).HasColumnName("id").ValueGeneratedNever();
        entity.Property(e => e.CreatedAt).HasColumnName("criado_em").HasColumnType("timestamptz").HasDefaultValueSql("now()");
        entity.Property(e => e.CreatedBy).HasColumnName("criado_por");
        entity.Property(e => e.UpdatedAt).HasColumnName("atualizado_em").HasColumnType("timestamptz");
        entity.Property(e => e.UpdatedBy).HasColumnName("atualizado_por");
    }

    private void ConfigureTenantRecord<T>(EntityTypeBuilder<T> entity, string table) where T : TenantIdentityRecord
    {
        ConfigureRecord(entity, table);
        entity.Property(e => e.TenantId).HasColumnName("tenant_id");
        entity.HasIndex(e => e.TenantId).HasDatabaseName($"ix_{table}_tenant_id");
        entity.HasOne<IdentityTenant>().WithMany().HasForeignKey(e => e.TenantId)
            .OnDelete(DeleteBehavior.NoAction).HasConstraintName($"fk_{table}_tenants");
        entity.ToTable(table, t => t.HasCheckConstraint($"ck_{table}_tenant_id_nao_vazio", "tenant_id <> '00000000-0000-0000-0000-000000000000'::uuid"));
        entity.HasQueryFilter(e => e.TenantId == ConfiguredTenantId);
    }
}
