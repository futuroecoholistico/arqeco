import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PartnerShell, StatusPill, brl, fieldClass } from "@/components/PartnerShell";
import { PartnerApplication } from "@/components/PartnerApplication";

export const Route = createFileRoute("/_authenticated/afiliado")({
  head: () => ({ meta: [{ title: "Área do afiliado — ARQECO" }, { name: "description", content: "Gere links da Curadoria ARQECO por projeto e acompanhe cliques, vendas e comissões." }, { property: "og:title", content: "Área do afiliado — ARQECO" }, { property: "og:description", content: "Acompanhe seus links, vendas e comissões na rede ARQECO." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AffiliatePage,
});

function AffiliatePage() {
  const { user } = Route.useRouteContext();
  const app = useQuery({
    queryKey: ["application", "affiliate"],
    queryFn: async () => (await supabase.from("partner_applications").select("id,status,review_note,display_name").eq("user_id", user.id).eq("kind", "affiliate").maybeSingle()).data,
  });
  return (
    <PartnerShell eyebrow="Área do afiliado" title="Seus projetos e comissões">
      {app.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p>
        : app.data?.status === "approved" ? <AffiliateDashboard userId={user.id} />
        : <PartnerApplication kind="affiliate" userId={user.id} application={app.data ?? null} />}
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
