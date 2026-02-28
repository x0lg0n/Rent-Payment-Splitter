"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateEscrowForm } from "@/components/escrow/create-escrow-form";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useToasts } from "@/lib/hooks/use-toasts";
import { useEscrowStore } from "@/lib/store";

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
      // Create mock escrow for now (will integrate with contract later)
      const mockEscrow = {
        id: BigInt(Date.now()),
        creator: walletAddress,
        landlord: data.landlord,
        participants: data.participants.map((address, i) => ({
          address,
          share_amount: data.shares[i],
          deposited: false,
        })),
        total_rent: data.shares.reduce((a, b) => a + b, 0n),
        deposited_amount: 0n,
        deadline: data.deadline,
        status: "Active" as const,
        created_at: BigInt(Date.now()),
      };

      addEscrow(mockEscrow);
      
      pushToast("Escrow Created", `Escrow #${mockEscrow.id.toString().slice(-6)} created successfully`, "success");
      router.push(`/escrow/${mockEscrow.id}`);
    } catch (error) {
      pushToast(
        "Creation Failed",
        error instanceof Error ? error.message : "Failed to create escrow",
        "error"
      );
      throw error;
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="landing-grid absolute inset-0 -z-10" />
      
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        {/* Header */}
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
              Set up a rent splitting escrow with your roommates
            </p>
          </div>
        </div>

        {/* Form */}
        <CreateEscrowForm
          walletAddress={walletAddress}
          onSubmit={handleCreateEscrow}
          onCancel={() => router.back()}
        />

        {/* Info Card */}
        <div className="rounded-lg border bg-muted/50 p-6">
          <h3 className="text-sm font-semibold mb-2">How Escrow Works</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-semibold text-[var(--brand)]">1.</span>
              Create escrow with landlord address and participant shares
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[var(--brand)]">2.</span>
              Each participant deposits their share
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[var(--brand)]">3.</span>
              When fully funded, landlord can release funds
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-[var(--brand)]">4.</span>
              If deadline passes, participants can request refunds
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
