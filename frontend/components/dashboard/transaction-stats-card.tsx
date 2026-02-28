import { useMemo } from "react";
import { TrendingUp, Activity, Calendar, Coins } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransactionRecord } from "@/lib/types/transaction";

interface TransactionStatsCardProps {
  transactions: TransactionRecord[];
  walletAddress: string;
}

export function TransactionStatsCard({
  transactions,
  walletAddress,
}: TransactionStatsCardProps) {
  const stats = useMemo(() => {
    if (transactions.length === 0) {
      return {
        totalSent: 0,
        totalReceived: 0,
        transactionCount: 0,
        averageAmount: 0,
        lastTransactionDate: null as Date | null,
      };
    }

    const sent = transactions.filter((tx) => tx.from === walletAddress);
    const received = transactions.filter((tx) => tx.to === walletAddress);

    const totalSent = sent.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalReceived = received.reduce((sum, tx) => sum + Number(tx.amount), 0);
    
    const lastTransaction = transactions[0];
    const lastTransactionDate = lastTransaction 
      ? new Date(lastTransaction.createdAt) 
      : null;

    return {
      totalSent,
      totalReceived,
      transactionCount: transactions.length,
      averageAmount: (totalSent + totalReceived) / transactions.length,
      lastTransactionDate,
    };
  }, [transactions, walletAddress]);

  if (transactions.length === 0) {
    return null; // Don't show stats if no transactions
  }

  return (
    <Card className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Transaction Statistics
        </CardTitle>
        <CardDescription>
          Overview of your transaction activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Total Sent */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Sent</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.totalSent.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">XLM</p>
          </div>

          {/* Total Received */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Received</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.totalReceived.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">XLM</p>
          </div>

          {/* Transaction Count */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--brand)]" />
              <span className="text-xs text-muted-foreground">Transactions</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.transactionCount}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>

          {/* Average Amount */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Avg</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.averageAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">XLM</p>
          </div>
        </div>

        {/* Last Transaction */}
        {stats.lastTransactionDate && (
          <div className="mt-4 rounded-lg border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">
              Last transaction: {stats.lastTransactionDate.toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
