import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Instant Verification",
    description:
      "Every transaction creates an on-chain record with a hash you can verify independently on the Stellar testnet explorer.",
    image: "/landing/feature-verification.svg",
    alt: "Shield verification visual",
  },
  {
    title: "Fast & Transparent",
    description:
      "Send XLM payments in seconds with real-time balance updates and transaction status visibility for all participants.",
    image: "/landing/feature-speed.svg",
    alt: "Fast transfer flow visual",
  },
  {
    title: "Decentralized Trust",
    description:
      "Powered by Stellar's blockchain network — no intermediaries, no hidden fees, just peer-to-peer transactions.",
    image: "/landing/feature-network.svg",
    alt: "Decentralized network node visual",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="rounded-[26px] border border-slate-200 bg-white/70 p-6 dark:border-slate-700 dark:bg-slate-900/55 md:p-8">
      <div className="mb-16 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-1000" style={{ animationFillMode: "both" }}>
        <h2 className="text-3xl font-bold tracking-tighter text-slate-950 dark:text-white md:text-4xl animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          Why Choose SplitRent?
        </h2>
        <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          Built on Stellar with blockchain clarity, transparency, and zero intermediaries.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature, index) => {
          return (
            <div
              key={feature.title}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${0.1 + index * 0.1}s`, animationFillMode: "both" }}
            >
              <Card
                className="group relative overflow-hidden border-slate-200 bg-white/90 backdrop-blur transition-all hover:shadow-lg hover:shadow-(--brand)/10 h-full dark:border-slate-700 dark:bg-slate-900/65"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-linear-0-to-br from-(--brand)/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="relative space-y-4 pb-6">
                  <div className="overflow-hidden rounded-2xl border border-[#d7e4ff] bg-white/70">
                    <Image
                      src={feature.image}
                      alt={feature.alt}
                      width={640}
                      height={420}
                      className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="text-xl group-hover:text-(--brand) transition-colors">{feature.title}</CardTitle>
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
