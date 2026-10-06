"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  }

  const links = [
    { href: "/", label: "Dashboard", icon: "dashboard" },
    { href: "/estoque", label: "Estoque", icon: "inventory_2" },
    {
      href: "/ordens-de-servico",
      label: "Ordens de Serviço",
      icon: "receipt_long",
      sublinks: [
        { href: "/ordens-de-servico/fila", label: "Fila de Laboratório (Kanban)", icon: "view_kanban", desc: "Acompanhamento da bancada" },
        { href: "/ordens-de-servico", label: "Nova OS (Receituário)", icon: "add_circle", desc: "Emissão e cálculo dióptrico" },
        { href: "/ordens-de-servico/detalhes?id=10294", label: "Ficha Técnica da OS", icon: "assignment", desc: "Inspeção clínica e Kardex" },
      ],
    },
    {
      href: "/kardex",
      label: "Kardex",
      icon: "biotech",
      sublinks: [
        { href: "/kardex", label: "Visão Geral do Kardex", icon: "query_stats", desc: "Ledger e alertas de ruptura" },
        { href: "/kardex/entrada-nfe", label: "Entrada por NF-e (XML)", icon: "upload_file", desc: "Importação e custo médio" },
        { href: "/kardex/ajuste-manual", label: "Ajuste / Avaria Clínica", icon: "construction", desc: "Laudos e perdas de bancada" },
        { href: "/kardex/sugestoes-compra", label: "Sugestões de Reposição", icon: "shopping_cart_checkout", desc: "Algoritmo de compras" },
      ],
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <header className="bg-[#052659] text-white top-0 h-16 z-50 border-b border-[#021024] flex items-center justify-between px-4 sm:px-8 shadow-sm sticky">
      {/* Esquerda: Logo + Botão Voltar + Navegação Desktop */}
      <div className="flex items-center gap-4 lg:gap-8">
        <div className="flex items-center gap-3">
          {pathname !== "/" && (
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-xl hover:bg-[#0b3b7a] flex items-center justify-center text-[#c1e8ff] transition-colors cursor-pointer"
              title="Voltar para a tela anterior"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#5483b3] group-hover:bg-[#7da0ca] flex items-center justify-center text-white shadow-xs transition-colors">
              <span className="material-symbols-outlined text-[20px]" data-icon="visibility">visibility</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-white group-hover:text-[#c1e8ff] transition-colors">
                  Fatura Ótica
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#5483b3]/30 text-[#c1e8ff] border border-[#7da0ca]/40 text-[9px] font-bold tracking-wide">
                  ERP Matriz
                </span>
              </div>
              <span className="text-[11px] text-[#7da0ca] font-medium hidden sm:block">Gestão Clínica &amp; Ofta</span>
            </div>
          </Link>
        </div>

        {/* Links Desktop com Dropdowns */}
        <nav ref={dropdownRef} className="hidden md:flex items-center gap-1 pl-2">
          {links.map((link) => {
            const active = isLinkActive(link.href);
            const hasSublinks = Boolean(link.sublinks && link.sublinks.length > 0);
            const isOpen = openDropdown === link.label;

            return (
              <div key={link.href} className="relative">
                <div
                  className={`rounded-xl flex items-center transition-all border ${
                    active
                      ? "bg-[#5483b3] text-white font-bold border-[#7da0ca] shadow-xs"
                      : "text-[#c1e8ff] hover:text-white hover:bg-[#0b3b7a] font-medium border-transparent"
                  }`}
                >
                  <Link
                    href={link.href}
                    className="px-3 py-1.5 text-xs lg:text-sm flex items-center gap-1.5"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${active ? "text-white" : "text-[#7da0ca]"}`}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </Link>

                  {hasSublinks && (
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(isOpen ? null : link.label)}
                      className="pr-2 pl-0.5 py-1.5 text-[#c1e8ff] hover:text-white transition-colors cursor-pointer flex items-center"
                      aria-label={`Menu de ${link.label}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isOpen ? "arrow_drop_up" : "arrow_drop_down"}
                      </span>
                    </button>
                  )}
                </div>

                {/* Dropdown Menu Desktop posicionado com z-[100] */}
                {hasSublinks && isOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-0 w-72 bg-[#052659] border border-[#7da0ca]/50 rounded-xl shadow-2xl py-2 z-[100] ring-1 ring-black/30 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Seta indicadora de topo */}
                    <div className="absolute -top-1.5 left-7 w-3 h-3 bg-[#052659] border-t border-l border-[#7da0ca]/50 transform rotate-45"></div>

                    <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c1e8ff] border-b border-[#021024]/70 mb-1 flex items-center justify-between">
                      <span>Subtelas • {link.label}</span>
                      <span className="text-[9px] text-[#7da0ca]">Navegação Rápida</span>
                    </div>

                    <div className="space-y-0.5 px-1.5">
                      {link.sublinks!.map((sub) => {
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setOpenDropdown(null)}
                            className={`px-3 py-2 rounded-lg flex items-start gap-2.5 transition-colors ${
                              isSubActive
                                ? "bg-[#5483b3] text-white font-semibold"
                                : "text-[#c1e8ff] hover:bg-[#09326e] hover:text-white"
                            }`}
                          >
                            <span className={`material-symbols-outlined text-[19px] mt-0.5 ${isSubActive ? "text-white" : "text-[#7da0ca]"}`}>
                              {sub.icon}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold leading-tight truncate">{sub.label}</span>
                              <span className="text-[10px] text-[#7da0ca] font-normal leading-tight mt-0.5">{sub.desc}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Direita: Filial, Status, Notificações, Perfil e Toggle Mobile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden lg:flex items-center gap-2 bg-[#09326e] px-2.5 py-1.5 rounded-xl border border-[#1d4c8f] text-xs text-[#c1e8ff]">
          <span className="material-symbols-outlined text-[16px] text-[#7da0ca]">store</span>
          <span className="font-semibold text-white">Filial Centro</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-medium text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold">Sync OK</span>
        </div>

        <button
          aria-label="Notificações"
          className="w-9 h-9 rounded-xl border border-[#1d4c8f] bg-[#09326e] flex items-center justify-center text-[#c1e8ff] hover:text-white hover:bg-[#0b3b7a] transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[19px]">notifications</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-[#1d4c8f]">
          <div className="w-8 h-8 rounded-xl bg-[#5483b3] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            CR
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">Dr. Carlos Ramos</span>
            <span className="text-[10px] text-[#7da0ca] font-medium">Gerente Operacional</span>
          </div>
        </div>

        {/* Botão Hambúrguer Mobile (visível em telas < md) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-9 h-9 rounded-xl bg-[#09326e] border border-[#1d4c8f] flex items-center justify-center text-[#c1e8ff] hover:text-white transition-colors cursor-pointer"
          aria-label="Abrir menu de navegação"
        >
          <span className="material-symbols-outlined text-[20px]">
            {mobileMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Menu Drawer Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#052659] border-b border-[#021024] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {links.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <div key={link.href} className="space-y-1">
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? "bg-[#5483b3] text-white shadow-xs"
                        : "text-[#c1e8ff] hover:bg-[#09326e] hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>

                  {/* Sublinks no Mobile */}
                  {link.sublinks && (
                    <div className="pl-6 space-y-1 border-l-2 border-[#5483b3]/30 ml-4 mb-2">
                      {link.sublinks.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors ${
                            pathname === sub.href
                              ? "text-white font-bold bg-[#09326e]"
                              : "text-[#7da0ca] hover:text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">{sub.icon}</span>
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 mt-3 border-t border-[#021024]/60 flex items-center justify-between text-xs text-[#7da0ca]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Filial Centro • Conectado
            </span>
            <span>ERP v4.8.2</span>
          </div>
        </div>
      )}
    </header>
  );
}
