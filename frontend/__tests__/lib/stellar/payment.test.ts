import { describe, it, expect } from "vitest";
import { isValidXlmAmount, isValidStellarAddress } from "@/lib/stellar/payment";

/**
 * Pure-function tests for XLM amount & address validation.
 *
 * `isValidStellarAddress` delegates entirely to StrKey.isValidEd25519PublicKey
 * from the Stellar SDK, so we just smoke-test it here rather than re-testing
 * the SDK's own logic.
 */

/* ------------------------------------------------------------------ */
/*  isValidStellarAddress (smoke-test)                                */
/* ------------------------------------------------------------------ */
describe("isValidStellarAddress", () => {
  it("delegates to StrKey.isValidEd25519PublicKey (smoke test)", () => {
    // Smoke test: verify the function properly validates Stellar public keys
    // The actual validation logic is in the Stellar SDK's StrKey module
    // This test just ensures our wrapper is wired up correctly

    // Should reject clearly invalid inputs
    expect(isValidStellarAddress("")).toBe(false);
    expect(isValidStellarAddress("invalid")).toBe(false);
    expect(isValidStellarAddress("123456")).toBe(false);
  });

  it("rejects secret keys (starting with S)", () => {
    // Secret keys start with 'S' and should be rejected
    expect(
      isValidStellarAddress("SBYWQVWQK72DWPZHDSVKZVMQWTRB5GFVGXDUGAAFUBZN75B2DNRQGG2")
    ).toBe(false);
  });

  it("rejects addresses with invalid length", () => {
    // Valid addresses are exactly 56 characters
    expect(isValidStellarAddress("G")).toBe(false);
    expect(isValidStellarAddress("GB".padEnd(60, "A"))).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/*  isValidXlmAmount                                                   */
/* ------------------------------------------------------------------ */
describe("isValidXlmAmount", () => {
  it("accepts simple integer amounts", () => {
    expect(isValidXlmAmount("1")).toBe(true);
    expect(isValidXlmAmount("100")).toBe(true);
    expect(isValidXlmAmount("999999")).toBe(true);
  });

  it("accepts decimal amounts up to 7 decimal places", () => {
    expect(isValidXlmAmount("0.1")).toBe(true);
    expect(isValidXlmAmount("10.25")).toBe(true);
    expect(isValidXlmAmount("0.0000001")).toBe(true); // 7 places — minimum stroop
  });

  it("rejects amounts with more than 7 decimal places", () => {
    expect(isValidXlmAmount("0.00000001")).toBe(false); // 8 places
    expect(isValidXlmAmount("1.12345678")).toBe(false);
  });

  it("rejects zero", () => {
    expect(isValidXlmAmount("0")).toBe(false);
    expect(isValidXlmAmount("0.0")).toBe(false);
    expect(isValidXlmAmount("0.0000000")).toBe(false);
  });

  it("rejects negative values", () => {
    expect(isValidXlmAmount("-1")).toBe(false);
    expect(isValidXlmAmount("-0.5")).toBe(false);
  });

  it("rejects non-numeric / garbage strings", () => {
    expect(isValidXlmAmount("")).toBe(false);
    expect(isValidXlmAmount("abc")).toBe(false);
    expect(isValidXlmAmount("12abc")).toBe(false);
    expect(isValidXlmAmount(" 10 ")).toBe(false);
    expect(isValidXlmAmount("1,000")).toBe(false);
  });

  it("rejects leading zeros (except bare 0)", () => {
    expect(isValidXlmAmount("007")).toBe(false);
    expect(isValidXlmAmount("01.5")).toBe(false);
  });
});
