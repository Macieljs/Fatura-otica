"use client";

import { useState, useEffect, useCallback } from "react";

export type UserRole = "gerente" | "consultor";

export interface OperatorData {
  name: string;
  role: string;
  roleType: UserRole;
  branch: string;
  loginTime: string;
}

const DEFAULT_OPERATOR: OperatorData = {
  name: "Dr. Carlos Ramos",
  role: "Gerente Operacional & Optometrista",
  roleType: "gerente",
  branch: "Filial Centro - Loja 01 Matriz",
  loginTime: "08:00",
};

/**
 * Hook de sessão unificado e reativo para controle de acesso baseado em papel (RBAC MVP).
 * Lê e sincroniza a sessão do operador gravada em localStorage ("fatura_otica_operator").
 * Notifica abas e componentes instantaneamente em mudanças de operador.
 */
export function useOperator() {
  const [operator, setOperator] = useState<OperatorData>(DEFAULT_OPERATOR);
  const [isLoaded, setIsLoaded] = useState(false);

  const syncFromStorage = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("fatura_otica_operator");
      if (stored) {
        const parsed = JSON.parse(stored);
        const isManager =
          parsed.roleType === "gerente" ||
          (parsed.role && parsed.role.toLowerCase().includes("gerente")) ||
          (parsed.name && parsed.name.toLowerCase().includes("carlos"));

        setOperator({
          name: parsed.name || (isManager ? "Dr. Carlos Ramos" : "Mariana Souza"),
          role: parsed.role || (isManager ? "Gerente Operacional & Optometrista" : "Consultora de Atendimento"),
          roleType: isManager ? "gerente" : "consultor",
          branch: parsed.branch || "Filial Centro - Loja 01 Matriz",
          loginTime: parsed.loginTime || "08:00",
        });
      }
    } catch (e) {
      console.error("Erro ao sincronizar operador:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    syncFromStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fatura_otica_operator") {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("fatura_otica_operator_change", syncFromStorage);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("fatura_otica_operator_change", syncFromStorage);
    };
  }, [syncFromStorage]);

  const setOperatorAndSave = (data: Partial<OperatorData>) => {
    const updated: OperatorData = { ...operator, ...data };
    try {
      localStorage.setItem("fatura_otica_operator", JSON.stringify(updated));
      window.dispatchEvent(new Event("fatura_otica_operator_change"));
    } catch (e) {
      console.error("Erro ao salvar operador:", e);
    }
    setOperator(updated);
  };

  const isManager = operator.roleType === "gerente";
  const isConsultant = operator.roleType === "consultor";

  return {
    operator,
    role: operator.roleType,
    isManager,
    isConsultant,
    isLoaded,
    setOperator: setOperatorAndSave,
  };
}
