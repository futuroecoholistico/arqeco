// Business rules for the plan referral program (see mem://features/afiliados).
export const REFERRAL_PLANS = [
  { slug: "start", name: "Projeto Start", reward: "10 ecos" },
  { slug: "viver-bem", name: "Viver Bem", reward: "10% do valor fechado" },
  { slug: "viver-lifestyle", name: "Viver Lifestyle", reward: "10% do valor fechado" },
] as const;
export type ReferralPlanSlug = (typeof REFERRAL_PLANS)[number]["slug"];

export const START_REFERRAL_ECOS = 20;
export const PAID_PLAN_COMMISSION_RATE = 10; // percent
// Eco redemption: 1 eco = R$ 1,00 off interior project plans (100 ecos = R$ 100,00).
export const ECO_VALUE_CENTS = 100;

export function commissionCents(totalCents: number): number {
  return Math.round((totalCents * PAID_PLAN_COMMISSION_RATE) / 100);
}

/** Payout happens on day 15 of the month after the payment. Returns YYYY-MM-DD. */
export function payoutDate(paidAt: Date): string {
  const y = paidAt.getUTCFullYear();
  const m = paidAt.getUTCMonth() + 1; // next month (0-based + 1)
  const d = new Date(Date.UTC(y, m, 15));
  return d.toISOString().slice(0, 10);
}

export const REF_STORAGE_KEY = "arqeco-ref";
