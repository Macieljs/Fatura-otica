"use client";

import { useState, useCallback, useRef } from "react";
import { useToast } from "@/components/ToastProvider";

export interface ToastConfig<T> {
  title?: string;
  message: string | ((data: T) => string);
  icon?: string;
}

export interface UseAsyncActionOptions<T, P extends unknown[]> {
  action: (...args: P) => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  successToast?: string | ((result: T) => string) | ToastConfig<T>;
  errorToast?: string | ((error: Error) => string) | ToastConfig<Error>;
  debounceMs?: number; // Prevenção contra duplo clique e concorrência (padrão: 500ms)
}

export interface UseAsyncActionResult<T, P extends unknown[]> {
  execute: (...args: P) => Promise<T | undefined>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
  lastExecutedAt: number | null;
}

/**
 * Hook para blindagem de ações de mutação contra duplo clique, disparos concorrentes
 * e estados de carregamento não sincronizados.
 */
export function useAsyncAction<T, P extends unknown[] = []>({
  action,
  onSuccess,
  onError,
  successToast,
  errorToast,
  debounceMs = 500,
}: UseAsyncActionOptions<T, P>): UseAsyncActionResult<T, P> {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastExecutedAt, setLastExecutedAt] = useState<number | null>(null);

  const isLockedRef = useRef(false);
  const lastCallTimeRef = useRef(0);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    isLockedRef.current = false;
  }, []);

  const execute = useCallback(
    async (...args: P): Promise<T | undefined> => {
      const now = Date.now();

      // Bloqueio imediato para chamadas rápidas consecutivas
      if (now - lastCallTimeRef.current < debounceMs) {
        return undefined;
      }
      lastCallTimeRef.current = now;

      // Bloqueio se já houver execução assíncrona em andamento
      if (isLockedRef.current) {
        return undefined;
      }

      isLockedRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const result = await action(...args);

        setLastExecutedAt(Date.now());

        if (successToast) {
          if (typeof successToast === "string") {
            toast.success(successToast);
          } else if (typeof successToast === "function") {
            toast.success(successToast(result));
          } else {
            const msg =
              typeof successToast.message === "function"
                ? successToast.message(result)
                : successToast.message;
            toast.success(msg, {
              title: successToast.title,
              icon: successToast.icon,
            });
          }
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);

        if (errorToast) {
          if (typeof errorToast === "string") {
            toast.error(errorToast);
          } else if (typeof errorToast === "function") {
            toast.error(errorToast(errorObj));
          } else {
            const msg =
              typeof errorToast.message === "function"
                ? errorToast.message(errorObj)
                : errorToast.message;
            toast.error(msg, {
              title: errorToast.title,
              icon: errorToast.icon,
            });
          }
        } else {
          toast.error(errorObj.message || "Ocorreu um erro ao processar a ação.", {
            title: "Erro na Operação",
            icon: "error",
          });
        }

        if (onError) {
          onError(errorObj);
        }

        return undefined;
      } finally {
        isLockedRef.current = false;
        setIsLoading(false);
      }
    },
    [action, debounceMs, errorToast, onError, onSuccess, successToast, toast]
  );

  return {
    execute,
    isLoading,
    error,
    reset,
    lastExecutedAt,
  };
}
