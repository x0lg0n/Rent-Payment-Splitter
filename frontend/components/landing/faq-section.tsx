import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    q: "Is this on testnet or mainnet?",
    a: "Current implementation is testnet-only to complete Level 1 safely.",
  },
  {
    q: "Can I verify each transaction?",
    a: "Yes, every successful payment includes a testnet explorer link.",
  },
  {
    q: "Do I get transaction history?",
    a: "Yes, dashboard keeps a local transaction history with verification links.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto w-full max-w-6xl px-6 pb-16 md:px-10">
      <h2 className="mb-6 text-2xl font-bold tracking-tight md:text-3xl">FAQ</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {faqs.map((item) => (
          <Card key={item.q} className="border-white/70 bg-white/80 dark:border-white/10 dark:bg-white/5">
            <CardHeader>
              <CardTitle className="text-lg">{item.q}</CardTitle>
              <CardDescription>{item.a}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
