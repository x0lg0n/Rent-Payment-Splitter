import { CheckCircle2, Circle, Clock } from "lucide-react";

interface TimelineStep {
  id: string;
  label: string;
  status: "completed" | "current" | "pending";
  description?: string;
}

interface EscrowTimelineProps {
  steps: TimelineStep[];
}

export function EscrowTimeline({ steps }: EscrowTimelineProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Escrow Timeline</h4>
      
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex items-start gap-4">
              {/* Icon */}
              <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                step.status === "completed" 
                  ? "border-green-600 bg-green-600" 
                  : step.status === "current"
                  ? "border-[var(--brand)] bg-[var(--brand)]"
                  : "border-muted bg-background"
              }`}>
                {step.status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : step.status === "current" ? (
                  <Clock className="h-4 w-4 text-white animate-pulse" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 pt-1">
                <p className={`text-sm font-medium ${
                  step.status === "completed" ? "text-foreground" :
                  step.status === "current" ? "text-[var(--brand)]" :
                  "text-muted-foreground"
                }`}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
