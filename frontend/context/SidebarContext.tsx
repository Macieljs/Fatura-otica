"use client";

import React, { createContext, useContext, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "fatura_otica_sidebar_collapsed";
const listeners = new Set<() => void>();

// Fonte da verdade: atributo data-sidebar no <html>, definido antes da pintura pelo script do layout.
const getSnapshot = () => document.documentElement.dataset.sidebar === "collapsed";
const getServerSnapshot = () => false;
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const apply = (collapsed: boolean) => {
  if (collapsed) document.documentElement.dataset.sidebar = "collapsed";
  else delete document.documentElement.dataset.sidebar;
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  } catch {}
  listeners.forEach((l) => l());
};

/** Script inline (layout) que aplica a preferência antes da primeira pintura. */
export const SIDEBAR_INIT_SCRIPT = `try{var s=localStorage.getItem("${STORAGE_KEY}");if(s==="true"||(s===null&&innerWidth>=1024&&innerWidth<1340))document.documentElement.dataset.sidebar="collapsed"}catch(e){}`;

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
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggleCollapse = useCallback(() => apply(!getSnapshot()), []);
  const setCollapsed = useCallback((val: boolean) => apply(val), []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
