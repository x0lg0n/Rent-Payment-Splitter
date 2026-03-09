import { redirect } from "next/navigation";

export default function LegacyCreateEscrowPage() {
  redirect("/dashboard/escrow-create");
}
