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
  const [tab, setTab] = useState<"contratos" | "planos" | "horarios" | "depoimentos" | "parceiros" | "produtos" | "vendas">("contratos");
  return (
    <PartnerShell eyebrow="Administração" title="Curadoria e parceiros">
      {isAdmin.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : !isAdmin.data ? <p className="text-sm text-muted-foreground">Esta área é exclusiva da equipe ARQECO.</p> : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">
            {(["contratos", "planos", "horarios", "depoimentos", "parceiros", "produtos", "vendas"] as const).map((t) => <Button key={t} variant={tab === t ? "editorial" : "paper"} size="sm" onClick={() => setTab(t)} className="capitalize">{t === "horarios" ? "horários" : t === "parceiros" ? "parceiros e arquitetos" : t}</Button>)}
          </div>
          {tab === "contratos" && <Contracts />}
          {tab === "horarios" && <Slots />}
          {tab === "depoimentos" && <Testimonials />}
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
    const { error } = await supabase.rpc("review_partner_application", { _id: id, _approve: approve, ...(note ? { _note: note } : {}) });
    if (error) alert("Não foi possível concluir."); qc.invalidateQueries({ queryKey: ["admin-apps"] });
  }
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {(q.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhum cadastro recebido.</p>}
      {(q.data ?? []).map((a) => (
        <div key={a.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
          <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold">{a.kind === "supplier" ? "Fornecedor" : a.kind === "professional" ? "Arquiteto/designer" : "Afiliado"}</span>
          <div className="flex-1"><p className="font-semibold">{a.display_name}</p><p className="text-xs text-muted-foreground">{[a.document, a.category, a.city, a.website].filter(Boolean).join(" · ")}</p>{a.message && <p className="mt-1 text-xs">{a.message}</p>}</div>
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
  const q = useQuery({ queryKey: ["admin-plans"], queryFn: async () => (await supabase.from("service_plans").select("id,name,badge,service_plan_options(id,rooms_label,price_cents,compare_at_price_cents,delivery_days,sort_order)").order("sort_order")).data ?? [] });
  async function savePrice(id: string, value: string, field: "price_cents" | "compare_at_price_cents" = "price_cents") {
    const n = value.trim() === "" ? null : Math.round(Number(value.replace(",", ".")) * 100);
    if (n !== null && (!Number.isFinite(n) || n < 0)) return;
    await supabase.from("service_plan_options").update(field === "price_cents" ? { price_cents: n } : { compare_at_price_cents: n }).eq("id", id);
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
  const q = useQuery({ queryKey: ["admin-contracts"], queryFn: async () => (await supabase.from("service_bookings").select("id,full_name,email,phone,city,state,status,total_cents,room_count,professional_id,add_extra_room,urgent_delivery,service_plans(name),service_plan_options(rooms_label),appointment_slots(starts_at)").neq("status", "draft").order("created_at", { ascending: false })).data ?? [] });
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
            <p className="text-xs text-muted-foreground">{c.service_plans?.name} · {c.service_plan_options?.rooms_label}{c.room_count > 1 ? ` × ${c.room_count}` : ""}{c.add_extra_room ? " · +1 ambiente" : ""}{c.urgent_delivery ? " · urgência" : ""} · {c.city}/{c.state}{c.appointment_slots?.starts_at ? ` · ${new Date(c.appointment_slots.starts_at).toLocaleString("pt-BR")}` : ""}</p>
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
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-slots"], queryFn: async () => (await supabase.from("appointment_slots").select("id,starts_at,ends_at,is_available").gte("starts_at", new Date().toISOString()).order("starts_at")).data ?? [] });
  const [date, setDate] = useState(""); const [time, setTime] = useState("");  const [minutes, setMinutes] = useState("60");
  const [err, setErr] = useState<string | null>(null);
  async function add() {
    const start = new Date(`${date}T${time}`);
    const dur = Number(minutes);
    if (!date || !time || Number.isNaN(start.getTime()) || start <= new Date() || !(dur >= 15 && dur <= 480)) { setErr("Informe data e hora futuras e duração entre 15 e 480 minutos."); return; }
    setErr(null);
    await supabase.from("appointment_slots").insert({ starts_at: start.toISOString(), ends_at: new Date(start.getTime() + dur * 60000).toISOString() });
    qc.invalidateQueries({ queryKey: ["admin-slots"] });
  }
  async function toggle(id: string, is_available: boolean) { await supabase.from("appointment_slots").update({ is_available }).eq("id", id); qc.invalidateQueries({ queryKey: ["admin-slots"] }); }
  async function remove(id: string) { const { error } = await supabase.from("appointment_slots").delete().eq("id", id); if (error) alert("Este horário já tem contratação; bloqueie em vez de excluir."); qc.invalidateQueries({ queryKey: ["admin-slots"] }); }
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-5">
        <label className="text-xs font-semibold text-muted-foreground">Data<input type="date" className={`${fieldClass} mt-1`} value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="text-xs font-semibold text-muted-foreground">Hora<input type="time" className={`${fieldClass} mt-1`} value={time} onChange={(e) => setTime(e.target.value)} /></label>
        <label className="text-xs font-semibold text-muted-foreground">Duração (min)<input type="number" className={`${fieldClass} mt-1 w-28`} value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label>
        <Button variant="editorial" size="sm" onClick={add}>Adicionar horário</Button>
        {err && <p className="w-full text-sm text-destructive">{err}</p>}
      </div>
      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {(q.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhum horário futuro.</p>}
        {(q.data ?? []).map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
            <span className="flex-1">{new Date(s.starts_at).toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            <span className={s.is_available ? "text-primary" : "text-muted-foreground"}>{s.is_available ? "Disponível" : "Bloqueado"}</span>
            <Button size="sm" variant="paper" onClick={() => toggle(s.id, !s.is_available)}>{s.is_available ? "Bloquear" : "Liberar"}</Button>
            <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>Excluir</Button>
          </div>
        ))}
      </div>
    </div>
  );
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
