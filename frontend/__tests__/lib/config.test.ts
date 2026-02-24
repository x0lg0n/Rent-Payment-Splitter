import { describe, it, expect } from "vitest";
import {
  STELLAR_CONFIG,
  EXPLORER_CONFIG,
  APP_CONFIG,
} from "@/lib/config";

/* ------------------------------------------------------------------ */
/*  Config shape / sanity checks                                       */
/* ------------------------------------------------------------------ */
describe("STELLAR_CONFIG", () => {
  it("has a valid horizonUrl", () => {
    expect(STELLAR_CONFIG.horizonUrl).toMatch(/^https?:\/\//);
  });

  it("has testnet and mainnet passphrases", () => {
    expect(STELLAR_CONFIG.testnetPassphrase).toContain("Test SDF Network");
    expect(STELLAR_CONFIG.mainnetPassphrase).toContain(
      "Public Global Stellar Network",
    );
  });
});

describe("EXPLORER_CONFIG", () => {
  it("has a transaction base URL", () => {
    expect(EXPLORER_CONFIG.txBaseUrl).toMatch(/^https?:\/\//);
  });

  it("has a friendbot URL", () => {
    expect(EXPLORER_CONFIG.friendbotUrl).toMatch(/^https?:\/\//);
  });
});

describe("APP_CONFIG", () => {
  it("balanceRefreshInterval is a positive number", () => {
    expect(APP_CONFIG.balanceRefreshInterval).toBeGreaterThan(0);
  });

  it("toastDuration is a positive number", () => {
    expect(APP_CONFIG.toastDuration).toBeGreaterThan(0);
  });

  it("storagePrefix is a non-empty string", () => {
    expect(APP_CONFIG.storagePrefix).toBeTruthy();
    expect(typeof APP_CONFIG.storagePrefix).toBe("string");
  });
});
