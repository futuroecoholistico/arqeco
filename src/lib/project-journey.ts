// Client journey: maps the stored project status to the 8 visible stages and the next action.
export const STANDARD_BUSINESS_DAYS = 15;

export const JOURNEY_STAGES = [
  "Contratação confirmada",
  "Agendamento da reunião",
  "Briefing do cliente",
  "Reunião de briefing",
  "Desenvolvimento",
  "Primeira apresentação",
  "Revisões",
  "Entrega final",
] as const;

export type StageState = "done" | "waiting_client" | "in_progress" | "pending";

export type JourneyInput = {
  status: string;
  hasMeeting: boolean;
  briefingSubmitted: boolean;
  meetingDone: boolean;
  openRevisions?: number;
};

const ORDER = ["PAYMENT_CONFIRMED", "BRIEFING_PENDING", "BRIEFING_COMPLETED", "BRIEFING_VALIDATED", "MEETING_1", "DEVELOPMENT", "PRESENTATION", "ADJUSTMENTS", "APPROVAL", "FINAL_DELIVERY", "CERTIFICATION_REVIEW", "CERTIFIED", "COMPLETED"];
const at = (s: string, ref: string) => ORDER.indexOf(s) >= ORDER.indexOf(ref);

export function journeyStates(p: JourneyInput): StageState[] {
  const final = at(p.status, "FINAL_DELIVERY");
  const presented = at(p.status, "PRESENTATION");
  const dev = p.meetingDone || at(p.status, "DEVELOPMENT");
  return [
    "done",
    p.hasMeeting || dev ? "done" : "waiting_client",
    p.briefingSubmitted || dev ? "done" : "waiting_client",
    dev ? "done" : p.hasMeeting ? "in_progress" : "pending",
    presented ? "done" : dev ? "in_progress" : "pending",
    presented && p.status !== "PRESENTATION" ? "done" : p.status === "PRESENTATION" ? "waiting_client" : "pending",
    final ? "done" : p.status === "ADJUSTMENTS" ? "in_progress" : p.status === "APPROVAL" ? "waiting_client" : "pending",
    final ? "done" : "pending",
  ];
}

export function nextAction(p: JourneyInput): string {
  if (at(p.status, "FINAL_DELIVERY")) return "Seu projeto final está disponível.";
  if (p.status === "APPROVAL") return "Seu projeto foi atualizado e aguarda sua aprovação final.";
  if (p.status === "ADJUSTMENTS") return "Suas revisões estão em andamento com a arquiteta.";
  if (p.status === "PRESENTATION") return "Sua primeira apresentação está disponível. Avalie e, se quiser, solicite revisões.";
  if (p.meetingDone || p.status === "DEVELOPMENT") return "Seu projeto está em desenvolvimento.";
  if (!p.hasMeeting) return "Agende sua reunião de briefing.";
  if (!p.briefingSubmitted) return "Preencha seu briefing e envie as medidas do ambiente.";
  return "Prepare-se para a reunião de briefing.";
}

/** Adds business days (Mon–Fri, skipping listed holidays as YYYY-MM-DD). Mirrors public.add_business_days. */
export function addBusinessDays(start: Date, days: number, holidays: string[] = []): Date {
  const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  let n = 0;
  while (n < days) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6 && !holidays.includes(d.toISOString().slice(0, 10))) n++;
  }
  return d;
}

export function formatDateBR(iso: string | null | undefined) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

export const FILE_CATEGORIES: { key: string; label: string; hint: string }[] = [
  { key: "apresentacao", label: "Apresentação", hint: "Primeira versão do projeto para avaliação." },
  { key: "layout", label: "Layout", hint: "Planta com a distribuição dos ambientes e mobiliário." },
  { key: "cortes", label: "Cortes e elevações", hint: "Desenhos técnicos e detalhamentos previstos no serviço." },
  { key: "iluminacao", label: "Iluminação", hint: "Indicação dos pontos e soluções de iluminação." },
  { key: "3d", label: "Vistas em 3D", hint: "Imagens para visualização do ambiente projetado." },
  { key: "materiais", label: "Lista de materiais", hint: "Materiais, acabamentos, mobiliário e produtos especificados." },
  { key: "links", label: "Links para compra", hint: "Produtos e fornecedores indicados pela arquiteta." },
  { key: "outros", label: "Outros arquivos", hint: "Documentos complementares." },
];

export const REVISION_LABEL: Record<string, string> = { requested: "Revisão solicitada", in_progress: "Revisão em andamento", updated: "Projeto atualizado", closed: "Encerrada" };
