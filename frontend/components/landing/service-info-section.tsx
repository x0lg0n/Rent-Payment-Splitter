import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock3, LifeBuoy, ShieldCheck, Users, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Transparent by default",
    text: "Every completed payment returns a transaction hash so users can independently verify activity on Stellar.",
  },
  {
    icon: FileCheck2,
    title: "Escrow-aware flows",
    text: "Create escrow entries, track status, and keep payment history within one dashboard shell.",
  },
  {
    icon: Users,
    title: "Built for roommates",
    text: "Quick transfer, request, and split actions reduce friction during recurring rent cycles.",
  },
];

const infoCards = [
  {
    icon: Clock3,
    title: "Live sync",
    text: "Balance and recent activity refresh automatically so your dashboard stays current.",
  },
  {
    icon: LifeBuoy,
    title: "Error clarity",
    text: "Readable validation and transfer feedback helps users fix issues quickly.",
  },
];

export function ServiceInfoSection() {
  return (
    <section id="service-info" className="rounded-[26px] border border-slate-200 bg-white/70 p-6 dark:border-slate-700 dark:bg-slate-900/55 md:p-8">
      <div className="mb-8 flex flex-col gap-3 md:mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
          Product overview
        </p>
        <h2 className="text-3xl font-bold tracking-tighter text-slate-950 dark:text-white md:text-4xl">
          More clarity for every rent payment
        </h2>
        <p className="max-w-3xl text-base text-slate-600 dark:text-slate-300">
          SplitRent combines wallet connection, escrow workflows, payment transfer, and analytics in one place so users can pay faster and verify every step.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-start">
        <div className="space-y-4">
          {pillars.map((item, index) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white/85 p-4 dark:border-slate-700 dark:bg-slate-900/70"
              style={{ animationDelay: `${0.1 + index * 0.08}s` }}
            >
              <div className="mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                <item.icon className="h-4 w-4 text-(--brand)" />
                <h3 className="text-base font-semibold">{item.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.text}</p>
            </article>
          ))}

          <div className="flex flex-wrap gap-3 pt-1">
            <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <a href="#faq">Read FAQs</a>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-[#d9e4ff] bg-[#eef3ff] p-2">
            <Image
              src="/landing/trust-snapshot.svg"
              alt="Snapshot of SplitRent trust and safety features"
              width={880}
              height={420}
              className="h-auto w-full rounded-xl"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {infoCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center gap-2">
                  <card.icon className="h-4 w-4 text-(--brand)" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{card.title}</p>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl border border-[#d6e3ff] bg-[#eef3ff]/70 p-4 md:grid-cols-3 dark:border-slate-700 dark:bg-slate-900/60">
        <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Wallet-based identity and local profile context.
        </p>
        <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Explorer-linked transfers for independent verification.
        </p>
        <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Unified shell across dashboard, escrow, transfer, and analytics.
        </p>
      </div>
    </section>
  );
}
