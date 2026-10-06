"use client";

import React from "react";
import Link from "next/link";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "danger"
  | "outline"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id: string; // Obrigatório pela regra semantic-ids.md
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: "left" | "right";
  hotkey?: string;
  href?: string;
  target?: string;
  rel?: string;
  isLoading?: boolean;
}

export default function Button({
  id,
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  hotkey,
  href,
  target,
  rel,
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Variantes visuais com alto destaque e affordance clínica
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-[#052659] hover:bg-[#021024] text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 ring-2 ring-[#052659]/20 border border-[#052659]";
      case "accent":
        return "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 border border-emerald-600 ring-2 ring-emerald-500/20";
      case "secondary":
        return "bg-white border-2 border-[#5483B3] hover:border-[#052659] text-[#052659] hover:bg-[#F0F6FC] shadow-2xs hover:shadow-xs hover:-translate-y-0.5 active:scale-95";
      case "outline":
        return "bg-white border border-[#7DA0CA] hover:border-[#052659] text-[#052659] hover:bg-[#F0F6FC] shadow-2xs active:scale-95";
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-95 border border-rose-600 ring-2 ring-rose-500/20";
      case "ghost":
        return "bg-transparent hover:bg-[#F0F6FC] text-[#052659] hover:text-[#5483B3] border border-transparent";
      default:
        return "bg-[#052659] text-white";
    }
  };

  // Alturas ergonômicas padronizadas
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "h-8 px-2.5 sm:px-3 text-xs gap-1.5 rounded-lg";
      case "lg":
        return "h-11 px-5 text-sm gap-2 rounded-xl";
      case "md":
      default:
        return "h-9 px-3.5 sm:px-4 text-xs gap-2 rounded-xl";
    }
  };

  const baseStyles =
    "inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 cursor-pointer select-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none";

  const content = (
    <>
      {isLoading ? (
        <span className="material-symbols-outlined text-[17px] animate-spin">
          progress_activity
        </span>
      ) : icon && iconPosition === "left" ? (
        <span className="material-symbols-outlined text-[17px] shrink-0">
          {icon}
        </span>
      ) : null}

      {children && <span>{children}</span>}

      {icon && iconPosition === "right" && !isLoading && (
        <span className="material-symbols-outlined text-[17px] shrink-0">
          {icon}
        </span>
      )}

      {hotkey && (
        <kbd className="hidden sm:inline-block font-mono text-[10px] font-bold opacity-80 uppercase ml-0.5">
          {hotkey}
        </kbd>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        id={id}
        href={href}
        target={target}
        rel={rel}
        className={`${baseStyles} ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      id={id}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
}
