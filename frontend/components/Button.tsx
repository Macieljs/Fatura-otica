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
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  id: string; // Obrigatório pela regra semantic-ids.md
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  customIcon?: React.ReactNode;
  iconPosition?: "left" | "right";
  hotkey?: string;
  href?: string;
  target?: string;
  rel?: string;
  isLoading?: boolean;
  loadingText?: string;
  debounceMs?: number; // Prevenção contra duplo clique (padrão: 500ms)
  preventDoubleClick?: boolean; // Padrão: true
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<unknown> | unknown;
}

export default function Button({
  id,
  children,
  variant = "primary",
  size = "md",
  icon,
  customIcon,
  iconPosition = "left",
  hotkey,
  href,
  target,
  rel,
  isLoading = false,
  loadingText,
  debounceMs = 500,
  preventDoubleClick = true,
  className = "",
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  // Blindagem de concorrência e duplo clique instantâneo
  const [internalLoading, setInternalLoading] = React.useState(false);
  const isExecutingRef = React.useRef(false);
  const lastClickTimeRef = React.useRef(0);

  const effectiveLoading = isLoading || internalLoading;
  const isEffectivelyDisabled = disabled || effectiveLoading;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isEffectivelyDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const now = Date.now();
    // Bloqueio imediato síncrono para cliques em sequência ultra-rápida (abaixo de debounceMs)
    if (preventDoubleClick && now - lastClickTimeRef.current < debounceMs) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    lastClickTimeRef.current = now;

    // Bloqueio síncrono por ref se uma ação assíncrona já estiver em curso
    if (isExecutingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (onClick) {
      try {
        const result: unknown = onClick(e);
        // Se a função for assíncrona (retorna Promise), trava o botão automaticamente
        if (
          result !== null &&
          typeof result === "object" &&
          "then" in result &&
          typeof (result as Promise<unknown>).then === "function"
        ) {
          isExecutingRef.current = true;
          setInternalLoading(true);
          await result;
        }
      } catch (err) {
        // Erros são propagados após liberar o estado
        throw err;
      } finally {
        isExecutingRef.current = false;
        setInternalLoading(false);
      }
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const now = Date.now();
    if (preventDoubleClick && now - lastClickTimeRef.current < debounceMs) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    lastClickTimeRef.current = now;
  };

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

  const renderIcon = () => {
    if (customIcon) {
      return <span className="shrink-0 flex items-center justify-center">{customIcon}</span>;
    }
    if (icon) {
      return (
        <span className="material-symbols-outlined text-[17px] shrink-0">
          {icon}
        </span>
      );
    }
    return null;
  };

  const content = (
    <>
      {effectiveLoading ? (
        <span className="material-symbols-outlined text-[17px] animate-spin shrink-0">
          progress_activity
        </span>
      ) : iconPosition === "left" ? (
        renderIcon()
      ) : null}

      {effectiveLoading && loadingText ? (
        <span>{loadingText}</span>
      ) : (
        children && <span>{children}</span>
      )}

      {!effectiveLoading && iconPosition === "right" && renderIcon()}

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
        onClick={handleLinkClick}
        className={`${baseStyles} ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      id={id}
      disabled={isEffectivelyDisabled}
      aria-busy={effectiveLoading}
      aria-disabled={isEffectivelyDisabled}
      onClick={handleClick}
      className={`${baseStyles} ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
}
