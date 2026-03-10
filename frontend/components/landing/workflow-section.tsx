import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

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
    <section id="workflow" className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-white/70 p-6 dark:border-slate-700 dark:bg-slate-900/55 md:p-8">
      <div className="mb-8 grid gap-6 md:mb-12 md:grid-cols-[0.95fr_1.05fr] md:items-center">
        <div className="animate-in fade-in slide-in-from-left-4 duration-1000" style={{ animationFillMode: "both" }}>
          <h2 className="text-3xl font-bold tracking-tighter text-slate-950 dark:text-white md:text-4xl animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
            How It Works
          </h2>
          <p className="mt-3 max-w-lg text-base text-slate-600 dark:text-slate-300 animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
            A clear 3-step path from wallet connection to successful and verifiable transfers.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#dbe6ff] bg-[#eef3ff] p-2 animate-in fade-in slide-in-from-right-4 duration-1000" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          <Image
            src="/landing/workflow-map.svg"
            alt="Three-step SplitRent workflow map"
            width={980}
            height={420}
            className="h-auto w-full rounded-xl"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((item, index) => (
          <div
            key={item.step}
            className="animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: "both" }}
          >
            <Card
              className="relative overflow-hidden border-slate-200 bg-white/90 backdrop-blur group hover:shadow-lg hover:shadow-(--brand)/10 transition-all h-full dark:border-slate-700 dark:bg-slate-900/65"
            >
              {/* Gradient on hover */}
              <div className="absolute inset-0 bg-linear-0-to-br from-(--brand)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-(--brand-soft) text-(--brand) dark:bg-white/10 dark:text-cyan-300 text-lg px-3 py-1 group-hover:scale-105 transition-transform">
                    {item.step}
                  </Badge>
                  <div className="text-sm font-medium text-muted-foreground">
                    {item.step < 3 && (
                      <span className="hidden md:inline text-(--brand) opacity-50 group-hover:opacity-100 transition-opacity">→</span>
                    )}
                  </div>
                </div>

                <div>
                  <CardTitle className="text-xl mb-2 group-hover:text-(--brand) transition-colors">{item.title}</CardTitle>
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
