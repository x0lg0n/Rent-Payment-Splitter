"use client";

import { useState } from "react";
import { Download, Upload, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TransactionRecord } from "@/lib/types/transaction";
import {
  exportTransactionHistory,
  exportToCSV,
  importTransactionHistory,
} from "@/lib/utils/transaction-export";

interface TransactionExportProps {
  transactions: TransactionRecord[];
  walletAddress: string;
  onImportSuccess?: (transactions: TransactionRecord[]) => void;
}

export function TransactionExport({
  transactions,
  walletAddress,
  onImportSuccess,
}: TransactionExportProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleExportJSON = async () => {
    try {
      await exportTransactionHistory(transactions, walletAddress);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportToCSV(transactions, walletAddress);
    } catch (error) {
      console.error("CSV export failed:", error);
    }
  };

  const handleImportClick = () => {
    setIsImportDialogOpen(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const result = await importTransactionHistory(file, walletAddress);
      
      if (result.success && result.transactions) {
        onImportSuccess?.(result.transactions);
        setIsImportDialogOpen(false);
      } else {
        setImportError(result.error || "Import failed");
      }
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Import failed");
    } finally {
      setIsImporting(false);
      // Reset file input
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportJSON}>
            <FileJson className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            Import from JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Import Dialog */}
      <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Transaction History</AlertDialogTitle>
            <AlertDialogDescription>
              Select a JSON file exported from SplitRent to import your transaction history.
              This will replace your current transaction history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {importError && (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
              {importError}
            </div>
          )}
          
          <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-8 my-4">
            <label className="flex flex-col items-center cursor-pointer">
              <FileJson className="h-12 w-12 text-muted-foreground mb-2" />
              <span className="text-sm font-medium">Click to select JSON file</span>
              <span className="text-xs text-muted-foreground mt-1">
                or drag and drop
              </span>
              <input
                ref={fileInputRef as any}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isImporting}
              />
            </label>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isImporting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? "Importing..." : "Select File"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
