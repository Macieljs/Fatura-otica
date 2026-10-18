"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Schemas } from "@/generated/identity";
import { getCurrentMe, restoreSession, SESSION_CHANGED } from "@/services/identityClient";

export type UserRole = "gerente" | "consultor";
export interface OperatorData {
  name: string;
  role: string;
  roleType: UserRole;
  branch: string;
  loginTime: string;
}
interface OperatorContextType {
  operator: OperatorData;
  role: UserRole;
  isManager: boolean;
  isConsultant: boolean;
  isLoaded: boolean;
  isAuthenticated: boolean;
  canManageAccess: boolean;
  me: Schemas["Me"] | null;
  sessionError: string | null;
}
const EMPTY: OperatorData = { name: "", role: "", roleType: "consultor", branch: "", loginTime: "" };
const OperatorContext = createContext<OperatorContextType>({
  operator: EMPTY, role: "consultor", isManager: false, isConsultant: false,
  isLoaded: false, isAuthenticated: false, canManageAccess: false, me: null, sessionError: null,
});

export function OperatorProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Schemas["Me"] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    const sync = () => { if (mounted) { setMe(getCurrentMe()); setSessionError(null); } };
    window.addEventListener(SESSION_CHANGED, sync);
    try { localStorage.removeItem("fatura_otica_operator"); } catch { /* Storage can be disabled. */ }
    restoreSession().then(sync).catch(() => {
      if (mounted) setSessionError("Não foi possível verificar sua sessão. Confira a conexão com o servidor.");
    }).finally(() => { if (mounted) setIsLoaded(true); });
    return () => { mounted = false; window.removeEventListener(SESSION_CHANGED, sync); };
  }, []);
  const owner = me?.tenantRoles.includes("owner") ?? false;
  const canManageAccess = owner || (me?.tenantRoles.includes("accessAdministrator") ?? false);
  const isManager = owner || (me?.grants.some(grant => grant.role === "branchManager" && grant.branchId === me.activeBranchId) ?? false);
  const isConsultant = !!me && !isManager && me.grants.some(grant => grant.role === "seller" && grant.branchId === me.activeBranchId);
  const operator: OperatorData = me ? {
    name: me.profile.name,
    role: owner ? "Proprietário" : canManageAccess ? "Administrador de acessos" : isManager ? "Gestor de filial" : "Vendedor",
    roleType: isManager ? "gerente" : "consultor",
    branch: me.branches.find(branch => branch.id === me.activeBranchId)?.name ?? "Selecione uma filial",
    loginTime: "",
  } : EMPTY;
  return <OperatorContext.Provider value={{ operator, role: operator.roleType, isManager, isConsultant,
    isLoaded, isAuthenticated: !!me, canManageAccess, me, sessionError }}>{children}</OperatorContext.Provider>;
}

export function useOperator() { return useContext(OperatorContext); }
