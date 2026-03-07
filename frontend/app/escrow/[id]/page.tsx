"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Clock, Users, CheckCircle2, AlertCircle, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEscrowStore } from "@/lib/store";
import { useWallet } from "@/lib/hooks/use-wallet";
import { useToasts } from "@/lib/hooks/use-toasts";
import { EXPLORER_CONFIG } from "@/lib/config";

export default function EscrowDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { pushToast } = useToasts();
  const { walletAddress } = useWallet({ pushToast });
  const { escrows } = useEscrowStore();

  const escrowIdString = params.id as string;

  // Find escrow by ID (stored as string)
  const escrow = escrows.find(e => e.id === escrowIdString);

  // Share functionality
  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rent Escrow',
          text: `Join the rent escrow #${escrowIdString.slice(-6)}`,
          url: shareUrl,
        });
        pushToast("Shared", "Escrow link shared successfully", "success");
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          fallbackCopyToClipboard(shareUrl);
        }
      }
    } else {
      fallbackCopyToClipboard(shareUrl);
    }
  };

  const fallbackCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      pushToast("Link Copied", "Escrow link copied to clipboard", "success");
    } catch (error) {
      pushToast("Copy Failed", "Unable to copy link", "error");
    }
  };

  // Deposit functionality
  const handleDeposit = async () => {
    if (!walletAddress) {
      pushToast("Wallet Required", "Please connect your wallet first", "error");
      return;
    }

    const participant = escrow.participants.find((p: { address: string }) => p.address === walletAddress);
    if (!participant) {
      pushToast("Not a Participant", "You are not part of this escrow", "error");
      return;
    }

    if (participant.deposited) {
      pushToast("Already Deposited", "You have already deposited your share", "success");
      return;
    }

    try {
      pushToast(
        "Initiating Deposit",
        `Preparing to deposit ${formatAmount(participant.share_amount)} XLM...`,
        "success"
      );
      
      // TODO: Implement actual deposit logic with smart contract
      // For now, show instructions
      pushToast(
        "Deposit Ready",
        "Smart contract integration pending. This will deposit your share when implemented.",
        "success"
      );
      
      // In production, this would call:
      // await escrowService.depositToEscrow(escrow.id, participant.share_amount);
      
    } catch (error) {
      pushToast(
        "Deposit Failed",
        error instanceof Error ? error.message : "Failed to deposit",
        "error"
      );
    }
  };

  // Release functionality
  const handleRelease = async () => {
    if (!walletAddress) {
      pushToast("Wallet Required", "Please connect your wallet first", "error");
      return;
    }

    const isLandlord = walletAddress === escrow.landlord;
    if (!isLandlord) {
      pushToast("Unauthorized", "Only the landlord can release funds", "error");
      return;
    }

    if (!isFullyFunded) {
      pushToast("Not Ready", "Escrow must be fully funded before releasing", "error");
      return;
    }

    try {
      pushToast(
        "Initiating Release",
        "Preparing to release funds to landlord...",
        "success"
      );
      
      // TODO: Implement actual release logic with smart contract
      // For now, show success message
      pushToast(
        "Release Ready",
        "Smart contract integration pending. This will release funds to landlord when implemented.",
        "success"
      );
      
      // In production, this would call:
      // await escrowService.releaseEscrow(escrow.id);
      
    } catch (error) {
      pushToast(
        "Release Failed",
        error instanceof Error ? error.message : "Failed to release funds",
        "error"
      );
    }
  };

  if (!escrow) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="landing-grid absolute inset-0 -z-10" />
        <div className="mx-auto max-w-3xl space-y-8 px-6 py-10 text-center">
          <Card>
            <CardHeader>
              <CardTitle>Escrow Not Found</CardTitle>
              <CardDescription>
                The escrow you're looking for doesn't exist or hasn't been created yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const formatAmount = (amount: string) => {
    return (Number(amount) / 10000000).toFixed(2);
  };

  const formatDate = (timestamp: string) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const depositedCount = escrow.participants.filter((p: { deposited: boolean }) => p.deposited).length;
  const totalCount = escrow.participants.length;
  const isFullyFunded = depositedCount === totalCount;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="landing-grid absolute inset-0 -z-10" />
      
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
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
                ID: {escrow.id.slice(-8)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
              title="Share escrow link"
            >
              <Share2 className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Share</span>
            </Button>
            <Badge variant={escrow.status === "Active" ? "default" : "secondary"} className="text-sm">
              {escrow.status}
            </Badge>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Escrow Status</CardTitle>
            <CardDescription>Current funding progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {depositedCount} of {totalCount} participants deposited
                </span>
              </div>
              <Badge variant={isFullyFunded ? "default" : "secondary"}>
                {isFullyFunded ? "Fully Funded" : "In Progress"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {formatAmount(escrow.deposited_amount)} / {formatAmount(escrow.total_rent)} XLM
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div 
                  className="h-full bg-[var(--brand)] transition-all"
                  style={{ width: `${(depositedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
              <Clock className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Deadline: {formatDate(escrow.deadline)}</p>
                <p className="text-xs">
                  {isFullyFunded ? "Ready to release to landlord" : "Deposits still being collected"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
            <CardDescription>All parties in this escrow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {escrow.participants.map((participant: { address: string; share_amount: string; deposited: boolean }, index: number) => {
                const isCurrentUser = participant.address === walletAddress;
                const isLandlord = participant.address === escrow.landlord;
                
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
                        {participant.deposited ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {isCurrentUser ? "You" : `Participant ${index + 1}`}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                          {isLandlord && (
                            <Badge variant="outline" className="text-xs">Landlord</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {participant.address.slice(0, 4)}...{participant.address.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatAmount(participant.share_amount)} XLM
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {participant.deposited ? "Deposited" : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6 pt-6 border-t">
              {!escrow.participants.find((p: { address: string; deposited: boolean }) => p.address === walletAddress)?.deposited && (
                <Button 
                  onClick={handleDeposit} 
                  className="flex-1 min-h-[44px]"
                  disabled={!walletAddress}
                >
                  Deposit Your Share
                </Button>
              )}
              {walletAddress === escrow.landlord && isFullyFunded && escrow.status !== "Released" && (
                <Button 
                  onClick={handleRelease} 
                  className="flex-1 min-h-[44px]"
                  variant="default"
                >
                  Release Funds to Landlord
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contract Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Information</CardTitle>
            <CardDescription>On-chain verification details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract Address:</span>
                  <code className="font-mono text-xs">
                    CBUMZ3VLJ3IINXLXTS72V6AMGPOFIYRDRQCDWV7BBYNIS4RAX2U6T2AM
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span>Stellar Testnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow ID:</span>
                  <code className="font-mono text-xs">{escrow.id}</code>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="min-h-[44px]" asChild>
                <a
                  href={`${EXPLORER_CONFIG.txBaseUrl}/contract/CBUMZ3VLJ3IINXLXTS72V6AMGPOFIYRDRQCDWV7BBYNIS4RAX2U6T2AM`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Contract on Explorer
                </a>
              </Button>
              <Button variant="outline" className="min-h-[44px]" asChild>
                <a
                  href="https://lab.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Stellar Lab
                </a>
              </Button>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-blue-900 dark:bg-blue-950/20 dark:text-blue-100">
              <p className="text-sm font-medium">ℹ️ Note</p>
              <p className="text-xs mt-1">
                This escrow was created using mock mode (SDK v14). 
                To deploy on-chain, upgrade to @stellar/stellar-sdk v15+ and redeploy the contract.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
