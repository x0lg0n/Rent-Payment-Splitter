import { Networks, StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import {
  ALBEDO_ID,
  AlbedoModule,
} from "@creit.tech/stellar-wallets-kit/modules/albedo";
import {
  FREIGHTER_ID,
  FreighterModule,
} from "@creit.tech/stellar-wallets-kit/modules/freighter";
import { RABET_ID, RabetModule } from "@creit.tech/stellar-wallets-kit/modules/rabet";
import { XBULL_ID, xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull";

let initialized = false;

const ensureInitialized = () => {
  if (initialized) return;

  StellarWalletsKit.init({
    network: Networks.TESTNET,
    modules: [
      new FreighterModule(),
      new xBullModule(),
      new AlbedoModule(),
      new RabetModule(),
    ],
  });

  initialized = true;
};

ensureInitialized();

export const WalletKit = StellarWalletsKit;
export { Networks };

export const SUPPORTED_WALLETS = [
  { id: FREIGHTER_ID, name: "Freighter", icon: "🚀" },
  { id: XBULL_ID, name: "xBull", icon: "🐂" },
  { id: ALBEDO_ID, name: "Albedo", icon: "🌌" },
  { id: RABET_ID, name: "Rabet", icon: "🧩" },
] as const;

export const signWithSelectedWallet = async (
  transactionXdr: string,
  networkPassphrase: string,
  address: string,
) => {
  const result = await WalletKit.signTransaction(transactionXdr, {
    networkPassphrase,
    address,
  });

  if (!result.signedTxXdr) {
    throw new Error("Wallet did not return a signed transaction.");
  }

  return result.signedTxXdr;
};
