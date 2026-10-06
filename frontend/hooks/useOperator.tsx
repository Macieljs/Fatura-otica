"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

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

const getInitialOperator = (): OperatorData => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("fatura_otica_operator");
      if (stored) {
        const parsed = JSON.parse(stored);
        const isManager =
          parsed.roleType === "gerente" ||
          (parsed.role && parsed.role.toLowerCase().includes("gerente")) ||
          (parsed.name && parsed.name.toLowerCase().includes("carlos"));

        return {
          name: parsed.name || (isManager ? "Dr. Carlos Ramos" : "Mariana Souza"),
          role: parsed.role || (isManager ? "Gerente Operacional & Optometrista" : "Consultora de Atendimento"),
          roleType: isManager ? "gerente" : "consultor",
          branch: parsed.branch || "Filial Centro - Loja 01 Matriz",
          loginTime: parsed.loginTime || "08:00",
        };
      }
    } catch {
      // Ignora erro
    }
  }
  return DEFAULT_OPERATOR;
};

interface OperatorContextType {
  operator: OperatorData;
  role: UserRole;
  isManager: boolean;
  isConsultant: boolean;
  isLoaded: boolean;
  setOperator: (data: Partial<OperatorData>) => void;
}

const OperatorContext = createContext<OperatorContextType>({
  operator: DEFAULT_OPERATOR,
  role: "gerente",
  isManager: true,
  isConsultant: false,
  isLoaded: true,
  setOperator: () => {},
});

/**
 * Provedor de contexto global de operador (RBAC).
 * Montado uma única vez no RootLayout para persistir o estado do operador
 * em memória entre todas as transições de rotas do Next.js sem causar
 * hydration mismatch entre SSR e cliente.
 */
export function OperatorProvider({ children }: { children: React.ReactNode }) {
  const [operator, setOperator] = useState<OperatorData>(getInitialOperator);
  const [isLoaded, setIsLoaded] = useState(true);

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
    const timer = setTimeout(syncFromStorage, 0);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fatura_otica_operator") {
        syncFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("fatura_otica_operator_change", syncFromStorage);

    return () => {
      clearTimeout(timer);
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

  return (
    <OperatorContext.Provider
      value={{
        operator,
        role: operator.roleType,
        isManager,
        isConsultant,
        isLoaded,
        setOperator: setOperatorAndSave,
      }}
    >
      {children}
    </OperatorContext.Provider>
  );
}

/**
 * Hook de sessão unificado e reativo para controle de acesso baseado em papel (RBAC MVP).
 * Lê o estado global fornecido pelo OperatorProvider mantido em memória no AppShell.
 */
export function useOperator() {
  return useContext(OperatorContext);
}
