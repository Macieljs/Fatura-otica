"use client";

import React from "react";
import Link from "next/link";

export type KpiIconVariant = "primary" | "warning" | "danger" | "success" | "neutral";

export interface KpiCardProps {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  icon?: string;
  iconVariant?: KpiIconVariant;
  trend?: {
    text: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    icon?: string;
  };
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  progressPercent?: number;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  footerHref?: string;
  footerActionLabel?: string;
  footerActionId?: string;
  className?: string;
  onClick?: () => void;
}

export default function KpiCard({
  id,
  title,
  value,
  unit,
  icon,
  iconVariant = "primary",
  trend,
  subtitle,
  badge,
  progressPercent,
  footerLeft,
  footerRight,
  footerHref,
  footerActionLabel,
  footerActionId,
  className = "",
  onClick,
}: KpiCardProps) {
  // Squircles cromáticos segundo paleta oficial do Design System Clinical Precision
  const getIconStyles = () => {
    switch (iconVariant) {
      case "danger":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "warning":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "neutral":
        return "bg-slate-50 text-slate-600 border-slate-200";
      case "primary":
      default:
        return "bg-[#F0F6FC] text-[#5483B3] border-[#C1E8FF]";
    }
  };

  const hasFooter = footerLeft || footerRight || (footerHref && footerActionLabel);

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white border border-[#C1E8FF] rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#5483B3] transition-all duration-200 group flex flex-col justify-between ${
        onClick ? "cursor-pointer" : "cursor-default"
      } ${className}`}
    >
      <div>
        {/* Top Row: Rótulo de Categoria e Squircle de Ícone Clínico */}
        <div className="flex items-center justify-between text-[#5483B3] text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider">
          <span className="truncate pr-2">{title}</span>
          {icon && (
            <div
              className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs ${getIconStyles()}`}
            >
              <span className="material-symbols-outlined text-[17px]">{icon}</span>
            </div>
          )}
        </div>

        {/* Métricas Principais Dióptricas / Monetárias com Espaçamento Ajustado */}
        <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-xl sm:text-2xl font-mono font-bold text-[#052659] tracking-tight leading-tight">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-sans font-semibold text-[#5483B3] leading-none">
              {unit}
            </span>
          )}
          {badge && <div className="ml-1 inline-flex items-center">{badge}</div>}
        </div>

        {/* Linha Opcional de Tendência ou Subtítulo Operacional */}
        {trend && (
          <div
            className={`flex items-center gap-1 mt-1 text-[11px] sm:text-xs font-semibold ${
              trend.isPositive
                ? "text-emerald-700"
                : trend.isNeutral
                ? "text-[#5483B3]"
                : "text-rose-700"
            }`}
          >
            {trend.icon && (
              <span className="material-symbols-outlined text-[13px]">{trend.icon}</span>
            )}
            <span>{trend.text}</span>
          </div>
        )}

        {subtitle && (
          <div className="mt-1 text-[11px] sm:text-xs text-[#5483B3] flex items-center gap-1">
            {subtitle}
          </div>
        )}

        {/* Barra de Progresso Operacional / Metas Diárias */}
        {typeof progressPercent === "number" && (
          <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-[#052659] transition-all duration-300"
              style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Rodapé Executivo Clínico com Divisor Neutro */}
      {hasFooter && (
        <div className="mt-2.5 pt-2 border-t border-[#F0F6FC] flex items-center justify-between text-[11px] sm:text-xs text-[#5483B3]">
          <div>{footerLeft}</div>
          <div>
            {footerRight ? (
              footerRight
            ) : footerHref && footerActionLabel ? (
              <Link
                id={footerActionId || `${id}-link-acao`}
                href={footerHref}
                className="font-bold text-[#052659] hover:text-white bg-[#F0F6FC] hover:bg-[#052659] px-2.5 py-1 rounded-md border border-[#C1E8FF] hover:border-[#052659] transition-all inline-flex items-center gap-1 text-[11px] sm:text-xs shadow-2xs group active:scale-95"
              >
                <span>{footerActionLabel}</span>
                <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
