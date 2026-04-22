// src/hooks/useToast.ts
import { useState, useCallback } from "react";

export type ToastType = "error" | "success" | "warning" | "info";

export interface Toast {
  id: number;
  message: string;
  title?: string;
  type: ToastType;
}

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "error", title?: string) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}