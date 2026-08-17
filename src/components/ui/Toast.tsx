"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Check, Info, X } from "lucide-react";

/**
 * Lightweight toasts for demo mutations ("Marked as delivered").
 *
 * The region is a polite live region so a screen reader announces the result of
 * an action without stealing focus.
 */

type Toast = { id: number; message: string; tone: "success" | "info" };

type ToastContextValue = { notify: (message: string, tone?: Toast["tone"]) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: Toast["tone"] = "success") => {
      nextId += 1;
      const id = nextId;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="parcel-no-print pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      >
        {toasts.map((toast) => {
          const Icon = toast.tone === "success" ? Check : Info;
          return (
            <div
              key={toast.id}
              className="animate-parcel-in pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-sm border border-line bg-surface px-3 py-2.5 shadow-parcel-lg"
            >
              <Icon
                aria-hidden="true"
                className={`mt-0.5 size-4 shrink-0 ${
                  toast.tone === "success" ? "text-success" : "text-info"
                }`}
              />
              <p className="text-[0.8125rem] leading-relaxed text-ink">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-mr-1 ml-1 rounded-sm p-0.5 text-ink-faint hover:text-ink"
              >
                <X aria-hidden="true" className="size-3.5" />
                <span className="sr-only">Dismiss notification</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}
