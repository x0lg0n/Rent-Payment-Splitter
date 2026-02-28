import { cn } from "@/lib/utils";

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function Progress({ 
  value = 0, 
  max = 100, 
  className, 
  showLabel = false,
  label 
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-[var(--brand)] transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-muted-foreground">
          {label || `${Math.round(percentage)}%`}
        </p>
      )}
    </div>
  );
}
