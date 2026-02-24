import { ShieldCheck, Wallet, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Wallet,
    title: "Wallet-First Onboarding",
    description: "Connect Freighter and start from a real account context.",
  },
  {
    icon: ShieldCheck,
    title: "On-Chain Verification",
    description: "Every payment gives a hash with a testnet explorer link.",
  },
  {
    icon: Zap,
    title: "Fast Workflow",
    description: "Balance, pay, and verify in one dashboard flow.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-6 pb-16 md:px-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Core Features</h2>
        <Badge className="border-0 bg-[var(--brand-soft)] text-[var(--brand)] dark:bg-white/10 dark:text-white">
          Built with shadcn/ui
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {features.map((item, idx) => (
          <Card
            key={item.title}
            className="animate-enter border-white/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5"
            style={{ animationDelay: `${idx * 110}ms` }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <item.icon className="h-5 w-5 text-[var(--brand)]" />
                {item.title}
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
