import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  id: string;
  label: string;
  status: "pending" | "loading" | "completed";
}

interface TransactionTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function TransactionTimeline({ steps, className }: TransactionTimelineProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {step.status === "completed" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : step.status === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin text-[var(--brand)]" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
              {!isLast && (
                <div 
                  className={cn(
                    "my-1 h-8 w-0.5",
                    step.status === "completed" ? "bg-green-600" : "bg-muted"
                  )}
                />
              )}
            </div>
            <div className="flex-1 pt-0.5">
              <p className={cn(
                "text-sm font-medium",
                step.status === "completed" ? "text-foreground" :
                step.status === "loading" ? "text-[var(--brand)]" :
                "text-muted-foreground"
              )}>
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
