"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useOperator } from "@/hooks/useOperator";
import { useSidebar } from "@/context/SidebarContext";
import OpticalBrandLogo from "@/components/OpticalBrandLogo";

interface NavItem {
  id: string;
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  badge?: string;
  badgeColor?: string;
  shortcut?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function SidebarNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { operator, isManager } = useOperator();
  const { isCollapsed, toggleCollapse } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navGroups: NavGroup[] = [
    {
      group: isManager ? "Visão Executiva" : "Visão Operacional",
      items: [
        { id: "nav-link-dashboard", href: "/", label: "Dashboard", icon: "dashboard", exact: true },
        { id: "nav-link-kardex", href: "/kardex", label: "Kardex", icon: "monitoring", exact: true },
      ],
    },
    {
      group: "Atendimento & Balcão",
      items: [
        {
          id: "nav-link-ordens-fila",
          href: "/ordens-de-servico/fila",
          label: "Ordens de Serviço",
          icon: "assignment",
          badge: "12",
          badgeColor: "bg-[#5483B3] text-white",
        },
        {
          id: "nav-link-notificar-whatsapp",
          href: "/ordens-de-servico/notificar-whatsapp?id=10294",
          label: "Notificar WhatsApp",
          icon: "chat",
          shortcut: "[W]",
        },
        {
          id: "nav-link-nova-os",
          href: "/ordens-de-servico",
          label: "Nova Venda / OS",
          icon: "add_shopping_cart",
          shortcut: "[F2]",
          exact: true,
        },
      ],
    },
    {
      group: "Estoque & Logística",
      items: isManager
        ? [
            { id: "nav-link-estoque", href: "/estoque", label: "Catálogo Armações", icon: "qr_code_2" },
            { id: "nav-link-entrada-nfe", href: "/kardex/entrada-nfe", label: "Entrada NF-e XML", icon: "receipt_long" },
            { id: "nav-link-ajuste-manual", href: "/kardex/ajuste-manual", label: "Ajuste & Avaria", icon: "construction" },
            {
              id: "nav-link-sugestoes-compra",
              href: "/kardex/sugestoes-compra",
              label: "Sugestões de Compra",
              icon: "production_quantity_limits",
              badge: "8",
              badgeColor: "bg-red-500/20 text-red-300 border border-red-500/40",
            },
          ]
        : [
            { id: "nav-link-estoque", href: "/estoque", label: "Catálogo Armações", icon: "qr_code_2" },
            { id: "nav-link-entrada-nfe", href: "/kardex/entrada-nfe", label: "Entrada NF-e XML", icon: "receipt_long" },
          ],
    },
  ];

  const isItemActive = (href: string, exact?: boolean) => {
    const cleanHref = href.split("?")[0];
    if (exact || cleanHref === "/") {
      return pathname === cleanHref;
    }
    if (cleanHref === "/ordens-de-servico/fila") {
      return pathname === "/ordens-de-servico/fila" || pathname.startsWith("/ordens-de-servico/detalhes");
    }
    return pathname.startsWith(cleanHref);
  };

  const navContent = (forceExpanded = false) => {
    const collapsed = forceExpanded ? false : isCollapsed;

    return (
      <div className="flex flex-col h-full justify-between">
        {/* Top Section */}
        <div className="flex flex-col overflow-y-auto overflow-x-hidden">
          {/* Brand Header */}
          <div className={`h-16 flex items-center border-b border-[#021024] bg-[#031c44] flex-shrink-0 transition-all ${
            collapsed ? "px-2 justify-center" : "px-4 justify-between"
          }`}>
            <Link id="nav-link-brand-home" href="/" className={`flex items-center ${collapsed ? "justify-center w-full" : ""}`}>
              {collapsed ? (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#052659] to-[#5483B3] border border-[#7DA0CA]/50 flex items-center justify-center text-white shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">visibility</span>
                </div>
              ) : (
                <OpticalBrandLogo size="md" subtitle="v4.8 Enterprise" badge="MATRIZ" />
              )}
            </Link>

            {/* Desktop Collapse Toggle Button (When Expanded) */}
            {!forceExpanded && !collapsed && (
              <button
                id="btn-sidebar-toggle-collapse"
                type="button"
                onClick={toggleCollapse}
                title="Recolher Menu Lateral [Alt+B]"
                className="hidden md:flex p-1.5 rounded-lg text-[#C1E8FF] hover:text-white hover:bg-[#5483B3]/20 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">first_page</span>
              </button>
            )}

            {/* Mobile close button */}
            <button
              id="btn-sidebar-mobile-close"
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-[#C1E8FF] hover:text-white p-1"
              title="Fechar menu"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Desktop Expand Toggle Button (When Collapsed - Centered Perfectly) */}
          {collapsed && !forceExpanded && (
            <div className="px-2 pt-2.5 pb-0.5 flex justify-center">
              <button
                id="btn-sidebar-toggle-collapse-collapsed"
                type="button"
                onClick={toggleCollapse}
                title="Expandir Menu Lateral [Alt+B]"
                className="hidden md:flex w-10 h-7.5 rounded-lg text-[#C1E8FF] hover:text-white hover:bg-[#5483B3]/25 transition-colors cursor-pointer items-center justify-center border border-[#5483B3]/30 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[18px]">last_page</span>
              </button>
            </div>
          )}

          {/* Live Optical Engine Pulse Badge */}
          {collapsed ? (
            <div 
              className="mx-auto mt-2 w-8 h-8 rounded-lg bg-[#021024]/70 border border-[#5483B3]/30 flex items-center justify-center shadow-2xs"
              title="EDI Óptico Conectado • Tolerância ±0.25D"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
          ) : (
            <div className="mx-3 mt-3 px-2.5 py-1.5 rounded-lg bg-[#021024]/70 border border-[#5483B3]/30 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono text-[#C1E8FF] font-semibold">
                  EDI Óptico Conectado
                </span>
              </div>
              <span className="text-[9px] font-mono text-[#7DA0CA] bg-[#052659] px-1.5 py-0.2 rounded font-bold border border-[#5483B3]/40">
                ±0.25D
              </span>
            </div>
          )}

          {/* Navigation Groups */}
          <div className={`space-y-4 ${collapsed ? "p-2" : "p-3"}`}>
            {navGroups.map((group, gIdx) => (
              <div key={gIdx}>
                {!collapsed && (
                  <div className="px-2.5 pb-1.5 text-[10px] font-bold tracking-wider text-[#7DA0CA] uppercase">
                    {group.group}
                  </div>
                )}
                {collapsed && gIdx > 0 && (
                  <div className="my-2 border-t border-[#021024]" />
                )}
                <nav className="space-y-1">
                  {group.items.map((item, iIdx) => {
                    const active = isItemActive(item.href, item.exact);
                    return (
                      <Link
                        key={iIdx}
                        id={item.id}
                        href={item.href}
                        title={collapsed ? `${item.label} ${item.shortcut ? `(${item.shortcut})` : ""}` : undefined}
                        className={`rounded-lg transition-all relative group flex items-center ${
                          collapsed
                            ? "h-11 w-11 mx-auto justify-center"
                            : "w-full px-2.5 py-2 justify-between font-medium text-[13px]"
                        } ${
                          active
                            ? "bg-[#5483B3] text-white shadow-xs font-semibold"
                            : "text-[#C1E8FF] hover:bg-[#C1E8FF]/10 hover:text-white"
                        }`}
                      >
                        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5 min-w-0"}`}>
                          <span
                            className={`material-symbols-outlined text-[20px] ${
                              active ? "text-white" : "text-[#7DA0CA]"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </div>

                        {/* Collapsed Tooltip / Floating Badge */}
                        {collapsed ? (
                          <>
                            {item.badge && (
                              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#5483B3] text-white text-[9px] font-mono font-bold flex items-center justify-center border border-[#052659]">
                                {item.badge}
                              </span>
                            )}
                            {active && (
                              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#C1E8FF]"></span>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {item.badge && (
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${item.badgeColor}`}
                              >
                                {item.badge}
                              </span>
                            )}
                            {item.shortcut && (
                              <span className="text-[10px] font-mono text-[#7DA0CA]">
                                {item.shortcut}
                              </span>
                            )}
                            {active && !item.badge && !item.shortcut && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                            )}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className={`border-t border-[#021024] bg-[#021024]/60 flex-shrink-0 ${collapsed ? "p-2" : "p-3"}`}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Link
                id="btn-sidebar-user-avatar"
                href="/login"
                title={`${operator.name} • ${operator.role} • Trocar`}
                className="relative w-9 h-9 rounded-xl bg-[#5483B3]/20 border border-[#5483B3]/40 flex items-center justify-center text-[#C1E8FF] hover:border-white transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">account_circle</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#052659]"></span>
              </Link>
              <Link
                id="btn-sidebar-trocar-operador"
                href="/login"
                title="Sair / Trocar de Terminal"
                className="p-1 rounded-lg text-[#7DA0CA] hover:text-white hover:bg-[#5483B3]/20 transition-all flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </Link>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-[#031c44] border border-[#7DA0CA]/30 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#5483B3]/20 border border-[#5483B3]/40 flex items-center justify-center text-[#C1E8FF] flex-shrink-0">
                  <span className="material-symbols-outlined text-lg">account_circle</span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-white truncate">{operator.name}</span>
                    {isManager ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono">
                        GERENTE
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 font-mono">
                        BALCÃO
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#C1E8FF]/70 truncate">{operator.role}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[9px] font-mono text-emerald-300 font-medium truncate">
                      Terminal • {operator.branch.split(" - ")[0]}
                    </span>
                  </div>
                </div>
              </div>
              <Link
                id="btn-sidebar-trocar-operador"
                href="/login"
                title="Sair / Trocar de Terminal"
                className="p-1.5 rounded-lg text-[#7DA0CA] hover:text-white hover:bg-[#5483B3]/20 transition-all flex items-center justify-center flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#052659] border-b border-[#021024] z-40 flex items-center justify-between px-4 text-white">
        <Link href="/" className="flex items-center">
          <OpticalBrandLogo size="sm" subtitle="" badge="" />
        </Link>
        <button
          id="btn-sidebar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg bg-[#5483B3]/20 text-[#C1E8FF] hover:text-white"
          title="Abrir menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
      </div>

      {/* Desktop Persistent Sidebar (Adaptive Collapsible Width) */}
      <aside 
        id="sidebar-nav-desktop-aside"
        className={`hidden md:flex flex-shrink-0 bg-[#052659] border-r border-[#021024] flex-col fixed top-0 bottom-0 left-0 z-40 select-none transition-[width] duration-200 ease-in-out ${
          isCollapsed ? "w-[72px]" : "w-64"
        }`}
      >
        {navContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-72 bg-[#052659] h-full shadow-2xl flex flex-col"
          >
            {navContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
