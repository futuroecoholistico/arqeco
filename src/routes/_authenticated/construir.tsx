import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Building2, CalendarDays, Check, Clock, MapPin, UserRound } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { createConstructionInquiry, scheduleConstructionMeeting } from "@/lib/construction.functions";

export const Route = createFileRoute("/_authenticated/construir")({
  head: () => ({
    meta: [
      { title: "Construir com a ARQECO" },
      { name: "description", content: "Conte à ARQECO o que você pretende construir e agende uma primeira conversa." },
      { property: "og:title", content: "Construir com a ARQECO" },
      { property: "og:description", content: "Solicite um projeto de arquitetura sustentável e agende uma conversa com a equipe ARQECO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({ tipo: search["tipo"] === "clinica" ? ("clinica" as const) : undefined }),
  component: ConstructionPage,
});

const inquirySchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome completo.").max(100),
  email: z.string().trim().email("Informe um e-mail válido.").max(255),
  phone: z.string().trim().regex(/^[0-9()+ -]{10,20}$/, "Informe um telefone válido."),
  postalCode: z.string().trim().regex(/^\d{5}-?\d{3}$/, "Informe um CEP válido."),
  city: z.string().trim().min(2, "Informe a cidade.").max(100),
  state: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Use a sigla do estado."),
  description: z.string().trim().min(10, "Conte um pouco mais sobre o que pretende construir.").max(1500),
  scope: z.enum(["project_only", "project_build_followup"], { message: "Escolha o tipo de atendimento." }),
  timeline: z.string().trim().min(2, "Informe quando pretende começar.").max(100),
});

type FormState = z.infer<typeof inquirySchema>;

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function ConstructionPage() {
  const { tipo } = Route.useSearch();
  const clinic = tipo === "clinica";
  const [budget, setBudget] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormState>({ fullName: "", email: "", phone: "", postalCode: "", city: "", state: "", description: "", scope: "project_only", timeline: "" });
  const [inquiryId, setInquiryId] = useState<string>();
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const slots = useQuery({
    queryKey: ["construction-appointment-slots"],
    queryFn: async () => {
      const { data, error: queryError } = await supabase.from("appointment_slots").select("id,starts_at,ends_at").eq("is_available", true).gt("starts_at", new Date().toISOString()).order("starts_at");
      if (queryError) throw queryError;
      return data ?? [];
    },
  });
  const availableDays = useMemo(() => new Set((slots.data ?? []).map((slot) => new Date(slot.starts_at).toDateString())), [slots.data]);
  const daySlots = useMemo(() => selectedDay ? (slots.data ?? []).filter((slot) => new Date(slot.starts_at).toDateString() === selectedDay.toDateString()) : [], [selectedDay, slots.data]);

  async function submitInquiry() {
    const prefix = clinic ? "[Well Spaces Business] " : "";
    const budgetNote = budget.trim() ? `\n\nOrçamento estimado: ${budget.trim()}` : "";
    const parsed = inquirySchema.safeParse({ ...form, description: `${prefix}${form.description}${budgetNote}`.slice(0, 1500) });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revise os dados informados."); return; }
    setBusy(true); setError(undefined);
    try {
      const result = await createConstructionInquiry({ data: parsed.data });
      setInquiryId(result.id); setStep(2);
    } catch { setError("Não foi possível enviar sua solicitação. Tente novamente."); }
    setBusy(false);
  }

  async function scheduleMeeting() {
    if (!inquiryId || !selectedSlot) { setError("Escolha um horário para a conversa."); return; }
    setBusy(true); setError(undefined);
    try {
      await scheduleConstructionMeeting({ data: { inquiryId, slotId: selectedSlot } });
      setStep(3);
    } catch (scheduleError) {
      setError(scheduleError instanceof Error && scheduleError.message.includes("slot_not_available") ? "Este horário acabou de ser reservado. Escolha outro." : "Não foi possível marcar a reunião.");
      await slots.refetch();
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5"><Link to="/" className="font-display text-2xl font-semibold">ARQECO</Link><p className="hidden text-xs uppercase tracking-[0.16em] opacity-65 sm:block">Arquitetura consciente</p></div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Voltar ao site</Link>
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          <section>
            {step === 1 && <>
              {clinic
                ? <StepTitle icon={Building2} eyebrow="Well Spaces Business" title="Solicite o orçamento do seu espaço comercial." text="Lojas, escritórios, clínicas, consultórios, spas e restaurantes. Conte sobre o espaço, os atendimentos e o orçamento que imagina para receber uma proposta sob medida." />
                : <StepTitle icon={Building2} eyebrow="Construção sustentável" title="Conte o que você deseja construir." text="Vamos conhecer o seu momento, o imóvel e o tipo de apoio que você procura." />}
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Field label="Nome completo" className="sm:col-span-2"><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} maxLength={100} autoComplete="name" /></Field>
                <Field label="E-mail"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} autoComplete="email" /></Field>
                <Field label="Telefone"><Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} autoComplete="tel" /></Field>
                <Field label="CEP do imóvel"><Input inputMode="numeric" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} maxLength={9} autoComplete="postal-code" /></Field>
                <Field label="Cidade"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={100} autoComplete="address-level2" /></Field>
                <Field label="Estado (UF)"><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} maxLength={2} autoComplete="address-level1" /></Field>
                <Field label="Quando pretende começar?"><Select value={form.timeline} onValueChange={(value) => setForm({ ...form, timeline: value })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="Até 3 meses">Até 3 meses</SelectItem><SelectItem value="De 3 a 6 meses">De 3 a 6 meses</SelectItem><SelectItem value="De 6 a 12 meses">De 6 a 12 meses</SelectItem><SelectItem value="Mais de 1 ano">Mais de 1 ano</SelectItem><SelectItem value="Ainda estou planejando">Ainda estou planejando</SelectItem></SelectContent></Select></Field>
                <Field label={clinic ? "Conte sobre o seu espaço (tipo de atendimento, metragem, número de salas)" : "O que você pretende construir?"} className="sm:col-span-2"><textarea className="min-h-36 w-full border border-input bg-background px-3 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={1500} placeholder="Conte sobre o imóvel, o terreno, as necessidades e o que imagina para o projeto." /></Field>
                <Field label="Orçamento estimado para o projeto (opcional)" className="sm:col-span-2"><Input value={budget} onChange={(e) => setBudget(e.target.value)} maxLength={80} placeholder="Ex.: até R$ 15.000" /></Field>
                <fieldset className="sm:col-span-2"><legend className="mb-3 text-sm font-semibold">Como podemos ajudar?</legend><div className="grid gap-3 sm:grid-cols-2"><ScopeOption selected={form.scope === "project_only"} title="Somente o projeto" text="Arquitetura e documentos previstos na proposta." onClick={() => setForm({ ...form, scope: "project_only" })} /><ScopeOption selected={form.scope === "project_build_followup"} title="Projeto, obra e acompanhamento" text="Uma jornada integrada do projeto à execução." onClick={() => setForm({ ...form, scope: "project_build_followup" })} /></div></fieldset>
              </div>
              <div className="mt-8 flex justify-end"><Button variant="editorial" onClick={submitInquiry} disabled={busy}>{busy ? "Enviando…" : "Enviar e escolher reunião"} <ArrowRight /></Button></div>
            </>}
            {step === 2 && <>
              <StepTitle icon={CalendarDays} eyebrow="Conversa inicial" title="Escolha um horário para nos conhecermos." text="Sua solicitação já foi recebida. Agora marque uma primeira conversa com a equipe ARQECO." />
              <div className="mt-8 grid gap-6 md:grid-cols-[auto_1fr]"><div className="border border-border bg-card p-2"><Calendar mode="single" selected={selectedDay} onSelect={(day) => { setSelectedDay(day); setSelectedSlot(undefined); }} disabled={(day) => !availableDays.has(day.toDateString())} /></div><div><p className="text-sm font-semibold">{selectedDay ? formatDay(selectedDay) : "Selecione uma data disponível"}</p><div className="mt-4 grid grid-cols-2 gap-3">{daySlots.map((slot) => <Button key={slot.id} type="button" variant={selectedSlot === slot.id ? "editorial" : "paper"} onClick={() => setSelectedSlot(slot.id)} aria-pressed={selectedSlot === slot.id}><Clock /> {formatTime(slot.starts_at)}</Button>)}</div>{selectedDay && daySlots.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Não há horários disponíveis neste dia.</p>}</div></div>
              <div className="mt-8 flex flex-wrap justify-between gap-3"><Button variant="paper" onClick={() => setStep(3)}>Agendar depois</Button><Button variant="editorial" onClick={scheduleMeeting} disabled={busy || !selectedSlot}>{busy ? "Agendando…" : "Confirmar reunião"} <ArrowRight /></Button></div>
            </>}
            {step === 3 && <div className="border-t-2 border-primary pt-10"><p className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"><Check /></p><h1 className="mt-6 font-display text-4xl font-semibold md:text-5xl">Recebemos seu projeto.</h1><p className="mt-4 max-w-2xl text-muted-foreground">A equipe ARQECO vai analisar as informações e entrar em contato. {selectedSlot ? "Sua conversa também está agendada." : "Você poderá combinar a melhor data durante o contato."}</p><Button asChild variant="editorial" className="mt-8"><Link to="/painel">Ir para meus projetos</Link></Button></div>}
            {error && <p role="alert" className="mt-6 border-l-2 border-destructive pl-4 text-sm text-destructive">{error}</p>}
          </section>
          <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-8"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Construir com consciência</p><h2 className="mt-3 font-display text-2xl font-semibold">Uma conversa antes da proposta.</h2><div className="mt-6 space-y-5 text-sm text-muted-foreground"><Info icon={UserRound} title="Entendemos você" text="Seus dados e sua intenção ficam reunidos no pedido." /><Info icon={MapPin} title="Conhecemos o contexto" text="Localização, prazo e visão orientam a análise inicial." /><Info icon={CalendarDays} title="Marcamos a conversa" text="Você escolhe um horário disponível ou agenda depois." /></div></aside>
        </div>
      </main>
    </div>
  );
}

function StepTitle({ icon: Icon, eyebrow, title, text }: { icon: typeof Building2; eyebrow: string; title: string; text: string }) { return <div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary"><Icon className="size-4" />{eyebrow}</p><h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold md:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{text}</p></div>; }
function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) { return <div className={className}><Label className="mb-2 block">{label}</Label>{children}</div>; }
function ScopeOption({ selected, title, text, onClick }: { selected: boolean; title: string; text: string; onClick: () => void }) { return <button type="button" onClick={onClick} aria-pressed={selected} className={`min-h-28 border p-4 text-left transition-colors ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/60"}`}><span className="block font-semibold">{title}</span><span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{text}</span></button>; }
function Info({ icon: Icon, title, text }: { icon: typeof UserRound; title: string; text: string }) { return <div className="flex gap-3"><Icon className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="font-semibold text-foreground">{title}</p><p className="mt-1 text-xs leading-relaxed">{text}</p></div></div>; }