import { describe, it, expect } from "vitest";
import { isTestnetNetwork, isMainnetNetwork } from "@/lib/stellar/network";

/* ------------------------------------------------------------------ */
/*  isTestnetNetwork                                                   */
/* ------------------------------------------------------------------ */
describe("isTestnetNetwork", () => {
  it("returns true for common testnet identifiers", () => {
    expect(isTestnetNetwork("TESTNET")).toBe(true);
    expect(isTestnetNetwork("testnet")).toBe(true);
    expect(isTestnetNetwork("Testnet")).toBe(true);
    expect(isTestnetNetwork("Stellar Testnet")).toBe(true);
    expect(isTestnetNetwork("test")).toBe(true);
  });

  it("returns true for the testnet passphrase", () => {
    expect(
      isTestnetNetwork("Test SDF Network ; September 2015"),
    ).toBe(true);
  });

  it("returns false for mainnet identifiers", () => {
    expect(isTestnetNetwork("MAINNET")).toBe(false);
    expect(isTestnetNetwork("public")).toBe(false);
  });

  it("returns false for null / undefined / empty string", () => {
    expect(isTestnetNetwork(null)).toBe(false);
    expect(isTestnetNetwork(undefined)).toBe(false);
    expect(isTestnetNetwork("")).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  isMainnetNetwork                                                   */
/* ------------------------------------------------------------------ */
describe("isMainnetNetwork", () => {
  it("returns true for common mainnet identifiers", () => {
    expect(isMainnetNetwork("MAINNET")).toBe(true);
    expect(isMainnetNetwork("mainnet")).toBe(true);
    expect(isMainnetNetwork("Mainnet")).toBe(true);
    expect(isMainnetNetwork("public")).toBe(true);
    expect(isMainnetNetwork("Public")).toBe(true);
  });

  it("returns true for the mainnet passphrase", () => {
    expect(
      isMainnetNetwork("Public Global Stellar Network ; September 2015"),
    ).toBe(true);
  });

  it("returns false for testnet identifiers", () => {
    expect(isMainnetNetwork("TESTNET")).toBe(false);
    expect(isMainnetNetwork("test")).toBe(false);
  });

  it("returns false for null / undefined / empty string", () => {
    expect(isMainnetNetwork(null)).toBe(false);
    expect(isMainnetNetwork(undefined)).toBe(false);
    expect(isMainnetNetwork("")).toBe(false);
  });
});
