"use client";

import React from "react";

export interface MetricCardProps {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  statusType?: "neutral" | "success" | "warning" | "danger";
  footerSlot?: React.ReactNode;
  className?: string;
}

export default function MetricCard({
  id,
  label,
  value,
  unit,
  icon,
  trend,
  statusType = "neutral",
  footerSlot,
  className = "",
}: MetricCardProps) {
  const iconBoxStyles = {
    neutral: "bg-[#F0F6FC] text-[#5483B3] border-[#C1E8FF]",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
  }[statusType];

  return (
    <div
      id={id}
      className={`bg-white rounded-2xl border border-[#C1E8FF] p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#5483B3] transition-all duration-200 group ${className}`}
    >
      <div>
        <div className="flex items-center justify-between text-[#5483B3] text-[11px] font-bold uppercase tracking-wider gap-2">
          <span className="truncate">{label}</span>
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200 ${iconBoxStyles}`}
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
        </div>

        <div className="mt-2 text-2xl md:text-3xl font-mono font-bold text-[#052659] tracking-tight">
          {value}{" "}
          {unit && (
            <span className="text-xs md:text-sm font-sans font-medium text-[#5483B3]">
              {unit}
            </span>
          )}
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 mt-1.5 text-xs font-bold ${
              trend.isPositive ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {trend.isPositive ? "trending_up" : "trending_down"}
            </span>
            <span>{trend.value}</span>
            {trend.label && (
              <span className="text-slate-500 font-normal ml-0.5">{trend.label}</span>
            )}
          </div>
        )}
      </div>

      {footerSlot && (
        <div className="mt-3 pt-2.5 border-t border-[#F0F6FC]">
          {footerSlot}
        </div>
      )}
    </div>
  );
}
