import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CategoryBoundary, PartnerShell, StatusPill, brl } from "@/components/PartnerShell";
import { PartnerApplication } from "@/components/PartnerApplication";
import { SlotManager } from "@/components/SlotManager";
import { ZoeChat } from "@/components/ZoeChat";

export const Route = createFileRoute("/_authenticated/profissional")({
  head: () => ({
    meta: [
      { title: "Painel do arquiteto — ARQECO" },
      { name: "description", content: "Cadastro e painel de arquitetos e designers da rede ARQECO." },
      { property: "og:title", content: "Painel do arquiteto — ARQECO" },
      { property: "og:description", content: "Rede profissional ARQECO para arquitetos e designers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <CategoryBoundary category="professional"><ProfessionalPage /></CategoryBoundary>,
});

function ProfessionalPage() {
  const { user } = Route.useRouteContext();
  const app = useQuery({
    queryKey: ["application", "professional"],
    queryFn: async () => (await supabase.from("partner_applications").select("id,status,review_note,display_name").eq("user_id", user.id).eq("kind", "professional").maybeSingle()).data,
  });
  const approved = app.data?.status === "approved";
  const contracts = useQuery({
    queryKey: ["pro-contracts"],
    enabled: approved,
    queryFn: async () => (await supabase.from("service_bookings").select("id,full_name,city,state,status,total_cents,room_count,service_plans(name),service_plan_options(rooms_label),appointment_slots(starts_at)").eq("professional_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });

  return (
    <PartnerShell eyebrow="ArqEco Pro" title={approved ? "Seus projetos" : "Cadastro de arquiteto ou designer"}>
      {app.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p> : !approved ? (
        <PartnerApplication kind="professional" userId={user.id} application={app.data ?? null} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-8">
          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {(contracts.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhum projeto atribuído ainda.</p>}
            {(contracts.data ?? []).map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 p-4 text-sm">
                <div className="flex-1"><p className="font-semibold">{c.full_name}</p><p className="text-xs text-muted-foreground">{c.service_plans?.name} · {c.service_plan_options?.rooms_label} · {c.city}/{c.state}{c.appointment_slots?.starts_at ? ` · ${new Date(c.appointment_slots.starts_at).toLocaleString("pt-BR")}` : ""}</p></div>
                <span>{brl(c.total_cents)}</span>
                <StatusPill status={c.status === "confirmed" ? "paid" : "pending"} />
              </div>
            ))}
          </div>
          <MyBriefings userId={user.id} />
          <MySchedule userId={user.id} />
          </div>
          <div className="rounded-lg border border-border bg-card p-4"><ZoeChat userName={app.data?.display_name ?? "profissional"} context="Painel profissional ArqEco" /></div>
        </div>
      )}
    </PartnerShell>
  );
}

const PROJECT_STATUS: Record<string, string> = {
  PAYMENT_CONFIRMED: "Pagamento confirmado", BRIEFING_PENDING: "Aguardando briefing", BRIEFING_COMPLETED: "Briefing enviado",
  BRIEFING_VALIDATED: "Briefing validado", MEETING_1: "1ª reunião", DEVELOPMENT: "Em desenvolvimento", PRESENTATION: "Apresentação",
  ADJUSTMENTS: "Ajustes", APPROVAL: "Aprovação", FINAL_DELIVERY: "Entrega final", CERTIFICATION_REVIEW: "Revisão de certificação",
  CERTIFIED: "Certificado", COMPLETED: "Concluído",
};

function MyBriefings({ userId }: { userId: string }) {
  const rows = useQuery({
    queryKey: ["pro-briefings", userId],
    queryFn: async () => (await supabase.from("projects").select("id,name,service_name,status,progress,next_action,due_date,briefings(status,progress,aesthetic_profile,answers,submitted_at)").eq("professional_id", userId).order("created_at", { ascending: false })).data ?? [],
  });
  const list = rows.data ?? [];
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">Projetos e briefings</h2>
      <p className="mt-1 text-sm text-muted-foreground">Acompanhe o andamento, o briefing e os ambientes de cada projeto atribuído a você.</p>
      {!list.length && <p className="mt-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">Nenhum projeto atribuído ainda.</p>}
      <div className="mt-4 grid gap-4">
        {list.map((p) => {
          const b = Array.isArray(p.briefings) ? p.briefings[0] : p.briefings;
          const answers = (b?.answers ?? {}) as { rooms?: { id: string; name: string }[] };
          const rooms = answers.rooms ?? [];
          const sent = b && b.status !== "draft";
          return (
            <article key={p.id} className="rounded-lg border border-border bg-card p-5 text-sm">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.service_name}{p.due_date ? ` · entrega ${new Date(p.due_date + "T12:00").toLocaleDateString("pt-BR")}` : ""}</p>
                </div>
                <StatusPill status={PROJECT_STATUS[p.status] ?? p.status} />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Andamento do projeto</p>
                  <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${p.progress ?? 0}%` }} /></div>
                  <p className="mt-1 text-xs">{p.progress ?? 0}%{p.next_action ? ` · Próximo passo: ${p.next_action}` : ""}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Briefing</p>
                  <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${sent ? 100 : b?.progress ?? 0}%` }} /></div>
                  <p className="mt-1 text-xs">{!b ? "Ainda não iniciado" : sent ? `Enviado${b.aesthetic_profile ? ` · ${b.aesthetic_profile}` : ""}` : `Cliente respondendo · ${b.progress ?? 0}%`}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Ambientes ({rooms.length})</p>
                {rooms.length ? (
                  <ul className="mt-2 flex flex-wrap gap-2">{rooms.map((r) => <li key={r.id} className="rounded-full border border-border px-3 py-1 text-xs">{r.name}</li>)}</ul>
                ) : <p className="mt-1 text-xs text-muted-foreground">O cliente ainda não informou os ambientes.</p>}
              </div>
              <div className="mt-4"><Button asChild size="sm" variant="paper"><Link to="/briefing/$projectId" params={{ projectId: p.id }}>Ver briefing completo</Link></Button></div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MySchedule({ userId }: { userId: string }) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">Minha agenda</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">Escolha os dias, o período e o intervalo — os horários são criados automaticamente. Os clientes escolhem você e um destes horários ao contratar.</p>
      <SlotManager professionalId={userId} />
    </section>
  );
}
