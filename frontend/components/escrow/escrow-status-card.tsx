import { ExternalLink, Clock, Share2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DepositProgress } from "./deposit-progress";
import { ParticipantList } from "./participant-list";
import { EscrowTimeline } from "./escrow-timeline";
import type { EscrowData, EscrowStatus as EscrowStatusType } from "@/lib/stellar/contract";

interface EscrowStatusCardProps {
  escrow: EscrowData;
  currentUserId: string;
  onDeposit?: () => void;
  onRelease?: () => void;
  onViewDetails?: () => void;
}

export function EscrowStatusCard({
  escrow,
  currentUserId,
  onDeposit,
  onRelease,
  onViewDetails,
}: EscrowStatusCardProps) {
  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 10000000).toFixed(2);
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const depositedCount = escrow.participants.filter(p => p.deposited).length;
  const isFullyFunded = depositedCount === escrow.participants.length;
  const isCurrentUserDeposited = escrow.participants.find(
    p => p.address === currentUserId
  )?.deposited;

  const getStatusColor = (status: EscrowStatusType) => {
    switch (status) {
      case "Active": return "bg-blue-500";
      case "FullyFunded": return "bg-green-500";
      case "Released": return "bg-purple-500";
      case "Refunded": return "bg-gray-500";
      case "Disputed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTimelineSteps = (): Array<{ id: string; label: string; status: "completed" | "current" | "pending"; description?: string }> => {
    const steps = [
      {
        id: "created",
        label: "Created",
        status: "completed" as const,
        description: formatDate(escrow.created_at),
      },
      {
        id: "deposits",
        label: "Collecting Deposits",
        status: isFullyFunded ? "completed" as const : "current" as const,
        description: `${depositedCount}/${escrow.participants.length} deposited`,
      },
      {
        id: "release",
        label: "Release to Landlord",
        status: escrow.status === "Released" ? "completed" as const : 
                isFullyFunded ? "current" as const : "pending" as const,
        description: "Funds transferred when fully funded",
      },
      {
        id: "complete",
        label: "Complete",
        status: escrow.status === "Released" ? "completed" as const : "pending" as const,
        description: "Escrow closed",
      },
    ];

    return steps;
  };

  const isLandlord = currentUserId === escrow.landlord;
  const canRelease = isLandlord && isFullyFunded && escrow.status !== "Released";

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Escrow #{escrow.id.toString().slice(-6)}
              <div className={`h-3 w-3 rounded-full ${getStatusColor(escrow.status)}`} />
              <Badge variant="secondary">{escrow.status}</Badge>
            </CardTitle>
            <CardDescription>
              Created {formatDate(escrow.created_at)}
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
            {onViewDetails && (
              <Button variant="outline" size="sm" onClick={onViewDetails}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress */}
        <DepositProgress
          depositedAmount={escrow.deposited_amount}
          totalAmount={escrow.total_rent}
          participantsCount={escrow.participants.length}
          depositedCount={depositedCount}
        />

        {/* Deadline */}
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
          <Clock className="h-4 w-4 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Deadline: {formatDate(escrow.deadline)}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {isFullyFunded ? "Fully funded - ready to release" : "Deposits still being collected"}
            </p>
          </div>
        </div>

        {/* Participants */}
        <ParticipantList
          participants={escrow.participants}
          currentUserId={currentUserId}
        />

        {/* Timeline */}
        <EscrowTimeline steps={getTimelineSteps()} />

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          {!isCurrentUserDeposited && onDeposit && (
            <Button onClick={onDeposit} className="flex-1 min-h-[44px]">
              Deposit {formatAmount(
                escrow.participants.find(p => p.address === currentUserId)?.share_amount || 0n
              )} XLM
            </Button>
          )}
          
          {canRelease && onRelease && (
            <Button onClick={onRelease} className="flex-1 min-h-[44px]" variant="default">
              Release Funds to Landlord
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          
          {onViewDetails && (
            <Button variant="outline" onClick={onViewDetails} className="min-h-[44px]">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
