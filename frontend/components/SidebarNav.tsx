"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const { isCollapsed, isMounted, toggleCollapse } = useSidebar();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  const navGroups: NavGroup[] = [
    {
      group: isManager ? "Visão Executiva" : "Visão Operacional",
      items: [
        { id: "nav-link-dashboard", href: "/", label: "Dashboard", icon: "dashboard", exact: true },
        { id: "nav-link-kardex", href: "/kardex", label: "Kardex", icon: "swap_horiz", exact: true },
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
          icon: "add_circle",
          shortcut: "[F2]",
          exact: true,
        },
      ],
    },
    {
      group: "Estoque & Logística",
      items: isManager
        ? [
            { id: "nav-link-estoque", href: "/estoque", label: "Catálogo Armações", icon: "inventory_2" },
            { id: "nav-link-entrada-nfe", href: "/kardex/entrada-nfe", label: "Entrada NF-e XML", icon: "receipt_long" },
            { id: "nav-link-ajuste-manual", href: "/kardex/ajuste-manual", label: "Ajuste & Avaria", icon: "tune" },
            {
              id: "nav-link-sugestoes-compra",
              href: "/kardex/sugestoes-compra",
              label: "Sugestões de Compra",
              icon: "shopping_cart",
              badge: "8",
              badgeColor: "bg-red-500/20 text-red-300 border border-red-500/40",
            },
          ]
        : [
            { id: "nav-link-estoque", href: "/estoque", label: "Catálogo Armações", icon: "inventory_2" },
            { id: "nav-link-entrada-nfe", href: "/kardex/entrada-nfe", label: "Entrada NF-e XML", icon: "receipt_long" },
          ],
    },
    ...(isManager
      ? [
          {
            group: "Administração & Acessos",
            items: [
              {
                id: "nav-link-admin-usuarios",
                href: "/admin/usuarios",
                label: "Colaboradores & Acessos",
                icon: "badge",
              },
            ],
          },
        ]
      : []),
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

  const getInitials = (name: string) => {
    if (!name) return "FO";
    const clean = name.replace(/^(Dr\.|Dra\.)\s*/i, "").trim();
    const parts = clean.split(" ").filter(Boolean);
    if (parts.length === 0) return "FO";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const navContent = (forceExpanded = false) => {
    const collapsed = forceExpanded ? false : isCollapsed;
    const initials = getInitials(operator.name);

    return (
      <div className="flex flex-col h-full justify-between">
        {/* Top Section */}
        <div className={`flex flex-col flex-1 min-h-0 ${collapsed ? "overflow-visible" : "overflow-y-auto overflow-x-hidden"}`}>
          {/* Brand Header: Altura Fixa Rigorosa de 64px (Zero Shift) */}
          <div className="h-16 flex items-center border-b border-[#021024] bg-[#031c44] flex-shrink-0 px-3.5 justify-between overflow-hidden">
            <Link
              id="nav-link-brand-home"
              href="/"
              prefetch={true}
              className={`flex items-center min-w-0 cursor-pointer active:scale-95 transition-transform duration-100 ${
                collapsed ? "justify-center relative group w-full" : "justify-start gap-2.5"
              }`}
            >
              <div className="shrink-0 flex items-center justify-center">
                <OpticalBrandLogo size="md" showText={false} />
              </div>
              <div
                className={`overflow-hidden transition-all duration-200 whitespace-nowrap ${
                  collapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[180px] opacity-100 pointer-events-auto"
                }`}
              >
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-[16px] font-bold tracking-tight font-sans text-white">
                    Fatura <span className="text-[#5483b3] font-black">Ótica</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[#021024] text-[#c1e8ff] border border-[#5483b3]/40">
                    MATRIZ
                  </span>
                </div>
                <span className="text-[11px] font-mono tracking-tight text-[#7da0ca] mt-0.5 block">
                  v4.8 Enterprise
                </span>
              </div>
              {collapsed && (
                <div
                  role="tooltip"
                  className="hidden md:block absolute left-[56px] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out translate-x-[-4px] group-hover:translate-x-0"
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#021024] text-white text-xs font-semibold shadow-xl border border-[#5483B3]/40 whitespace-nowrap backdrop-blur-md">
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#021024] border-l border-b border-[#5483B3]/40 rotate-45"></div>
                    <span className="text-[#F0F6FC]">Fatura Ótica Enterprise</span>
                  </div>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle Button (When Expanded) */}
            {!forceExpanded && !collapsed && (
              <button
                id="btn-sidebar-toggle-collapse"
                type="button"
                onClick={toggleCollapse}
                title="Recolher Menu Lateral [Alt+B]"
                className="hidden md:flex p-1.5 rounded-lg text-[#C1E8FF] hover:text-white hover:bg-[#5483B3]/20 transition-colors cursor-pointer shrink-0"
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

          {/* Navigation Groups (Posição vertical idêntica nos dois estados) */}
          <div className="space-y-4 p-2.5">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx}>
                <div
                  className={`px-2.5 text-[10px] font-bold tracking-wider text-[#7DA0CA] uppercase overflow-hidden whitespace-nowrap transition-all duration-200 ${
                    collapsed ? "max-w-0 opacity-0 h-0 pb-0" : "max-w-[180px] opacity-100 h-auto pb-1.5"
                  }`}
                >
                  {group.group}
                </div>
                {collapsed && gIdx > 0 && (
                  <div className="my-2 border-t border-[#021024]/60" />
                )}
                <nav className="space-y-1">
                  {group.items.map((item, iIdx) => {
                    const active = isItemActive(item.href, item.exact);
                    return (
                      <Link
                        key={iIdx}
                        id={item.id}
                        href={item.href}
                        prefetch={true}
                        className={`w-full h-11 rounded-lg transition-colors duration-150 relative group flex items-center cursor-pointer active:scale-95 px-3 ${
                          active
                            ? "bg-[#5483B3] text-white shadow-xs font-semibold"
                            : "text-[#C1E8FF] hover:bg-[#5483B3]/25 hover:text-white"
                        }`}
                      >
                        {/* Ícone fixo centralizado que nunca salta */}
                        <div className="w-5 h-5 shrink-0 flex items-center justify-center pointer-events-none">
                          <span
                            className={`material-symbols-outlined text-[20px] ${
                              active ? "text-white" : "text-[#7DA0CA]"
                            }`}
                          >
                            {item.icon}
                          </span>
                        </div>

                        {/* Rótulo e Badges com fade e max-width suave sem quebras */}
                        <div
                          className={`flex items-center justify-between min-w-0 flex-1 ml-2.5 overflow-hidden transition-all duration-200 pointer-events-none ${
                            collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
                          }`}
                        >
                          <span className="truncate text-[13px] font-medium">{item.label}</span>
                          <div className="flex items-center gap-1 shrink-0 ml-1.5">
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
                        </div>

                        {/* Badges e Flyout Tooltip na Sidebar Recolhida */}
                        {collapsed && (
                          <>
                            {item.badge && (
                              <span className="absolute -top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#5483B3] text-white text-[9px] font-mono font-bold flex items-center justify-center border border-[#052659]">
                                {item.badge}
                              </span>
                            )}
                            {active && (
                              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#C1E8FF]"></span>
                            )}

                            {/* Flyout Tooltip Instantâneo */}
                            <div
                              role="tooltip"
                              className="hidden md:block absolute left-[56px] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out translate-x-[-4px] group-hover:translate-x-0"
                            >
                              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#021024] text-white text-xs font-semibold shadow-xl border border-[#5483B3]/40 whitespace-nowrap backdrop-blur-md">
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#021024] border-l border-b border-[#5483B3]/40 rotate-45"></div>
                                <span className="text-[#F0F6FC]">{item.label}</span>

                                {item.shortcut && (
                                  <span className="px-1.5 py-0.5 rounded bg-[#5483B3]/30 text-[#C1E8FF] text-[10px] font-mono border border-[#5483B3]/30">
                                    {item.shortcut}
                                  </span>
                                )}

                                {item.badge && (
                                  <span
                                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                      item.badgeColor || "bg-[#5483B3] text-white"
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            </div>
                          </>
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
        <div className={`border-t border-[#021024] bg-[#021024]/60 flex-shrink-0 ${collapsed ? "p-2 overflow-visible" : "p-3"}`}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="relative group flex justify-center">
                <Link
                  id="btn-sidebar-user-avatar"
                  href="/login"
                  className="relative w-9 h-9 rounded-xl bg-[#5483B3] border border-[#7DA0CA]/50 flex items-center justify-center text-white text-xs font-bold shadow-xs hover:border-white transition-all cursor-pointer"
                >
                  <span>{initials}</span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#052659]"></span>
                </Link>
                {/* Flyout Tooltip */}
                <div
                  role="tooltip"
                  className="hidden md:block absolute left-[56px] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out translate-x-[-4px] group-hover:translate-x-0"
                >
                  <div className="flex flex-col gap-0.5 px-3 py-1.5 rounded-xl bg-[#021024] text-white text-xs font-semibold shadow-xl border border-[#5483B3]/40 whitespace-nowrap backdrop-blur-md">
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#021024] border-l border-b border-[#5483B3]/40 rotate-45"></div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#F0F6FC]">{operator.name}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          isManager
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                            : "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                        }`}
                      >
                        {isManager ? "GERENTE" : "BALCÃO"}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#7DA0CA] font-normal">
                      Terminal • {operator.branch.split(" - ")[0]} • Trocar
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative group flex justify-center">
                <Link
                  id="btn-sidebar-trocar-operador"
                  href="/login"
                  className="p-1.5 rounded-lg text-[#7DA0CA] hover:text-white hover:bg-[#5483B3]/20 transition-all flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </Link>
                {/* Flyout Tooltip */}
                <div
                  role="tooltip"
                  className="hidden md:block absolute left-[56px] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out translate-x-[-4px] group-hover:translate-x-0"
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#021024] text-white text-xs font-semibold shadow-xl border border-[#5483B3]/40 whitespace-nowrap backdrop-blur-md">
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#021024] border-l border-b border-[#5483B3]/40 rotate-45"></div>
                    <span className="text-[#F0F6FC]">Trocar Operador / Sair</span>
                  </div>
                </div>
              </div>

              {/* Botão de Expandir no rodapé na Sidebar Recolhida */}
              {!forceExpanded && (
                <div className="relative group flex justify-center pt-1 border-t border-[#021024]/60 w-full">
                  <button
                    id="btn-sidebar-toggle-collapse-collapsed"
                    type="button"
                    onClick={toggleCollapse}
                    className="w-9 h-8 rounded-lg text-[#C1E8FF] hover:text-white hover:bg-[#5483B3]/25 transition-colors cursor-pointer flex items-center justify-center border border-[#5483B3]/30 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">last_page</span>
                  </button>
                  {/* Flyout Tooltip */}
                  <div
                    role="tooltip"
                    className="hidden md:block absolute left-[56px] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out translate-x-[-4px] group-hover:translate-x-0"
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#021024] text-white text-xs font-semibold shadow-xl border border-[#5483B3]/40 whitespace-nowrap backdrop-blur-md">
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#021024] border-l border-b border-[#5483B3]/40 rotate-45"></div>
                      <span className="text-[#F0F6FC]">Expandir Menu</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#5483B3]/30 text-[#C1E8FF] text-[10px] font-mono border border-[#5483B3]/30">
                        Alt+B
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded-xl bg-[#031c44] border border-[#7DA0CA]/30 shadow-xs flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#5483B3] border border-[#7DA0CA]/50 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                    {initials}
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

              {!forceExpanded && (
                <button
                  id="btn-sidebar-toggle-collapse-footer"
                  type="button"
                  onClick={toggleCollapse}
                  className="w-full py-1.5 px-2.5 rounded-lg text-xs font-medium text-[#7DA0CA] hover:text-white hover:bg-[#5483B3]/20 flex items-center justify-between transition-colors cursor-pointer border border-[#5483B3]/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">first_page</span>
                    <span>Recolher Menu Lateral</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#021024] text-[#C1E8FF] border border-[#5483B3]/30">
                    Alt+B
                  </span>
                </button>
              )}
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
        className={`hidden md:flex flex-shrink-0 bg-[#052659] border-r border-[#021024] flex-col fixed top-0 bottom-0 left-0 z-40 select-none ${
          isMounted ? "transition-[width] duration-200 ease-in-out" : ""
        } ${
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
