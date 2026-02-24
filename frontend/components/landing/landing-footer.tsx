import Link from "next/link";
import { Wallet } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/20 bg-white/50 px-6 py-12 backdrop-blur dark:border-white/10 dark:bg-black/35 md:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Top section */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Brand */}
          <div className="space-y-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)] text-white">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold">SplitRent</p>
                <p className="text-xs text-muted-foreground">Stellar Payment Splitter</p>
              </div>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              Making rent payments transparent, verifiable, and on-chain with Stellar.
            </p>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-6 md:justify-end md:gap-12">
            <div className="space-y-3">
              <p className="text-sm font-semibold">Product</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#workflow" className="hover:text-foreground transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold">Resources</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://developers.stellar.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    Stellar Docs
                  </a>
                </li>
                <li>
                  <a
                    href="https://stellar.expert"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    Explorer
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10" />

        {/* Bottom section */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SplitRent. Built on Stellar Testnet.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">
              Dashboard
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              License
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
