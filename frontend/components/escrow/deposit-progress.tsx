import { Progress } from "@/components/ui/progress";

interface DepositProgressProps {
  depositedAmount: bigint;
  totalAmount: bigint;
  participantsCount: number;
  depositedCount: number;
}

export function DepositProgress({
  depositedAmount,
  totalAmount,
  participantsCount,
  depositedCount,
}: DepositProgressProps) {
  const percentage = Number(depositedAmount) / Number(totalAmount) * 100;
  const isFullyFunded = depositedCount === participantsCount;

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 10000000).toFixed(2);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {isFullyFunded ? "Fully Funded" : "Funding Progress"}
        </span>
        <span className="text-sm text-muted-foreground">
          {formatAmount(depositedAmount)} / {formatAmount(totalAmount)} XLM
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-3"
      />
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {depositedCount} of {participantsCount} participants deposited
        </span>
        <span className={isFullyFunded ? "text-green-600 font-medium" : ""}>
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
