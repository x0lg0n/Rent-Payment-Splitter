"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight, Wallet, Send, Users, FileText } from "lucide-react";

interface OnboardingChecklistProps {
  hasWallet: boolean;
  hasBalance: boolean;
  hasTransactions: boolean;
  hasEscrows: boolean;
  onDismiss: () => void;
}

const steps = [
  {
    id: "wallet",
    title: "Connect Wallet",
    description: "Connect your Stellar wallet to get started",
    icon: Wallet,
  },
  {
    id: "balance",
    title: "Get Test XLM",
    description: "Fund your wallet with testnet XLM",
    icon: Send,
  },
  {
    id: "transaction",
    title: "Send First Payment",
    description: "Try sending a test payment to another address",
    icon: FileText,
  },
  {
    id: "escrow",
    title: "Create Escrow",
    description: "Set up a rent-splitting escrow with roommates",
    icon: Users,
  },
];

export function OnboardingChecklist({
  hasWallet,
  hasBalance,
  hasTransactions,
  hasEscrows,
  onDismiss,
}: OnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("splitrent:onboardingDismissed");
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    localStorage.setItem("splitrent:onboardingDismissed", "true");
    onDismiss();
  }, [onDismiss]);

  const getStepStatus = useCallback((stepId: string) => {
    switch (stepId) {
      case "wallet":
        return hasWallet ? "completed" : "pending";
      case "balance":
        return hasBalance ? "completed" : hasWallet ? "pending" : "locked";
      case "transaction":
        return hasTransactions ? "completed" : hasBalance ? "pending" : "locked";
      case "escrow":
        return hasEscrows ? "completed" : "pending";
      default:
        return "locked";
    }
  }, [hasWallet, hasBalance, hasTransactions, hasEscrows]);

  const completedSteps = useMemo(() => {
    return steps.filter((step) => getStepStatus(step.id) === "completed").length;
  }, [getStepStatus]);
  
  const progress = (completedSteps / steps.length) * 100;

  // Auto-dismiss when all steps are completed
  useEffect(() => {
    if (completedSteps === steps.length && !isDismissed) {
      setIsDismissed(true);
      localStorage.setItem("splitrent:onboardingDismissed", "true");
      onDismiss();
    }
  }, [completedSteps, steps.length, isDismissed, onDismiss]);

  if (isDismissed || completedSteps === steps.length) {
    return null;
  }

  return (
    <Card className="border-[--brand]/30 bg-linear-to-r from-[--brand]/5 to-sky-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Getting Started Guide</CardTitle>
            <CardDescription>
              Complete these steps to familiarize yourself with SplitRent
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8"
          >
            Dismiss
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-muted-foreground">Progress</span>
            <span className="font-semibold text-[--brand]">
              {completedSteps} of {steps.length} completed
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-linear-to-r from-[--brand] to-sky-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            const isLocked = status === "locked";
            const isCompleted = status === "completed";
            const isPending = status === "pending";

            return (
              <div
                key={step.id}
                className={`relative rounded-lg border p-4 transition-all ${
                  isCompleted
                    ? "border-green-500/50 bg-green-500/5"
                    : isPending
                    ? "border-[--brand]/50 bg-[--brand]/5"
                    : "border-muted bg-muted/30"
                }`}
              >
                {/* Step Number */}
                <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-background border text-xs font-bold shadow-sm">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Icon */}
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                    isCompleted
                      ? "bg-green-500/20"
                      : isPending
                      ? "bg-[--brand]/20"
                      : "bg-muted"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isCompleted
                        ? "text-green-600"
                        : isPending
                        ? "text-[--brand]"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>

                {/* Content */}
                <h3
                  className={`text-sm font-semibold mb-1 ${
                    isLocked ? "text-muted-foreground" : ""
                  }`}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground">{step.description}</p>

                {/* Status Badge */}
                {isPending && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Next Step
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        {!hasWallet && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Ready to get started?
            </p>
            <Button className="min-h-11">
              Connect Your Wallet
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
