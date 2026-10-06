/**
 * Tipos de Identidade e Acesso Empresarial (RBAC & Multi-tenant)
 * Alinhados 1:1 com o contrato oficial de API do backend:
 * backend/docs/contracts/identity.openapi.yaml (Sprint 01)
 */

export type ProfileStatus = "pending" | "active" | "blocked";

export type Role = "seller" | "branchManager" | "owner" | "accessAdministrator";

export type Scope = "tenant" | "branch";

export interface Branch {
  id: string;
  name: string;
  cnpj?: string;
  roleDescription?: string;
  isMatriz?: boolean;
}

export interface Grant {
  id: string;
  role: Role;
  scope: Scope;
  branchId?: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  status: ProfileStatus;
  branchId?: string;
  branchName?: string;
  cargo?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Me {
  profile: Profile;
  branches: Branch[];
  tenantRoles: Role[];
  grants: Grant[];
  activeBranchId: string | null;
}

export interface Session {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
  me: Me;
}

export interface CreateProfileRequest {
  email: string;
  name: string;
  branchId: string;
  cargo?: string;
}

export interface GrantRequest {
  role: Role;
  scope: Scope;
  branchId?: string;
}

export interface UserStateRequest {
  status: "active" | "blocked";
}

export interface ActivateRequest {
  token: string;
  password: string;
  name?: string;
}

export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  traceId?: string;
  code: string;
  errors?: Record<string, string[]>;
}
