import { Horizon } from "@stellar/stellar-sdk";
import { HORIZON_TESTNET_URL } from "@/lib/stellar/network";

const server = new Horizon.Server(HORIZON_TESTNET_URL);

export const fetchTestnetXlmBalance = async (address: string) => {
  const account = await server.loadAccount(address);
  const nativeBalance = account.balances.find((balance) => balance.asset_type === "native");
  return nativeBalance ? Number(nativeBalance.balance) : 0;
};
