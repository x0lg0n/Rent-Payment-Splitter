"use client";

import { useCallback, useState } from "react";
import type { AppToast, ToastLevel } from "@/components/dashboard/toast-stack";

export function useToasts() {
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const pushToast = useCallback(
    (title: string, description: string, level: ToastLevel = "error") => {
      const toastId = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev, { id: toastId, title, description, level }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
      }, 5000);
    },
    [],
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, pushToast, removeToast };
}
