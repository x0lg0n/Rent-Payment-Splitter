"use client";

import { ExternalLink, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransactionRecord } from "@/lib/types/transaction";
import { useState } from "react";

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
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
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
          <div className="space-y-2">
            {transactions.map((tx) => {
              const isExpanded = expandedTx === tx.id;
              return (
                <div
                  key={tx.id}
                  className="group rounded-xl border border-border/70 bg-background/80 transition-all duration-300 hover:border-[var(--brand)]/30 hover:bg-background dark:hover:bg-white/5"
                >
                  <button
                    onClick={() => setExpandedTx(isExpanded ? null : tx.id)}
                    className="w-full p-3 text-left transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{tx.amount} XLM</Badge>
                        <Badge variant="outline">Testnet</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:text-[var(--brand)] ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="animate-in slide-in-from-top-2 border-t border-border/70 px-3 py-3">
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">From</p>
                          <p className="truncate font-mono text-xs" title={tx.from}>
                            {tx.from}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">To</p>
                          <p className="truncate font-mono text-xs" title={tx.to}>
                            {tx.to}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                          <p className="break-all font-mono text-xs text-[var(--brand)]">{tx.hash}</p>
                        </div>
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
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
