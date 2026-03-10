import Link from "next/link";
import { ArrowRight, LifeBuoy, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/80 bg-[linear-gradient(180deg,rgba(234,241,255,0.72)_0%,rgba(248,250,255,0.92)_100%)] px-4 py-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.62)_0%,rgba(2,6,23,0.8)_100%)] md:px-8 md:py-8">
      <div className="rounded-2xl border border-[#d7e2fb] bg-white/75 p-4 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/65 md:p-5">
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-[#d4e0fb] bg-[#eef3ff]/85 p-4 dark:border-slate-700 dark:bg-slate-900/70 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-lg font-semibold text-slate-950 dark:text-white">
              Ready to split rent with full transparency?
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Connect wallet, pay, and verify each transfer hash in one flow.
            </p>
          </div>
          <Button
            asChild
            className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
            <Link href="/dashboard" className="gap-2">
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))]">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--brand) text-white">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold">SplitRent</p>
                <p className="text-xs text-muted-foreground">
                  Stellar Payment Splitter
                </p>
              </div>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              Built for roommates and shared households managing recurring rent
              transfers and escrow milestones.
            </p>
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white/85 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/70">
              <p className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Explorer-linked verification on Stellar testnet.
              </p>
              <p className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <LifeBuoy className="h-4 w-4 text-sky-600" />
                Clear transfer status and validation feedback.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Product
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="#features"
                  className="hover:text-foreground transition-colors">
                  Feature overview
                </a>
              </li>
              <li>
                <a
                  href="#workflow"
                  className="hover:text-foreground transition-colors">
                  Transfer workflow
                </a>
              </li>
              <li>
                <a
                  href="#service-info"
                  className="hover:text-foreground transition-colors">
                  Service details
                </a>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-foreground transition-colors">
                  Dashboard shell
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Resources
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="#faq"
                  className="hover:text-foreground transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="https://developers.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors">
                  Stellar developer docs
                </a>
              </li>
              <li>
                <a
                  href="https://stellar.expert"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors">
                  Stellar explorer
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Use Cases
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Monthly roommate rent split.</li>
              <li>Shared household expense transfer.</li>
              <li>Escrow trial flows on testnet.</li>
            </ul>
          </div>
        </div>

        <div className="my-5 h-px bg-slate-200 dark:bg-slate-700" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <p>© {currentYear} SplitRent. Built on Stellar Testnet.</p>
          <div className="flex gap-5">
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <a
              href="https://stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors">
              Stellar
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
