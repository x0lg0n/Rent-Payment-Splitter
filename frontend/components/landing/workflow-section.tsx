import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  "Connect Freighter wallet on testnet.",
  "Review balance and update it with one click.",
  "Send XLM payment and verify transaction hash.",
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="mx-auto w-full max-w-6xl px-6 pb-16 md:px-10">
      <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">How It Works</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step} className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <Badge className="w-fit bg-[var(--brand-soft)] text-[var(--brand)] dark:bg-white/10 dark:text-white">
                Step {index + 1}
              </Badge>
              <CardTitle className="pt-2 text-lg">{step}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
