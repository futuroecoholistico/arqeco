import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Check, ClipboardList, HandCoins, Ruler } from "lucide-react";
import { DeadlineCard, JourneyTimeline } from "@/components/ProjectJourney";
import { formatDateBR, nextAction } from "@/lib/project-journey";
import { PaidBookingSchedule } from "@/components/PaidBookingSchedule";
import { Button } from "@/components/ui/button";
import { JournalSection } from "@/components/JournalSection";
import { PartnerShell, CategoryBoundary } from "@/components/PartnerShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Meus projetos — ARQECO" },
      { name: "description", content: "Acompanhe seus projetos ARQECO e responda o briefing para dar início ao seu projeto." },
      { property: "og:title", content: "Meus projetos — ARQECO" },
      { property: "og:description", content: "Seus projetos de design de interiores sustentável em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <CategoryBoundary category="client"><ClientDashboard /></CategoryBoundary>,
});


function ClientDashboard() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const projects = useQuery({
    queryKey: ["my-projects"],
    queryFn: async () => (await supabase.from("projects").select("id,name,service_name,status,created_at,booking_id,delivery_mode,delivery_business_days,briefing_meeting_done_at,first_delivery_due,briefings(status,progress,answers),service_bookings(paid_at,appointment_slot_id)").eq("client_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });
  const bookings = useQuery({
    queryKey: ["my-meeting-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_bookings").select("id,projects(id)").eq("client_id", user.id).eq("payment_status", "paid").eq("status", "confirmed");
      if (error) throw error;
      return data ?? [];
    },
  });
  const firstName = (user.user_metadata?.["full_name"] as string | undefined)?.split(" ")[0];

  return (
    <PartnerShell eyebrow="Cliente" title="Meus projetos">
      <main className="mx-auto max-w-5xl px-5 py-10 lg:py-14">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Meus projetos</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Olá{firstName ? `, ${firstName}` : ""}!</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{(projects.data ?? []).length ? "Seu projeto está em andamento. Acompanhe cada etapa da transformação do seu espaço." : "Bem-vindo à Minha ARQECO."}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="border border-border bg-card p-6"><BookOpen className="size-5 text-primary" /><p className="mt-3 font-display text-2xl font-semibold">Manual do cliente</p><p className="mt-1 text-sm text-muted-foreground">Tudo sobre etapas, prazos, revisões e entregas. Leia online ou baixe em PDF.</p><Button asChild variant="editorial" size="sm" className="mt-4"><Link to="/manual">Acessar meu manual</Link></Button></div>
          <div className="border border-border bg-card p-6"><Ruler className="size-5 text-primary" /><p className="mt-3 font-display text-2xl font-semibold">Não tem a planta?</p><p className="mt-1 text-sm text-muted-foreground">Aprenda a medir paredes, portas, janelas e pontos de instalação.</p><Button asChild variant="paper" size="sm" className="mt-4"><Link to="/guia-medicao">Aprender a medir meu ambiente</Link></Button></div>
          <div className="border border-border bg-card p-6"><HandCoins className="size-5 text-primary" /><p className="mt-3 font-display text-2xl font-semibold">Indique e ganhe</p><p className="mt-1 text-sm text-muted-foreground">Cadastre-se como afiliado ou creator e receba 15% de comissão em cada plano vendido e 10 ecos por Dossiê Start.</p><Button asChild variant="editorial" size="sm" className="mt-4"><Link to="/afiliado">Quero ser afiliado <ArrowRight /></Link></Button></div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="editorial"><Link to="/diagnostico">Criar Dossiê gratuito <ArrowRight /></Link></Button><Button asChild variant="paper"><Link to="/meus-diagnosticos">Meus dossiês</Link></Button></div>
        {projects.isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>}
        {!projects.isLoading && (projects.data ?? []).length === 0 && (
          <div className="mt-10 border border-border bg-card p-8">
            <p className="font-display text-2xl font-semibold">Você ainda não tem projetos.</p>
            <p className="mt-2 text-sm text-muted-foreground">Depois que o pagamento do seu plano for confirmado, seu projeto aparece aqui com o briefing para começar.</p>
            <Button asChild variant="editorial" className="mt-6"><Link to="/" hash="planos">Ver planos <ArrowRight /></Link></Button>
          </div>
        )}

        <a href="https://wa.me/5511964710505" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground">Falar com nosso time no WhatsApp · (11) 96471-0505</a>

        <div className="mt-10 space-y-6">
          {(projects.data ?? []).map((p) => {
            const b = Array.isArray(p.briefings) ? p.briefings[0] : p.briefings;
            const open = !b || b.status === "draft" || b.status === "revision_requested";
            const bk = p.service_bookings;
            const journey = { status: p.status, hasMeeting: !!bk?.appointment_slot_id, briefingSubmitted: b?.status === "submitted", meetingDone: !!p.briefing_meeting_done_at };
            return (
              <article key={p.id} className="border border-border bg-card">
                <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
                  <div>
                    <h2 className="font-display text-3xl font-semibold">{p.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{p.service_name} · Pedido nº {(p.booking_id ?? p.id).slice(0, 8).toUpperCase()} · contratado em {formatDateBR(bk?.paid_at ?? p.created_at)} · {p.delivery_mode === "priority" ? "Entrega prioritária" : "Prazo padrão"}</p>
                    <p className="mt-3 border-l-2 border-primary pl-3 text-sm"><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Próxima ação</span><br />{nextAction(journey)}</p>
                    <Link to="/projeto/$projectId" params={{ projectId: p.id }} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">Abrir passaporte do projeto <ArrowRight className="size-4" /></Link>
                  </div>
                  <div className="md:text-right">
                    {open ? (
                      <Button asChild variant="editorial" size="lg"><Link to="/briefing/$projectId" params={{ projectId: p.id }}><ClipboardList /> {b && b.progress > 0 ? `Continuar briefing (${b.progress}%)` : "Responder briefing"}</Link></Button>
                    ) : (
                      <Button asChild variant="paper"><Link to="/briefing/$projectId" params={{ projectId: p.id }}><Check /> Ver briefing enviado</Link></Button>
                    )}
                    {b?.status === "revision_requested" && <p className="mt-2 text-xs text-destructive">A equipe pediu ajustes no briefing.</p>}
                  </div>
                </div>
                {(() => { const ans = (b?.answers ?? {}) as { rooms?: { id: string; name: string; area?: string }[]; roomNeeds?: Record<string, { items?: string[]; usage?: string; problem?: string; change?: string }> }; const rs = ans.rooms ?? []; if (!rs.length) return null; return (
                  <div className="border-t border-border px-6 py-5 md:px-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Ambientes do projeto</p>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {rs.map((r) => { const n = ans.roomNeeds?.[r.id]; const filled = [n?.items?.length, n?.usage, n?.problem, n?.change].filter(Boolean).length; const done = filled >= 3; return (
                        <li key={r.id} className="flex flex-col justify-between gap-3 border border-border bg-background p-4">
                          <div><p className="font-display text-xl font-semibold">{r.name}</p><p className="text-xs text-muted-foreground">{r.area ? `${r.area} m²` : "Metragem a informar"} · {done ? "Briefing preenchido" : filled ? "Briefing em andamento" : "Briefing pendente"}</p></div>
                          <Button asChild size="sm" variant={done ? "paper" : "editorial"}><Link to="/briefing/$projectId" params={{ projectId: p.id }}><ClipboardList /> {done ? "Ver briefing" : "Preencher briefing"}</Link></Button>
                        </li>); })}
                    </ul>
                  </div>); })()}
                {(bookings.data ?? []).filter(booking => booking.projects?.id === p.id).map(booking => <div key={booking.id} className="px-6 pb-6 md:px-8"><PaidBookingSchedule bookingId={booking.id} /></div>)}
                <div className="border-t border-border px-6 py-5 md:px-8"><JourneyTimeline input={journey} /></div>
                <div className="px-6 pb-6 md:px-8"><DeadlineCard mode={p.delivery_mode} days={p.delivery_business_days} meetingDoneAt={p.briefing_meeting_done_at} due={p.first_delivery_due} /></div>
              </article>
            );
          })}
        </div>
        <JournalSection />
      </main>
    </PartnerShell>
  );
}
