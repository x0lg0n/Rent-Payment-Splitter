import { redirect } from "next/navigation";

interface LegacyEscrowPageProps {
  params: Promise<{ id: string }>;
}

export default async function LegacyEscrowPage({ params }: LegacyEscrowPageProps) {
  const { id } = await params;
  redirect(`/dashboard/escrows/${id}`);
}
