import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Copy, Trash2, LayoutGrid, Link2, FolderOpen, Trophy, DollarSign, Lock, MessageCircle } from "lucide-react";
import { AffiliateHome, MaterialTab, AchievementsTab, PaymentsHistory } from "@/components/affiliate/AffiliateTabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CategoryBoundary, PartnerShell, StatusPill, brl, fieldClass } from "@/components/PartnerShell";
import { PartnerApplication } from "@/components/PartnerApplication";
import { PayoutAccount } from "@/components/PayoutAccount";
import { REFERRAL_PLANS, type ReferralPlanSlug } from "@/lib/referrals";

export const Route = createFileRoute("/_authenticated/afiliado")({
  head: () => ({ meta: [{ title: "Área do afiliado — ARQECO" }, { name: "description", content: "Gere links da Curadoria ARQECO por projeto e acompanhe cliques, vendas e comissões." }, { property: "og:title", content: "Área do afiliado — ARQECO" }, { property: "og:description", content: "Acompanhe seus links, vendas e comissões na rede ARQECO." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <CategoryBoundary category="affiliate"><AffiliatePage /></CategoryBoundary>,
});

const TABS = [
  { id: "home", label: "Home", icon: LayoutGrid },
  { id: "links", label: "Meus links", icon: Link2 },
  { id: "material", label: "Material de divulgação", icon: FolderOpen },
  { id: "conquistas", label: "Conquistas", icon: Trophy },
  { id: "pagamentos", label: "Pagamentos", icon: DollarSign },
] as const;
type Tab = (typeof TABS)[number]["id"];

function AffiliatePage() {
  const { user } = Route.useRouteContext();
  const [tab, setTab] = useState<Tab>("home");
  const app = useQuery({
    queryKey: ["application", "affiliate"],
    queryFn: async () => (await supabase.from("partner_applications").select("id,status,review_note,display_name").eq("user_id", user.id).eq("kind", "affiliate").maybeSingle()).data,
  });
  const approved = app.data?.status === "approved";
  const locked = (what: string) => (
    <div className="rounded-lg border border-border bg-card p-10 text-center"><Lock className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-3 font-display text-xl font-semibold">Disponível após a aprovação</p><p className="mt-1 text-sm text-muted-foreground">{what} será liberado assim que a equipe ARQECO aprovar seu cadastro.</p></div>
  );
  return (
    <PartnerShell eyebrow="Afiliados · Creators · Corretores de imóveis" title={`Olá, ${(app.data?.display_name ?? user.email ?? "").split(/[ @]/)[0]}`}>
      {app.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : (
        <div className="space-y-8">
          {app.data && !approved && <p className="rounded-md border border-border bg-secondary px-4 py-3 text-center text-sm">{app.data.status === "rejected" ? "Cadastro não aprovado. Fale com a equipe ARQECO." : "Cadastro em análise. Seus links só rastreiam indicações após a aprovação."}</p>}
          <nav className="flex gap-1 overflow-x-auto border-b border-border">
            {TABS.map((t) => (
              <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <t.icon className="h-4 w-4" />{t.label}
              </button>
            ))}
          </nav>
          {tab === "home" && (app.data ? <AffiliateHome userId={user.id} email={user.email ?? ""} name={app.data.display_name} approved={approved} onGo={(t) => setTab(t as Tab)} /> : <PartnerApplication kind="affiliate" userId={user.id} application={null} />)}
          {tab === "links" && (approved ? <AffiliateDashboard userId={user.id} /> : app.data ? locked("A criação de links") : <PartnerApplication kind="affiliate" userId={user.id} application={null} />)}
          {tab === "material" && <MaterialTab />}
          {tab === "conquistas" && <AchievementsTab userId={user.id} />}
          {tab === "pagamentos" && (approved ? <div className="space-y-8"><PayoutAccount userId={user.id} /><PaymentsHistory userId={user.id} /></div> : locked("A área de pagamentos"))}
          <a href="https://wa.me/5511964710505" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><MessageCircle className="h-4 w-4" /> Dúvidas? Fale com o time no WhatsApp · (11) 96471-0505</a>
        </div>
      )}
    </PartnerShell>
  );
}

function AffiliateDashboard({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const materials = useQuery({ queryKey: ["catalog"], queryFn: async () => (await supabase.from("curated_materials").select("id,name,category,commission_rate,eco_index").eq("is_active", true).order("name")).data ?? [] });
  const links = useQuery({ queryKey: ["links", userId], queryFn: async () => (await supabase.from("affiliate_links").select("id,code,project_label,created_at,material:curated_materials(name,commission_rate)").eq("affiliate_id", userId).order("created_at", { ascending: false })).data ?? [] });
  const clicks = useQuery({ queryKey: ["clicks", userId], queryFn: async () => (await supabase.from("affiliate_clicks").select("link_id")).data ?? [] });
  const sales = useQuery({ queryKey: ["aff-sales", userId], queryFn: async () => (await supabase.from("affiliate_conversions").select("id,link_id,order_ref,sale_amount_cents,commission_cents,commission_rate,status,created_at").eq("affiliate_id", userId).order("created_at", { ascending: false })).data ?? [] });
  const [materialId, setMaterialId] = useState("");
  const [project, setProject] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const clickCount = useMemo(() => { const m = new Map<string, number>(); (clicks.data ?? []).forEach((c) => m.set(c.link_id, (m.get(c.link_id) ?? 0) + 1)); return m; }, [clicks.data]);
  const salesByLink = useMemo(() => { const m = new Map<string, { n: number; cents: number }>(); (sales.data ?? []).filter((s) => s.status !== "cancelled").forEach((s) => { const v = m.get(s.link_id) ?? { n: 0, cents: 0 }; m.set(s.link_id, { n: v.n + 1, cents: v.cents + s.commission_cents }); }); return m; }, [sales.data]);
  const projects = useMemo(() => { const g = new Map<string, NonNullable<typeof links.data>>(); (links.data ?? []).forEach((l) => g.set(l.project_label, [...(g.get(l.project_label) ?? []), l])); return [...g.entries()]; }, [links.data]);
  const valid = (sales.data ?? []).filter((s) => s.status !== "cancelled");
  const totals = {
    clicks: clicks.data?.length ?? 0,
    sales: valid.length,
    pending: valid.filter((s) => s.status === "pending" || s.status === "approved").reduce((a, s) => a + s.commission_cents, 0),
    paid: valid.filter((s) => s.status === "paid").reduce((a, s) => a + s.commission_cents, 0),
  };

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    const label = project.trim().slice(0, 80) || "Geral";
    if (!materialId) { setErr("Escolha um produto."); return; }
    setErr(null);
    const { error } = await supabase.from("affiliate_links").insert({ affiliate_id: userId, material_id: materialId, project_label: label });
    if (error) { setErr("Não foi possível criar o link."); return; }
    qc.invalidateQueries({ queryKey: ["links", userId] });
  }
  async function remove(id: string) { await supabase.from("affiliate_links").delete().eq("id", id); qc.invalidateQueries({ queryKey: ["links", userId] }); }

  return (
    <div className="space-y-10">
      <PlanReferrals userId={userId} origin={origin} />
      <h2 className="font-display text-2xl font-semibold">Produtos da Curadoria</h2>
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Cliques", String(totals.clicks)], ["Vendas", String(totals.sales)], ["A receber", brl(totals.pending)], ["Recebido", brl(totals.paid)]].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-card p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{k}</p><p className="mt-2 font-display text-3xl font-semibold">{v}</p></div>
        ))}
      </div>

      <form onSubmit={createLink} className="grid gap-3 rounded-lg border border-border bg-card p-6 md:grid-cols-[1.4fr_1fr_auto] md:items-end">
        <label className="text-xs font-semibold text-muted-foreground">Produto da Curadoria
          <select className={`${fieldClass} mt-1`} value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
            <option value="">Escolha…</option>
            {(materials.data ?? []).map((m) => <option key={m.id} value={m.id}>{m.name} · {Number(m.commission_rate)}%</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-muted-foreground">Projeto / campanha
          <input className={`${fieldClass} mt-1`} placeholder="Ex.: Reels cozinha de outubro" value={project} onChange={(e) => setProject(e.target.value)} />
        </label>
        <Button type="submit" variant="editorial">Gerar link</Button>
        {err && <p className="text-sm text-destructive md:col-span-3">{err}</p>}
        {(materials.data ?? []).length === 0 && <p className="text-xs text-muted-foreground md:col-span-3">Ainda não há produtos aprovados na Curadoria.</p>}
      </form>

      <section className="space-y-6">
        <h2 className="font-display text-2xl font-semibold">Meus projetos</h2>
        {projects.length === 0 && <p className="text-sm text-muted-foreground">Crie seu primeiro link para começar.</p>}
        {projects.map(([label, items]) => (
          <div key={label} className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4"><h3 className="font-display text-xl font-semibold">{label}</h3><span className="text-xs text-muted-foreground">{items.length} link(s)</span></div>
            <div className="divide-y divide-border">
              {items.map((l) => {
                const url = `${origin}/r/${l.code}`; const s = salesByLink.get(l.id);
                return (
                  <div key={l.id} className="grid gap-2 px-5 py-4 text-sm md:grid-cols-[1.5fr_2fr_auto_auto_auto_auto] md:items-center">
                    <span className="font-semibold">{l.material?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{url}</span>
                    <span className="text-xs">{clickCount.get(l.id) ?? 0} cliques</span>
                    <span className="text-xs">{s?.n ?? 0} vendas · {brl(s?.cents ?? 0)}</span>
                    <Button variant="ghost" size="icon" aria-label="Copiar link" onClick={() => navigator.clipboard.writeText(url)}><Copy /></Button>
                    <Button variant="ghost" size="icon" aria-label="Excluir link" onClick={() => remove(l.id)}><Trash2 /></Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">Vendas e comissões</h2>
        <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
          {valid.length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhuma venda ainda. As vendas aparecem aqui automaticamente quando a loja confirma.</p>}
          {(sales.data ?? []).map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-4 p-4 text-sm"><span className="flex-1">{new Date(c.created_at).toLocaleDateString("pt-BR")} · pedido {c.order_ref}</span><span>{brl(c.sale_amount_cents)}</span><span className="font-semibold text-primary">+{brl(c.commission_cents)} ({Number(c.commission_rate)}%)</span><StatusPill status={c.status} /></div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PlanReferrals({ userId, origin }: { userId: string; origin: string }) {
  const qc = useQueryClient();
  const links = useQuery({ queryKey: ["ref-links", userId], queryFn: async () => (await supabase.from("referral_links").select("id,code,plan_slug").eq("affiliate_id", userId)).data ?? [] });
  const refs = useQuery({ queryKey: ["ref-attr", userId], queryFn: async () => (await supabase.from("referral_attributions").select("link_id")).data ?? [] });
  const comms = useQuery({ queryKey: ["ref-comms", userId], queryFn: async () => (await supabase.from("referral_commissions").select("*").order("created_at", { ascending: false })).data ?? [] });
  const ecos = useQuery({ queryKey: ["ecos", userId], queryFn: async () => (await supabase.from("eco_ledger").select("id,amount,reason,created_at").eq("user_id", userId).order("created_at", { ascending: false })).data ?? [] });
  const [err, setErr] = useState<string | null>(null);
  const list = comms.data ?? [];
  const valid = list.filter((c) => c.status !== "cancelled");
  const ecoTotal = (ecos.data ?? []).reduce((a, e) => a + e.amount, 0);
  const toReceive = valid.filter((c) => c.status === "pending").reduce((a, c) => a + c.commission_cents, 0);
  const received = valid.filter((c) => c.status === "paid").reduce((a, c) => a + c.commission_cents, 0);
  const next = valid.filter((c) => c.status === "pending").map((c) => c.payout_date).sort()[0];

  async function generate(slug: ReferralPlanSlug) {
    setErr(null);
    const { error } = await supabase.from("referral_links").insert({ affiliate_id: userId, plan_slug: slug });
    if (error) setErr("Não foi possível gerar o link.");
    qc.invalidateQueries({ queryKey: ["ref-links", userId] });
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Indique os planos ARQECO</h2>
        <p className="mt-1 text-sm text-muted-foreground">Projeto Start é gratuito e não monetiza, então rende 10 ecos por pessoa que criar a conta pelo seu link e gerar o Dossiê Eco-Holístico. Viver Bem e Viver Lifestyle rendem 15% do valor do plano vendido (Viver Bem R$ 907,40 → R$ 136,11; Viver Lifestyle R$ 1.480,00 → R$ 222,00; cada ambiente extra R$ 258,70 → R$ 38,81). Só é creditado quando o cliente fecha e paga a compra do projeto, e é pago sempre no dia 15 do mês seguinte à compra. Seus ecos valem desconto: 100 ecos = R$ 100,00 nos planos de projetos de interiores.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Ecos acumulados", `${ecoTotal} ecos`], ["A receber", brl(toReceive)], ["Recebido", brl(received)], ["Próximo pagamento", next ? new Date(`${next}T12:00:00`).toLocaleDateString("pt-BR") : "—"]].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-card p-5"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{k}</p><p className="mt-2 font-display text-3xl font-semibold">{v}</p></div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {REFERRAL_PLANS.map((p) => {
          const link = (links.data ?? []).find((l) => l.plan_slug === p.slug);
          const url = link ? `${origin}/indicacao/${link.code}` : "";
          const count = link ? (refs.data ?? []).filter((r) => r.link_id === link.id).length : 0;
          return (
            <div key={p.slug} className="rounded-lg border border-border bg-card p-5">
              <h3 className="font-display text-xl font-semibold">{p.name}</h3>
              <p className="text-xs font-semibold text-primary">{p.reward}</p>
              {link ? (
                <>
                  <p className="mt-3 truncate text-xs text-muted-foreground">{url}</p>
                  <p className="mt-1 text-xs">{count} pessoa(s) indicada(s)</p>
                  <Button className="mt-3 w-full" variant="paper" size="sm" onClick={() => navigator.clipboard.writeText(url)}><Copy /> Copiar link</Button>
                </>
              ) : <Button className="mt-4 w-full" variant="editorial" size="sm" onClick={() => generate(p.slug)}>Gerar meu link</Button>}
            </div>
          );
        })}
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {list.length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhuma comissão de plano ainda. Ela aparece aqui assim que o cliente indicado pagar.</p>}
        {list.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
            <span className="flex-1">{new Date(c.created_at).toLocaleDateString("pt-BR")} · {c.plan_name}</span>
            <span>{brl(c.sale_cents)}</span>
            <span className="font-semibold text-primary">+{brl(c.commission_cents)} (15%)</span>
            <span className="text-xs">pagamento em {new Date(`${c.payout_date}T12:00:00`).toLocaleDateString("pt-BR")}</span>
            <StatusPill status={c.status} />
          </div>
        ))}
      </div>
      {(ecos.data ?? []).length > 0 && <p className="text-xs text-muted-foreground">Seus ecos valem desconto nos planos de projetos de interiores (100 ecos = R$ 100,00) e poderão ser trocados por cursos, produtos e serviços ARQECO.</p>}
    </section>
  );
}
