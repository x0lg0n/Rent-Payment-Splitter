export const STELLAR_TESTNET_PASSPHRASE =
  "Test SDF Network ; September 2015";
export const STELLAR_MAINNET_PASSPHRASE =
  "Public Global Stellar Network ; September 2015";

export const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";

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
