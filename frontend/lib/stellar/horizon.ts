import { HORIZON_TESTNET_URL } from "@/lib/stellar/network";

interface HorizonBalance {
  asset_type: string;
  balance: string;
}

interface HorizonAccountResponse {
  balances: HorizonBalance[];
}

export const fetchTestnetXlmBalance = async (address: string) => {
  const response = await fetch(`${HORIZON_TESTNET_URL}/accounts/${address}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to fetch testnet balance from Horizon.");
  }

  const data = (await response.json()) as HorizonAccountResponse;
  const nativeBalance = data.balances.find((item) => item.asset_type === "native");

  return nativeBalance ? Number(nativeBalance.balance) : 0;
};
