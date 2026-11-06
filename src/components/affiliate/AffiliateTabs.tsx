import { useQuery } from "@tanstack/react-query";
import { FolderOpen, Link2, Lock, Trophy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { StatusPill, brl } from "@/components/PartnerShell";
import { REFERRAL_PLANS } from "@/lib/referrals";
import { ACHIEVEMENTS, affiliateLevel, type AffiliateStats } from "@/lib/affiliate-achievements";

function useAffiliateStats(userId: string) {
  return useQuery({
    queryKey: ["aff-stats", userId],
    queryFn: async (): Promise<AffiliateStats & { pendingCents: number; paidCents: number }> => {
      const [refs, comms, ecos] = await Promise.all([
        supabase.from("referral_attributions").select("id,created_at").eq("affiliate_id", userId),
        supabase.from("referral_commissions").select("plan_name,commission_cents,status,created_at").eq("affiliate_id", userId),
        supabase.from("eco_ledger").select("amount").eq("user_id", userId),
      ]);
      const valid = (comms.data ?? []).filter((c) => c.status !== "cancelled");
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      return {
        referred: refs.data?.length ?? 0,
        paidSales: valid.length,
        monthSales: valid.filter((c) => new Date(c.created_at) >= monthStart).length,
        lifestyleSales: valid.filter((c) => /lifestyle/i.test(c.plan_name)).length,
        ecos: (ecos.data ?? []).reduce((a, e) => a + e.amount, 0),
        pendingCents: valid.filter((c) => c.status === "pending").reduce((a, c) => a + c.commission_cents, 0),
        paidCents: valid.filter((c) => c.status === "paid").reduce((a, c) => a + c.commission_cents, 0),
      };
    },
  });
}

const card = "rounded-lg border border-border bg-card p-6";
const kicker = "text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground";

export function AffiliateHome({ userId, email, name, approved, onGo }: { userId: string; email: string; name: string; approved: boolean; onGo: (tab: string) => void }) {
  const stats = useAffiliateStats(userId);
  const s = stats.data;
  const level = affiliateLevel(s?.paidSales ?? 0);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="space-y-6">
      <div className={card}>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary font-display text-xl font-semibold text-primary">{initials}</span>
          <div className="flex-1"><p className="font-display text-2xl font-semibold">{name}</p><p className="text-sm text-muted-foreground">{email}</p></div>
          <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary">Nível {level.name}</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button variant="paper" onClick={() => onGo("links")} disabled={!approved}><Link2 /> Ver meus links de indicação</Button>
          <Button variant="editorial" onClick={() => onGo("material")}><FolderOpen /> Material de divulgação</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[["Pessoas indicadas", String(s?.referred ?? 0)], ["Planos vendidos", String(s?.paidSales ?? 0)], ["A receber", brl(s?.pendingCents ?? 0)], ["Ecos acumulados", `${s?.ecos ?? 0}`]].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-card p-5"><p className={kicker}>{k}</p><p className="mt-2 font-display text-3xl font-semibold">{v}</p></div>
        ))}
      </div>

      <div className={card}>
        <p className={kicker}>Seu nível</p>
        <p className="mt-1 font-display text-xl font-semibold">{level.name}</p>
        <p className="text-sm text-muted-foreground">{level.next ? `Faltam ${level.next - (s?.paidSales ?? 0)} plano(s) vendido(s) para o próximo nível.` : "Você está no nível mais alto. Parabéns!"}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-primary" style={{ width: `${level.progress}%` }} /></div>
      </div>

      <div className={card}>
        <h3 className="font-display text-xl font-semibold">Mais indicados</h3>
        <p className="text-sm text-muted-foreground">O que você ganha por cada plano indicado.</p>
        <ol className="mt-4 divide-y divide-border">
          {REFERRAL_PLANS.map((p, i) => (
            <li key={p.slug} className="flex items-center gap-4 py-3"><span className="font-display text-2xl text-primary">{i + 1}</span><span className="flex-1 font-semibold">{p.name}</span><span className="text-sm font-semibold text-primary">{p.reward}</span></li>
          ))}
        </ol>
      </div>

      <div className={`${card} text-center`}>
        <Lock className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="mt-2 font-display text-lg font-semibold">Ranking de afiliados em breve</p>
        <p className="text-sm text-muted-foreground">Vamos mostrar quem mais indicou na semana e no mês.</p>
      </div>
    </div>
  );
}

const MATERIALS = [
  { title: "Guia do afiliado ARQECO", body: "A ARQECO nasceu para tornar o projeto de interiores sustentável acessível: 100% online, por ambiente, com arquiteta de verdade, visual 3D, lista de compras e harmonização. Você indica, o cliente contrata pelo seu link, paga e depois agenda a reunião. Plano pago rende 15% do valor fechado (Viver Bem: R$ 136,11; Viver Lifestyle: R$ 222,00), creditado só quando o cliente conclui a compra e pago sempre no dia 15 do mês seguinte à compra. Indicação do Projeto Start (gratuito, não monetiza) rende 10 ecos." },
  { title: "Roteiro: Projeto Start (gratuito)", body: "Abra com uma pergunta: “Sua casa te faz bem?”. Mostre que o Dossiê Eco-Holístico é gratuito e revela como luz, ventilação, cores e materiais afetam o bem-estar. Feche com o link: é só criar a conta e responder." },
  { title: "Roteiro: Viver Bem", body: "O inimigo aqui é o improviso. Mostre o antes/depois de um ambiente e diga: sem obra, sem improviso, sem desperdício. O cliente recebe projeto 3D e lista de compras para executar com segurança." },
  { title: "Roteiro: Viver Lifestyle", body: "Para quem quer a casa completa com propósito. Fale de integração entre ambientes, materiais ecológicos e harmonização. O argumento é tranquilidade: tudo planejado antes de gastar." },
  { title: "Roteiro para corretores de imóveis", body: "Ofereça o projeto como presente de boas-vindas para quem acabou de comprar ou alugar. O novo morador evita erros na compra de móveis e você ganha comissão em cada plano contratado pelo seu link." },
];

export function MaterialTab() {
  return (
    <div className="space-y-4">
      <div className={card}>
        <p className={kicker}>Use como inspiração, não como cópia</p>
        <p className="mt-2 text-sm text-muted-foreground">O que mais converte é a sua voz: fale como você já fala com a sua audiência. Autenticidade vende mais que produção perfeita.</p>
      </div>
      {MATERIALS.map((m) => (
        <details key={m.title} className={`${card} group`}>
          <summary className="flex cursor-pointer items-center justify-between gap-4 font-display text-lg font-semibold">{m.title}<span className="text-xs font-semibold text-primary group-open:hidden">Abrir</span></summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
        </details>
      ))}
    </div>
  );
}

export function AchievementsTab({ userId }: { userId: string }) {
  const stats = useAffiliateStats(userId);
  const s = stats.data;
  const done = s ? ACHIEVEMENTS.filter((a) => a.test(s)) : [];
  const totalEcos = done.reduce((a, x) => a + x.ecos, 0);
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Bônus extras em ecos, somados às suas comissões. Nada é descontado da sua comissão.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Bônus de conquistas", `${totalEcos} ecos`], ["Planos vendidos no mês", String(s?.monthSales ?? 0)], ["Progresso", `${Math.round((done.length / ACHIEVEMENTS.length) * 100)}%`]].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-card p-5"><p className={kicker}>{k}</p><p className="mt-2 font-display text-3xl font-semibold">{v}</p></div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{done.length} de {ACHIEVEMENTS.length} conquistas desbloqueadas</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const ok = done.includes(a);
          return (
            <div key={a.id} className={`${card} ${ok ? "border-primary" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-display text-lg font-semibold">{a.title}</p><p className={kicker}>{a.scope}</p></div>
                {ok ? <Check className="h-5 w-5 text-primary" /> : <Trophy className="h-5 w-5 text-muted-foreground" />}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
              <div className="mt-3 flex items-center justify-between text-sm"><span className="font-semibold text-primary">+ {a.ecos} ecos</span><span className="text-xs text-muted-foreground">{ok ? "Desbloqueada" : "Bloqueada"}</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PaymentsHistory({ userId }: { userId: string }) {
  const comms = useQuery({ queryKey: ["ref-comms", userId], queryFn: async () => (await supabase.from("referral_commissions").select("*").eq("affiliate_id", userId).order("created_at", { ascending: false })).data ?? [] });
  const list = comms.data ?? [];
  return (
    <section className={card}>
      <h3 className="font-display text-xl font-semibold">Histórico de comissões</h3>
      <p className="text-sm text-muted-foreground">Comissões são pagas no dia 15 do mês seguinte ao pagamento confirmado do cliente.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className={kicker}><th className="py-2">Data</th><th>Plano</th><th>Venda</th><th>Comissão</th><th>Pagamento em</th><th>Status</th></tr></thead>
          <tbody className="divide-y divide-border">
            {list.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">Nenhuma comissão registrada ainda.</td></tr>}
            {list.map((c) => (
              <tr key={c.id}><td className="py-3">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td><td>{c.plan_name}</td><td>{brl(c.sale_cents)}</td><td className="font-semibold text-primary">{brl(c.commission_cents)}</td><td>{new Date(`${c.payout_date}T12:00:00`).toLocaleDateString("pt-BR")}</td><td><StatusPill status={c.status} /></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
