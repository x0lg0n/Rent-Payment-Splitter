import { CheckCircle2, Circle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Participant {
  address: string;
  share_amount: bigint;
  deposited: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
  currentUserId: string;
}

export function ParticipantList({
  participants,
  currentUserId,
}: ParticipantListProps) {
  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 10000000).toFixed(2);
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Participants</h4>
      
      <div className="space-y-2">
        {participants.map((participant, index) => {
          const isCurrentUser = participant.address === currentUserId;
          
          return (
            <div
              key={index}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                isCurrentUser ? "border-[var(--brand)] bg-[var(--brand)]/5" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isCurrentUser ? "bg-[var(--brand)]/20" : "bg-muted"
                }`}>
                  <User className="h-4 w-4" />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {isCurrentUser ? "You" : `Participant ${index + 1}`}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {shortenAddress(participant.address)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatAmount(participant.share_amount)} XLM
                  </p>
                </div>
                
                {participant.deposited ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
