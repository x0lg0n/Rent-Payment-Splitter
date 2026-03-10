"use client";

import Image from "next/image";
import { ArrowRight, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onConnectClick?: () => void;
}

export function HeroSection({ onConnectClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[#9eabd3]/90 bg-[#aeb9d9]/85 p-6 shadow-[0_14px_35px_rgba(62,95,184,0.20)] dark:border-slate-700 dark:bg-slate-800/70 md:p-8">
      <div className="pointer-events-none absolute -right-24 -top-20 h-64 w-64 rounded-full bg-white/35 blur-3xl dark:bg-slate-200/10" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-sky-200/55 blur-3xl dark:bg-sky-500/10" />

      <div className="relative grid items-center gap-10 md:grid-cols-[1.03fr_1fr]">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000" style={{ animationFillMode: "both" }}>
          <div className="space-y-4">
            <Badge className="w-fit rounded-full border border-slate-200 bg-white/75 text-slate-700 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200 animate-in fade-in zoom-in-50 duration-700" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5 animate-spin" style={{ animationDuration: "3s" }} />
              Stellar Testnet Ready
            </Badge>

            <h1 className="text-4xl font-black leading-tight tracking-tighter text-slate-950 dark:text-white md:text-5xl lg:text-6xl animate-in fade-in slide-in-from-left-8 duration-1000" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
              Rent Payments
              <br />
              <span className="bg-linear-0-to-r from-slate-900 via-(--brand) to-sky-500 bg-clip-text text-transparent dark:from-white">
                Made Simple
              </span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-slate-700 dark:text-slate-300 animate-in fade-in slide-in-from-left-8 duration-1000" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
              Connect your wallet, split rent transparently, and verify every transaction on-chain.
              SplitRent brings blockchain clarity to roommate payments on Stellar.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-4 animate-in fade-in slide-in-from-left-8 duration-1000" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
            <Button
              size="lg"
              className="gap-2 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-all"
              onClick={onConnectClick}
            >
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 rounded-full border-slate-300 bg-white/70 px-6 hover:bg-white dark:border-slate-600 dark:bg-slate-900/70 dark:hover:bg-slate-900"
            >
              <a href="#features">
                Explore Features
              </a>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/72 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-300">On-chain proof</p>
              <p className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Verified
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/72 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Balance sync</p>
              <p className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                <RefreshCw className="h-4 w-4 text-sky-600" />
                30s refresh
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/72 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Wallet support</p>
              <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Freighter + more</p>
            </div>
          </div>
        </div>

        <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 md:duration-700" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
          <div className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.15)] dark:border-slate-700 dark:bg-slate-900/65">
            <div className="rounded-2xl border border-[#d8e2fb] bg-[#eef3ff] p-2">
              <Image
                src="/landing/hero-dashboard.svg"
                alt="SplitRent dashboard preview with balance, quick transfer, and stats"
                width={1200}
                height={780}
                className="h-auto w-full rounded-xl object-cover"
                priority
              />
            </div>
          </div>

          <div className="absolute -top-6 right-4 flex items-center gap-3 rounded-full border border-white/70 bg-white/90 px-3 py-2 shadow-lg backdrop-blur animate-float dark:border-slate-700 dark:bg-slate-900/85">
            <Image
              src="/user-avatar.svg"
              alt="User avatar"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border border-slate-200"
            />
            <div className="text-xs leading-tight">
              <p className="font-semibold text-slate-900 dark:text-white">John M.</p>
              <p className="text-slate-600 dark:text-slate-300">Wallet connected</p>
            </div>
          </div>

          <div className="absolute -bottom-5 left-6 rounded-2xl border border-[#d2dbf6] bg-white/95 px-4 py-3 shadow-lg animate-pulse-glow dark:border-slate-700 dark:bg-slate-900/85">
            <p className="text-xs text-slate-500 dark:text-slate-300">Last transfer</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">-42.00 XLM to Roommate Vault</p>
          </div>
        </div>
      </div>
    </section>
  );
}
