"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EscrowStatusCard } from "@/components/escrow/escrow-status-card";
import { useEscrowStore } from "@/lib/store";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useToasts } from "@/lib/hooks/use-toasts";

export default function EscrowDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { pushToast } = useToasts();
  const { walletAddress } = useWallet({ pushToast });
  const { escrows, updateEscrow } = useEscrowStore();

  // Get escrow ID as string (not BigInt)
  const escrowIdString = params.id as string;
  
  // Find escrow by comparing string representations
  const escrow = escrows.find(e => e.id.toString() === escrowIdString);

  if (!escrow) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="landing-grid absolute inset-0 -z-10" />
        <div className="mx-auto max-w-3xl space-y-8 px-6 py-10 text-center">
          <h1 className="text-2xl font-bold">Escrow Not Found</h1>
          <p className="text-muted-foreground">
            The escrow you're looking for doesn't exist or hasn't been created yet.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </main>
    );
  }

  const handleDeposit = async () => {
    if (!walletAddress) {
      pushToast("Wallet Required", "Please connect your wallet first", "error");
      return;
    }

    try {
      updateEscrow(BigInt(escrowIdString), {
        deposited_amount: escrow.total_rent,
        participants: escrow.participants.map(p => ({
          ...p,
          deposited: p.address === walletAddress ? true : p.deposited,
        })),
      });

      pushToast("Deposit Successful", "Your share has been deposited", "success");
    } catch (error) {
      pushToast(
        "Deposit Failed",
        error instanceof Error ? error.message : "Failed to deposit",
        "error"
      );
    }
  };

  const handleRelease = async () => {
    if (!walletAddress) {
      pushToast("Wallet Required", "Please connect your wallet first", "error");
      return;
    }

    try {
      updateEscrow(BigInt(escrowIdString), { status: "Released" });
      pushToast("Escrow Released", "Funds transferred to landlord", "success");
    } catch (error) {
      pushToast(
        "Release Failed",
        error instanceof Error ? error.message : "Failed to release escrow",
        "error"
      );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="landing-grid absolute inset-0 -z-10" />
      
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="min-h-[44px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Escrow Details</h1>
            <p className="text-sm text-muted-foreground">
              Escrow #{escrow.id.toString().slice(-6)}
            </p>
          </div>
        </div>

        <EscrowStatusCard
          escrow={escrow}
          currentUserId={walletAddress || ""}
          onDeposit={handleDeposit}
          onRelease={handleRelease}
          onViewDetails={() => {}}
        />

        <div className="rounded-lg border bg-muted/50 p-6">
          <h3 className="text-sm font-semibold mb-2">Need Help?</h3>
          <p className="text-sm text-muted-foreground">
            If you have questions about this escrow, contact the other participants or the landlord.
          </p>
        </div>
      </div>
    </main>
  );
}
