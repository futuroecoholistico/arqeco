import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PartnerShell, StatusPill, brl, fieldClass } from "@/components/PartnerShell";
import { SlotManager } from "@/components/SlotManager";
import { BriefingsAdmin, VisualLibraryAdmin } from "@/components/briefing/BriefingAdmin";
import { RegistrantsAdmin, DossiersAdmin } from "@/components/RegistrantsAdmin";
import { NewsletterAdmin } from "@/components/NewsletterAdmin";
import { ProjectManager } from "@/components/ProjectManager";
import { QuoteRequestsAdmin } from "@/components/QuoteRequestsAdmin";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Administração — ARQECO" }, { name: "description", content: "Gerencie contratos, solicitações de construção, parceiros, produtos e planos ARQECO." }, { property: "og:title", content: "Administração — ARQECO" }, { property: "og:description", content: "Gestão da operação, dos serviços e dos parceiros ARQECO." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AdminPage,
});

function AdminPage() {
  const isAdmin = useQuery({ queryKey: ["is-admin"], queryFn: async () => (await supabase.rpc("is_admin")).data === true });
  const [tab, setTab] = useState<"orcamentos" | "cadastros" | "projetos" | "dossies" | "contratos" | "briefings" | "biblioteca" | "construcao" | "planos" | "horarios" | "depoimentos" | "parceiros" | "produtos" | "vendas" | "indicacoes" | "newsletter">("cadastros");
  return (
    <PartnerShell eyebrow="Administração" title="Curadoria e parceiros">
      {isAdmin.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : !isAdmin.data ? <p className="text-sm text-muted-foreground">Esta área é exclusiva da equipe ARQECO.</p> : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {(["orcamentos", "cadastros", "projetos", "dossies", "contratos", "briefings", "biblioteca", "construcao", "planos", "horarios", "depoimentos", "parceiros", "produtos", "vendas", "indicacoes", "newsletter"] as const).map((t) => <Button key={t} variant={tab === t ? "editorial" : "paper"} size="sm" onClick={() => setTab(t)} className="capitalize">{t === "orcamentos" ? "orçamentos do site" : t === "dossies" ? "dossiês" : t === "horarios" ? "horários" : t === "construcao" ? "construção" : t === "parceiros" ? "parceiros e arquitetos" : t === "biblioteca" ? "biblioteca visual" : t === "indicacoes" ? "indicações de planos" : t}</Button>)}
          </div>
          {tab === "orcamentos" && <QuoteRequestsAdmin />}
          {tab === "contratos" && <Contracts />}
          {tab === "projetos" && <ProjectManager />}
          {tab === "cadastros" && <RegistrantsAdmin />}
          {tab === "dossies" && <DossiersAdmin />}
          {tab === "briefings" && <BriefingsAdmin />}
          {tab === "biblioteca" && <VisualLibraryAdmin />}
          {tab === "construcao" && <ConstructionInquiries />}
          {tab === "horarios" && <Slots />}
          {tab === "depoimentos" && <Testimonials />}
          {tab === "parceiros" && <Applications />}
          {tab === "produtos" && <Submissions />}
          {tab === "planos" && <Plans />}
          {tab === "vendas" && <Sales />}
          {tab === "indicacoes" && <><AffiliateReport /><ReferralPayouts /></>}
          {tab === "newsletter" && <NewsletterAdmin />}
        </>
      )}
    </PartnerShell>
  );
}

const constructionStatusLabel: Record<string, string> = { submitted: "Recebido", meeting_scheduled: "Reunião marcada", contacted: "Contato realizado", converted: "Convertido em projeto", closed: "Encerrado" };

function ConstructionInquiries() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-construction-inquiries"], queryFn: async () => (await supabase.from("construction_inquiries").select("id,full_name,email,phone,postal_code,city,state,construction_description,service_scope,desired_timeline,status,admin_notes,created_at,appointment_slots(starts_at)").order("created_at", { ascending: false })).data ?? [] });
  async function setStatus(id: string, status: "submitted" | "meeting_scheduled" | "contacted" | "converted" | "closed") {
    await supabase.from("construction_inquiries").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-construction-inquiries"] });
  }
  async function saveNotes(id: string, admin_notes: string) {
    await supabase.from("construction_inquiries").update({ admin_notes: admin_notes.trim().slice(0, 2000) || null }).eq("id", id);
  }
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {(q.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhuma solicitação de construção recebida.</p>}
      {(q.data ?? []).map((item) => (
        <article key={item.id} className="grid gap-4 p-5 text-sm lg:grid-cols-[1fr_250px]">
          <div>
            <div className="flex flex-wrap items-center gap-3"><h3 className="font-semibold">{item.full_name}</h3><span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold">{constructionStatusLabel[item.status] ?? item.status}</span></div>
            <p className="mt-1 text-xs text-muted-foreground">{item.email} · {item.phone} · {item.city}/{item.state} · CEP {item.postal_code}</p>
            <p className="mt-3 leading-relaxed">{item.construction_description}</p>
            <p className="mt-3 text-xs font-semibold text-primary">{item.service_scope === "project_only" ? "Somente projeto" : "Projeto, obra e acompanhamento"} · {item.desired_timeline}{item.appointment_slots?.starts_at ? ` · reunião em ${new Date(item.appointment_slots.starts_at).toLocaleString("pt-BR")}` : " · reunião ainda não marcada"}</p>
          </div>
          <div className="space-y-3">
            <select className={fieldClass} value={item.status} onChange={(e) => setStatus(item.id, e.target.value as "submitted" | "meeting_scheduled" | "contacted" | "converted" | "closed")} aria-label="Situação da solicitação"><option value="submitted">Recebido</option><option value="meeting_scheduled">Reunião marcada</option><option value="contacted">Contato realizado</option><option value="converted">Convertido em projeto</option><option value="closed">Encerrado</option></select>
            <textarea className={`${fieldClass} min-h-24 py-2`} defaultValue={item.admin_notes ?? ""} onBlur={(e) => saveNotes(item.id, e.target.value)} maxLength={2000} placeholder="Anotações da equipe" aria-label="Anotações da equipe" />
          </div>
        </article>
      ))}
    </div>
  );
}

async function openKyc(path: string) {
  const { data } = await supabase.storage.from("partner-kyc").createSignedUrl(path, 120);
  if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
}

function AffiliateReport() {
  const clicks = useQuery({ queryKey: ["admin-ref-clicks"], queryFn: async () => (await supabase.from("referral_clicks").select("affiliate_id,link_id").limit(10000)).data ?? [] });
  const links = useQuery({ queryKey: ["admin-ref-links"], queryFn: async () => (await supabase.from("referral_links").select("id,affiliate_id,plan_slug")).data ?? [] });
  const comms = useQuery({ queryKey: ["admin-referrals"], queryFn: async () => (await supabase.from("referral_commissions").select("*").order("payout_date")).data ?? [] });
  const attrs = useQuery({ queryKey: ["admin-ref-attrs"], queryFn: async () => (await supabase.from("referral_attributions").select("affiliate_id")).data ?? [] });
  const names = useQuery({ queryKey: ["admin-aff-names"], queryFn: async () => (await supabase.from("partner_applications").select("user_id,display_name").eq("kind", "affiliate")).data ?? [] });
  const ids = Array.from(new Set([...(links.data ?? []).map((l) => l.affiliate_id), ...(names.data ?? []).map((n) => n.user_id)]));
  const plans = Array.from(new Set((comms.data ?? []).map((c) => c.plan_name)));
  const byPlan = plans.map((p) => { const rows = (comms.data ?? []).filter((c) => c.plan_name === p); return { p, n: rows.length, sale: rows.reduce((a, c) => a + c.sale_cents, 0), com: rows.reduce((a, c) => a + c.commission_cents, 0) }; });
  return (
    <div className="mb-8 space-y-6">
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-display text-xl">Comissões por plano vendido</h3>
        {byPlan.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Nenhum plano vendido por indicação ainda.</p> :
        <table className="mt-3 w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th>Plano</th><th>Vendas</th><th>Valor vendido</th><th>Comissões</th></tr></thead>
        <tbody>{byPlan.map((r) => <tr key={r.p} className="border-t border-border"><td className="py-2">{r.p}</td><td>{r.n}</td><td>{brl(r.sale)}</td><td className="font-semibold text-primary">{brl(r.com)}</td></tr>)}</tbody></table>}
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-display text-xl">Desempenho por afiliado</h3>
        {ids.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Nenhum afiliado com links ainda.</p> :
        <table className="mt-3 w-full text-sm"><thead><tr className="text-left text-muted-foreground"><th>Afiliado</th><th>Cliques</th><th>Cadastros indicados</th><th>Planos vendidos</th><th>Comissões</th></tr></thead>
        <tbody>{ids.map((id) => { const cs = (comms.data ?? []).filter((c) => c.affiliate_id === id); return <tr key={id} className="border-t border-border"><td className="py-2">{names.data?.find((n) => n.user_id === id)?.display_name ?? "Afiliado"}</td><td>{(clicks.data ?? []).filter((c) => c.affiliate_id === id).length}</td><td>{(attrs.data ?? []).filter((a) => a.affiliate_id === id).length}</td><td>{cs.length}</td><td className="font-semibold text-primary">{brl(cs.reduce((a, c) => a + c.commission_cents, 0))}</td></tr>; })}</tbody></table>}
      </div>
      <h3 className="font-display text-xl">Pagamentos de comissões</h3>
    </div>
  );
}

function ReferralPayouts() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-referrals"], queryFn: async () => (await supabase.from("referral_commissions").select("*").order("payout_date")).data ?? [] });
  const names = useQuery({ queryKey: ["admin-aff-names"], queryFn: async () => (await supabase.from("partner_applications").select("user_id,display_name").eq("kind", "affiliate")).data ?? [] });
  const nameOf = (id: string) => names.data?.find((n) => n.user_id === id)?.display_name ?? "Afiliado";
  const payouts = useQuery({ queryKey: ["admin-payout-accounts"], queryFn: async () => (await supabase.from("payout_accounts").select("user_id,document_path")).data ?? [] });
  const canPay = (id: string) => !!payouts.data?.find((p) => p.user_id === id && p.document_path);
  async function markPaid(id: string) {
    await supabase.from("referral_commissions").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-referrals"] });
  }
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {(q.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhuma comissão de indicação ainda.</p>}
      {(q.data ?? []).map((c) => (
        <div key={c.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
          <span className="flex-1"><b>{nameOf(c.affiliate_id)}</b> · {c.plan_name} · venda {brl(c.sale_cents)}</span>
          <span className="font-semibold text-primary">{brl(c.commission_cents)}</span>
          <span className="text-xs">pagar em {new Date(`${c.payout_date}T12:00:00`).toLocaleDateString("pt-BR")}</span>
          <StatusPill status={c.status} />
          {c.status === "pending" && (canPay(c.affiliate_id)
            ? <Button size="sm" variant="editorial" onClick={() => markPaid(c.id)}>Marcar como pago</Button>
            : <span className="text-xs text-destructive">Sem dados bancários com documento</span>)}
        </div>
      ))}
    </div>
  );
}

function Applications() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-apps"], queryFn: async () => (await supabase.from("partner_applications").select("*").order("created_at", { ascending: false })).data ?? [] });
  async function review(id: string, approve: boolean) {
    const note = approve ? null : window.prompt("Motivo (opcional)") ?? null;
    const { error } = await supabase.rpc("review_partner_application", { _id: id, _approve: approve, ...(note ? { _note: note } : {}) });
    if (error) alert("Não foi possível concluir."); qc.invalidateQueries({ queryKey: ["admin-apps"] });
  }
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {(q.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhum cadastro recebido.</p>}
      {(q.data ?? []).map((a) => (
        <div key={a.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
          <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold">{a.kind === "supplier" ? "Fornecedor" : a.kind === "professional" ? "Arquiteto/designer" : "Afiliado"}</span>
          <div className="flex-1"><p className="font-semibold">{a.display_name}</p><p className="text-xs text-muted-foreground">{[a.cpf && `CPF ${a.cpf}`, a.phone, a.document, a.category, a.city, a.website].filter(Boolean).join(" · ")}</p>{a.message && <p className="mt-1 text-xs">{a.message}</p>}<div className="mt-1 flex gap-3 text-xs">{a.document_path && <button type="button" className="underline" onClick={() => openKyc(a.document_path!)}>Ver documento</button>}{a.selfie_path && <button type="button" className="underline" onClick={() => openKyc(a.selfie_path!)}>Ver selfie</button>}</div></div>
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
    const { error } = await supabase.rpc("review_product_submission", { _id: id, _approve: approve, ...(approve ? { _eco_index: eco } : {}), ...(note ? { _note: note } : {}) });
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
  const q = useQuery({ queryKey: ["admin-plans"], queryFn: async () => (await supabase.from("service_plans").select("id,name,badge,is_active,service_plan_options(id,rooms_label,price_cents,compare_at_price_cents,extra_room_price_cents,delivery_days,sort_order)").eq("is_active", true).order("sort_order")).data ?? [] });
  async function savePrice(id: string, value: string, field: "price_cents" | "compare_at_price_cents" | "extra_room_price_cents" = "price_cents") {
    const n = value.trim() === "" ? null : Math.round(Number(value.replace(",", ".")) * 100);
    if (n !== null && (!Number.isFinite(n) || n < 0)) return;
    if (field === "price_cents") await supabase.from("service_plan_options").update({ price_cents: n }).eq("id", id);
    else if (field === "compare_at_price_cents") await supabase.from("service_plan_options").update({ compare_at_price_cents: n }).eq("id", id);
    else if (n !== null) await supabase.from("service_plan_options").update({ extra_room_price_cents: n }).eq("id", id);
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
                <input className={`${fieldClass} mt-2`} inputMode="decimal" placeholder="Preço antes (riscado)" defaultValue={o.compare_at_price_cents != null ? (o.compare_at_price_cents / 100).toString() : ""} onBlur={(e) => savePrice(o.id, e.target.value, "compare_at_price_cents")} aria-label={`Preço antes ${o.rooms_label}`} />
                 <input className={`${fieldClass} mt-2`} inputMode="decimal" placeholder="Ambiente extra" defaultValue={(o.extra_room_price_cents / 100).toString()} onBlur={(e) => savePrice(o.id, e.target.value, "extra_room_price_cents")} aria-label={`Valor do ambiente extra ${o.rooms_label}`} />
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

const statusLabel: Record<string, string> = { draft: "Rascunho", awaiting_payment: "Aguardando pagamento", payment_processing: "Pagamento em análise", confirmed: "Pago e confirmado", cancelled: "Cancelado" };

function Contracts() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-contracts"], queryFn: async () => (await supabase.from("service_bookings").select("id,full_name,email,phone,city,state,status,total_cents,room_count,extra_room_count,professional_id,urgent_delivery,service_plans(name),service_plan_options(rooms_label),appointment_slots(starts_at)").neq("status", "draft").order("created_at", { ascending: false })).data ?? [] });
  const pros = useQuery({ queryKey: ["admin-pros"], queryFn: async () => (await supabase.from("partner_applications").select("user_id,display_name").eq("kind", "professional").eq("status", "approved")).data ?? [] });
  async function assign(id: string, professional_id: string) {
    await supabase.from("service_bookings").update({ professional_id: professional_id || null }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-contracts"] });
  }
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {(q.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhuma contratação ainda.</p>}
      {(q.data ?? []).map((c) => (
        <div key={c.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
          <div className="min-w-60 flex-1">
            <p className="font-semibold">{c.full_name} <span className="font-normal text-muted-foreground">· {c.email} · {c.phone}</span></p>
            <p className="text-xs text-muted-foreground">{c.service_plans?.name} · {c.service_plan_options?.rooms_label}{c.room_count > 1 ? ` × ${c.room_count}` : ""}{c.extra_room_count > 0 ? ` · +${c.extra_room_count} ambiente${c.extra_room_count === 1 ? "" : "s"}` : ""}{c.urgent_delivery ? " · urgência" : ""} · {c.city}/{c.state}{c.appointment_slots?.starts_at ? ` · ${new Date(c.appointment_slots.starts_at).toLocaleString("pt-BR")}` : ""}</p>
          </div>
          <span className="font-semibold">{brl(c.total_cents)}</span>
          <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold">{statusLabel[c.status] ?? c.status}</span>
          <select className={`${fieldClass} w-52`} value={c.professional_id ?? ""} onChange={(e) => assign(c.id, e.target.value)} aria-label="Arquiteto responsável">
            <option value="">Sem arquiteto</option>
            {(pros.data ?? []).map((p) => <option key={p.user_id} value={p.user_id}>{p.display_name}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
}

function Slots() {
  return <SlotManager professionalId={null} />;
}

function Testimonials() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-testimonials"], queryFn: async () => (await supabase.from("testimonials").select("*").order("sort_order")).data ?? [] });
  const empty = { author_name: "", context: "", project_label: "", quote: "" };
  const [form, setForm] = useState(empty);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-testimonials"] }); qc.invalidateQueries({ queryKey: ["testimonials"] }); };
  async function add() {
    if (form.author_name.trim().length < 2 || form.quote.trim().length < 10) { alert("Informe o nome e um depoimento com pelo menos 10 caracteres."); return; }
    await supabase.from("testimonials").insert({ author_name: form.author_name.trim().slice(0, 100), context: form.context.trim().slice(0, 100) || null, project_label: form.project_label.trim().slice(0, 100) || null, quote: form.quote.trim().slice(0, 600), sort_order: (q.data?.length ?? 0) + 1 });
    setForm(empty); refresh();
  }
  async function update(id: string, patch: { quote?: string; author_name?: string; is_active?: boolean }) { await supabase.from("testimonials").update(patch).eq("id", id); refresh(); }
  async function remove(id: string) { if (!window.confirm("Excluir este depoimento?")) return; await supabase.from("testimonials").delete().eq("id", id); refresh(); }
  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-lg border border-border bg-card p-5 sm:grid-cols-3">
        <input className={fieldClass} placeholder="Nome" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} aria-label="Nome" />
        <input className={fieldClass} placeholder="Contexto (ex.: Cliente residencial)" value={form.context} onChange={(e) => setForm({ ...form, context: e.target.value })} aria-label="Contexto" />
        <input className={fieldClass} placeholder="Projeto (ex.: Sala de estar)" value={form.project_label} onChange={(e) => setForm({ ...form, project_label: e.target.value })} aria-label="Projeto" />
        <textarea className={`${fieldClass} h-24 py-2 sm:col-span-3`} placeholder="Depoimento" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} aria-label="Depoimento" />
        <Button variant="editorial" size="sm" className="w-fit" onClick={add}>Adicionar depoimento</Button>
      </div>
      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {(q.data ?? []).map((t) => (
          <div key={t.id} className="grid gap-3 p-4 text-sm sm:grid-cols-[200px_1fr_auto]">
            <input className={fieldClass} defaultValue={t.author_name} onBlur={(e) => e.target.value.trim() && update(t.id, { author_name: e.target.value.trim() })} aria-label="Nome" />
            <textarea className={`${fieldClass} h-20 py-2`} defaultValue={t.quote} onBlur={(e) => e.target.value.trim() && update(t.id, { quote: e.target.value.trim() })} aria-label="Depoimento" />
            <div className="flex gap-2 sm:flex-col">
              <Button size="sm" variant="paper" onClick={() => update(t.id, { is_active: !t.is_active })}>{t.is_active ? "Ocultar" : "Publicar"}</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(t.id)}>Excluir</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
