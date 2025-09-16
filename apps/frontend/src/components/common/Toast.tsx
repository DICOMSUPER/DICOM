import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";

type ToastType = "success" | "error" | "warn" | "info" | "debug";

type ToastContent = string | React.ReactNode;

export interface ToastOptions {
  type?: ToastType;
  durationSeconds?: number; // auto close
  tapToClose?: boolean;
}

interface ToastItem {
  id: string;
  content: ToastContent;
  type: ToastType;
  durationMs: number;
  tapToClose: boolean;
}

// -------- Internal host component --------
let addToastRef: ((toast: ToastItem) => void) | null = null;

function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const remove = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  };

  const add = React.useCallback((toast: ToastItem) => {
    setToasts((prev) => [...prev, toast]);
    if (toast.durationMs > 0) {
      const timer = window.setTimeout(() => remove(toast.id), toast.durationMs);
      timers.current.set(toast.id, timer);
    }
  }, []);

  useEffect(() => {
    addToastRef = add;
    const localTimers = timers.current;
    return () => {
      addToastRef = null;
      localTimers.forEach((t) => window.clearTimeout(t));
      localTimers.clear();
    };
  }, [add]);

  const typeStyles: Record<ToastType, string> = useMemo(
    () => ({
      success:
        "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]",
      error:
        "bg-[var(--destructive)] text-[var(--destructive-foreground)] border border-[var(--destructive)]",
      warn: "bg-amber-100 text-amber-900 border border-amber-200",
      info: "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]",
      debug: "bg-slate-900 text-white border border-slate-800",
    }),
    []
  );

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => t.tapToClose && remove(t.id)}
          className={`rounded-lg shadow-lg px-4 py-3 max-w-sm cursor-pointer ${
            typeStyles[t.type]
          }`}
          role="status"
          aria-live="polite"
        >
          {typeof t.content === "string" ? <span>{t.content}</span> : t.content}
        </div>
      ))}
    </div>
  );
}

// -------- Singleton container / API --------
let toastRoot: Root | null = null;

function ensureRoot() {
  if (toastRoot) return toastRoot;
  if (typeof window === "undefined") return null;
  const el = document.createElement("div");
  el.id = "toast-root";
  document.body.appendChild(el);
  toastRoot = createRoot(el);
  toastRoot.render(<ToastHost />);
  return toastRoot;
}

export function toast(content: ToastContent, options?: ToastOptions) {
  ensureRoot();
  const id = Math.random().toString(36).slice(2);
  const t: ToastItem = {
    id,
    content,
    type: options?.type ?? "info",
    durationMs: (options?.durationSeconds ?? 4) * 1000,
    tapToClose: options?.tapToClose ?? true,
  };
  addToastRef?.(t);
}

export default function ToastContainer() {
  // Optional component if someone prefers to mount in tree
  useEffect(() => {
    ensureRoot();
  }, []);
  return null;
}
