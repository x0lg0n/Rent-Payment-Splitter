import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockchainIllustration } from "@/components/landing/illustrations";

const steps = [
  {
    step: 1,
    title: "Connect Freighter",
    description: "Securely authenticate with your Freighter wallet extension on testnet.",
  },
  {
    step: 2,
    title: "Review Balance",
    description: "See your live XLM balance with automatic 30-second refresh intervals.",
  },
  {
    step: 3,
    title: "Send & Verify",
    description: "Send a payment and instantly see the transaction hash with explorer verification.",
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="relative mx-auto w-full max-w-7xl px-6 py-24 md:px-10">
      {/* Decorative blockchain illustration as background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 -z-10 opacity-20 animate-pulse">
        <BlockchainIllustration className="h-96 w-96 text-[var(--brand)]" />
      </div>

      <div className="mb-16 animate-in fade-in slide-in-from-left-4 duration-1000" style={{ animationFillMode: "both" }}>
        <h2 className="text-4xl font-bold tracking-tighter md:text-5xl animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          How It Works
        </h2>
        <p className="mt-4 max-w-lg text-lg text-muted-foreground animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          A simple three-step flow to connect, check balance, and send verified payments.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((item, index) => (
          <div
            key={item.step}
            className="animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: "both" }}
          >
            <Card
              className="relative border-white/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5 overflow-hidden group hover:shadow-lg hover:shadow-[var(--brand)]/10 transition-all h-full"
            >
              {/* Gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-[var(--brand-soft)] text-[var(--brand)] dark:bg-white/10 dark:text-cyan-300 text-lg px-3 py-1 group-hover:scale-105 transition-transform">
                    {item.step}
                  </Badge>
                  <div className="text-sm font-medium text-muted-foreground">
                    {item.step < 3 && (
                      <span className="hidden md:inline text-[var(--brand)] opacity-50 group-hover:opacity-100 transition-opacity">→</span>
                    )}
                  </div>
                </div>

                <div>
                  <CardTitle className="text-xl mb-2 group-hover:text-[var(--brand)] transition-colors">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </CardHeader>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
