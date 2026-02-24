import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type ToastLevel = "error" | "success";
export interface AppToast {
  id: number;
  title: string;
  description: string;
  level: ToastLevel;
}

interface ToastStackProps {
  toasts: AppToast[];
  onRemove: (id: number) => void;
}

export function ToastStack({ toasts, onRemove }: ToastStackProps) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      role="status"
      className="pointer-events-none fixed right-4 top-16 z-[70] flex w-[min(92vw,360px)] flex-col gap-2"
    >
      {toasts.map((toast) => (
        <Card
          key={toast.id}
          role={toast.level === "error" ? "alert" : undefined}
          className={`pointer-events-auto border ${
            toast.level === "error"
              ? "border-amber-400/50 bg-amber-50/90 dark:border-amber-500/50 dark:bg-amber-950/70"
              : "border-emerald-400/50 bg-emerald-50/90 dark:border-emerald-500/50 dark:bg-emerald-950/70"
          }`}
        >
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                <p className="text-xs text-muted-foreground">{toast.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                aria-label="Dismiss notification"
                onClick={() => onRemove(toast.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
