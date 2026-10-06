"use client";

import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  id?: string;
}

export interface PageHeaderProps {
  id: string;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  badge?: React.ReactNode;
  icon?: string;
  backHref?: string;
  backLabel?: string;
  backId?: string;
  breadcrumbs?: BreadcrumbItem[];
  centerSlot?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  id,
  title,
  subtitle,
  badge,
  icon,
  backHref,
  backLabel = "Voltar",
  backId,
  breadcrumbs,
  centerSlot,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <header
      id={id}
      className={`sticky top-14 md:top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#7DA0CA]/30 px-4 sm:px-6 py-2.5 min-h-[64px] shadow-xs flex items-center transition-all ${className}`}
    >
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-2.5 min-w-0">
        {/* Lado Esquerdo: Breadcrumb / Voltar + Ícone + Título + Subtítulo */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Botão Voltar (se fornecido) */}
          {backHref && (
            <>
              <Link
                id={backId || `${id}-link-voltar`}
                href={backHref}
                prefetch={true}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 hover:text-[#052659] hover:bg-[#F0F6FC] transition-colors text-xs font-semibold whitespace-nowrap shrink-0 border border-transparent hover:border-[#7DA0CA]/30 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-[17px]">arrow_back</span>
                <span className="hidden sm:inline">{backLabel}</span>
              </Link>
              <div className="h-4 w-px bg-[#7DA0CA]/30 shrink-0"></div>
            </>
          )}

          {/* Ícone de Destaque (se fornecido) */}
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-[#052659] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-lg">{icon}</span>
            </div>
          )}

          {/* Hierarquia de Títulos */}
          <div>
            {/* Breadcrumbs opcionais no topo do título */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav aria-label="Navegação Estrutural" className="flex items-center gap-1.5 text-xs text-[#5483B3] mb-0.5">
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={idx}>
                      {crumb.href && !isLast ? (
                        <Link
                          id={crumb.id || `${id}-crumb-${idx}`}
                          href={crumb.href}
                          prefetch={true}
                          className="hover:underline hover:text-[#052659] transition-colors truncate max-w-[150px] cursor-pointer"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className={`truncate max-w-[180px] ${isLast ? "font-semibold text-[#052659]" : ""}`}>
                          {crumb.label}
                        </span>
                      )}
                      {!isLast && <span className="text-[#7DA0CA]/60 text-[10px]">/</span>}
                    </React.Fragment>
                  );
                })}
              </nav>
            )}

            {/* Linha Principal do Título */}
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-[#052659] tracking-tight leading-snug">
                {title}
              </h1>
              {badge && <div className="shrink-0 inline-flex items-center">{badge}</div>}
            </div>

            {/* Subtítulo ou Metadados Clínicos */}
            {subtitle && (
              <div className="text-[11px] sm:text-xs text-[#5483B3] flex items-center gap-1.5 mt-0.5 flex-wrap">
                {typeof subtitle === "string" ? (
                  <span>{subtitle}</span>
                ) : (
                  subtitle
                )}
              </div>
            )}
          </div>
        </div>

        {/* Slot Central: Stepper, Filtros Rápidos, ou Abas Contextuais */}
        {centerSlot && (
          <div className="flex items-center justify-center shrink-0 min-w-0 mx-auto md:mx-0">
            {centerSlot}
          </div>
        )}

        {/* Lado Direito: Ações Principais (Botões Primários, Salvar, Exportar) */}
        {actions && (
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto md:ml-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
