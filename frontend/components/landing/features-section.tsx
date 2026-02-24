import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  VerificationIllustration,
  FastWorkflowIllustration,
  NetworkIllustration,
} from "@/components/landing/illustrations";

const features = [
  {
    title: "Instant Verification",
    description:
      "Every transaction creates an on-chain record with a hash you can verify independently on the Stellar testnet explorer.",
    illustration: VerificationIllustration,
  },
  {
    title: "Fast & Transparent",
    description:
      "Send XLM payments in seconds with real-time balance updates and transaction status visibility for all participants.",
    illustration: FastWorkflowIllustration,
  },
  {
    title: "Decentralized Trust",
    description:
      "Powered by Stellar's blockchain network — no intermediaries, no hidden fees, just peer-to-peer transactions.",
    illustration: NetworkIllustration,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative mx-auto w-full max-w-7xl px-6 py-24 md:px-10">
      <div className="mb-16 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationFillMode: "both" }}>
        <h2 className="text-4xl font-bold tracking-tighter md:text-5xl animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          Why Choose SplitRent?
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          Built on Stellar with blockchain clarity, transparency, and zero intermediaries.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature, index) => {
          const Illustration = feature.illustration;
          return (
            <div
              key={feature.title}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: "both" }}
            >
              <Card
                className="group relative border-white/70 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-white/5 overflow-hidden transition-all hover:shadow-lg hover:shadow-[var(--brand)]/10 h-full"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="relative space-y-4 pb-6">
                  {/* Illustration */}
                  <div className="h-32 w-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Illustration className="h-full w-full text-[var(--brand)] opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="text-xl group-hover:text-[var(--brand)] transition-colors">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
          );
        })}
      </div>
    </section>
  );
}
