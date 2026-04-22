"use client";

import { Toast } from "@/lib/types";

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`group pointer-events-auto flex w-80 animate-in slide-in-from-right-full items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md duration-300 ${
            toast.type === "error"
              ? "border-red-500/20 bg-red-500/10 text-red-200"
              : toast.type === "warning"
              ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg">
            {toast.type === "error" ? "✕" : toast.type === "warning" ? "!" : "✓"}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black uppercase tracking-widest">{toast.title}</h4>
            <p className="mt-1 text-xs font-bold leading-relaxed opacity-90">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
