"use client";

import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { Clock3, CopyCheck, ShieldCheck, Users2 } from "lucide-react";
import { CreateEscrowForm } from "@/components/escrow/create-escrow-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { useDashboardContext } from "@/components/dashboard/dashboard-context";
import { Badge } from "@/components/ui/badge";
import { useEscrowStore } from "@/lib/store";

function GuideItem({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-white p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardEscrowCreatePage() {
  const router = useRouter();
  const { wallet, pushToast } = useDashboardContext();
  const { addEscrow } = useEscrowStore();

  const handleCreateEscrow = async (data: {
    landlord: string;
    participants: string[];
    shares: bigint[];
    deadline: bigint;
  }) => {
    if (!wallet.walletAddress) {
      pushToast("Wallet Required", "Please connect your wallet first", "error");
      return;
    }

    const escrowId = BigInt(Date.now());
    const totalRent = data.shares.reduce((sum, share) => sum + share, BigInt(0));

    const escrowRecord = {
      id: escrowId.toString(),
      creator: wallet.walletAddress,
      landlord: data.landlord,
      participants: data.participants.map((address, index) => ({
        address,
        share_amount: data.shares[index].toString(),
        deposited: false,
      })),
      total_rent: totalRent.toString(),
      deposited_amount: "0",
      deadline: data.deadline.toString(),
      status: "Active",
      created_at: BigInt(Math.floor(Date.now() / 1000)).toString(),
    };

    addEscrow(escrowRecord);
    pushToast("Escrow Created", `Escrow #${escrowId.toString().slice(-6)} created successfully`, "success");
    router.push("/dashboard/escrows");
  };

  return (
    <>
      <DashboardPageHeader
        title="Create escrow"
        subtitle="Set up a rent splitting escrow with your roommates inside the dashboard workspace."
        badgeLabel="Escrow creation"
        showSearch={false}
      />

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <CreateEscrowForm
          walletAddress={wallet.walletAddress}
          onSubmit={handleCreateEscrow}
          onCancel={() => router.push("/dashboard/escrows")}
        />

        <aside className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Escrow checklist</h3>
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px]">
                Recommended
              </Badge>
            </div>

            <div className="mt-4 space-y-2.5">
              <GuideItem
                icon={ShieldCheck}
                title="Use verified addresses"
                description="Double-check every wallet before you create the escrow. Mistyped addresses cannot be recovered."
              />
              <GuideItem
                icon={Users2}
                title="Match shares to your rent split"
                description="Set each roommate amount in XLM exactly as agreed to avoid partial or incorrect funding."
              />
              <GuideItem
                icon={Clock3}
                title="Choose a realistic deadline"
                description="Give enough time for all participants to fund, especially if this is their first transfer."
              />
              <GuideItem
                icon={CopyCheck}
                title="Save escrow ID after creation"
                description="You can track status in the Escrows tab and open detail view for release/refund actions."
              />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">What you can add next</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Equal split shortcut to auto-fill roommate shares.</li>
              <li>Saved roommate templates for faster recurring setup.</li>
              <li>Live USD estimate with current XLM reference price.</li>
            </ul>
          </article>
        </aside>
      </div>
    </>
  );
}
