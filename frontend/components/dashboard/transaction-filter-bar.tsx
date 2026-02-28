"use client";

import { Search, Filter, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { TransactionRecord } from "@/lib/types/transaction";

interface TransactionFilters {
  search: string;
  status: "all" | "confirmed" | "pending";
  sortBy: "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
}

interface TransactionFilterBarProps {
  transactions: TransactionRecord[];
  onFilteredResultsChange: (filtered: TransactionRecord[]) => void;
}

export function TransactionFilterBar({
  transactions,
  onFilteredResultsChange,
}: TransactionFilterBarProps) {
  const [filters, setFilters] = useState<TransactionFilters>({
    search: "",
    status: "all",
    sortBy: "date_desc",
  });

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.from.toLowerCase().includes(searchLower) ||
          tx.to.toLowerCase().includes(searchLower) ||
          tx.hash.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      const isConfirmed = filters.status === "confirmed";
      result = result.filter((tx) => {
        if (tx.confirmed === undefined) return false;
        return tx.confirmed === isConfirmed;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "date_desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date_asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "amount_desc":
          return Number(b.amount) - Number(a.amount);
        case "amount_asc":
          return Number(a.amount) - Number(b.amount);
        default:
          return 0;
      }
    });

    return result;
  }, [transactions, filters]);

  // Notify parent of filtered results using useEffect (NOT useState)
  useEffect(() => {
    onFilteredResultsChange(filteredTransactions);
  }, [filteredTransactions, onFilteredResultsChange]);

  const hasActiveFilters = filters.search || filters.status !== "all";

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "all",
      sortBy: "date_desc",
    });
  };

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-col gap-3 md:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by address or hash..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9 min-h-[44px]"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value: any) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-full md:w-[160px] min-h-[44px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select
          value={filters.sortBy}
          onValueChange={(value: any) => setFilters({ ...filters, sortBy: value })}
        >
          <SelectTrigger className="w-full md:w-[180px] min-h-[44px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Newest First</SelectItem>
            <SelectItem value="date_asc">Oldest First</SelectItem>
            <SelectItem value="amount_desc">Highest Amount</SelectItem>
            <SelectItem value="amount_asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters & Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Badge variant="secondary" className="gap-1">
              {filteredTransactions.length} results
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="outline" className="gap-1">
              Status: {filters.status}
              <button
                onClick={() => setFilters({ ...filters, status: "all" })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 gap-1 text-xs"
          >
            <X className="h-3 w-3" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
