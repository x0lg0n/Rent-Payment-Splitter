import { ArrowRight, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EscrowBannerProps {
  activeEscrowsCount: number;
  onCreateClick: () => void;
  onViewAllClick: () => void;
}

export function EscrowBanner({
  activeEscrowsCount,
  onCreateClick,
  onViewAllClick,
}: EscrowBannerProps) {
  if (activeEscrowsCount === 0) {
    return (
      <Card className="border-2 border-dashed border-[var(--brand)]/30 bg-gradient-to-r from-[var(--brand)]/5 to-sky-500/5">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-8 md:flex-row">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand)]/10">
            <Users className="h-8 w-8 text-[var(--brand)]" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-semibold">Split Rent with Roommates</h3>
            <p className="text-sm text-muted-foreground">
              Create an escrow to collect rent from all roommates. Funds are released only when everyone pays.
            </p>
          </div>
          
          <Button onClick={onCreateClick} className="min-h-[44px]">
            <Plus className="mr-2 h-4 w-4" />
            Create Escrow
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--brand)]/30 bg-gradient-to-r from-[var(--brand)]/10 to-sky-500/10">
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand)]/20">
            <Users className="h-6 w-6 text-[var(--brand)]" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">
              {activeEscrowsCount} Active {activeEscrowsCount === 1 ? "Escrow" : "Escrows"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeEscrowsCount === 1 
                ? "You have 1 active rent escrow" 
                : `You have ${activeEscrowsCount} active rent escrows`}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onViewAllClick}
            className="min-h-[44px]"
          >
            View All
          </Button>
          <Button onClick={onCreateClick} className="min-h-[44px]">
            <Plus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
