import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Download, ExternalLink, FileText, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnerShell, fieldClass } from "@/components/PartnerShell";
import { supabase } from "@/integrations/supabase/client";
import { DeadlineCard, JourneyTimeline } from "@/components/ProjectJourney";
import { FILE_CATEGORIES, REVISION_LABEL, formatDateBR } from "@/lib/project-journey";

export const Route = createFileRoute("/_authenticated/projeto/$projectId")({
  head: () => ({
    meta: [
      { title: "Passaporte do projeto — Minha ARQECO" },
      { name: "description", content: "Histórico completo do seu projeto ARQECO: etapas, prazos, arquivos e revisões." },
      { property: "og:title", content: "Passaporte do projeto — Minha ARQECO" },
      { property: "og:description", content: "Acompanhe cada etapa do seu projeto de interiores sustentável." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjectPassport,
});

const STATUS_PT: Record<string, string> = { PAYMENT_CONFIRMED: "Contratação confirmada", BRIEFING_PENDING: "Aguardando briefing", BRIEFING_COMPLETED: "Briefing preenchido", BRIEFING_VALIDATED: "Briefing validado", MEETING_1: "Reunião agendada", DEVELOPMENT: "Projeto em desenvolvimento", PRESENTATION: "Primeira entrega disponível", ADJUSTMENTS: "Revisão em andamento", APPROVAL: "Aguardando aprovação final", FINAL_DELIVERY: "Projeto final entregue", CERTIFICATION_REVIEW: "Em certificação", CERTIFIED: "Certificado", COMPLETED: "Concluído" };

function ProjectPassport() {
  const { projectId } = Route.useParams();
  const q = useQuery({
    queryKey: ["passport", projectId],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id,name,service_name,status,created_at,delivery_mode,delivery_business_days,briefing_meeting_done_at,first_delivery_due,booking_id,briefings(status,submitted_at),service_bookings(id,total_cents,paid_at,urgent_delivery,appointment_slot_id,appointment_slots(starts_at),rooms),project_status_history(status,note,created_at)").eq("id", projectId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const p = q.data;
  if (q.isLoading) return <PartnerShell eyebrow="Minha ARQECO" title="Passaporte do projeto"><p className="text-sm text-muted-foreground">Carregando…</p></PartnerShell>;
  if (!p) return <PartnerShell eyebrow="Minha ARQECO" title="Passaporte do projeto"><p className="text-sm text-muted-foreground">Projeto não encontrado.</p></PartnerShell>;
  const b = Array.isArray(p.briefings) ? p.briefings[0] : p.briefings;
  const bk = p.service_bookings;
  const rooms = Array.isArray(bk?.rooms) ? (bk.rooms as { name?: string; area_m2?: number }[]) : [];
  const journey = { status: p.status, hasMeeting: !!bk?.appointment_slot_id, briefingSubmitted: b?.status === "submitted", meetingDone: !!p.briefing_meeting_done_at };
  const history = [...(p.project_status_history ?? [])].sort((a, c) => c.created_at.localeCompare(a.created_at));
  const presented = ["PRESENTATION", "ADJUSTMENTS", "APPROVAL"].includes(p.status);
  const finished = ["FINAL_DELIVERY", "COMPLETED", "CERTIFIED", "CERTIFICATION_REVIEW"].includes(p.status);

  return (
    <PartnerShell eyebrow="Minha ARQECO" title="Passaporte do projeto">
      <main className="mx-auto max-w-5xl space-y-8 px-5 py-10">
        <Link to="/painel" className="inline-flex items-center gap-2 text-sm text-primary"><ArrowLeft className="size-4" /> Voltar para meus projetos</Link>
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Passaporte do projeto</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">{p.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Pedido nº {(p.booking_id ?? p.id).slice(0, 8).toUpperCase()} · contratado em {formatDateBR(bk?.paid_at ?? p.created_at)} · {STATUS_PT[p.status] ?? p.status}</p>
          {rooms.length > 0 && <p className="mt-2 text-sm">Ambientes: {rooms.map((r) => `${r.name}${r.area_m2 ? ` (${r.area_m2} m²)` : ""}`).join(" · ")}</p>}
        </header>
        <section className="border border-border bg-card p-6"><JourneyTimeline input={journey} /></section>
        <DeadlineCard mode={p.delivery_mode} days={p.delivery_business_days} meetingDoneAt={p.briefing_meeting_done_at} due={p.first_delivery_due} />
        {presented && <section className="border border-primary bg-card p-6"><p className="font-display text-2xl font-semibold">Seu projeto está pronto para avaliação!</p><p className="mt-1 text-sm text-muted-foreground">Veja os arquivos abaixo. Se quiser ajustes, descreva-os no formulário de revisões, conforme as condições do serviço contratado.</p></section>}
        {finished && <section className="border border-primary bg-card p-6"><p className="font-display text-2xl font-semibold">Seu projeto ArqEco está concluído!</p><p className="mt-1 text-sm text-muted-foreground">Agora você tem as informações necessárias para planejar a transformação do seu ambiente com mais segurança, consciência e personalidade.</p></section>}
        <ProjectFiles projectId={p.id} />
        {(presented || finished) && <Revisions projectId={p.id} canRequest={presented} />}
        <section className="grid gap-4 sm:grid-cols-2">
          <Button asChild variant="paper"><Link to="/briefing/$projectId" params={{ projectId: p.id }}><FileText /> Ver meu briefing</Link></Button>
          <Button asChild variant="paper"><Link to="/guia-medicao"><Ruler /> Aprender a medir meu ambiente</Link></Button>
        </section>
        <section>
          <h2 className="font-display text-2xl font-semibold">Histórico</h2>
          <ol className="mt-4 space-y-3 border-l border-border pl-5 text-sm">
            {history.map((h, i) => <li key={i}><p className="font-semibold">{STATUS_PT[h.status] ?? h.status}</p><p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString("pt-BR")}{h.note ? ` · ${h.note}` : ""}</p></li>)}
            {b?.submitted_at && <li><p className="font-semibold">Briefing enviado</p><p className="text-xs text-muted-foreground">{new Date(b.submitted_at).toLocaleString("pt-BR")}</p></li>}
            <li><p className="font-semibold">Contratação confirmada</p><p className="text-xs text-muted-foreground">{new Date(bk?.paid_at ?? p.created_at).toLocaleString("pt-BR")}</p></li>
          </ol>
        </section>
      </main>
    </PartnerShell>
  );
}

function ProjectFiles({ projectId }: { projectId: string }) {
  const q = useQuery({ queryKey: ["project-files", projectId], queryFn: async () => (await supabase.from("project_files").select("id,title,category,stage,storage_path,external_url,created_at").eq("project_id", projectId).order("created_at", { ascending: false })).data ?? [] });
  async function open(path: string) {
    const { data, error } = await supabase.storage.from("project-files").createSignedUrl(path, 600);
    if (error || !data) return alert("Não foi possível abrir o arquivo agora.");
    window.open(data.signedUrl, "_blank", "noopener");
  }
  const files = q.data ?? [];
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">Meus arquivos do projeto</h2>
      {files.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Os arquivos aparecem aqui assim que a arquiteta disponibilizar a primeira apresentação.</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {FILE_CATEGORIES.map((c) => { const list = files.filter((f) => f.category === c.key); if (!list.length) return null; return (
          <div key={c.key} className="border border-border bg-card p-5">
            <p className="font-display text-xl font-semibold">{c.label}</p><p className="text-xs text-muted-foreground">{c.hint}</p>
            <ul className="mt-3 space-y-2 text-sm">{list.map((f) => <li key={f.id}>
              {f.external_url ? <a href={f.external_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"><ExternalLink className="size-4" /> {f.title}</a>
                : <button type="button" onClick={() => open(f.storage_path!)} className="inline-flex items-center gap-2 text-left text-primary underline-offset-4 hover:underline"><Download className="size-4" /> {f.title}</button>}
              <span className="ml-2 text-xs text-muted-foreground">{formatDateBR(f.created_at)}</span></li>)}</ul>
          </div>); })}
      </div>
    </section>
  );
}

function Revisions({ projectId, canRequest }: { projectId: string; canRequest: boolean }) {
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const q = useQuery({ queryKey: ["revisions", projectId], queryFn: async () => (await supabase.from("revision_requests").select("id,message,status,response,created_at").eq("project_id", projectId).order("created_at", { ascending: false })).data ?? [] });
  async function send() {
    if (text.trim().length < 3) return;
    setState("saving");
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("revision_requests").insert({ project_id: projectId, client_id: u.user!.id, message: text.trim().slice(0, 4000) });
    setState(error ? "error" : "ok"); if (!error) { setText(""); qc.invalidateQueries({ queryKey: ["revisions", projectId] }); }
  }
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">Revisões</h2>
      {canRequest && <div className="mt-4 border border-border bg-card p-5">
        <label className="text-sm font-semibold" htmlFor="rev">Descreva os ajustes desejados</label>
        <textarea id="rev" className={`${fieldClass} mt-2 h-28 w-full py-2`} value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex.: trocar a cor do sofá, aproximar a mesa da janela…" />
        <Button className="mt-3" variant="editorial" onClick={send} disabled={state === "saving" || text.trim().length < 3}>{state === "saving" ? "Enviando…" : "Solicitar revisões"}</Button>
        {state === "ok" && <p className="mt-2 text-sm text-primary">Solicitação enviada para a arquiteta.</p>}
        {state === "error" && <p className="mt-2 text-sm text-destructive">Não foi possível enviar. Tente novamente.</p>}
      </div>}
      <ul className="mt-4 space-y-3">{(q.data ?? []).map((r) => <li key={r.id} className="border border-border bg-card p-4 text-sm"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{REVISION_LABEL[r.status] ?? r.status} · {formatDateBR(r.created_at)}</p><p className="mt-1 whitespace-pre-wrap">{r.message}</p>{r.response && <p className="mt-2 border-l-2 border-primary pl-3 text-muted-foreground">Arquiteta: {r.response}</p>}</li>)}</ul>
    </section>
  );
}
