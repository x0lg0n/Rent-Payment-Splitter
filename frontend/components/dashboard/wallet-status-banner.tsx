import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface WalletStatusBannerProps {
  walletOnTestnet: boolean;
  walletOnMainnet: boolean;
  shortAddress: string | null;
  walletError: string | null;
}

export function WalletStatusBanner({
  walletOnTestnet,
  walletOnMainnet,
  shortAddress,
  walletError,
}: WalletStatusBannerProps) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          className={
            walletOnTestnet
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
          }
        >
          {walletOnTestnet ? "Connected to Testnet" : "Testnet required"}
        </Badge>
        {walletOnMainnet ? <Badge variant="destructive">Mainnet detected</Badge> : null}
        {shortAddress ? <Badge variant="secondary">{shortAddress}</Badge> : null}
      </div>

      {walletError ? (
        <Card className="border-amber-300/60 bg-amber-50/70 dark:border-amber-500/50 dark:bg-amber-950/30">
          <CardContent className="flex items-start gap-2 p-3 text-sm text-amber-900 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{walletError}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
