import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { fieldClass } from "@/components/PartnerShell";

const STATUS: Record<string, string> = { draft: "Em andamento", submitted: "Recebido", in_review: "Em análise", approved: "Aprovado", revision_requested: "Revisão solicitada" };

export function BriefingsAdmin() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const rows = useQuery({
    queryKey: ["admin-briefings"],
    queryFn: async () => (await supabase.from("briefings").select("id,status,progress,submitted_at,updated_at,aesthetic_profile,answers,project_id,projects(name)").order("updated_at", { ascending: false })).data ?? [],
  });
  const list = useMemo(() => (rows.data ?? []).filter((r) => {
    const a = (r.answers ?? {}) as { fullName?: string; rooms?: { name: string }[] };
    const hay = `${a.fullName ?? ""} ${r.projects?.name ?? ""} ${r.aesthetic_profile ?? ""} ${(a.rooms ?? []).map((x) => x.name).join(" ")}`.toLowerCase();
    return (!status || r.status === status) && (!q || hay.includes(q.toLowerCase()));
  }), [rows.data, status, q]);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <select className={`${fieldClass} max-w-[220px]`} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar situação"><option value="">Todas as situações</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <Input className="max-w-sm" placeholder="Buscar cliente, ambiente ou estilo" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {list.length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhum briefing ainda. Eles aparecem quando um pagamento de plano é confirmado.</p>}
        {list.map((r) => {
          const a = (r.answers ?? {}) as { fullName?: string; rooms?: { name: string }[] };
          return (
            <div key={r.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.fullName || "Cliente"} · {r.projects?.name}</p>
                <p className="text-xs text-muted-foreground">{(a.rooms ?? []).map((x) => x.name).join(", ") || "Ambientes não informados"}{r.aesthetic_profile ? ` · ${r.aesthetic_profile}` : ""}</p>
              </div>
              <span className="text-xs text-muted-foreground">{r.submitted_at ? new Date(r.submitted_at).toLocaleDateString("pt-BR") : `${r.progress}%`}</span>
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold">{STATUS[r.status] ?? r.status}</span>
              <Button asChild size="sm" variant="paper"><Link to="/briefing/$projectId" params={{ projectId: r.project_id }}>Abrir <ArrowRight /></Link></Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const KINDS: [string, string][] = [["style", "Estilos"], ["palette", "Paletas de cores"], ["material", "Materiais"], ["moodboard", "Combinações (moodboards)"]];

export function VisualLibraryAdmin() {
  const qc = useQueryClient();
  const [kind, setKind] = useState("style");
  const items = useQuery({
    queryKey: ["admin-visual", kind],
    queryFn: async () => (await supabase.from("briefing_visual_options").select("*").eq("kind", kind).order("sort_order")).data ?? [],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-visual"] });
  async function add() {
    await supabase.from("briefing_visual_options").insert({ kind, name: "Novo item", sort_order: (items.data?.length ?? 0) + 1 });
    refresh();
  }
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">{KINDS.map(([k, l]) => <Button key={k} size="sm" variant={kind === k ? "editorial" : "paper"} onClick={() => setKind(k)}>{l}</Button>)}<Button size="sm" variant="paper" onClick={add} className="ml-auto">+ Adicionar</Button></div>
      <div className="grid gap-4 md:grid-cols-2">
        {(items.data ?? []).map((it) => <VisualItem key={it.id} item={it} onSaved={refresh} />)}
      </div>
    </div>
  );
}

type Item = { id: string; name: string; description: string | null; image_url: string | null; tags: string[]; colors: string[]; sort_order: number; is_active: boolean };

function VisualItem({ item, onSaved }: { item: Item; onSaved: () => void }) {
  const [f, setF] = useState({ name: item.name, description: item.description ?? "", image_url: item.image_url ?? "", tags: item.tags.join(", "), colors: item.colors.join(", "), sort_order: item.sort_order, is_active: item.is_active });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>();
  async function uploadImage(file?: File) {
    if (!file) return;
    setBusy(true);
    const path = `library/${item.id}-${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_").slice(-60)}`;
    const up = await supabase.storage.from("briefing-files").upload(path, file, { contentType: file.type });
    if (up.error) { setMsg("Falha no envio."); setBusy(false); return; }
    const signed = await supabase.storage.from("briefing-files").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setF((p) => ({ ...p, image_url: signed.data?.signedUrl ?? p.image_url }));
    setBusy(false); setMsg("Imagem enviada — clique em salvar.");
  }
  async function save() {
    setBusy(true);
    await supabase.from("briefing_visual_options").update({
      name: f.name.trim().slice(0, 80) || "Sem nome", description: f.description.trim() || null, image_url: f.image_url.trim() || null,
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean), colors: f.colors.split(",").map((t) => t.trim()).filter((c) => /^#[0-9a-f]{3,8}$/i.test(c)),
      sort_order: Number(f.sort_order) || 0, is_active: f.is_active,
    }).eq("id", item.id);
    setBusy(false); setMsg("Salvo."); onSaved();
  }
  return (
    <div className={`flex gap-4 border border-border bg-card p-4 ${f.is_active ? "" : "opacity-60"}`}>
      <div className="w-28 shrink-0">
        {f.image_url ? <img src={f.image_url} alt={f.name} className="aspect-square w-full object-cover" /> : <div className="grid aspect-square place-items-center bg-secondary text-xs text-muted-foreground">Sem imagem</div>}
        {f.colors && <div className="mt-1 flex h-2">{f.colors.split(",").map((c) => c.trim()).filter(Boolean).map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}</div>}
        <label className="mt-2 flex cursor-pointer items-center justify-center gap-1 text-[11px] font-semibold text-primary"><Upload className="size-3" /> Trocar<input type="file" accept="image/*" className="sr-only" onChange={(e) => uploadImage(e.target.files?.[0])} /></label>
      </div>
      <div className="grid min-w-0 flex-1 gap-2 text-xs">
        <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-label="Nome" />
        <Input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Descrição curta" />
        <Input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="Tags internas, separadas por vírgula" />
        <Input value={f.colors} onChange={(e) => setF({ ...f, colors: e.target.value })} placeholder="Cores (#hex, separadas por vírgula)" />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1"><input type="checkbox" checked={f.is_active} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Ativo</label>
          <label className="flex items-center gap-1">Ordem<Input type="number" className="h-8 w-16" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} /></label>
          <Button size="sm" variant="editorial" className="ml-auto" disabled={busy} onClick={save}>Salvar</Button>
        </div>
        {msg && <p className="text-muted-foreground">{msg}</p>}
      </div>
    </div>
  );
}
