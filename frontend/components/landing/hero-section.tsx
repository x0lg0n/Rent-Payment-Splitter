import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function HeroSection() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 pb-12 pt-12 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:pt-16">
      <div className="animate-enter space-y-6">
        <Badge className="w-fit border border-[var(--brand-soft)] bg-white/75 text-[var(--brand)] dark:bg-white/10 dark:text-white">
          Stellar testnet ready
        </Badge>

        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
          Rent payments with
          <span className="block bg-gradient-to-r from-[var(--brand)] via-sky-500 to-cyan-500 bg-clip-text text-transparent">
            verifiable on-chain proof.
          </span>
        </h1>

        <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          SplitRent helps roommates coordinate monthly payments with wallet-native
          actions, transparent status, and clean transaction records.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]">
            <Link href="/dashboard">
              Start on Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#features">Explore Features</a>
          </Button>
        </div>
      </div>

      <Card className="animate-enter border-0 bg-white/80 shadow-2xl backdrop-blur delay-100 dark:bg-white/10">
        <CardHeader>
          <CardTitle className="text-xl">What You Get</CardTitle>
          <CardDescription>Level 1 functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="rounded-lg bg-muted/60 p-3">Wallet connect + testnet validation</p>
          <p className="rounded-lg bg-muted/60 p-3">Live XLM balance with refresh</p>
          <p className="rounded-lg bg-muted/60 p-3">Send XLM + explorer verification</p>
          <p className="rounded-lg bg-muted/60 p-3">Transaction history on dashboard</p>
        </CardContent>
      </Card>
    </section>
  );
}
