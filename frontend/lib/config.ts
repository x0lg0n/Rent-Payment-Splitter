/**
 * Centralized configuration constants for SplitRent.
 *
 * Values are read from environment variables where available,
 * falling back to sensible defaults for Stellar testnet.
 */

export const STELLAR_CONFIG = {
  /** Horizon API endpoint */
  horizonUrl:
    process.env.NEXT_PUBLIC_HORIZON_URL ??
    "https://horizon-testnet.stellar.org",

  /** Stellar testnet passphrase */
  testnetPassphrase: "Test SDF Network ; September 2015",

  /** Stellar mainnet passphrase */
  mainnetPassphrase: "Public Global Stellar Network ; September 2015",
} as const;

export const EXPLORER_CONFIG = {
  /** Base URL for viewing transactions on the explorer */
  txBaseUrl:
    process.env.NEXT_PUBLIC_EXPLORER_BASE_URL ??
    "https://stellar.expert/explorer/testnet/tx",

  /** Friendbot faucet URL */
  friendbotUrl:
    process.env.NEXT_PUBLIC_FRIENDBOT_URL ??
    "https://laboratory.stellar.org/#account-creator?network=test",
} as const;

export const APP_CONFIG = {
  /** How often to auto-refresh the balance (ms) */
  balanceRefreshInterval: 30_000,

  /** How long toasts stay visible before auto-dismiss (ms) */
  toastDuration: 5_000,

  /** localStorage key prefix */
  storagePrefix: "splitrent",
} as const;
