import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/30 bg-white/80 px-6 py-8 backdrop-blur dark:border-white/10 dark:bg-black/35 md:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <div>
          <p className="font-semibold">SplitRent</p>
          <p className="text-sm text-muted-foreground">
            Cleaner monthly rent coordination on Stellar.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#workflow" className="hover:text-foreground">
            Workflow
          </a>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
