/**
 * Transaction history export/import utilities
 * Allows users to backup and restore their transaction history
 */

import type { TransactionRecord } from "@/lib/types/transaction";

const EXPORT_VERSION = "1.0";
const EXPORT_KEY_PREFIX = "splitrent:export";

interface ExportData {
  version: string;
  exportedAt: string;
  walletAddress: string;
  transactions: TransactionRecord[];
  metadata: {
    totalTransactions: number;
    dateRange: {
      earliest: string;
      latest: string;
    };
    totalSent: string;
    totalReceived: string;
  };
}

/**
 * Calculate transaction statistics
 */
function calculateMetadata(
  transactions: TransactionRecord[],
  walletAddress: string
): ExportData["metadata"] {
  const now = new Date();
  const earliest = transactions.length > 0 
    ? transactions[transactions.length - 1].createdAt 
    : now.toISOString();
  const latest = transactions.length > 0 
    ? transactions[0].createdAt 
    : now.toISOString();

  // Calculate totals (simplified - would need to fetch actual transactions for accurate calc)
  const totalSent = transactions.reduce((sum, tx) => {
    return tx.from === walletAddress ? sum + Number(tx.amount) : sum;
  }, 0);

  const totalReceived = transactions.reduce((sum, tx) => {
    return tx.to === walletAddress ? sum + Number(tx.amount) : sum;
  }, 0);

  return {
    totalTransactions: transactions.length,
    dateRange: {
      earliest,
      latest,
    },
    totalSent: totalSent.toFixed(7),
    totalReceived: totalReceived.toFixed(7),
  };
}

/**
 * Export transaction history to JSON file
 */
export const exportTransactionHistory = async (
  transactions: TransactionRecord[],
  walletAddress: string
): Promise<void> => {
  const exportData: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    walletAddress,
    transactions,
    metadata: calculateMetadata(transactions, walletAddress),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  
  // Generate filename with date
  const date = new Date().toISOString().split("T")[0];
  const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  a.download = `splitrent-transactions-${shortAddress}-${date}.json`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Import transaction history from JSON file
 */
export const importTransactionHistory = async (
  file: File,
  walletAddress: string
): Promise<{ success: boolean; transactions?: TransactionRecord[]; error?: string }> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as ExportData;

    // Validate export format
    if (!data.version || data.version !== EXPORT_VERSION) {
      return {
        success: false,
        error: "Invalid export file format. Please use a file exported from SplitRent v1.0.",
      };
    }

    // Validate wallet address match
    if (data.walletAddress !== walletAddress) {
      return {
        success: false,
        error: "Export file belongs to a different wallet address.",
      };
    }

    // Validate transactions array
    if (!Array.isArray(data.transactions)) {
      return {
        success: false,
        error: "Invalid transactions data in export file.",
      };
    }

    // Validate each transaction
    const validTransactions: TransactionRecord[] = [];
    for (const tx of data.transactions) {
      if (
        tx &&
        typeof tx.id === "string" &&
        typeof tx.hash === "string" &&
        typeof tx.from === "string" &&
        typeof tx.to === "string" &&
        typeof tx.amount === "string" &&
        typeof tx.createdAt === "string"
      ) {
        validTransactions.push(tx);
      }
    }

    return {
      success: true,
      transactions: validTransactions,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse export file.",
    };
  }
};

/**
 * Export to CSV format for spreadsheet applications
 */
export const exportToCSV = (
  transactions: TransactionRecord[],
  walletAddress: string
): void => {
  const headers = ["Date", "Type", "From", "To", "Amount (XLM)", "Hash", "Status"];
  
  const rows = transactions.map((tx) => [
    new Date(tx.createdAt).toLocaleString(),
    tx.from === walletAddress ? "Sent" : "Received",
    tx.from,
    tx.to,
    tx.amount,
    tx.hash,
    tx.confirmed !== undefined ? (tx.confirmed ? "Confirmed" : "Pending") : "Unknown",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  
  const date = new Date().toISOString().split("T")[0];
  const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;
  a.download = `splitrent-transactions-${shortAddress}-${date}.csv`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Clear old export data from localStorage
 */
export const cleanupOldExports = (): void => {
  const keys = Object.keys(localStorage);
  const oldExportKeys = keys.filter((key) => key.startsWith(EXPORT_KEY_PREFIX));
  
  oldExportKeys.forEach((key) => {
    localStorage.removeItem(key);
  });
};
