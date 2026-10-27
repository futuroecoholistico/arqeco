// @ts-ignore bun test runner types are not installed
import { describe, expect, test } from "bun:test";
import { commissionCents, payoutDate, START_REFERRAL_ECOS, ECO_VALUE_CENTS } from "./referrals";

describe("referral rules", () => {
  test("paid plans pay 10% of the closed total", () => {
    expect(commissionCents(90740)).toBe(9074);
    expect(commissionCents(148000)).toBe(14800);
  });
  test("start referral earns 20 ecos", () => {
    expect(START_REFERRAL_ECOS).toBe(20);
  });
  test("100 ecos equal R$ 100,00 of discount", () => {
    expect(ECO_VALUE_CENTS * 100).toBe(10000);
  });
  test("payout is the 15th of the following month", () => {
    expect(payoutDate(new Date("2026-10-27T12:00:00Z"))).toBe("2026-11-15");
    expect(payoutDate(new Date("2026-12-02T12:00:00Z"))).toBe("2027-01-15");
  });
});
