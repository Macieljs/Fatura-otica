"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import SidebarNav from "@/components/SidebarNav";
import { useOperator } from "@/hooks/useOperator";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, isAuthenticated, me, canManageAccess, sessionError, operator } = useOperator();
  const isStandalonePage =
    pathname === "/login" ||
    pathname === "/ativar-conta" ||
    pathname?.startsWith("/ativar-conta");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  const needsBranch = isAuthenticated && !me?.activeBranchId && !(canManageAccess && pathname.startsWith("/admin/usuarios"));
  useEffect(() => {
    if (!isStandalonePage && isLoaded && (!isAuthenticated || needsBranch)) router.replace("/login");
  }, [isStandalonePage, isLoaded, isAuthenticated, needsBranch, router]);

  if (isStandalonePage) {
    return <main id="app-shell-standalone" className="w-full min-h-screen">{children}</main>;
  }

  if (!isLoaded || !isAuthenticated || needsBranch) {
    return <main id="app-shell-session-status" role="status" className="w-full min-h-screen flex items-center justify-center text-[#052659]">
      {sessionError ?? (isLoaded ? "Redirecionando para o acesso…" : "Verificando sessão…")}
    </main>;
  }

  return (
    <>
      <SidebarNav />
      <div 
        id="app-shell-main-wrapper"
        className="flex-1 min-w-0 flex flex-col min-h-screen pt-14 md:pt-0"
      >
        <div className="flex-1 w-full max-w-[1760px] mx-auto">{children}</div>
        <footer id="footer-global-sistema" className="py-3.5 px-4 md:px-8 border-t border-[#7DA0CA]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5483B3] gap-2 bg-white/70 backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate text-[11px] md:text-xs">{operator.branch}</span>
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
