"use client";

import { ExternalLink, ChevronDown, ChevronLeft, ChevronRight, FileText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { TransactionExport } from "@/components/dashboard/transaction-export";
import { TransactionFilterBar } from "@/components/dashboard/transaction-filter-bar";
import type { TransactionRecord } from "@/lib/types/transaction";
import { useState, useMemo, useEffect } from "react";

interface TransactionHistoryCardProps {
  transactions: TransactionRecord[];
  explorerBaseUrl: string;
  walletAddress: string;
  onCopyHash: (hash: string) => void;
  onImportTransactions?: (transactions: TransactionRecord[]) => void;
  onScrollToPaymentForm?: () => void;
}

const TRANSACTIONS_PER_PAGE = 10;

export function TransactionHistoryCard({
  transactions,
  explorerBaseUrl,
  walletAddress,
  onCopyHash,
  onImportTransactions,
  onScrollToPaymentForm,
}: TransactionHistoryCardProps) {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>(transactions);

  // Reset to page 1 when transactions change
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
    const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE);

  const handleFilteredResultsChange = (filtered: TransactionRecord[]) => {
    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleImportSuccess = (transactions: TransactionRecord[]) => {
    onImportTransactions?.(transactions);
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
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="No transactions yet"
            description="Send your first rent payment to get started. All your transactions will appear here with verification links."
            action={
              <Button onClick={onScrollToPaymentForm} className="min-h-[44px]">
                Send Your First Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Filter Bar */}
            <TransactionFilterBar
              transactions={transactions}
              onFilteredResultsChange={handleFilteredResultsChange}
            />

            {/* Transaction List */}
            <div className="space-y-2">
              {paginatedTransactions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">
                    No transactions match your filters
                  </p>
                </div>
              ) : (
                paginatedTransactions.map((tx) => {
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
                            <Badge variant="secondary" className="min-h-7">
                              {tx.amount} XLM
                            </Badge>
                            <Badge variant="outline" className="min-h-7">
                              Testnet
                            </Badge>
                            {tx.confirmed !== undefined && (
                              <Badge 
                                variant={tx.confirmed ? "default" : "secondary"}
                                className="min-h-7"
                              >
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
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onCopyHash(tx.hash)}
                                  className="h-8 min-w-11 px-2 text-xs"
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
                                    className="h-8 min-w-11 px-2 text-xs"
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
                })
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * TRANSACTIONS_PER_PAGE + 1} to {Math.min(currentPage * TRANSACTIONS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10 h-10 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
