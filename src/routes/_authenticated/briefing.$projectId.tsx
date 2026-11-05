import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, FileText, Loader2, Plus, Trash2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  BRIEFING_STEPS, BUDGETS, EXISTING_ACTIONS, FEEL_NO, FEEL_YES, FILE_CATEGORIES, HOUSEHOLD_FLAGS, PRIORITIES, PROJECT_FOR,
  PROPERTY_SITUATION, PROPERTY_TYPES, ROOM_CATALOG, ROOM_ITEMS, START_WHEN, USES, computeProgress, uid,
  type BriefingAnswers, type RoomNeeds,
} from "@/lib/briefing/config";
import { aestheticProfile, projectDNA, type VisualOption } from "@/lib/briefing/profile";
import { BriefingAnswersView, DNACard, type BriefingFile } from "@/components/briefing/BriefingView";

export const Route = createFileRoute("/_authenticated/briefing/$projectId")({
  head: () => ({
    meta: [
      { title: "Briefing ARQECO — seu espaço começa por você" },
      { name: "description", content: "Responda o briefing do seu projeto de interiores ARQECO: rotina, estilo, cores, materiais e necessidades." },
      { property: "og:title", content: "Briefing ARQECO" },
      { property: "og:description", content: "Seu espaço começa a ser projetado a partir de você." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BriefingPage,
});

const STATUS_LABEL: Record<string, string> = { draft: "Em andamento", submitted: "Recebido", in_review: "Em análise", approved: "Aprovado", revision_requested: "Revisão solicitada" };

function BriefingPage() {
  const { projectId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();

  const data = useQuery({
    queryKey: ["briefing", projectId],
    queryFn: async () => {
      const { data: project, error } = await supabase.from("projects").select("id,name,client_id,status").eq("id", projectId).single();
      if (error) throw error;
      let { data: briefing } = await supabase.from("briefings").select("*").eq("project_id", projectId).maybeSingle();
      if (!briefing && project.client_id === user.id) {
        const ins = await supabase.from("briefings").insert({ project_id: projectId, client_id: user.id }).select("*").single();
        briefing = ins.data;
      }
      const [{ data: options }, { data: isAdmin }] = await Promise.all([
        supabase.from("briefing_visual_options").select("id,kind,name,description,image_url,tags,colors").eq("is_active", true).order("sort_order"),
        supabase.rpc("is_admin"),
      ]);
      return { project, briefing, options: (options ?? []) as VisualOption[], isAdmin: isAdmin === true };
    },
  });

  const files = useQuery({
    queryKey: ["briefing-files", data.data?.briefing?.id],
    enabled: !!data.data?.briefing?.id,
    queryFn: async () => {
      const { data: rows } = await supabase.from("briefing_files").select("id,file_name,category,mime_type,storage_path").eq("briefing_id", data.data!.briefing!.id).order("created_at");
      return Promise.all((rows ?? []).map(async (r) => ({ ...r, url: (await supabase.storage.from("briefing-files").createSignedUrl(r.storage_path, 3600)).data?.signedUrl ?? null })));
    },
  });

  if (data.isLoading) return <Shell><p className="text-sm text-muted-foreground">Carregando…</p></Shell>;
  if (data.error || !data.data?.briefing) return <Shell><p className="text-sm text-muted-foreground">Não encontramos este briefing.</p><Button asChild variant="paper" className="mt-6"><Link to="/painel">Voltar aos meus projetos</Link></Button></Shell>;

  const { project, briefing, options, isAdmin } = data.data;
  const canEdit = briefing.client_id === user.id && (briefing.status === "draft" || briefing.status === "revision_requested");
  const reload = () => { qc.invalidateQueries({ queryKey: ["briefing", projectId] }); qc.invalidateQueries({ queryKey: ["briefing-files"] }); };

  if (!canEdit) {
    const a = (briefing.answers ?? {}) as BriefingAnswers;
    return (
      <Shell back={isAdmin ? "/admin" : briefing.client_id === user.id ? "/painel" : "/profissional"}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Briefing · {STATUS_LABEL[briefing.status] ?? briefing.status}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">{project.name}</h1>
        {briefing.submitted_at && <p className="mt-2 text-sm text-muted-foreground">Enviado em {new Date(briefing.submitted_at).toLocaleString("pt-BR")}</p>}
        {isAdmin && <AdminStatus id={briefing.id} status={briefing.status} notes={briefing.admin_notes} onSaved={reload} />}
        <div className="mt-8"><DNACard dna={(briefing.project_dna as never) ?? projectDNA(a, options)} profile={briefing.aesthetic_profile} /></div>
        <div className="mt-6"><BriefingAnswersView a={a} options={options} files={(files.data ?? []) as BriefingFile[]} /></div>
        <section className="mt-6 border border-dashed border-border p-5 text-sm text-muted-foreground"><p className="font-semibold text-foreground">Resumo inteligente e leitura Eco-Holística</p><p className="mt-1">Em breve. A estrutura já está preparada; a análise nunca substitui a decisão da arquiteta.</p></section>
      </Shell>
    );
  }

  return <Wizard briefing={briefing} projectName={project.name} options={options} files={(files.data ?? []) as (BriefingFile & { storage_path: string })[]} userId={user.id} userEmail={user.email ?? ""} onFilesChanged={() => qc.invalidateQueries({ queryKey: ["briefing-files"] })} onSubmitted={reload} />;
}

function AdminStatus({ id, status, notes, onSaved }: { id: string; status: string; notes: string | null; onSaved: () => void }) {
  const [s, setS] = useState(status);
  const [n, setN] = useState(notes ?? "");
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-6 grid gap-3 border border-border bg-card p-4 md:grid-cols-[220px_1fr_auto] md:items-end">
      <label className="text-xs font-semibold">Situação
        <select className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={s} onChange={(e) => setS(e.target.value)}>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold">Anotações da equipe<Input className="mt-1" value={n} onChange={(e) => setN(e.target.value)} maxLength={2000} /></label>
      <Button variant="editorial" disabled={busy} onClick={async () => { setBusy(true); await supabase.from("briefings").update({ status: s, admin_notes: n || null }).eq("id", id); setBusy(false); onSaved(); }}>Salvar</Button>
    </div>
  );
}

function Shell({ children, back = "/painel" }: { children: ReactNode; back?: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link to="/" className="font-display text-xl font-semibold tracking-wide">ARQECO</Link>
          <Link to={back} className="text-xs uppercase tracking-[0.16em] opacity-70 hover:opacity-100">Voltar</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 lg:py-14">{children}</main>
    </div>
  );
}

type BriefingRow = { id: string; answers: Json; current_step: number; status: string };

function Wizard({ briefing, projectName, options, files, userId, userEmail, onFilesChanged, onSubmitted }: {
  briefing: BriefingRow; projectName: string; options: VisualOption[]; files: (BriefingFile & { storage_path: string })[];
  userId: string; userEmail: string; onFilesChanged: () => void; onSubmitted: () => void;
}) {
  const [a, setA] = useState<BriefingAnswers>(() => ({ email: userEmail, ...((briefing.answers ?? {}) as BriefingAnswers) }));
  const [step, setStep] = useState(Math.min(briefing.current_step ?? 0, BRIEFING_STEPS.length - 1));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [done, setDone] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setSaveState("saving");
    const t = setTimeout(async () => {
      await supabase.from("briefings").update({ answers: a as Json, current_step: step, progress: computeProgress(a) }).eq("id", briefing.id);
      setSaveState("saved");
    }, 900);
    return () => clearTimeout(t);
  }, [a, step, briefing.id]);

  const set = <K extends keyof BriefingAnswers>(k: K, v: BriefingAnswers[K]) => setA((p) => ({ ...p, [k]: v }));
  const go = (n: number) => { setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const byKind = (k: string) => options.filter((o) => o.kind === k);

  if (done) return <Shell><Confirmation fileCount={files.length} /></Shell>;

  return (
    <Shell>
      <div className="mb-10">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Briefing ARQECO · {projectName}</p><p className="mt-1 text-xs text-muted-foreground">Etapa {step + 1} de {BRIEFING_STEPS.length} · {BRIEFING_STEPS[step]}</p></div>
          <p className="text-[11px] text-muted-foreground" aria-live="polite">{saveState === "saving" ? "Salvando…" : saveState === "saved" ? "Salvo automaticamente" : ""}</p>
        </div>
        <div className="mt-4 flex gap-1.5" aria-hidden>{BRIEFING_STEPS.map((s, i) => <button key={s} type="button" onClick={() => go(i)} className={`h-1 flex-1 transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} title={s} />)}</div>
      </div>

      {step === 0 && (
        <section className="grid gap-10 md:grid-cols-[1.2fr_.8fr] md:items-end">
          <div>
            <p className="font-display text-lg italic text-primary">Seu espaço começa a ser projetado a partir de você.</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">Vamos começar pelo que realmente importa: você.</h1>
            <p className="mt-6 max-w-xl text-muted-foreground">Antes de escolher móveis, cores e materiais, queremos entender como você vive, o que precisa e o que deseja sentir no seu espaço.</p>
            <Button variant="editorial" size="lg" className="mt-10" onClick={() => go(1)}>Começar meu briefing <ArrowRight /></Button>
          </div>
          <div className="space-y-4 border-l border-border pl-6 text-sm">
            <p className="flex items-center gap-3"><Clock className="size-4 text-primary" /> Tempo aproximado: 10–15 minutos</p>
            <p className="flex items-center gap-3"><Check className="size-4 text-primary" /> Você poderá salvar e continuar depois.</p>
          </div>
        </section>
      )}

      {step === 1 && (
        <Step title="Conte um pouco sobre você." text="Quem é você e quem vai viver este espaço.">
          <Grid>
            <F label="Nome completo"><Input value={a.fullName ?? ""} onChange={(e) => set("fullName", e.target.value)} maxLength={100} autoComplete="name" /></F>
            <F label="E-mail"><Input type="email" value={a.email ?? ""} onChange={(e) => set("email", e.target.value)} maxLength={255} /></F>
            <F label="WhatsApp"><Input type="tel" value={a.phone ?? ""} onChange={(e) => set("phone", e.target.value)} maxLength={20} /></F>
          </Grid>
          <Q title="Este projeto é para:"><Chips options={PROJECT_FOR} value={a.projectFor ? [a.projectFor] : []} onChange={(v) => set("projectFor", v[0])} single /></Q>
          {a.projectFor === "Outro" && <Input placeholder="Conte qual" value={a.projectForOther ?? ""} onChange={(e) => set("projectForOther", e.target.value)} maxLength={100} />}
          <Q title="Quem utiliza este espaço?">
            <div className="space-y-3">
              {(a.people ?? []).map((p, i) => (
                <div key={p.id} className="grid gap-3 border border-border bg-card p-4 sm:grid-cols-3">
                  <Input placeholder="Nome" value={p.name} onChange={(e) => set("people", (a.people ?? []).map((x, j) => j === i ? { ...x, name: e.target.value } : x))} maxLength={100} />
                  <Input placeholder="Idade" inputMode="numeric" value={p.age} onChange={(e) => set("people", (a.people ?? []).map((x, j) => j === i ? { ...x, age: e.target.value } : x))} maxLength={3} />
                  <Input placeholder="Relação com você" value={p.relation} onChange={(e) => set("people", (a.people ?? []).map((x, j) => j === i ? { ...x, relation: e.target.value } : x))} maxLength={60} />
                  <Input placeholder="Profissão / atividade" value={p.occupation} onChange={(e) => set("people", (a.people ?? []).map((x, j) => j === i ? { ...x, occupation: e.target.value } : x))} maxLength={100} />
                  <Input placeholder="Como utiliza o espaço" value={p.usage} onChange={(e) => set("people", (a.people ?? []).map((x, j) => j === i ? { ...x, usage: e.target.value } : x))} maxLength={300} />
                  <div className="flex gap-2"><Input placeholder="Observações" value={p.notes} onChange={(e) => set("people", (a.people ?? []).map((x, j) => j === i ? { ...x, notes: e.target.value } : x))} maxLength={500} /><ConfirmRemove onConfirm={() => set("people", (a.people ?? []).filter((_, j) => j !== i))} /></div>
                </div>
              ))}
              <Button type="button" variant="paper" onClick={() => set("people", [...(a.people ?? []), { id: uid(), name: "", age: "", relation: "", occupation: "", usage: "", notes: "" }])}><Plus /> Adicionar pessoa</Button>
            </div>
          </Q>
          <div className="grid gap-3 sm:grid-cols-2">
            {HOUSEHOLD_FLAGS.map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-3 border border-border bg-card px-4 py-3 text-sm">
                <span>{f.label}</span>
                <div className="flex gap-1">{[true, false].map((v) => <Button key={String(v)} type="button" size="sm" variant={a.household?.[f.key] === v ? "editorial" : "paper"} aria-pressed={a.household?.[f.key] === v} onClick={() => set("household", { ...a.household, [f.key]: v })}>{v ? "Sim" : "Não"}</Button>)}</div>
              </div>
            ))}
          </div>
          <F label="Existe alguma necessidade específica de acessibilidade, conforto ou uso?"><Textarea value={a.accessibility ?? ""} onChange={(e) => set("accessibility", e.target.value)} maxLength={1000} /></F>
        </Step>
      )}

      {step === 2 && (
        <Step title="Agora queremos conhecer o espaço." text="Conte sobre o imóvel e envie o que você já tiver.">
          <Q title="Tipo de imóvel"><Chips options={PROPERTY_TYPES} value={a.propertyType ? [a.propertyType] : []} onChange={(v) => set("propertyType", v[0])} single /></Q>
          <Q title="Situação"><Chips options={PROPERTY_SITUATION} value={a.propertySituation ? [a.propertySituation] : []} onChange={(v) => set("propertySituation", v[0])} single /></Q>
          <Grid>
            <F label="Cidade"><Input value={a.city ?? ""} onChange={(e) => set("city", e.target.value)} maxLength={100} /></F>
            <F label="Endereço"><Input value={a.address ?? ""} onChange={(e) => set("address", e.target.value)} maxLength={200} /></F>
            <F label="Área aproximada do imóvel (m²)"><Input inputMode="decimal" value={a.propertyArea ?? ""} onChange={(e) => set("propertyArea", e.target.value)} maxLength={10} /></F>
            <p className="self-end text-xs text-muted-foreground">A metragem de cada ambiente é informada na etapa de ambientes.</p>
          </Grid>
          <Q title="Quando pretende iniciar a execução?"><Chips options={START_WHEN} value={a.startWhen ? [a.startWhen] : []} onChange={(v) => set("startWhen", v[0])} single /></Q>
          <Uploader briefingId={briefing.id} userId={userId} files={files} onChanged={onFilesChanged} />
        </Step>
      )}

      {step === 3 && (
        <Step title="Quais ambientes vamos transformar?" text="Escolha todos que fazem parte do projeto. Depois, faremos perguntas só sobre eles.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {ROOM_CATALOG.map((r) => {
              const on = (a.rooms ?? []).some((x) => x.name === r.label);
              const locked = (a.rooms ?? []).some((x) => x.name === r.label && x.contracted);
              return <button key={r.label} type="button" aria-pressed={on} disabled={locked} title={locked ? "Ambiente contratado" : undefined} onClick={() => set("rooms", on ? (a.rooms ?? []).filter((x) => x.name !== r.label) : [...(a.rooms ?? []), { id: uid(), key: r.key, name: r.label }])} className={`flex min-h-20 items-end justify-between border p-4 text-left text-sm font-semibold transition-all ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary"}`}>{r.label}{on && <Check className="size-4" />}</button>;
            })}
          </div>
          <OtherRoom onAdd={(name) => set("rooms", [...(a.rooms ?? []), { id: uid(), key: "outro", name }])} />
          {(a.rooms ?? []).filter((r) => !ROOM_CATALOG.some((c) => c.label === r.name)).map((r) => <span key={r.id} className="mr-2 inline-flex items-center gap-2 rounded-full border border-primary px-3 py-1 text-sm">{r.name}{!r.contracted && <button type="button" aria-label={`Remover ${r.name}`} onClick={() => set("rooms", (a.rooms ?? []).filter((x) => x.id !== r.id))}><X className="size-3" /></button>}</span>)}
        </Step>
      )}

      {step === 4 && (
        <Step title="Agora queremos entender sua rotina." text="E como você quer se sentir no espaço.">
          <Q title="Como você normalmente utiliza os ambientes que serão projetados?"><Chips options={USES} value={a.uses ?? []} onChange={(v) => set("uses", v)} /></Q>
          <F label="Quais são os maiores desafios que você enfrenta hoje no espaço?"><Textarea value={a.challenges ?? ""} onChange={(e) => set("challenges", e.target.value)} maxLength={1500} /></F>
          <F label="Qual é o principal problema que você gostaria que o projeto resolvesse?"><Textarea value={a.mainProblem ?? ""} onChange={(e) => set("mainProblem", e.target.value)} maxLength={1500} /></F>
          <F label="O que você gostaria de conseguir fazer nesse espaço que hoje não consegue?"><Textarea value={a.wishToDo ?? ""} onChange={(e) => set("wishToDo", e.target.value)} maxLength={1500} /></F>
          <div className="bg-sidebar p-6 text-sidebar-foreground md:p-8">
            <h3 className="font-display text-2xl font-semibold md:text-3xl">Como você quer se sentir nesse ambiente?</h3>
            <p className="mt-1 text-xs opacity-60">Escolha até 5.</p>
            <div className="mt-5"><Chips dark options={FEEL_YES} value={a.feelYes ?? []} onChange={(v) => set("feelYes", v)} max={5} /></div>
            <h3 className="mt-8 font-display text-xl font-semibold">O que você NÃO quer sentir?</h3>
            <div className="mt-4"><Chips dark options={FEEL_NO} value={a.feelNo ?? []} onChange={(v) => set("feelNo", v)} /></div>
          </div>
          <F label="Complete: Eu quero que este espaço seja um lugar onde eu possa…"><Textarea value={a.spaceIs ?? ""} onChange={(e) => set("spaceIs", e.target.value)} maxLength={1000} /></F>
        </Step>
      )}

      {step === 5 && (
        <Step title="Qual dessas atmosferas mais combina com você?" text="Escolha pelas imagens. Não existe resposta certa.">
          <Q title="Estilos que você ama" hint="até 3"><ImageCards options={byKind("style")} value={a.styles ?? []} onChange={(v) => set("styles", v)} max={3} /></Q>
          <Q title="Existe algum estilo que você definitivamente não gostaria?" hint="até 2"><Chips options={byKind("style").map((o) => o.name)} value={(a.stylesNo ?? []).map((id) => options.find((o) => o.id === id)?.name ?? "")} onChange={(v) => set("stylesNo", v.map((n) => byKind("style").find((o) => o.name === n)?.id ?? "").filter(Boolean))} max={2} /></Q>
          <Q title="Você gostaria de misturar estilos?"><Chips options={["Sim", "Não"]} value={a.mixStyles === undefined ? [] : [a.mixStyles ? "Sim" : "Não"]} onChange={(v) => set("mixStyles", v[0] === undefined ? undefined : v[0] === "Sim")} single /></Q>
          {a.mixStyles && <Q title="Quais estilos você gostaria de combinar?" hint="até 3"><Chips options={byKind("style").map((o) => o.name)} value={(a.stylesMix ?? []).map((id) => options.find((o) => o.id === id)?.name ?? "")} onChange={(v) => set("stylesMix", v.map((n) => byKind("style").find((o) => o.name === n)?.id ?? "").filter(Boolean))} max={3} /></Q>}
          <Divider />
          <Q title="Quais cores fazem você se sentir em casa?" hint="até 3"><ImageCards options={byKind("palette")} value={a.palettes ?? []} onChange={(v) => set("palettes", v)} max={3} /></Q>
          <Grid>
            <F label="Existe alguma cor que você ama?"><Input value={a.colorsLove ?? ""} onChange={(e) => set("colorsLove", e.target.value)} maxLength={200} /></F>
            <F label="Existe alguma cor que você não quer usar?"><Input value={a.colorsAvoid ?? ""} onChange={(e) => set("colorsAvoid", e.target.value)} maxLength={200} /></F>
          </Grid>
          <Divider />
          <Q title="Que materiais traduzem a atmosfera que você deseja?" hint="até 5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {byKind("material").map((m) => { const on = (a.materials ?? []).includes(m.id); const full = !on && (a.materials ?? []).length >= 5; return (
                <button key={m.id} type="button" disabled={full} aria-pressed={on} onClick={() => set("materials", on ? (a.materials ?? []).filter((x) => x !== m.id) : [...(a.materials ?? []), m.id])} className={`flex items-center gap-3 border p-3 text-left text-sm transition-all disabled:opacity-40 ${on ? "border-primary ring-1 ring-primary" : "border-border bg-card hover:border-primary"}`}>
                  {m.image_url ? <img src={m.image_url} alt="" className="size-10 object-cover" loading="lazy" /> : <span className="size-10 shrink-0 border border-border" style={{ background: m.colors[0] }} />}
                  <span className="flex-1 font-semibold">{m.name}</span>{on && <Check className="size-4 text-primary" />}
                </button>); })}
            </div>
          </Q>
          <Q title="Qual combinação de materiais mais representa o que você imagina?" hint="1 a 3"><ImageCards options={byKind("moodboard")} value={a.moodboards ?? []} onChange={(v) => set("moodboards", v)} max={3} tall /></Q>
        </Step>
      )}

      {step === 6 && (
        <Step title="Necessidades de cada ambiente." text="Perguntas só sobre os ambientes que você escolheu.">
          {(a.rooms ?? []).length === 0 && <p className="border-l-2 border-primary pl-4 text-sm text-muted-foreground">Você ainda não escolheu ambientes. <button type="button" className="underline" onClick={() => go(3)}>Escolher agora</button></p>}
          {(a.rooms ?? []).map((r) => { const n: RoomNeeds = a.roomNeeds?.[r.id] ?? { items: [], usage: "", problem: "", change: "", mustHave: "" }; const upd = (p: Partial<RoomNeeds>) => set("roomNeeds", { ...a.roomNeeds, [r.id]: { ...n, ...p } }); return (
            <div key={r.id} className="border border-border bg-card p-5 md:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Módulo</p>
              <div className="flex flex-wrap items-end justify-between gap-3"><h3 className="font-display text-2xl font-semibold">{r.name}</h3>{r.contracted && <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Contratado</span>}</div>
              <label className="mt-3 flex max-w-xs items-center gap-2 text-sm">Metragem (m²)<Input inputMode="decimal" value={r.area ?? ""} onChange={(e) => set("rooms", (a.rooms ?? []).map((x) => x.id === r.id ? { ...x, area: e.target.value } : x))} maxLength={6} /></label>
              {ROOM_ITEMS[r.key].length > 0 && <div className="mt-4"><p className="mb-2 text-sm font-semibold">O que não pode faltar nesse ambiente?</p><Chips options={ROOM_ITEMS[r.key]} value={n.items} onChange={(v) => upd({ items: v })} /></div>}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input placeholder="Objetivo: o que você quer com este ambiente?" value={n.usage} onChange={(e) => upd({ usage: e.target.value })} maxLength={500} />
                <Input placeholder="Problemas a solucionar" value={n.problem} onChange={(e) => upd({ problem: e.target.value })} maxLength={500} />
                <Input placeholder="Solução esperada com a reforma" value={n.change} onChange={(e) => upd({ change: e.target.value })} maxLength={500} />
                <Input placeholder="Outros itens (ex.: TV de 55 polegadas)" value={n.mustHave} onChange={(e) => upd({ mustHave: e.target.value })} maxLength={500} />
              </div>
            </div>); })}
          <Q title="Móveis e objetos que você já tem">
            <div className="space-y-2">
              {(a.existing ?? []).map((e, i) => (
                <div key={e.id} className="grid gap-2 sm:grid-cols-[1fr_170px_1fr_auto]">
                  <Input placeholder="Ex.: sofá cinza 3 lugares" value={e.name} onChange={(ev) => set("existing", (a.existing ?? []).map((x, j) => j === i ? { ...x, name: ev.target.value } : x))} maxLength={120} />
                  <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={e.action} onChange={(ev) => set("existing", (a.existing ?? []).map((x, j) => j === i ? { ...x, action: ev.target.value } : x))}>{EXISTING_ACTIONS.map((o) => <option key={o}>{o}</option>)}</select>
                  <Input placeholder="Observações" value={e.notes} onChange={(ev) => set("existing", (a.existing ?? []).map((x, j) => j === i ? { ...x, notes: ev.target.value } : x))} maxLength={300} />
                  <ConfirmRemove onConfirm={() => set("existing", (a.existing ?? []).filter((_, j) => j !== i))} />
                </div>
              ))}
              <Button type="button" variant="paper" onClick={() => set("existing", [...(a.existing ?? []), { id: uid(), name: "", action: "Manter", notes: "" }])}><Plus /> Adicionar item</Button>
            </div>
          </Q>
          <Q title="Quanto pretende investir na execução?"><Chips options={BUDGETS} value={a.budget ? [a.budget] : []} onChange={(v) => set("budget", v[0])} single /></Q>
          <Q title="O que é mais importante para você?" hint="até 3"><Chips options={PRIORITIES} value={a.priorities ?? []} onChange={(v) => set("priorities", v)} max={3} /></Q>
          <F label="Links de referências (Pinterest, Instagram…)"><Textarea value={a.referenceLinks ?? ""} onChange={(e) => set("referenceLinks", e.target.value)} maxLength={2000} placeholder="Cole um link por linha. Imagens podem ser enviadas na etapa do imóvel." /></F>
          <div className="border-t border-border pt-8">
            <p className="font-display text-2xl italic">Agora imagine que o projeto está pronto.</p>
            <div className="mt-5 grid gap-5">
              <F label="Qual é a transformação que você mais deseja perceber?"><Textarea value={a.transformation ?? ""} onChange={(e) => set("transformation", e.target.value)} maxLength={1500} /></F>
              <F label="O que faria você olhar para esse ambiente e pensar: “Agora sim, este espaço tem a minha cara”?"><Textarea value={a.myFace ?? ""} onChange={(e) => set("myFace", e.target.value)} maxLength={1500} /></F>
            </div>
          </div>
        </Step>
      )}

      {step === 7 && <Review a={a} options={options} files={files} briefingId={briefing.id} onEdit={go} onDone={() => { setDone(true); onSubmitted(); }} />}

      {step > 0 && step < 7 && (
        <div className="mt-12 flex justify-between gap-3 border-t border-border pt-6">
          <Button type="button" variant="paper" onClick={() => go(step - 1)}><ArrowLeft /> Voltar</Button>
          <Button type="button" variant="editorial" onClick={() => go(step + 1)}>Continuar <ArrowRight /></Button>
        </div>
      )}
    </Shell>
  );
}

function Review({ a, options, files, briefingId, onEdit, onDone }: { a: BriefingAnswers; options: VisualOption[]; files: BriefingFile[]; briefingId: string; onEdit: (n: number) => void; onDone: () => void }) {
  const [c, setC] = useState({ accurate: false, files: false, images: false, marketing: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const profile = useMemo(() => aestheticProfile(a, options), [a, options]);
  const dna = useMemo(() => projectDNA(a, options), [a, options]);
  const consents: [keyof typeof c, string][] = [
    ["accurate", "Confirmo que as informações fornecidas estão corretas e autorizo o desenvolvimento do projeto com base neste briefing."],
    ["files", "Estou ciente de que plantas, medidas, fotos e demais informações são necessárias para o desenvolvimento do projeto."],
    ["images", "Autorizo a utilização das imagens do ambiente conforme os termos definidos pela ArqEco."],
    ["marketing", "Quero receber comunicações da ArqEco."],
  ];
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold md:text-5xl">Seu briefing está pronto.</h1>
      <p className="mt-3 text-muted-foreground">Confira tudo. Você pode editar qualquer etapa antes de enviar.</p>
      <div className="mt-8"><DNACard dna={dna} profile={profile} /></div>
      <div className="mt-6"><BriefingAnswersView a={a} options={options} files={files} onEdit={onEdit} /></div>
      <div className="mt-8 space-y-3">
        {consents.map(([k, label]) => <label key={k} className="flex cursor-pointer items-start gap-3 border border-border bg-card p-4 text-sm"><Checkbox checked={c[k]} onCheckedChange={(v) => setC({ ...c, [k]: v === true })} className="mt-0.5" /><span>{label}{(k === "accurate" || k === "files") && <span className="text-primary"> *</span>}</span></label>)}
      </div>
      <blockquote className="mt-10 border-l-2 border-primary pl-5 font-display text-xl italic leading-relaxed md:text-2xl">Seu espaço começa muito antes do projeto. Ele começa quando entendemos quem você é, como você vive e o que deseja sentir.</blockquote>
      {error && <p role="alert" className="mt-6 text-sm text-destructive">{error}</p>}
      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Button type="button" variant="paper" onClick={() => onEdit(6)}><ArrowLeft /> Voltar</Button>
        <Button type="button" variant="editorial" size="lg" disabled={busy || !c.accurate || !c.files} onClick={async () => {
          setBusy(true); setError(undefined);
          const { error: e } = await supabase.rpc("submit_briefing", { _briefing_id: briefingId, _aesthetic_profile: profile ?? "", _project_dna: dna as unknown as Json, _consents: c as unknown as Json });
          setBusy(false);
          if (e) { setError("Não foi possível enviar agora. Suas respostas estão salvas; tente novamente."); return; }
          onDone();
        }}>{busy ? <Loader2 className="animate-spin" /> : null} Finalizar briefing</Button>
      </div>
    </div>
  );
}

function Confirmation({ fileCount }: { fileCount: number }) {
  return (
    <section className="border-t-2 border-primary pt-10">
      <p className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"><Check /></p>
      <h1 className="mt-6 font-display text-4xl font-semibold md:text-5xl">Briefing recebido.</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">Agora temos uma visão muito mais completa sobre você, seu espaço e o que deseja transformar. Essas informações serão analisadas pela nossa equipe para orientar o desenvolvimento do seu projeto.</p>
      <ul className="mt-8 space-y-2 text-sm">
        <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Briefing enviado</li>
        <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> {fileCount ? `${fileCount} arquivo(s) recebido(s)` : "Arquivos podem ser enviados depois, se necessário"}</li>
        <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> Informações registradas</li>
      </ul>
      <p className="mt-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">Situação: briefing recebido</p>
      <Button asChild variant="editorial" className="mt-8"><Link to="/painel">Ir para meus projetos</Link></Button>
    </section>
  );
}

function Uploader({ briefingId, userId, files, onChanged }: { briefingId: string; userId: string; files: (BriefingFile & { storage_path: string })[]; onChanged: () => void }) {
  const [category, setCategory] = useState(FILE_CATEGORIES[0]!);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  async function upload(list: FileList | null) {
    if (!list?.length) return;
    setBusy(true); setError(undefined);
    for (const file of Array.from(list)) {
      if (file.size > 50 * 1024 * 1024) { setError(`${file.name} passa de 50 MB.`); continue; }
      const path = `${userId}/${briefingId}/${uid()}-${file.name.replace(/[^\w.-]+/g, "_").slice(-80)}`;
      const up = await supabase.storage.from("briefing-files").upload(path, file, { contentType: file.type });
      if (up.error) { setError(`Não foi possível enviar ${file.name}.`); continue; }
      await supabase.from("briefing_files").insert({ briefing_id: briefingId, client_id: userId, storage_path: path, file_name: file.name.slice(0, 200), mime_type: file.type || null, size_bytes: file.size, category });
    }
    setBusy(false); onChanged();
  }
  return (
    <div className="border border-dashed border-primary/50 bg-card p-5 md:p-6">
      <h3 className="font-display text-2xl font-semibold">Envie o que você já tem.</h3>
      <p className="mt-1 text-sm text-muted-foreground">Não tem planta? Não tem problema. Envie o que tiver disponível.</p>
      <div className="mt-4"><Chips options={FILE_CATEGORIES} value={[category]} onChange={(v) => v[0] && setCategory(v[0])} single /></div>
      <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 border border-border bg-background p-6 text-sm font-semibold hover:border-primary">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} {busy ? "Enviando…" : `Escolher arquivos (${category.toLowerCase()})`}
        <input type="file" multiple className="sr-only" accept="image/*,video/*,application/pdf,.dwg,.dxf,.skp" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} disabled={busy} />
      </label>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {files.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {files.map((f) => (
            <div key={f.id} className="relative border border-border bg-background">
              {f.mime_type?.startsWith("image/") && f.url ? <img src={f.url} alt={f.file_name} className="aspect-square w-full object-cover" /> : <div className="grid aspect-square place-items-center"><FileText className="size-8 text-primary" /></div>}
              <p className="truncate px-2 py-1 text-xs">{f.file_name}</p>
              <p className="px-2 pb-1 text-[10px] text-muted-foreground">{f.category}</p>
              <div className="absolute right-1 top-1"><ConfirmRemove small onConfirm={async () => { await supabase.storage.from("briefing-files").remove([f.storage_path]); await supabase.from("briefing_files").delete().eq("id", f.id); onChanged(); }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OtherRoom({ onAdd }: { onAdd: (name: string) => void }) {
  const [v, setV] = useState("");
  return <div className="flex max-w-md gap-2"><Input placeholder="Outro ambiente (dê um nome)" value={v} onChange={(e) => setV(e.target.value)} maxLength={60} /><Button type="button" variant="paper" disabled={v.trim().length < 2} onClick={() => { onAdd(v.trim()); setV(""); }}><Plus /> Adicionar</Button></div>;
}

function ConfirmRemove({ onConfirm, small }: { onConfirm: () => void; small?: boolean }) {
  const [ask, setAsk] = useState(false);
  if (ask) return <div className="flex gap-1 bg-background"><Button type="button" size="sm" variant="destructive" onClick={() => { setAsk(false); onConfirm(); }}>Remover</Button><Button type="button" size="sm" variant="ghost" onClick={() => setAsk(false)}>Não</Button></div>;
  return <Button type="button" size={small ? "sm" : "icon"} variant="ghost" aria-label="Remover" onClick={() => setAsk(true)}><Trash2 /></Button>;
}

function Step({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return <section><h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">{title}</h1>{text && <p className="mt-3 max-w-2xl text-muted-foreground">{text}</p>}<div className="mt-10 space-y-8">{children}</div></section>;
}
function Q({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return <div><p className="mb-3 text-sm font-semibold">{title}{hint && <span className="ml-2 text-xs font-normal text-muted-foreground">({hint})</span>}</p>{children}</div>;
}
function F({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-semibold"><span className="mb-2 block">{label}</span><span className="font-normal">{children}</span></label>;
}
const Grid = ({ children }: { children: ReactNode }) => <div className="grid gap-5 sm:grid-cols-2">{children}</div>;
const Divider = () => <div className="h-px bg-border" />;

function Chips({ options, value, onChange, single, max, dark }: { options: string[]; value: string[]; onChange: (v: string[]) => void; single?: boolean; max?: number; dark?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        const full = !single && !on && max != null && value.length >= max;
        const base = dark ? (on ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground" : "border-sidebar-border hover:border-sidebar-foreground") : (on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary");
        return <button key={o} type="button" aria-pressed={on} disabled={full} onClick={() => onChange(single ? (on ? [] : [o]) : on ? value.filter((x) => x !== o) : [...value, o])} className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-35 ${base}`}>{o}</button>;
      })}
    </div>
  );
}

function ImageCards({ options, value, onChange, max, tall }: { options: VisualOption[]; value: string[]; onChange: (v: string[]) => void; max: number; tall?: boolean }) {
  if (!options.length) return <p className="text-sm text-muted-foreground">Em breve.</p>;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((o) => {
        const on = value.includes(o.id);
        const full = !on && value.length >= max;
        return (
          <button key={o.id} type="button" aria-pressed={on} disabled={full} onClick={() => onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])} className={`group relative overflow-hidden border text-left transition-all disabled:opacity-40 ${on ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary"}`}>
            <div className={`${tall ? "aspect-[3/4]" : "aspect-[4/3]"} overflow-hidden bg-secondary`}>
              {o.image_url ? <img src={o.image_url} alt={o.name} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="grid size-full place-items-center p-6 text-center font-display text-3xl italic text-muted-foreground">{o.name}</div>}
            </div>
            {o.colors.length > 0 && <div className="flex h-3">{o.colors.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}</div>}
            <div className="bg-card p-4"><p className="font-display text-xl font-semibold">{o.name}</p>{o.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{o.description}</p>}</div>
            {on && <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-4" /></span>}
          </button>
        );
      })}
    </div>
  );
}
