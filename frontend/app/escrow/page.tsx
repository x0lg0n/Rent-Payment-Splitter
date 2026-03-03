"use client";

import { useRouter } from "next/navigation";
import { Plus, ArrowLeft, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useEscrowStore } from "@/lib/store";
import { useState, useMemo } from "react";

export default function AllEscrowsPage() {
  const router = useRouter();
  const { escrows } = useEscrowStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredEscrows = useMemo(() => {
    return escrows.filter(escrow => {
      const matchesSearch = escrow.id.includes(searchTerm) || 
                           escrow.landlord.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || escrow.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [escrows, searchTerm, statusFilter]);

  const formatAmount = (amount: string) => {
    return (Number(amount) / 10000000).toFixed(2);
  };

  const formatDate = (timestamp: string) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-blue-500";
      case "FullyFunded": return "bg-green-500";
      case "Released": return "bg-purple-500";
      case "Refunded": return "bg-gray-500";
      case "Disputed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="landing-grid absolute inset-0 -z-10" />
      
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="min-h-[44px]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Escrows</h1>
              <p className="text-sm text-muted-foreground">
                {escrows.length} total {escrows.length === 1 ? "escrow" : "escrows"}
              </p>
            </div>
          </div>
          
          <Button onClick={() => router.push("/escrow/create")} className="min-h-[44px]">
            <Plus className="mr-2 h-4 w-4" />
            Create New Escrow
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ID or landlord..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 min-h-[44px]"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-h-[44px] rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="FullyFunded">Fully Funded</option>
                  <option value="Released">Released</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Disputed">Disputed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escrows List */}
        {filteredEscrows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No escrows found</h3>
              <p className="text-sm text-muted-foreground">
                {escrows.length === 0 
                  ? "Create your first escrow to get started" 
                  : "Try adjusting your search or filters"}
              </p>
              {escrows.length === 0 && (
                <Button onClick={() => router.push("/escrow/create")} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Escrow
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEscrows.map((escrow) => {
              const depositedCount = escrow.participants.filter((p: { deposited: boolean }) => p.deposited).length;
              const totalCount = escrow.participants.length;
              const isFullyFunded = depositedCount === totalCount;
              
              return (
                <Card 
                  key={escrow.id} 
                  className="cursor-pointer transition-all hover:border-[var(--brand)]/50 hover:shadow-lg"
                  onClick={() => router.push(`/escrow/${escrow.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${getStatusColor(escrow.status)}`} />
                          Escrow #{escrow.id.slice(-8)}
                        </CardTitle>
                        <CardDescription>
                          Created {formatDate(escrow.created_at)}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{escrow.status}</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Funding Progress</span>
                        <span className="font-medium">
                          {formatAmount(escrow.deposited_amount)} / {formatAmount(escrow.total_rent)} XLM
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div 
                          className={`h-full transition-all ${
                            isFullyFunded ? "bg-green-500" : "bg-[var(--brand)]"
                          }`}
                          style={{ width: `${(depositedCount / totalCount) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {depositedCount} of {totalCount} participants deposited
                      </p>
                    </div>

                    {/* Deadline */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Deadline:</span>
                      <span className="font-medium">{formatDate(escrow.deadline)}</span>
                    </div>

                    {/* Participants Preview */}
                    <div className="flex items-center gap-1">
                      {escrow.participants.slice(0, 3).map((_: any, i: number) => (
                        <div
                          key={i}
                          className={`h-6 w-6 rounded-full border-2 ${
                            i < depositedCount ? "bg-green-500" : "bg-muted"
                          }`}
                        />
                      ))}
                      {escrow.participants.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{escrow.participants.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* View Button */}
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Contract Info */}
        <Card>
          <CardHeader>
            <CardTitle>Smart Contract</CardTitle>
            <CardDescription>Deployed on Stellar Testnet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contract Address:</span>
                  <code className="font-mono text-xs break-all">
                    CBUMZ3VLJ3IINXLXTS72V6AMGPOFIYRDRQCDWV7BBYNIS4RAX2U6T2AM
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span>Stellar Testnet</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
