"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const getInitialCollapsed = (): boolean => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("fatura_otica_sidebar_collapsed");
      if (saved !== null) {
        return saved === "true";
      }
      if (window.innerWidth >= 1024 && window.innerWidth < 1340) {
        return true;
      }
    } catch {
      // Ignora erro de storage
    }
  }
  return false;
};

interface SidebarContextType {
  isCollapsed: boolean;
  isMounted: boolean;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isMounted: false,
  toggleCollapse: () => {},
  setCollapsed: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(getInitialCollapsed);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Habilita as transições CSS apenas após a montagem inicial do layout (Zero Shift)
    const frameId = requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => cancelAnimationFrame(frameId);
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
    <SidebarContext.Provider value={{ isCollapsed, isMounted, toggleCollapse, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
