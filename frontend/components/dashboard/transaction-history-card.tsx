"use client";

import { ExternalLink, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransactionRecord } from "@/lib/types/transaction";
import { TransactionExport } from "@/components/dashboard/transaction-export";
import { useState } from "react";

interface TransactionHistoryCardProps {
  transactions: TransactionRecord[];
  explorerBaseUrl: string;
  walletAddress: string;
  onCopyHash: (hash: string) => void;
  onImportTransactions?: (transactions: TransactionRecord[]) => void;
}

export function TransactionHistoryCard({
  transactions,
  explorerBaseUrl,
  walletAddress,
  onCopyHash,
  onImportTransactions,
}: TransactionHistoryCardProps) {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const handleImportSuccess = (importedTransactions: TransactionRecord[]) => {
    onImportTransactions?.(importedTransactions);
  };

  return (
    <Card id="history" className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Recent payments sent from this app. Verify each hash on testnet explorer.
            </CardDescription>
          </div>
          {transactions.length > 0 && (
            <TransactionExport
              transactions={transactions}
              walletAddress={walletAddress}
              onImportSuccess={handleImportSuccess}
            />
          )}
        </div>
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
                        {tx.confirmed !== undefined && (
                          <Badge variant={tx.confirmed ? "default" : "secondary"}>
                            {tx.confirmed ? "Confirmed" : "Pending"}
                          </Badge>
                        )}
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
                          <div className="flex items-center gap-2">
                            <p className="truncate font-mono text-xs" title={tx.hash}>
                              {tx.hash}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onCopyHash(tx.hash)}
                              className="h-6 px-2 text-xs"
                            >
                              Copy
                            </Button>
                            <a
                              href={`${explorerBaseUrl}/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs"
                              >
                                <ExternalLink className="mr-1 h-3 w-3" />
                                Verify
                              </Button>
                            </a>
                          </div>
                        </div>
                        {tx.ledger && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Ledger</p>
                            <p className="text-xs font-mono">{tx.ledger}</p>
                          </div>
                        )}
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
