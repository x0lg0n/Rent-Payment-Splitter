import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransactionRecord } from "@/lib/types/transaction";

interface TransactionHistoryCardProps {
  transactions: TransactionRecord[];
  explorerBaseUrl: string;
  onCopyHash: (hash: string) => void;
}

export function TransactionHistoryCard({
  transactions,
  explorerBaseUrl,
  onCopyHash,
}: TransactionHistoryCardProps) {
  return (
    <Card id="history" className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Recent payments sent from this app. Verify each hash on testnet explorer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="rounded-xl border border-border/70 bg-background/80 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{tx.amount} XLM</Badge>
                    <Badge variant="outline">Testnet</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="mt-2 space-y-1 text-sm">
                  <p className="truncate" title={tx.from}>
                    <span className="text-muted-foreground">From:</span>{" "}
                    <span className="font-mono text-xs">
                      {tx.from.slice(0, 6)}...{tx.from.slice(-6)}
                    </span>
                  </p>
                  <p className="truncate" title={tx.to}>
                    <span className="text-muted-foreground">To:</span>{" "}
                    <span className="font-mono text-xs">
                      {tx.to.slice(0, 6)}...{tx.to.slice(-6)}
                    </span>
                  </p>
                  <p className="break-all">
                    <span className="text-muted-foreground">Hash:</span>{" "}
                    <span className="font-mono text-xs">{tx.hash}</span>
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => onCopyHash(tx.hash)}>
                    Copy Hash
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`${explorerBaseUrl}/${tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Verify
                      <ExternalLink className="ml-2 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
