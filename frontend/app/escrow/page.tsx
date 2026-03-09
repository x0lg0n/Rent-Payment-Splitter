import { redirect } from "next/navigation";

export default function LegacyEscrowsPage() {
  redirect("/dashboard/escrows");
}
