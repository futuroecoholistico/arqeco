import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PartnerShell, StatusPill, brl, fieldClass } from "@/components/PartnerShell";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Administração — ARQECO" }, { name: "description", content: "Aprovação de parceiros, avaliação de produtos e planos." }] }),
  component: AdminPage,
});

function AdminPage() {
  const isAdmin = useQuery({ queryKey: ["is-admin"], queryFn: async () => (await supabase.rpc("is_admin")).data === true });
  const [tab, setTab] = useState<"parceiros" | "produtos" | "planos" | "vendas">("parceiros");
  return (
    <PartnerShell eyebrow="Administração" title="Curadoria e parceiros">
      {isAdmin.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : !isAdmin.data ? <p className="text-sm text-muted-foreground">Esta área é exclusiva da equipe ARQECO.</p> : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {(["parceiros", "produtos", "planos", "vendas"] as const).map((t) => <Button key={t} variant={tab === t ? "editorial" : "paper"} size="sm" onClick={() => setTab(t)} className="capitalize">{t}</Button>)}
          </div>
          {tab === "parceiros" && <Applications />}
          {tab === "produtos" && <Submissions />}
          {tab === "planos" && <Plans />}
          {tab === "vendas" && <Sales />}
        </>
      )}
    </PartnerShell>
  );
}

function Applications() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-apps"], queryFn: async () => (await supabase.from("partner_applications").select("*").order("created_at", { ascending: false })).data ?? [] });
  async function review(id: string, approve: boolean) {
    const note = approve ? null : window.prompt("Motivo (opcional)") ?? null;
    const { error } = await supabase.rpc("review_partner_application", { _id: id, _approve: approve, _note: note ?? undefined });
    if (error) alert("Não foi possível concluir."); qc.invalidateQueries({ queryKey: ["admin-apps"] });
  }
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {(q.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhum cadastro recebido.</p>}
      {(q.data ?? []).map((a) => (
        <div key={a.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
          <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold">{a.kind === "supplier" ? "Fornecedor" : "Afiliado"}</span>
          <div className="flex-1"><p className="font-semibold">{a.display_name}</p><p className="text-xs text-muted-foreground">{[a.category, a.city, a.website].filter(Boolean).join(" · ")}</p>{a.message && <p className="mt-1 text-xs">{a.message}</p>}</div>
          <StatusPill status={a.status} />
          {a.status === "pending" && <><Button size="sm" variant="editorial" onClick={() => review(a.id, true)}>Aprovar</Button><Button size="sm" variant="paper" onClick={() => review(a.id, false)}>Recusar</Button></>}
        </div>
      ))}
    </div>
  );
}

function Submissions() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-subs"], queryFn: async () => (await supabase.from("product_submissions").select("*, supplier:suppliers(name)").order("created_at", { ascending: false })).data ?? [] });
  const [scores, setScores] = useState<Record<string, string>>({});
  async function review(id: string, approve: boolean) {
    const eco = Number(scores[id]);
    if (approve && (!Number.isFinite(eco) || eco < 0 || eco > 100)) { alert("Informe o Índice Eco-Holístico (0 a 100)."); return; }
    const note = approve ? undefined : window.prompt("Motivo para o fornecedor (opcional)") ?? undefined;
    const { error } = await supabase.rpc("review_product_submission", { _id: id, _approve: approve, _eco_index: approve ? eco : undefined, _note: note });
    if (error) alert("Não foi possível concluir."); qc.invalidateQueries({ queryKey: ["admin-subs"] });
  }
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {(q.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhum produto enviado.</p>}
      {(q.data ?? []).map((s) => (
        <div key={s.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
          <div className="min-w-60 flex-1"><p className="font-semibold">{s.name} <span className="font-normal text-muted-foreground">· {s.supplier?.name}</span></p><p className="text-xs text-muted-foreground">{s.category} · {Number(s.commission_rate)}% · <a href={s.product_url} target="_blank" rel="noreferrer" className="underline">ver produto</a></p>{s.sustainability_notes && <p className="mt-1 text-xs">{s.sustainability_notes}</p>}</div>
          <StatusPill status={s.status} />
          {s.status === "pending" && <>
            <input className={`${fieldClass} w-28`} type="number" min={0} max={100} placeholder="Índice" value={scores[s.id] ?? ""} onChange={(e) => setScores({ ...scores, [s.id]: e.target.value })} aria-label="Índice Eco-Holístico" />
            <Button size="sm" variant="editorial" onClick={() => review(s.id, true)}>Aprovar</Button>
            <Button size="sm" variant="paper" onClick={() => review(s.id, false)}>Recusar</Button>
          </>}
        </div>
      ))}
    </div>
  );
}

function Plans() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-plans"], queryFn: async () => (await supabase.from("service_plans").select("id,name,badge,service_plan_options(id,rooms_label,price_cents,delivery_days,sort_order)").order("sort_order")).data ?? [] });
  async function savePrice(id: string, value: string) {
    const n = value.trim() === "" ? null : Math.round(Number(value.replace(",", ".")) * 100);
    if (n !== null && (!Number.isFinite(n) || n < 0)) return;
    await supabase.from("service_plan_options").update({ price_cents: n }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-plans"] }); qc.invalidateQueries({ queryKey: ["plans"] });
  }
  async function saveBadge(id: string, value: string) {
    await supabase.from("service_plans").update({ badge: value.trim() || null }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["plans"] });
  }
  return (
    <div className="space-y-6">
      {(q.data ?? []).map((p) => (
        <div key={p.id} className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-3"><h3 className="flex-1 font-display text-xl font-semibold">{p.name}</h3>
            <input className={`${fieldClass} w-60`} defaultValue={p.badge ?? ""} placeholder="Selo (opcional)" onBlur={(e) => saveBadge(p.id, e.target.value)} aria-label="Selo" /></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            {[...p.service_plan_options].sort((a, b) => a.sort_order - b.sort_order).map((o) => (
              <label key={o.id} className="text-xs font-semibold text-muted-foreground">{o.rooms_label}
                <input className={`${fieldClass} mt-1`} inputMode="decimal" placeholder="R$ —" defaultValue={o.price_cents != null ? (o.price_cents / 100).toString() : ""} onBlur={(e) => savePrice(o.id, e.target.value)} />
                <span className="mt-1 block font-normal">{brl(o.price_cents)}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Sales() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-sales"], queryFn: async () => (await supabase.from("affiliate_conversions").select("*").order("created_at", { ascending: false }).limit(100)).data ?? [] });
  async function setStatus(id: string, status: "approved" | "paid" | "cancelled") { await supabase.from("affiliate_conversions").update({ status }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-sales"] }); }
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {(q.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhuma venda registrada.</p>}
      {(q.data ?? []).map((c) => (
        <div key={c.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
          <span className="flex-1">Pedido {c.order_ref}</span><span>{brl(c.sale_amount_cents)}</span><span className="text-primary">{brl(c.commission_cents)}</span><StatusPill status={c.status} />
          <Button size="sm" variant="paper" onClick={() => setStatus(c.id, "approved")}>Aprovar</Button>
          <Button size="sm" variant="paper" onClick={() => setStatus(c.id, "paid")}>Marcar pago</Button>
          <Button size="sm" variant="ghost" onClick={() => setStatus(c.id, "cancelled")}>Cancelar</Button>
        </div>
      ))}
    </div>
  );
}
