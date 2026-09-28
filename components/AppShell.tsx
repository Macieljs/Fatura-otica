"use client";

import { usePathname } from "next/navigation";
import SidebarNav from "@/components/SidebarNav";
import { useSidebar } from "@/context/SidebarContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <>
      <SidebarNav />
      <div 
        id="app-shell-main-wrapper"
        className={`flex-1 min-w-0 flex flex-col min-h-screen pt-14 md:pt-0 transition-[margin] duration-200 ease-in-out ${
          isCollapsed ? "md:ml-[72px]" : "md:ml-64"
        }`}
      >
        <div className="flex-1 w-full max-w-[1760px] mx-auto">{children}</div>
        <footer id="footer-global-sistema" className="py-3.5 px-4 md:px-8 border-t border-[#7DA0CA]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5483B3] gap-2 bg-white/70 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate text-[11px] md:text-xs">Módulo de auditoria fiscal e controle de Kardex ativo para Filial Centro.</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4 text-[11px] text-[#7DA0CA]">
            <span className="font-mono">Fatura Ótica v4.8.2</span>
            <span>•</span>
            <a className="hover:underline hover:text-[#052659]" href="#">
              Políticas Oftalmológicas
            </a>
            <span>•</span>
            <a className="hover:underline hover:text-[#052659]" href="#">
              Suporte Clínico
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
