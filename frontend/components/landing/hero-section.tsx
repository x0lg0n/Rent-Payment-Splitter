import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentFlowIllustration } from "@/components/landing/illustrations";

export function HeroSection() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 py-24 md:px-10 md:py-32">
      {/* Animated gradient background orbs */}
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-[var(--brand)]/10 blur-3xl animate-pulse" />
      <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />

      <div className="relative grid items-center gap-12 md:grid-cols-2">
        {/* Left content with animations */}
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000" style={{ animationFillMode: "both" }}>
          <div className="space-y-4">
            <Badge className="w-fit border border-[var(--brand-soft)] bg-white/75 text-[var(--brand)] dark:border-[var(--brand)]/30 dark:bg-white/10 dark:text-cyan-300 animate-in fade-in zoom-in-50 duration-700" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} />
              Stellar Testnet Ready
            </Badge>

            <h1 className="text-5xl font-black leading-tight tracking-tighter md:text-6xl lg:text-7xl animate-in fade-in slide-in-from-left-8 duration-1000" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
              Rent Payments
              <br />
              <span className="bg-gradient-to-r from-[var(--brand)] via-sky-500 to-cyan-400 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-left-8 duration-1000" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
              Connect your wallet, split rent transparently, and verify every transaction on-chain. 
              SplitRent brings blockchain clarity to roommate payments on Stellar.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 animate-in fade-in slide-in-from-left-8 duration-1000" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
            <Button
              asChild
              size="lg"
              className="gap-2 bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)] transition-all hover:shadow-lg hover:shadow-[var(--brand)]/30"
            >
              <Link href="/dashboard">
                Launch Dashboard
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <a href="#features">
                Explore Features
              </a>
            </Button>
          </div>

          {/* Quick stats */}
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Native Wallet</p>
              <p className="text-2xl font-bold">Freighter</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Network</p>
              <p className="text-2xl font-bold">Testnet</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Asset</p>
              <p className="text-2xl font-bold">XLM</p>
            </div>
          </div>
        </div>

        {/* Right illustration with animations */}
        <div className="relative flex items-center justify-center animate-in fade-in slide-in-from-right-8 duration-1000 md:duration-700" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
          <div className="relative w-full aspect-square max-w-md">
            <PaymentFlowIllustration className="h-full w-full text-[var(--brand)]" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--brand)]/20 to-transparent" />
    </section>
  );
}
