"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useOperator } from "@/hooks/useOperator";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import Button from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import {
  Profile,
  Branch,
  Grant,
  Role,
  ProfileStatus,
  CreateProfileRequest,
} from "@/types/identity";
import { identityMockService } from "@/services/identityMockService";

const ROLE_LABELS: Record<Role, { label: string; bg: string; text: string; border: string }> = {
  owner: {
    label: "Dono / Diretor",
    bg: "bg-[#052659]",
    text: "text-white",
    border: "border-[#052659]",
  },
  accessAdministrator: {
    label: "Admin de Acessos",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  branchManager: {
    label: "Gestor de Filial",
    bg: "bg-blue-50",
    text: "text-[#052659]",
    border: "border-[#5483B3]/40",
  },
  seller: {
    label: "Vendedor / Balcão",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
};

const STATUS_CONFIG: Record<
  ProfileStatus,
  { label: string; badgeClass: string; icon: string }
> = {
  active: {
    label: "Ativo",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
    icon: "check_circle",
  },
  pending: {
    label: "Aguardando Ativação",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
    icon: "hourglass_top",
  },
  blocked: {
    label: "Acesso Suspenso",
    badgeClass: "bg-rose-50 text-rose-800 border-rose-300",
    icon: "block",
  },
};

export default function AdminUsuariosPage() {
  const router = useRouter();
  const toast = useToast();
  const { isManager, isLoaded } = useOperator();
  const [, startTransition] = useTransition();

  // Proteção de rota corporativa: apenas gestores e administradores podem acessar
  useEffect(() => {
    if (isLoaded && !isManager) {
      toast.warning("Acesso restrito a gestores e administradores de acesso.", {
        title: "Acesso Negado (403)",
        icon: "lock",
      });
      router.replace("/");
    }
  }, [isLoaded, isManager, router, toast]);

  // Estados principais
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [grantsMap, setGrantsMap] = useState<Record<string, Grant[]>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | ProfileStatus>("all");

  // Modal de Criação Rápida
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProfileForm, setNewProfileForm] = useState<CreateProfileRequest>({
    name: "",
    email: "",
    branchId: "",
    cargo: "",
  });

  // Drawer de Concessões & Permissões
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userGrantsEdit, setUserGrantsEdit] = useState<Grant[]>([]);
  const [showGrantsDrawer, setShowGrantsDrawer] = useState(false);

  // Carregamento de dados assíncrono seguro contra cascading renders
  useEffect(() => {
    if (!isLoaded || !isManager) return;
    let isMounted = true;

    void (async () => {
      try {
        const [branchList, usersData] = await Promise.all([
          identityMockService.getBranches(),
          identityMockService.getUsers(),
        ]);
        if (!isMounted) return;
        setBranches(branchList);
        setProfiles(usersData.profiles);
        setGrantsMap(usersData.grantsMap);
        setNewProfileForm((prev) => ({
          ...prev,
          branchId: prev.branchId || branchList[0]?.id || "",
        }));
      } catch {
        if (!isMounted) return;
        toast.error("Falha ao carregar lista de colaboradores.", {
          title: "Erro de Conexão",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [toast, isLoaded, isManager]);

  // KPIs
  const kpis = useMemo(() => {
    const total = profiles.length;
    const active = profiles.filter((p) => p.status === "active").length;
    const pending = profiles.filter((p) => p.status === "pending").length;
    const blocked = profiles.filter((p) => p.status === "blocked").length;
    return { total, active, pending, blocked };
  }, [profiles]);

  // Lista filtrada
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (filterBranch !== "all" && p.branchId !== filterBranch) return false;
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchEmail = p.email.toLowerCase().includes(query);
        const matchCargo = p.cargo?.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchCargo) return false;
      }
      return true;
    });
  }, [profiles, filterBranch, filterStatus, search]);

  // Handlers
  const handleOpenCreateModal = () => {
    setNewProfileForm({
      name: "",
      email: "",
      branchId: branches[0]?.id || "",
      cargo: "",
    });
    setShowCreateModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileForm.name.trim() || !newProfileForm.email.trim()) {
      toast.warning("Nome e e-mail corporativo são obrigatórios.", {
        title: "Campos Obrigatórios",
      });
      return;
    }

    try {
      const created = await identityMockService.createProfile(newProfileForm);
      startTransition(() => {
        setProfiles((prev) => [created, ...prev]);
        setShowCreateModal(false);
      });
      toast.success(
        `Colaborador "${created.name}" cadastrado! Convite seguro disparado para ${created.email}.`,
        {
          title: "Colaborador Criado",
          icon: "person_add",
        }
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao cadastrar colaborador.");
    }
  };

  const handleOpenGrantsDrawer = (profile: Profile) => {
    setSelectedUser(profile);
    const existing = grantsMap[profile.id] || [];
    setUserGrantsEdit([...existing]);
    setShowGrantsDrawer(true);
  };

  const handleToggleRole = (role: Role) => {
    setUserGrantsEdit((prev) => {
      const exists = prev.some((g) => g.role === role);
      if (exists) {
        return prev.filter((g) => g.role !== role);
      }
      const newGrant: Grant = {
        id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        role,
        scope: role === "owner" || role === "accessAdministrator" ? "tenant" : "branch",
        branchId: selectedUser?.branchId,
      };
      return [...prev, newGrant];
    });
  };

  const handleToggleBranchScope = (branchId: string) => {
    setUserGrantsEdit((prev) => {
      const exists = prev.some((g) => g.branchId === branchId);
      if (exists) {
        return prev.filter((g) => g.branchId !== branchId);
      }
      const newGrant: Grant = {
        id: `g-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        role: "seller",
        scope: "branch",
        branchId,
      };
      return [...prev, newGrant];
    });
  };

  const handleSaveGrants = async () => {
    if (!selectedUser) return;
    try {
      await identityMockService.updateUserGrants(selectedUser.id, userGrantsEdit);
      setGrantsMap((prev) => ({ ...prev, [selectedUser.id]: userGrantsEdit }));
      setShowGrantsDrawer(false);
      toast.success(`Permissões e papéis de "${selectedUser.name}" atualizados com sucesso!`, {
        title: "Acessos Atualizados",
        icon: "verified_user",
      });
    } catch {
      toast.error("Erro ao salvar permissões do operador.");
    }
  };

  const handleToggleStatus = async (profile: Profile) => {
    const nextStatus: ProfileStatus = profile.status === "blocked" ? "active" : "blocked";
    try {
      await identityMockService.updateUserStatus(profile.id, nextStatus);
      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, status: nextStatus } : p))
      );
      if (selectedUser?.id === profile.id) {
        setSelectedUser({ ...selectedUser, status: nextStatus });
      }
      toast.info(
        `Acesso de "${profile.name}" alterado para: ${
          nextStatus === "active" ? "Ativo" : "Suspenso"
        }.`,
        {
          title: "Status Atualizado",
          icon: nextStatus === "active" ? "check_circle" : "block",
        }
      );
    } catch {
      toast.error("Erro ao alterar status do operador.");
    }
  };

  const handleResendActivation = async (profile: Profile) => {
    try {
      const res = await identityMockService.resendActivation(profile.id);
      toast.success(
        `Novo link seguro de ativação enviado para ${profile.email}! Validade: ${res.expiresAt}.`,
        {
          title: "Convite Reenviado",
          icon: "send",
        }
      );
    } catch {
      toast.error("Erro ao reenviar convite de ativação.");
    }
  };

  if (!isLoaded || !isManager) {
    return (
      <div
        id="admin-usuarios-guard-loading"
        className="flex-1 flex items-center justify-center min-h-[500px] bg-[#F0F6FC]"
      >
        <div className="flex flex-col items-center gap-3 p-8 bg-white border border-[#5483B3]/20 rounded-2xl shadow-sm text-center max-w-md">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">lock</span>
          </div>
          <div>
            <h3 className="font-bold text-[#021024] text-base">Acesso Restrito a Gestores</h3>
            <p className="text-xs text-[#5483B3] mt-1">
              Esta área de configuração de colaboradores e permissões RBAC é restrita a gestores e administradores. Redirecionando...
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#5483B3] font-mono mt-2">
            <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            <span>Verificando credenciais corporativas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F0F6FC] min-h-screen pb-16 text-[#021024]">
      {/* 1. CABEÇALHO PADRONIZADO DA TELA */}
      <PageHeader
        id="header-admin-usuarios"
        icon="badge"
        title="Colaboradores & Gestão de Acessos"
        badge={
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C1E8FF] text-[#052659] border border-[#7DA0CA]/50">
            RBAC &amp; Filiais Ativas
          </span>
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Administração" },
          { label: "Colaboradores & Acessos" },
        ]}
        actions={
          <Button
            id="btn-admin-novo-usuario"
            variant="primary"
            icon="person_add"
            onClick={handleOpenCreateModal}
          >
            + Novo Colaborador
          </Button>
        }
      />

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Faixa de Indicadores de Governança (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            id="card-kpi-total-usuarios"
            title="Total de Colaboradores"
            value={kpis.total}
            unit="usuários"
            icon="group"
            trend={{ text: "Quadro geral da organização", isNeutral: true }}
            footerLeft="Todas as filiais vinculadas"
          />
          <KpiCard
            id="card-kpi-usuarios-ativos"
            title="Contas Ativas"
            value={kpis.active}
            unit="homologados"
            icon="verified_user"
            trend={{ text: `${kpis.active} operando regularmente`, isPositive: true }}
            footerLeft="Com acesso autorizado"
          />
          <KpiCard
            id="card-kpi-usuarios-pendentes"
            title="Aguardando Ativação"
            value={kpis.pending}
            unit="convites"
            icon="mark_email_unread"
            trend={{ text: "Criados por gestores de filial", isNeutral: true }}
            footerLeft="Token de primeiro acesso"
          />
          <KpiCard
            id="card-kpi-usuarios-bloqueados"
            title="Acessos Suspensos"
            value={kpis.blocked}
            unit="bloqueados"
            icon="person_off"
            trend={{ text: "Acesso revogado por auditoria", isPositive: false }}
            footerLeft="Sem emissão de OS permitida"
          />
        </div>

        {/* 3. BARRA DE FERRAMENTAS & FILTROS */}
        <div className="bg-white border border-[#C1E8FF] rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          {/* Busca textual */}
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              id="input-admin-busca-usuario"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail corporativo ou cargo..."
              className="w-full h-9.5 pl-9 pr-8 rounded-xl border border-[#7DA0CA]/60 text-xs font-medium text-[#052659] placeholder:text-slate-400 focus:outline-none focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/20 bg-white"
            />
            {search && (
              <button
                id="btn-admin-limpar-busca"
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#052659] p-0.5"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filtro por Filial */}
            <div className="flex items-center gap-1.5 bg-[#F0F6FC] px-2.5 py-1 rounded-xl border border-[#7DA0CA]/40">
              <span className="material-symbols-outlined text-[#5483B3] text-[16px]">apartment</span>
              <select
                id="select-admin-filtro-filial"
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#052659] outline-none cursor-pointer pr-1"
              >
                <option value="all">Todas as Filiais</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pílulas de Filtro de Status */}
            <div className="flex items-center gap-1 bg-[#F0F6FC] p-1 rounded-xl border border-[#7DA0CA]/40">
              {[
                { id: "all", label: "Todos" },
                { id: "active", label: "Ativos" },
                { id: "pending", label: "Pendentes" },
                { id: "blocked", label: "Bloqueados" },
              ].map((st) => (
                <button
                  key={st.id}
                  id={`btn-filtro-status-${st.id}`}
                  type="button"
                  onClick={() => setFilterStatus(st.id as "all" | ProfileStatus)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === st.id
                      ? "bg-[#052659] text-white shadow-xs"
                      : "text-[#5483B3] hover:text-[#052659] hover:bg-white/80"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. TABELA DE COLABORADORES */}
        <div className="bg-white border border-[#C1E8FF] rounded-2xl overflow-hidden shadow-xs">
          <div className="p-4 bg-[#F0F6FC] border-b border-[#C1E8FF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#052659] text-lg">manage_accounts</span>
              <h3 className="text-xs font-bold text-[#052659] uppercase tracking-wider">
                Colaboradores Cadastrados
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#5483B3]">
              {filteredProfiles.length} registros exibidos
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-3xl text-[#5483B3]">
                progress_activity
              </span>
              <span className="text-xs font-semibold">Carregando operadores do tenant...</span>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <span className="material-symbols-outlined text-4xl text-slate-300">person_search</span>
              <h4 className="text-sm font-bold text-[#052659]">Nenhum colaborador encontrado</h4>
              <p className="text-xs text-slate-500">Tente ajustar os filtros de busca ou filial.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table id="table-admin-usuarios" className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[#052659] border-b border-[#C1E8FF] text-[11px] font-bold uppercase tracking-wider select-none">
                    <th className="px-5 py-3.5">Colaborador / E-mail</th>
                    <th className="px-5 py-3.5">Filial de Lotação</th>
                    <th className="px-5 py-3.5">Papéis Concedidos</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Último Acesso</th>
                    <th className="px-5 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProfiles.map((p) => {
                    const statusCfg = STATUS_CONFIG[p.status];
                    const userGrants = grantsMap[p.id] || [];

                    return (
                      <tr
                        key={p.id}
                        id={`tr-usuario-${p.id}`}
                        className="hover:bg-[#F0F6FC]/60 transition-colors"
                      >
                        {/* Coluna Colaborador */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#052659] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {p.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-[#052659] text-xs block truncate">
                                {p.name}
                              </span>
                              <span className="font-mono text-[11px] text-slate-500 block truncate">
                                {p.email}
                              </span>
                              {p.cargo && (
                                <span className="text-[10px] text-[#5483B3] font-semibold block truncate mt-0.5">
                                  {p.cargo}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Coluna Filial */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-[#5483B3]">
                              storefront
                            </span>
                            <span className="font-medium text-slate-700">{p.branchName}</span>
                          </div>
                        </td>

                        {/* Coluna Papéis */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {userGrants.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic">
                                Sem papéis concedidos
                              </span>
                            ) : (
                              userGrants.map((g) => {
                                const cfg = ROLE_LABELS[g.role] || ROLE_LABELS.seller;
                                return (
                                  <span
                                    key={g.id}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                                  >
                                    {cfg.label}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        </td>

                        {/* Coluna Status */}
                        <td className="px-5 py-3.5">
                          <span
                            id={`badge-status-${p.id}`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.badgeClass}`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {statusCfg.icon}
                            </span>
                            <span>{statusCfg.label}</span>
                          </span>
                        </td>

                        {/* Coluna Último Acesso */}
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-slate-600 text-[11px]">
                            {p.lastLoginAt || "Nunca acessou"}
                          </span>
                        </td>

                        {/* Coluna Ações */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {p.status === "pending" && (
                              <button
                                id={`btn-usuario-reenviar-convite-${p.id}`}
                                type="button"
                                onClick={() => handleResendActivation(p)}
                                className="p-1.5 rounded-lg text-[#5483B3] hover:text-[#052659] hover:bg-[#F0F6FC] transition-colors"
                                title="Reenviar convite de ativação por e-mail"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  forward_to_inbox
                                </span>
                              </button>
                            )}

                            <button
                              id={`btn-usuario-gerenciar-acessos-${p.id}`}
                              type="button"
                              onClick={() => handleOpenGrantsDrawer(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#F0F6FC] hover:bg-[#C1E8FF] text-[#052659] font-bold text-[11px] transition-colors border border-[#7DA0CA]/40 inline-flex items-center gap-1"
                              title="Configurar papéis e filiais autorizadas"
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                admin_panel_settings
                              </span>
                              <span>Acessos</span>
                            </button>

                            <button
                              id={`btn-usuario-toggle-bloqueio-${p.id}`}
                              type="button"
                              onClick={() => handleToggleStatus(p)}
                              className={`group/lock relative w-8 h-8 rounded-lg transition-all duration-200 active:scale-90 flex items-center justify-center cursor-pointer ${
                                p.status === "blocked"
                                  ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:shadow-2xs"
                                  : "text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:shadow-2xs"
                              }`}
                              title={
                                p.status === "blocked"
                                  ? "Clique para reativar/desbloquear o acesso deste colaborador"
                                  : "Clique para suspender/bloquear o acesso deste colaborador"
                              }
                            >
                              <div className="relative w-5 h-5 flex items-center justify-center pointer-events-none">
                                {p.status === "blocked" ? (
                                  <>
                                    {/* Estado normal (Verde): lock_open */}
                                    <span className="material-symbols-outlined text-[19px] absolute transition-all duration-200 ease-out group-hover/lock:opacity-0 group-hover/lock:scale-75 group-hover/lock:-rotate-12">
                                      lock_open
                                    </span>
                                    {/* Estado hover: lock (sinaliza fechamento de trava) */}
                                    <span className="material-symbols-outlined text-[19px] absolute transition-all duration-200 ease-out opacity-0 scale-75 rotate-12 group-hover/lock:opacity-100 group-hover/lock:scale-110 group-hover/lock:rotate-0">
                                      lock
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    {/* Estado normal (Vermelho): lock */}
                                    <span className="material-symbols-outlined text-[19px] absolute transition-all duration-200 ease-out group-hover/lock:opacity-0 group-hover/lock:scale-75 group-hover/lock:rotate-12">
                                      lock
                                    </span>
                                    {/* Estado hover: lock_open (sinaliza abertura de trava) */}
                                    <span className="material-symbols-outlined text-[19px] absolute transition-all duration-200 ease-out opacity-0 scale-75 -rotate-12 group-hover/lock:opacity-100 group-hover/lock:scale-110 group-hover/lock:rotate-0">
                                      lock_open
                                    </span>
                                  </>
                                )}
                              </div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL: CADASTRO RÁPIDO DE COLABORADOR (GESTÃO SEM SENHA)                  */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div
          id="modal-admin-novo-usuario"
          className="fixed inset-0 bg-[#021024]/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-[#7DA0CA] max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F0F6FC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#052659] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#052659]">Cadastrar Novo Colaborador</h3>
                  <p className="text-[11px] text-slate-500">
                    O funcionário receberá um link seguro para definir sua própria senha.
                  </p>
                </div>
              </div>
              <button
                id="btn-modal-usuario-fechar-topo"
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Aviso de Governança de Senhas */}
            <div className="p-3 bg-[#F0F6FC] rounded-xl border border-[#7DA0CA]/50 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#052659] text-[18px] shrink-0 mt-0.5">
                shield
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Proteção Estrita de Credenciais:</strong> Gestores não criam senhas para
                colaboradores. O perfil será criado como <em>Pendente</em> e um e-mail de primeiro
                acesso com token de 24h será enviado para o endereço corporativo cadastrado.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Nome Completo */}
              <div className="space-y-1">
                <label
                  htmlFor="input-modal-usuario-nome"
                  className="text-xs font-bold text-[#052659] uppercase tracking-wider block"
                >
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-modal-usuario-nome"
                  type="text"
                  required
                  value={newProfileForm.name}
                  onChange={(e) =>
                    setNewProfileForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ex: Dra. Juliana Vasconcelos"
                  className="w-full h-9.5 px-3 border border-[#7DA0CA]/60 rounded-xl text-xs font-medium focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/20 outline-none"
                />
              </div>

              {/* E-mail Corporativo */}
              <div className="space-y-1">
                <label
                  htmlFor="input-modal-usuario-email"
                  className="text-xs font-bold text-[#052659] uppercase tracking-wider block"
                >
                  E-mail Corporativo <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-modal-usuario-email"
                  type="email"
                  required
                  value={newProfileForm.email}
                  onChange={(e) =>
                    setNewProfileForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="ex: juliana.optica@faturaotica.com.br"
                  className="w-full h-9.5 px-3 border border-[#7DA0CA]/60 rounded-xl text-xs font-medium font-mono focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/20 outline-none"
                />
              </div>

              {/* Filial de Lotação */}
              <div className="space-y-1">
                <label
                  htmlFor="select-modal-usuario-filial"
                  className="text-xs font-bold text-[#052659] uppercase tracking-wider block"
                >
                  Filial de Lotação <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-modal-usuario-filial"
                  value={newProfileForm.branchId}
                  onChange={(e) =>
                    setNewProfileForm((prev) => ({ ...prev, branchId: e.target.value }))
                  }
                  className="w-full h-9.5 px-3 border border-[#7DA0CA]/60 rounded-xl text-xs font-semibold text-[#052659] bg-white focus:border-[#5483B3] outline-none"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — ({b.roleDescription})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cargo / Função */}
              <div className="space-y-1">
                <label
                  htmlFor="input-modal-usuario-cargo"
                  className="text-xs font-bold text-[#052659] uppercase tracking-wider block"
                >
                  Cargo ou Especialidade Clínica
                </label>
                <input
                  id="input-modal-usuario-cargo"
                  type="text"
                  value={newProfileForm.cargo || ""}
                  onChange={(e) =>
                    setNewProfileForm((prev) => ({ ...prev, cargo: e.target.value }))
                  }
                  placeholder="Ex: Consultora de Atendimento / Optometrista"
                  className="w-full h-9.5 px-3 border border-[#7DA0CA]/60 rounded-xl text-xs font-medium focus:border-[#5483B3] focus:ring-2 focus:ring-[#5483B3]/20 outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  id="btn-modal-usuario-cancelar"
                  variant="outline"
                  size="md"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  id="btn-modal-usuario-salvar"
                  type="submit"
                  variant="primary"
                  size="md"
                  icon="send"
                  loadingText="Criando Colaborador..."
                >
                  Criar &amp; Enviar Convite
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER: MATRIZ DE PAPÉIS & FILIAIS AUTORIZADAS (ADMINISTRAÇÃO DE ACESSOS) */}
      {/* ========================================================================= */}
      {showGrantsDrawer && selectedUser && (
        <div
          id="drawer-admin-permissoes-usuario"
          className="fixed inset-0 bg-[#021024]/60 backdrop-blur-2xs z-50 flex justify-end"
        >
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              {/* Header do Drawer */}
              <div className="flex items-center justify-between border-b border-[#F0F6FC] pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#052659] text-2xl">
                    admin_panel_settings
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#052659]">Concessões de Acesso</h3>
                    <p className="text-[11px] text-slate-500">Matriz RBAC do Colaborador</p>
                  </div>
                </div>
                <button
                  id="btn-drawer-fechar"
                  type="button"
                  onClick={() => setShowGrantsDrawer(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Card do Usuário */}
              <div className="p-3.5 bg-[#F0F6FC] rounded-xl border border-[#7DA0CA]/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#052659]">{selectedUser.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      STATUS_CONFIG[selectedUser.status].badgeClass
                    }`}
                  >
                    {STATUS_CONFIG[selectedUser.status].label}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 block truncate">
                  {selectedUser.email}
                </span>
                <span className="text-[11px] text-[#5483B3] font-semibold block">
                  Filial Principal: {selectedUser.branchName}
                </span>
              </div>

              {/* 1. Seleção de Papéis do Sistema */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#052659] uppercase tracking-wider flex items-center justify-between">
                  <span>1. Papéis Atribuídos</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Selecione os aplicáveis)
                  </span>
                </label>

                <div className="space-y-2">
                  {(
                    [
                      {
                        role: "seller",
                        title: "Vendedor / Balcão (seller)",
                        desc: "Consulta e opera Ordens de Serviço nas filiais autorizadas.",
                      },
                      {
                        role: "branchManager",
                        title: "Gestor de Filial (branchManager)",
                        desc: "Cadastra colaboradores na sua filial e visualiza relatórios de faturamento.",
                      },
                      {
                        role: "accessAdministrator",
                        title: "Admin de Acessos (accessAdministrator)",
                        desc: "Capacidade de conceder/revogar papéis e filiais a terceiros.",
                      },
                      {
                        role: "owner",
                        title: "Dono / Diretor Geral (owner)",
                        desc: "Acesso irrestrito a todas as lojas e consolidação contábil da rede.",
                      },
                    ] as const
                  ).map((item) => {
                    const isChecked = userGrantsEdit.some((g) => g.role === item.role);
                    return (
                      <button
                        key={item.role}
                        id={`btn-toggle-papel-${item.role}`}
                        type="button"
                        onClick={() => handleToggleRole(item.role)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                          isChecked
                            ? "bg-[#052659] text-white border-[#052659] shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-[#F0F6FC]"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">
                          {isChecked ? "check_box" : "check_box_outline_blank"}
                        </span>
                        <div>
                          <div
                            className={`text-xs font-bold ${isChecked ? "text-white" : "text-[#052659]"}`}
                          >
                            {item.title}
                          </div>
                          <p
                            className={`text-[11px] mt-0.5 leading-snug ${
                              isChecked ? "text-[#C1E8FF]" : "text-slate-500"
                            }`}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Filiais Autorizadas */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-[#052659] uppercase tracking-wider flex items-center justify-between">
                  <span>2. Filiais com Acesso Autorizado</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Escopo operacional)
                  </span>
                </label>

                <div className="space-y-1.5">
                  {branches.map((b) => {
                    const hasAccess = userGrantsEdit.some((g) => g.branchId === b.id);
                    return (
                      <button
                        key={b.id}
                        id={`btn-toggle-filial-${b.id}`}
                        type="button"
                        onClick={() => handleToggleBranchScope(b.id)}
                        className={`w-full px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                          hasAccess
                            ? "bg-blue-50/80 text-[#052659] border-[#5483B3] font-bold"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#5483B3]">
                            apartment
                          </span>
                          <span>{b.name}</span>
                        </div>
                        <span className="material-symbols-outlined text-[18px]">
                          {hasAccess ? "check_circle" : "radio_button_unchecked"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Ações do Drawer */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <Button
                id="btn-drawer-salvar-concessoes"
                variant="primary"
                size="md"
                onClick={handleSaveGrants}
                loadingText="Salvando Acessos..."
                className="w-full"
              >
                Salvar Concessões
              </Button>

              <div className="flex items-center gap-2">
                <button
                  id="btn-drawer-toggle-bloqueio"
                  type="button"
                  onClick={() => handleToggleStatus(selectedUser)}
                  className={`group/drawer-lock flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    selectedUser.status === "blocked"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:shadow-2xs"
                      : "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 hover:shadow-2xs"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover/drawer-lock:scale-110">
                    {selectedUser.status === "blocked" ? "lock_open" : "lock"}
                  </span>
                  <span>{selectedUser.status === "blocked" ? "Reativar Colaborador" : "Suspender Acesso"}</span>
                </button>

                {selectedUser.status === "pending" && (
                  <button
                    id="btn-drawer-reenviar-convite"
                    type="button"
                    onClick={() => handleResendActivation(selectedUser)}
                    className="flex-1 py-2 px-3 rounded-xl border border-[#7DA0CA] bg-white hover:bg-[#F0F6FC] text-[#052659] text-xs font-bold transition-colors"
                  >
                    Reenviar Convite
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
