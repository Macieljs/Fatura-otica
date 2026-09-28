"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title?: string;
  duration?: number; // ms, default 4000
  icon?: string;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  icon?: string;
  duration: number;
  createdAt: number;
}

interface ToastContextType {
  toast: {
    (message: string, options?: ToastOptions): void;
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}

interface ToastCardProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

function ToastCard({ toast, onClose }: ToastCardProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const remainingTimeRef = useRef(toast.duration);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 250);
  }, [onClose, toast.id]);

  React.useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleClose();
    }, remainingTimeRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, handleClose]);

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const configMap: Record<
    ToastType,
    {
      badgeBg: string;
      badgeText: string;
      borderColor: string;
      progressBarBg: string;
      defaultIcon: string;
      defaultTitle: string;
    }
  > = {
    success: {
      badgeBg: "bg-emerald-50 text-emerald-600 border border-emerald-200",
      badgeText: "text-emerald-700",
      borderColor: "border-emerald-500/30",
      progressBarBg: "bg-emerald-500",
      defaultIcon: "check_circle",
      defaultTitle: "Ação Concluída",
    },
    error: {
      badgeBg: "bg-rose-50 text-rose-600 border border-rose-200",
      badgeText: "text-rose-700",
      borderColor: "border-rose-500/30",
      progressBarBg: "bg-rose-500",
      defaultIcon: "error",
      defaultTitle: "Atenção / Erro",
    },
    warning: {
      badgeBg: "bg-amber-50 text-amber-600 border border-amber-200",
      badgeText: "text-amber-700",
      borderColor: "border-amber-500/30",
      progressBarBg: "bg-amber-500",
      defaultIcon: "warning",
      defaultTitle: "Alerta Operacional",
    },
    info: {
      badgeBg: "bg-[#F0F6FC] text-[#052659] border border-[#7DA0CA]/40",
      badgeText: "text-[#052659]",
      borderColor: "border-[#7DA0CA]/50",
      progressBarBg: "bg-[#052659]",
      defaultIcon: "info",
      defaultTitle: "Notificação do Sistema",
    },
  };

  const cfg = configMap[toast.type];
  const icon = toast.icon || cfg.defaultIcon;
  const title = toast.title || cfg.defaultTitle;

  return (
    <div
      id={`toast-item-${toast.id}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-xl bg-white/95 backdrop-blur-md p-4 shadow-xl shadow-[#052659]/10 border ${cfg.borderColor} transition-all duration-300 ease-out flex items-start gap-3.5 ${
        isExiting
          ? "opacity-0 translate-x-10 scale-95"
          : "opacity-100 translate-x-0 scale-100 animate-in slide-in-from-top-3"
      }`}
      role="alert"
    >
      {/* Icon Badge */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.badgeBg}`}
      >
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#052659] flex items-center gap-1.5">
          {title}
        </h4>
        <p className="text-sm font-medium text-slate-700 mt-0.5 leading-snug break-words">
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        id={`btn-toast-fechar-${toast.id}`}
        onClick={handleClose}
        className="text-[#7DA0CA] hover:text-[#052659] p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
        title="Dispensar notificação"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>

      {/* Animated Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
        <div
          className={`h-full ${cfg.progressBarBg} transition-all`}
          style={{
            animationDuration: `${toast.duration}ms`,
            animationPlayState: isPaused ? "paused" : "running",
            animationTimingFunction: "linear",
            animationName: "toast-progress",
            animationFillMode: "forwards",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, options?: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = {
        id,
        type,
        message,
        title: options?.title,
        icon: options?.icon,
        duration: options?.duration ?? 4000,
        createdAt: Date.now(),
      };
      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const toast = Object.assign(
    (message: string, options?: ToastOptions) => addToast("info", message, options),
    {
      success: (message: string, options?: ToastOptions) =>
        addToast("success", message, options),
      error: (message: string, options?: ToastOptions) =>
        addToast("error", message, options),
      warning: (message: string, options?: ToastOptions) =>
        addToast("warning", message, options),
      info: (message: string, options?: ToastOptions) =>
        addToast("info", message, options),
    }
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast floating container */}
      <div
        id="container-toasts-flutuantes"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-3 sm:px-0 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} toast={item} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
