export type AffiliateStats = { referred: number; paidSales: number; monthSales: number; lifestyleSales: number; ecos: number };

export const ACHIEVEMENTS: { id: string; title: string; scope: string; description: string; ecos: number; test: (s: AffiliateStats) => boolean }[] = [
  { id: "first-referral", title: "Primeira semente", scope: "Marco único", description: "Sua primeira pessoa indicada criou a conta.", ecos: 10, test: (s) => s.referred >= 1 },
  { id: "ten-referrals", title: "Rede verde", scope: "Total", description: "10 pessoas indicadas.", ecos: 30, test: (s) => s.referred >= 10 },
  { id: "first-sale", title: "Primeiro projeto", scope: "Marco único", description: "Seu primeiro plano pago vendido.", ecos: 50, test: (s) => s.paidSales >= 1 },
  { id: "lifestyle", title: "Casa completa", scope: "Marco único", description: "Venda um plano Viver Lifestyle.", ecos: 80, test: (s) => s.lifestyleSales >= 1 },
  { id: "month-3", title: "Mês produtivo", scope: "No mês", description: "3 planos pagos no mês.", ecos: 100, test: (s) => s.monthSales >= 3 },
  { id: "month-10", title: "Mestre da indicação", scope: "No mês", description: "10 planos pagos no mês.", ecos: 300, test: (s) => s.monthSales >= 10 },
];

const LEVELS = [{ name: "Iniciante", min: 0 }, { name: "Prata", min: 3 }, { name: "Ouro", min: 10 }, { name: "Embaixador", min: 30 }];

export function affiliateLevel(sales: number) {
  let i = 0;
  LEVELS.forEach((l, idx) => { if (sales >= l.min) i = idx; });
  const cur = LEVELS[i]!;
  const next = LEVELS[i + 1]?.min ?? null;
  const progress = next === null ? 100 : Math.round(((sales - cur.min) / (next - cur.min)) * 100);
  return { name: cur.name, next, progress };
}
