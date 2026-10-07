"use client";

import {
  Profile,
  Branch,
  Grant,
  CreateProfileRequest,
  ProfileStatus,
  Me,
} from "@/types/identity";

const STORAGE_KEY_PROFILES = "fatura_otica_mock_profiles";
const STORAGE_KEY_GRANTS = "fatura_otica_mock_grants";
const STORAGE_KEY_BRANCHES = "fatura_otica_mock_branches";
const STORAGE_KEY_ACTIVE_BRANCH = "fatura_otica_mock_active_branch";

export const MOCK_BRANCHES: Branch[] = [
  {
    id: "branch-matriz",
    name: "Filial Centro - Loja 01 (Matriz)",
    cnpj: "14.238.991/0001-44",
    roleDescription: "Varejo & Consultório Oftálmico",
    isMatriz: true,
  },
  {
    id: "branch-shopping",
    name: "Filial Shopping Norte - Loja 02",
    cnpj: "14.238.991/0002-25",
    roleDescription: "Varejo Express & Balcão",
    isMatriz: false,
  },
  {
    id: "branch-lab",
    name: "Laboratório Central de Surfaçagem",
    cnpj: "14.238.991/0003-06",
    roleDescription: "Unidade Fabril, Montagem & Facetamento",
    isMatriz: false,
  },
];

export const INITIAL_PROFILES: Profile[] = [
  {
    id: "usr-01",
    name: "Dr. Carlos Ramos",
    email: "carlos.ramos@faturaotica.com.br",
    status: "active",
    branchId: "branch-matriz",
    branchName: "Filial Centro - Loja 01 (Matriz)",
    cargo: "Diretor Clínico & Optometrista",
    createdAt: "10/01/2026",
    lastLoginAt: "Hoje, 08:30",
  },
  {
    id: "usr-02",
    name: "Mariana Souza",
    email: "mariana.souza@faturaotica.com.br",
    status: "active",
    branchId: "branch-shopping",
    branchName: "Filial Shopping Norte - Loja 02",
    cargo: "Consultora Óptica de Atendimento",
    createdAt: "15/02/2026",
    lastLoginAt: "Hoje, 11:22",
  },
  {
    id: "usr-03",
    name: "Lucas Mendes",
    email: "lucas.mendes@faturaotica.com.br",
    status: "active",
    branchId: "branch-lab",
    branchName: "Laboratório Central de Surfaçagem",
    cargo: "Técnico Responsável de Laboratório (CFT-1092)",
    createdAt: "22/02/2026",
    lastLoginAt: "Ontem, 17:45",
  },
  {
    id: "usr-04",
    name: "Dra. Camila Vasconcelos",
    email: "camila.vasconcelos@faturaotica.com.br",
    status: "pending",
    branchId: "branch-matriz",
    branchName: "Filial Centro - Loja 01 (Matriz)",
    cargo: "Optometrista / Especialista em Lentes Multifocais",
    createdAt: "Hoje, 14:10",
  },
  {
    id: "usr-05",
    name: "Roberto Silva",
    email: "roberto.silva@faturaotica.com.br",
    status: "blocked",
    branchId: "branch-shopping",
    branchName: "Filial Shopping Norte - Loja 02",
    cargo: "Vendedor Júnior",
    createdAt: "05/01/2026",
    lastLoginAt: "01/03/2026",
  },
];

export const INITIAL_GRANTS: Record<string, Grant[]> = {
  "usr-01": [
    { id: "g-01", role: "owner", scope: "tenant" },
    { id: "g-02", role: "accessAdministrator", scope: "tenant" },
    { id: "g-03", role: "branchManager", scope: "branch", branchId: "branch-matriz" },
  ],
  "usr-02": [
    { id: "g-04", role: "seller", scope: "branch", branchId: "branch-shopping" },
  ],
  "usr-03": [
    { id: "g-05", role: "branchManager", scope: "branch", branchId: "branch-lab" },
    { id: "g-06", role: "seller", scope: "branch", branchId: "branch-lab" },
  ],
  "usr-04": [
    { id: "g-07", role: "seller", scope: "branch", branchId: "branch-matriz" },
  ],
  "usr-05": [
    { id: "g-08", role: "seller", scope: "branch", branchId: "branch-shopping" },
  ],
};

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignora em caso de cota de armazenamento
  }
}

/**
 * Serviço de Mock local alinhado 1:1 com os endpoints da Sprint 01 do backend.
 * Permite navegação, criação, alteração de permissões e bloqueio com latência realista.
 */
export const identityMockService = {
  async getBranches(): Promise<Branch[]> {
    await new Promise((r) => setTimeout(r, 200));
    return getStorageItem(STORAGE_KEY_BRANCHES, MOCK_BRANCHES);
  },

  async getUsers(): Promise<{ profiles: Profile[]; grantsMap: Record<string, Grant[]> }> {
    await new Promise((r) => setTimeout(r, 300));
    const profiles = getStorageItem(STORAGE_KEY_PROFILES, INITIAL_PROFILES);
    const grantsMap = getStorageItem(STORAGE_KEY_GRANTS, INITIAL_GRANTS);
    return { profiles, grantsMap };
  },

  async createProfile(req: CreateProfileRequest): Promise<Profile> {
    await new Promise((r) => setTimeout(r, 450));
    const profiles = getStorageItem<Profile[]>(STORAGE_KEY_PROFILES, INITIAL_PROFILES);
    const branches = getStorageItem<Branch[]>(STORAGE_KEY_BRANCHES, MOCK_BRANCHES);

    const branch = branches.find((b) => b.id === req.branchId) || branches[0];
    const newId = `usr-${Date.now().toString().slice(-4)}`;

    const newProfile: Profile = {
      id: newId,
      name: req.name.trim(),
      email: req.email.toLowerCase().trim(),
      status: "pending",
      branchId: req.branchId,
      branchName: branch.name,
      cargo: req.cargo?.trim() || "Consultor de Atendimento",
      createdAt: "Hoje",
    };

    const updatedProfiles = [newProfile, ...profiles];
    setStorageItem(STORAGE_KEY_PROFILES, updatedProfiles);

    // Concessão padrão inicial para nova conta pendente: seller na filial de lotação
    const grantsMap = getStorageItem<Record<string, Grant[]>>(STORAGE_KEY_GRANTS, INITIAL_GRANTS);
    grantsMap[newId] = [
      {
        id: `g-${Date.now()}`,
        role: "seller",
        scope: "branch",
        branchId: req.branchId,
      },
    ];
    setStorageItem(STORAGE_KEY_GRANTS, grantsMap);

    return newProfile;
  },

  async updateUserGrants(userId: string, grants: Grant[]): Promise<Grant[]> {
    await new Promise((r) => setTimeout(r, 400));
    const grantsMap = getStorageItem<Record<string, Grant[]>>(STORAGE_KEY_GRANTS, INITIAL_GRANTS);
    grantsMap[userId] = grants;
    setStorageItem(STORAGE_KEY_GRANTS, grantsMap);
    return grants;
  },

  async updateUserStatus(userId: string, status: ProfileStatus): Promise<ProfileStatus> {
    await new Promise((r) => setTimeout(r, 350));
    const profiles = getStorageItem<Profile[]>(STORAGE_KEY_PROFILES, INITIAL_PROFILES);
    const updated = profiles.map((p) => (p.id === userId ? { ...p, status } : p));
    setStorageItem(STORAGE_KEY_PROFILES, updated);
    return status;
  },

  async resendActivation(_userId: string): Promise<{ token: string; expiresAt: string }> {
    void _userId;
    await new Promise((r) => setTimeout(r, 400));
    return {
      token: `FO-ACT-${Math.floor(1000 + Math.random() * 9000)}-VALID`,
      expiresAt: "24 horas",
    };
  },

  async activateAccount(
    token: string,
    password: string,
    name?: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 600));
    if (!token || !password || password.length < 8) {
      throw new Error("Senha deve conter no mínimo 8 caracteres e token válido.");
    }
    // Ativa o primeiro usuário pendente para efeito de demonstração
    const profiles = getStorageItem<Profile[]>(STORAGE_KEY_PROFILES, INITIAL_PROFILES);
    const pendingIdx = profiles.findIndex((p) => p.status === "pending");
    if (pendingIdx !== -1) {
      profiles[pendingIdx].status = "active";
      if (name) profiles[pendingIdx].name = name;
      setStorageItem(STORAGE_KEY_PROFILES, profiles);
    }
    return {
      success: true,
      message: "Conta ativada com sucesso. Você já pode acessar o sistema com sua nova senha.",
    };
  },

  async getMe(): Promise<Me> {
    await new Promise((r) => setTimeout(r, 150));
    const branches = getStorageItem<Branch[]>(STORAGE_KEY_BRANCHES, MOCK_BRANCHES);
    const activeBranchId = getStorageItem<string>(STORAGE_KEY_ACTIVE_BRANCH, branches[0].id);

    return {
      profile: INITIAL_PROFILES[0],
      branches,
      tenantRoles: ["owner", "accessAdministrator", "branchManager"],
      grants: INITIAL_GRANTS["usr-01"],
      activeBranchId,
    };
  },

  async setActiveBranch(branchId: string): Promise<string> {
    await new Promise((r) => setTimeout(r, 200));
    setStorageItem(STORAGE_KEY_ACTIVE_BRANCH, branchId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("fatura_otica_branch_change"));
    }
    return branchId;
  },
};
