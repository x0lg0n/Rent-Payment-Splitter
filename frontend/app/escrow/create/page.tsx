"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateEscrowForm } from "@/components/escrow/create-escrow-form";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useToasts } from "@/lib/hooks/use-toasts";
import { useEscrowStore } from "@/lib/store";
import { escrowService } from "@/lib/stellar/contract";

export default function CreateEscrowPage() {
  const router = useRouter();
  const { pushToast } = useToasts();
  const { walletAddress } = useWallet({ pushToast });
  const { addEscrow } = useEscrowStore();

  const handleCreateEscrow = async (data: {
    landlord: string;
    participants: string[];
    shares: bigint[];
    deadline: bigint;
  }) => {
    if (!walletAddress) {
      pushToast("Wallet Required", "Please connect your wallet first", "error");
      return;
    }

    try {
      pushToast("Creating Escrow", "Submitting transaction to Stellar...", "success");

      // Call real contract
      const escrowId = await escrowService.createEscrow(
        data.landlord,
        data.participants,
        data.shares,
        data.deadline,
        walletAddress
      );

      // Create local escrow object
      const mockEscrow = {
        id: escrowId.toString(),
        creator: walletAddress,
        landlord: data.landlord,
        participants: data.participants.map((address, i) => ({
          address,
          share_amount: data.shares[i].toString(),
          deposited: false,
        })),
        total_rent: data.shares.reduce((a, b) => a + b, BigInt(0)).toString(),
        deposited_amount: BigInt(0).toString(),
        deadline: data.deadline.toString(),
        status: "Active" as const,
        created_at: BigInt(Date.now()).toString(),
      };

      addEscrow(mockEscrow);

      pushToast("Escrow Created", `Escrow #${escrowId.toString().slice(-6)} created on-chain!`, "success");
      router.push(`/escrow/${escrowId}`);
    } catch (error) {
      console.error("Create escrow failed:", error);
      
      // Fallback: Create mock escrow for demo purposes
      pushToast("Contract Unavailable", "Creating demo escrow (contract not deployed)", "error");
      
      const demoEscrowId = BigInt(Date.now());
      const mockEscrow = {
        id: demoEscrowId.toString(),
        creator: walletAddress,
        landlord: data.landlord,
        participants: data.participants.map((address, i) => ({
          address,
          share_amount: data.shares[i].toString(),
          deposited: false,
        })),
        total_rent: data.shares.reduce((a, b) => a + b, BigInt(0)).toString(),
        deposited_amount: BigInt(0).toString(),
        deadline: data.deadline.toString(),
        status: "Active" as const,
        created_at: BigInt(Date.now()).toString(),
      };

      addEscrow(mockEscrow);
      router.push(`/escrow/${demoEscrowId}`);
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
            <h1 className="text-2xl font-bold">Create Rent Escrow</h1>
            <p className="text-sm text-muted-foreground">
              Set up a rent splitting escrow on Stellar
            </p>
          </div>
        </div>

        <CreateEscrowForm
          walletAddress={walletAddress}
          onSubmit={handleCreateEscrow}
          onCancel={() => router.back()}
        />

        <div className="rounded-lg border bg-muted/50 p-6">
          <h3 className="text-sm font-semibold mb-2">ℹ️ How Escrow Works</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-semibold text-[var(--brand)]">1.</span>
              Create escrow - Transaction signed with your wallet
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[var(--brand)]">2.</span>
              Share link with roommates - They deposit their shares
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[var(--brand)]">3.</span>
              When fully funded - Landlord can release funds
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[var(--brand)]">4.</span>
              If deadline passes - Participants can request refunds
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
