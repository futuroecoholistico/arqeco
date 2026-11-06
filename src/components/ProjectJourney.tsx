import { Check, Clock, Zap } from "lucide-react";
import { JOURNEY_STAGES, journeyStates, formatDateBR, STANDARD_BUSINESS_DAYS, type JourneyInput } from "@/lib/project-journey";

const STATE_LABEL = { done: "Concluída", waiting_client: "Aguardando você", in_progress: "Em andamento", pending: "Pendente" } as const;

export function JourneyTimeline({ input }: { input: JourneyInput }) {
  const states = journeyStates(input);
  return (
    <ol className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {JOURNEY_STAGES.map((s, i) => {
        const st = states[i];
        return (
          <li key={s} className="flex items-start gap-3 sm:flex-col sm:gap-2">
            <span className={`grid size-7 shrink-0 place-items-center rounded-full border text-[11px] ${st === "done" ? "border-primary bg-primary text-primary-foreground" : st === "pending" ? "border-border text-muted-foreground" : "border-primary text-primary"}`}>{st === "done" ? <Check className="size-3.5" /> : i + 1}</span>
            <span><span className="block text-xs font-semibold leading-tight">{s}</span><span className={`text-[10px] uppercase tracking-wide ${st === "waiting_client" ? "font-bold text-primary" : "text-muted-foreground"}`}>{STATE_LABEL[st]}</span></span>
          </li>
        );
      })}
    </ol>
  );
}

export function DeadlineCard({ mode, days, meetingDoneAt, due }: { mode: string; days: number | null; meetingDoneAt: string | null; due: string | null }) {
  const priority = mode === "priority";
  return (
    <section className={`border bg-card p-6 ${priority ? "border-primary" : "border-border"}`}>
      <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{priority ? <><Zap className="size-3.5" /> Entrega prioritária</> : <><Clock className="size-3.5" /> Primeira entrega</>}</p>
      {priority
        ? <p className="mt-2 font-display text-2xl font-semibold">Prazo contratado: {days ? `${days} dias úteis` : "definido pela equipe ARQECO"}</p>
        : <p className="mt-2 font-display text-2xl font-semibold">Até {days ?? STANDARD_BUSINESS_DAYS} dias úteis após sua primeira reunião de briefing</p>}
      {meetingDoneAt
        ? <p className="mt-2 text-sm">Reunião realizada em {formatDateBR(meetingDoneAt)}{due ? <> · <strong>previsão da primeira entrega: {formatDateBR(due)}</strong></> : ""}</p>
        : <p className="mt-2 text-sm text-muted-foreground">Seu prazo de desenvolvimento será iniciado após a realização da primeira reunião de briefing com a arquiteta.</p>}
      <p className="mt-2 text-xs text-muted-foreground">O prazo se refere à primeira apresentação do projeto, não à conclusão das revisões ou à entrega final.</p>
    </section>
  );
}
