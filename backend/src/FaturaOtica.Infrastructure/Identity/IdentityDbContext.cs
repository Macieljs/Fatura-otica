using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FaturaOtica.Infrastructure.Identity;

public sealed class IdentityDbContext : DbContext
{
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("identity");
        modelBuilder.Ignore<IdentityRecord>();
        modelBuilder.Ignore<TenantIdentityRecord>();
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
        users.HasAlternateKey(e => new { e.TenantId, e.Id }).HasName("ux_usuarios_tenant_id_id");
        users.HasIndex(e => new { e.TenantId, e.EmailNormalized }).IsUnique().HasDatabaseName("ux_usuarios_tenant_id_email_normalizado");
        users.ToTable("usuarios", t =>
        {
            t.HasCheckConstraint("ck_usuarios_status", "status IN ('Pending', 'Active', 'Blocked')");
            t.HasCheckConstraint("ck_usuarios_email_normalizado", "length(email_normalizado) > 0 AND email_normalizado = lower(btrim(email_normalizado))");
            t.HasCheckConstraint("ck_usuarios_senha_hash", "senha_hash IS NULL OR length(btrim(senha_hash)) > 0");
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
