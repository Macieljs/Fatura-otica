"use client";

import React from "react";

interface OpticalBrandLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "blue";
  showText?: boolean;
  subtitle?: string;
  badge?: string;
}

export default function OpticalBrandLogo({
  size = "md",
  variant = "light",
  showText = true,
  subtitle = "Clinical Precision ERP",
  badge = "MATRIZ",
}: OpticalBrandLogoProps) {
  const sizeMap = {
    sm: { box: "w-7 h-7", icon: 28, text: "text-[14px]", sub: "text-[10px]" },
    md: { box: "w-9 h-9", icon: 36, text: "text-[16px]", sub: "text-[11px]" },
    lg: { box: "w-12 h-12", icon: 48, text: "text-[20px]", sub: "text-[12px]" },
  };

  const current = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5 select-none group">
      {/* Símbolo Óptico Singular: Geometria de Foco Dióptrico & Prisma */}
      <div
        className={`${current.box} rounded-xl bg-gradient-to-br from-[#052659] via-[#0b3b82] to-[#5483b3] p-[1.5px] shadow-sm flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
      >
        <div className="w-full h-full rounded-[10px] bg-[#021024] flex items-center justify-center relative overflow-hidden">
          {/* Subtle Optical Refraction Glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#5483b3]/30 via-transparent to-[#c1e8ff]/40 pointer-events-none" />

          {/* SVG Óptico de Precisão */}
          <svg
            width={current.icon * 0.7}
            height={current.icon * 0.7}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#c1e8ff] relative z-10 transition-colors group-hover:text-white"
          >
            {/* Lente Oftálmica Externa (Curvatura de Menisco Óptico) */}
            <circle
              cx="12"
              cy="12"
              r="8.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeDasharray="28 8"
              className="opacity-90"
            />
            {/* Eixo Dióptrico / Astigmatismo (Crosshair Óptico) */}
            <path
              d="M12 5V19M5 12H19"
              stroke="#5483b3"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="opacity-75"
            />
            {/* Foco Central / Ponto Nodal de Refração */}
            <circle cx="12" cy="12" r="2.5" fill="#5483b3" />
            <circle cx="12" cy="12" r="1.25" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Texto da Marca */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`${current.text} font-bold tracking-tight font-sans transition-colors ${
                variant === "dark"
                  ? "text-[#052659] group-hover:text-[#021024]"
                  : "text-white group-hover:text-[#c1e8ff]"
              }`}
            >
              Fatura <span className="text-[#5483b3] font-black">Ótica</span>
            </span>
            {badge && (
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                  variant === "dark"
                    ? "bg-[#052659] text-white"
                    : "bg-[#021024] text-[#c1e8ff] border border-[#5483b3]/40"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <span
              className={`${current.sub} font-mono tracking-tight transition-colors mt-0.5 ${
                variant === "dark" ? "text-[#5483b3]" : "text-[#7da0ca]"
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
