"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleCollapse: () => {},
  setCollapsed: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("fatura_otica_sidebar_collapsed");
        if (saved !== null) {
          setIsCollapsed(saved === "true");
        } else {
          // Telas de notebook / balcão compacto (1024px a 1300px) iniciam colapsadas para dar espaço à receita clínica
          if (window.innerWidth >= 1024 && window.innerWidth < 1340) {
            setIsCollapsed(true);
          }
        }
      } catch {
        // Ignora erro de storage
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("fatura_otica_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  }, []);

  const setCollapsed = useCallback((val: boolean) => {
    setIsCollapsed(val);
    try {
      localStorage.setItem("fatura_otica_sidebar_collapsed", String(val));
    } catch {}
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
