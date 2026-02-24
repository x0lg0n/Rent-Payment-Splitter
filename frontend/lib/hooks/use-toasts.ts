"use client";

import { useCallback, useState } from "react";
import type { AppToast, ToastLevel } from "@/components/dashboard/toast-stack";
import { APP_CONFIG } from "@/lib/config";

export function useToasts() {
  const [toasts, setToasts] = useState<AppToast[]>([]);

  const pushToast = useCallback(
    (title: string, description: string, level: ToastLevel = "error") => {
      const toastId = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev, { id: toastId, title, description, level }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== toastId));
      }, APP_CONFIG.toastDuration);
    },
    [],
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return { toasts, pushToast, removeToast };
}
