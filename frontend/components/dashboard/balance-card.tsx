import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface BalanceCardProps {
  balance: number | null;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  canRefresh: boolean;
  onRefresh: () => void;
  isZeroBalance: boolean;
  friendbotUrl: string;
}

export function BalanceCard({
  balance,
  isRefreshing,
  lastUpdated,
  canRefresh,
  onRefresh,
  isZeroBalance,
  friendbotUrl,
}: BalanceCardProps) {
  return (
    <Card id="balance" className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <CardTitle>Balance</CardTitle>
        <CardDescription>Connected testnet wallet balance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl bg-muted/60 p-4" aria-live="polite" aria-atomic="true">
          <p className="text-sm text-muted-foreground">Available XLM</p>
          
          {isRefreshing || balance === null ? (
            <Skeleton className="mt-2 h-12 w-48" />
          ) : (
            <p className="text-4xl font-black tracking-tight">
              {balance.toFixed(2)} XLM
            </p>
          )}
          
          <p className="mt-1 text-xs text-muted-foreground">
            {lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
              : "Last updated: --"}
          </p>
        </div>

        {isZeroBalance ? (
          <Card className="border-amber-300/60 bg-amber-50/70 dark:border-amber-500/50 dark:bg-amber-950/30">
            <CardContent className="p-3 text-sm">
              <p className="font-medium">Zero balance detected.</p>
              <p className="text-muted-foreground">
                Fund testnet XLM via{" "}
                <a
                  href={friendbotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--brand)] underline underline-offset-4"
                >
                  Friendbot
                </a>{" "}
                and refresh.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <Button 
          variant="outline" 
          onClick={onRefresh} 
          disabled={!canRefresh || isRefreshing}
          className="min-h-[44px]"
        >
          {isRefreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh Balance
        </Button>
      </CardContent>
    </Card>
  );
}
