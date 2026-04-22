"use client";

import { useState } from "react";
import { Toast, ToastType } from "@/lib/types";

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (message: string, type: ToastType = "error") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const titleByType: Record<ToastType, string> = {
      success: "Başarılı",
      warning: "Uyarı",
      error: "Hata",
    };
    setToasts((prev) => [...prev, { id, message, type, title: titleByType[type] }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  };

  return { toasts, pushToast };
}
