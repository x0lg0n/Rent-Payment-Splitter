"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is this on testnet or mainnet?",
    a: "Level 1 operates exclusively on Stellar Testnet for safety. You can use free XLM from the Stellar Friendbot faucet — no real money involved.",
  },
  {
    q: "How do I verify a transaction?",
    a: "Every successful payment includes a transaction hash linked to stellar.expert explorer. Click the link to view your transaction on-chain and confirm immutably.",
  },
  {
    q: "Is my transaction history saved?",
    a: "Yes. SplitRent saves your transaction history locally in your browser, tied to your wallet address. You can view historical payments with one click.",
  },
  {
    q: "Which wallets are supported right now?",
    a: "Level 1 officially supports Freighter. Future levels will add support for xBull, Albedo, and other Stellar-compatible wallets.",
  },
  {
    q: "What happens if a payment fails?",
    a: "SplitRent translates Horizon error codes into human-readable messages. Common failures include insufficient balance or invalid recipient addresses — you can retry immediately.",
  },
  {
    q: "Is there a fee?",
    a: "SplitRent doesn't charge a fee. You only pay Stellar's base transaction fee (~0.00001 XLM), which is forwarded to the Stellar network.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto w-full max-w-7xl px-6 py-24 md:px-10">
      <div className="mb-16 flex flex-col items-center text-center">
        <h2 className="text-4xl font-bold tracking-tighter md:text-5xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Everything you need to know about using SplitRent.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full max-w-3xl mx-auto"
      >
        {faqs.map((item, idx) => (
          <AccordionItem
            key={idx}
            value={`faq-${idx}`}
            className="border-b border-white/20 dark:border-white/10"
          >
            <AccordionTrigger className="py-5 text-left text-base font-semibold hover:text-[var(--brand)] transition-colors">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
