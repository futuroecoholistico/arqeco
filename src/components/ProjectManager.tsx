import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/PartnerShell";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { FILE_CATEGORIES, REVISION_LABEL, formatDateBR } from "@/lib/project-journey";

type Status = Database["public"]["Enums"]["project_status"];
const STATUS_OPTIONS: [Status, string][] = [
  ["BRIEFING_PENDING", "Aguardando briefing"], ["BRIEFING_COMPLETED", "Briefing preenchido"], ["MEETING_1", "Reunião agendada"],
  ["DEVELOPMENT", "Em desenvolvimento"], ["PRESENTATION", "Primeira entrega disponível"], ["ADJUSTMENTS", "Revisão em andamento"],
  ["APPROVAL", "Aguardando aprovação final"], ["FINAL_DELIVERY", "Projeto final entregue"], ["COMPLETED", "Concluído"],
];
const statusName = (s: string) => STATUS_OPTIONS.find(([k]) => k === s)?.[1] ?? s;
const FILTERS = [
  ["todos", "Todos"], ["briefing", "Aguardando briefing"], ["reuniao", "Reunião a confirmar"], ["dev", "Em desenvolvimento"],
  ["prioritaria", "Entrega prioritária"], ["revisoes", "Revisões solicitadas"], ["concluidos", "Concluídos"],
] as const;
const today = () => new Date().toISOString().slice(0, 10);

export function ProjectManager() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number][0]>("todos");
  const q = useQuery({
    queryKey: ["team-projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id,name,service_name,status,client_id,delivery_mode,delivery_business_days,briefing_meeting_done_at,first_delivery_due,internal_notes,created_at,briefings(status),service_bookings(full_name,email,phone),revision_requests(id,status)").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const rows = (q.data ?? []).filter((p) => {
    const b = Array.isArray(p.briefings) ? p.briefings[0] : p.briefings;
    if (filter === "briefing") return b?.status !== "submitted" && !p.briefing_meeting_done_at;
    if (filter === "reuniao") return !p.briefing_meeting_done_at;
    if (filter === "dev") return p.status === "DEVELOPMENT";
    if (filter === "prioritaria") return p.delivery_mode === "priority";
    if (filter === "revisoes") return p.revision_requests.some((r) => r.status === "requested");
    if (filter === "concluidos") return ["FINAL_DELIVERY", "COMPLETED", "CERTIFIED"].includes(p.status);
    return true;
  });
  const t = today();
  const late = (q.data ?? []).filter((p) => p.first_delivery_due && p.first_delivery_due < t && p.status === "DEVELOPMENT").length;
  const soon = (q.data ?? []).filter((p) => p.first_delivery_due && p.first_delivery_due >= t && p.status === "DEVELOPMENT" && (new Date(p.first_delivery_due).getTime() - Date.now()) / 864e5 <= 3).length;
  const refresh = () => qc.invalidateQueries({ queryKey: ["team-projects"] });

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Alert label="Prazo vencido" value={late} tone={late ? "destructive" : "muted"} />
        <Alert label="Prazo em até 3 dias" value={soon} tone={soon ? "primary" : "muted"} />
        <Alert label="Prioritários" value={(q.data ?? []).filter((p) => p.delivery_mode === "priority").length} tone="primary" />
      </div>
      <div className="flex flex-wrap gap-2">{FILTERS.map(([k, l]) => <Button key={k} size="sm" variant={filter === k ? "editorial" : "paper"} onClick={() => setFilter(k)}>{l}</Button>)}</div>
      {q.isLoading && <p className="text-sm text-muted-foreground">Carregando projetos…</p>}
      {q.error && <p className="text-sm text-destructive">Não foi possível carregar os projetos.</p>}
      {!q.isLoading && rows.length === 0 && <p className="border border-border bg-card p-5 text-sm text-muted-foreground">Nenhum projeto neste filtro.</p>}
      {rows.map((p) => <ProjectRow key={p.id} p={p} onChange={refresh} />)}
    </section>
  );
}

function Alert({ label, value, tone }: { label: string; value: number; tone: "destructive" | "primary" | "muted" }) {
  return <div className={`border bg-card p-4 ${tone === "destructive" ? "border-destructive text-destructive" : tone === "primary" ? "border-primary" : "border-border"}`}><p className="text-[10px] font-bold uppercase tracking-[0.18em]">{label}</p><p className="mt-1 font-display text-3xl font-semibold">{value}</p></div>;
}

type Row = { id: string; name: string; status: string; delivery_mode: string; delivery_business_days: number | null; briefing_meeting_done_at: string | null; first_delivery_due: string | null; internal_notes: string | null; service_bookings: { full_name: string | null; email: string | null; phone: string | null } | null };

function ProjectRow({ p, onChange }: { p: Row; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [doneOn, setDoneOn] = useState(today());
  const priority = p.delivery_mode === "priority";
  const overdue = p.first_delivery_due && p.first_delivery_due < today() && p.status === "DEVELOPMENT";

  async function run(fn: () => Promise<{ error: { message: string } | null }>, ok: string) {
    setBusy(true); setMsg(null);
    const { error } = await fn();
    setBusy(false); setMsg(error ? `Erro: ${error.message}` : ok);
    if (!error) onChange();
  }

  return (
    <article className={`border bg-card ${priority ? "border-primary border-l-4" : "border-border"}`}>
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-center gap-3 p-4 text-left text-sm">
        {priority && <span className="inline-flex items-center gap-1 bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground"><Zap className="size-3" /> Prioritária</span>}
        <span className="min-w-52 flex-1"><span className="font-semibold">{p.name}</span><span className="block text-xs text-muted-foreground">{p.service_bookings?.full_name} · {p.service_bookings?.email} · {p.service_bookings?.phone}</span></span>
        <span className="bg-secondary px-2 py-0.5 text-[11px] font-semibold">{statusName(p.status)}</span>
        <span className={`text-xs ${overdue ? "font-semibold text-destructive" : "text-muted-foreground"}`}>{overdue && <AlertTriangle className="mr-1 inline size-3" />}{p.first_delivery_due ? `1ª entrega ${formatDateBR(p.first_delivery_due)}` : "Prazo inicia após a reunião"}</span>
      </button>
      {open && (
        <div className="grid gap-6 border-t border-border p-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Prazo</p>
              <p className="mt-1 text-sm">{priority ? `Entrega prioritária · ${p.delivery_business_days ? `${p.delivery_business_days} dias úteis` : "dias úteis a definir no plano"}` : `Padrão · ${p.delivery_business_days ?? 15} dias úteis`}</p>
              {p.briefing_meeting_done_at ? <p className="text-sm text-muted-foreground">Reunião de briefing realizada em {formatDateBR(p.briefing_meeting_done_at)}.</p> : (
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <label className="text-xs">Data da reunião realizada<input type="date" max={today()} className={`${fieldClass} mt-1 block`} value={doneOn} onChange={(e) => setDoneOn(e.target.value)} /></label>
                  <Button size="sm" variant="editorial" disabled={busy} onClick={() => run(async () => await supabase.rpc("confirm_briefing_meeting", { _project_id: p.id, _done_on: doneOn }), "Reunião confirmada e prazo calculado.")}>Confirmar reunião de briefing realizada</Button>
                </div>
              )}
            </div>
            <label className="block text-xs">Status do projeto
              <select className={`${fieldClass} mt-1 block w-full`} value={p.status} disabled={busy} onChange={(e) => run(async () => await supabase.rpc("set_project_status", { _project_id: p.id, _status: e.target.value as Status }), "Status atualizado.")}>
                {STATUS_OPTIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
            <label className="block text-xs">Observações internas (o cliente não vê)
              <textarea className={`${fieldClass} mt-1 h-24 w-full py-2`} defaultValue={p.internal_notes ?? ""} onBlur={(e) => e.target.value !== (p.internal_notes ?? "") && run(async () => await supabase.from("projects").update({ internal_notes: e.target.value.slice(0, 4000) }).eq("id", p.id), "Observação salva.")} />
            </label>
            {msg && <p className={`text-xs ${msg.startsWith("Erro") ? "text-destructive" : "text-primary"}`}>{msg}</p>}
          </div>
          <div className="space-y-6"><FileUploader projectId={p.id} /><RevisionInbox projectId={p.id} onChange={onChange} /></div>
        </div>
      )}
    </article>
  );
}

function FileUploader({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const [category, setCategory] = useState("apresentacao");
  const [stage, setStage] = useState<"presentation" | "revision" | "final">("presentation");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [state, setState] = useState<string | null>(null);
  const files = useQuery({ queryKey: ["project-files", projectId], queryFn: async () => (await supabase.from("project_files").select("id,title,category,stage,created_at").eq("project_id", projectId).order("created_at", { ascending: false })).data ?? [] });
  const refresh = () => qc.invalidateQueries({ queryKey: ["project-files", projectId] });

  async function upload(file: File | undefined) {
    if (!file) return;
    setState("Enviando…");
    const path = `${projectId}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
    const up = await supabase.storage.from("project-files").upload(path, file);
    if (up.error) return setState(`Erro: ${up.error.message}`);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("project_files").insert({ project_id: projectId, category, stage, title: title.trim() || file.name, storage_path: path, uploaded_by: u.user!.id });
    setState(error ? `Erro: ${error.message}` : "Arquivo enviado."); setTitle(""); refresh();
  }
  async function addLink() {
    if (!/^https?:\/\//.test(url)) return setState("Informe um link começando com https://");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("project_files").insert({ project_id: projectId, category, stage, title: title.trim() || url, external_url: url, uploaded_by: u.user!.id });
    setState(error ? `Erro: ${error.message}` : "Link adicionado."); setUrl(""); setTitle(""); refresh();
  }
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Enviar arquivos ao cliente</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <select className={fieldClass} value={stage} onChange={(e) => setStage(e.target.value as typeof stage)} aria-label="Etapa"><option value="presentation">Primeira apresentação</option><option value="revision">Versão revisada</option><option value="final">Entrega final</option></select>
        <select className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Categoria">{FILE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
        <input className={`${fieldClass} sm:col-span-2`} placeholder="Título (opcional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="file" className="text-xs sm:col-span-2" onChange={(e) => upload(e.target.files?.[0])} aria-label="Arquivo" />
        <input className={fieldClass} placeholder="ou cole um link (compra, 3D…)" value={url} onChange={(e) => setUrl(e.target.value)} />
        <Button size="sm" variant="paper" onClick={addLink}>Adicionar link</Button>
      </div>
      {state && <p className="mt-2 text-xs text-muted-foreground">{state}</p>}
      <ul className="mt-3 space-y-1 text-xs">{(files.data ?? []).map((f) => <li key={f.id} className="flex justify-between gap-2 border-b border-border py-1"><span>{f.title}</span><span className="text-muted-foreground">{FILE_CATEGORIES.find((c) => c.key === f.category)?.label} · {formatDateBR(f.created_at)}</span></li>)}</ul>
    </div>
  );
}

function RevisionInbox({ projectId, onChange }: { projectId: string; onChange: () => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["revisions", projectId], queryFn: async () => (await supabase.from("revision_requests").select("id,message,status,response,created_at").eq("project_id", projectId).order("created_at", { ascending: false })).data ?? [] });
  async function answer(id: string, status: string, response?: string) {
    await supabase.from("revision_requests").update({ status, ...(response !== undefined ? { response: response.slice(0, 4000) } : {}) }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["revisions", projectId] }); onChange();
  }
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Solicitações de revisão</p>
      {(q.data ?? []).length === 0 && <p className="mt-2 text-xs text-muted-foreground">Nenhuma solicitação.</p>}
      {(q.data ?? []).map((r) => (
        <div key={r.id} className="mt-2 border border-border p-3 text-xs">
          <p className="whitespace-pre-wrap">{r.message}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select className={fieldClass} value={r.status} onChange={(e) => answer(r.id, e.target.value)} aria-label="Situação da revisão">{Object.entries(REVISION_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          </div>
          <textarea className={`${fieldClass} mt-2 h-16 w-full py-2`} placeholder="Resposta ao cliente" defaultValue={r.response ?? ""} onBlur={(e) => e.target.value !== (r.response ?? "") && answer(r.id, r.status, e.target.value)} />
        </div>
      ))}
    </div>
  );
}
