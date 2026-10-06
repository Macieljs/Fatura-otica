"use client";

import React from "react";

export interface SelectableCardProps {
  id: string;
  isSelected: boolean;
  onClick: () => void;
  icon?: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  badgeVariant?: "neutral" | "success" | "warning" | "info";
  code?: string;
  price?: number | string;
  className?: string;
}

export default function SelectableCard({
  id,
  isSelected,
  onClick,
  icon,
  title,
  subtitle,
  description,
  badge,
  badgeVariant = "neutral",
  code,
  price,
  className = "",
}: SelectableCardProps) {
  const badgeClasses = {
    neutral: "bg-[#F0F6FC] text-[#5483B3] border-[#C1E8FF]",
    success: "bg-emerald-50 text-emerald-800 border-emerald-300",
    warning: "bg-amber-50 text-amber-800 border-amber-300",
    info: "bg-[#F0F6FC] text-[#052659] border-[#C1E8FF]",
  }[badgeVariant];

  const formattedPrice =
    typeof price === "number"
      ? `R$ ${price.toFixed(2).replace(".", ",")}`
      : price;

  return (
    <div
      id={id}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer group flex flex-col justify-between select-none ${
        isSelected
          ? "bg-[#F0F6FC] border-[#052659] ring-2 ring-[#052659]/30 shadow-md -translate-y-0.5"
          : "bg-white border-[#C1E8FF] hover:border-[#5483B3] hover:shadow-md hover:-translate-y-0.5"
      } ${className}`}
    >
      <div>
        {/* Top Line: Brand/Title (Left) + Price (Right) */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200 shadow-2xs ${
                  isSelected
                    ? "bg-[#052659] text-white border-[#052659]"
                    : "bg-[#F0F6FC] text-[#5483B3] border-[#C1E8FF]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
              </div>
            )}
            <span className="text-sm font-bold text-[#052659] truncate leading-tight">
              {title}
            </span>
          </div>

          {formattedPrice && (
            <span className="text-sm sm:text-base font-mono font-bold text-[#052659] shrink-0">
              {formattedPrice}
            </span>
          )}
        </div>

        {/* Subtitle / Model details */}
        {subtitle && (
          <p className="text-xs font-semibold text-slate-800 leading-snug mt-1.5 line-clamp-2">
            {subtitle}
          </p>
        )}

        {/* Description / Optical Specs */}
        {description && (
          <p className="text-[11px] text-[#5483B3] font-medium leading-snug mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Bottom Line: Metadata (SKU / Stock) + Selected Status */}
      <div className="pt-2.5 border-t border-[#C1E8FF]/60 flex items-center justify-between gap-2 mt-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {code && (
            <span className="text-[10px] font-mono text-[#5483B3] font-medium">
              {code}
            </span>
          )}
          {badge && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${badgeClasses}`}
            >
              {badge}
            </span>
          )}
        </div>

        {/* Selected Check Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isSelected ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#052659]">
              <span className="material-symbols-outlined text-[15px] font-bold">check_circle</span>
              <span>Selecionado</span>
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 group-hover:text-[#5483B3] transition-colors">
              Selecionar
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
