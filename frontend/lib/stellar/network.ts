import { STELLAR_CONFIG } from "@/lib/config";

export const STELLAR_TESTNET_PASSPHRASE = STELLAR_CONFIG.testnetPassphrase;
export const STELLAR_MAINNET_PASSPHRASE = STELLAR_CONFIG.mainnetPassphrase;
export const HORIZON_TESTNET_URL = STELLAR_CONFIG.horizonUrl;

export const isTestnetNetwork = (network: string | null | undefined) => {
  if (!network) return false;
  const normalized = network.toLowerCase();

  return (
    normalized.includes("testnet") ||
    normalized.includes("test") ||
    network === STELLAR_TESTNET_PASSPHRASE
  );
};

export const isMainnetNetwork = (network: string | null | undefined) => {
  if (!network) return false;
  const normalized = network.toLowerCase();

  return (
    normalized.includes("mainnet") ||
    normalized.includes("public") ||
    network === STELLAR_MAINNET_PASSPHRASE
  );
};
