import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, ClipboardList, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  component: ClientDashboard,
});

const STAGES = ["Briefing", "Reunião", "Desenvolvimento", "Apresentação", "Ajustes", "Entrega"];
const stageIndex = (s: string) => (["PAYMENT_CONFIRMED", "BRIEFING_PENDING"].includes(s) ? 0 : ["BRIEFING_COMPLETED", "BRIEFING_VALIDATED", "MEETING_1"].includes(s) ? 1 : s === "DEVELOPMENT" ? 2 : s === "PRESENTATION" ? 3 : ["ADJUSTMENTS", "APPROVAL"].includes(s) ? 4 : 5);

function ClientDashboard() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const projects = useQuery({
    queryKey: ["my-projects"],
    queryFn: async () => (await supabase.from("projects").select("id,name,status,next_action,created_at,briefings(status,progress)").eq("client_id", user.id).order("created_at", { ascending: false })).data ?? [],
  });
  const firstName = (user.user_metadata?.["full_name"] as string | undefined)?.split(" ")[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link to="/" className="font-display text-xl font-semibold tracking-wide">ARQECO</Link>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground" aria-label="Sair" onClick={async () => { await supabase.auth.signOut(); qc.clear(); navigate({ to: "/" }); }}><LogOut /></Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10 lg:py-14">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Meus projetos</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Olá{firstName ? `, ${firstName}` : ""}.</h1>

        {projects.isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando…</p>}
        {!projects.isLoading && (projects.data ?? []).length === 0 && (
          <div className="mt-10 border border-border bg-card p-8">
            <p className="font-display text-2xl font-semibold">Você ainda não tem projetos.</p>
            <p className="mt-2 text-sm text-muted-foreground">Depois que o pagamento do seu plano for confirmado, seu projeto aparece aqui com o briefing para começar.</p>
            <Button asChild variant="editorial" className="mt-6"><Link to="/" hash="planos">Ver planos <ArrowRight /></Link></Button>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {(projects.data ?? []).map((p) => {
            const b = Array.isArray(p.briefings) ? p.briefings[0] : p.briefings;
            const open = !b || b.status === "draft" || b.status === "revision_requested";
            const idx = stageIndex(p.status);
            return (
              <article key={p.id} className="border border-border bg-card">
                <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
                  <div>
                    <h2 className="font-display text-3xl font-semibold">{p.name}</h2>
                    {p.next_action && <p className="mt-2 text-sm text-muted-foreground">Próxima ação: {p.next_action}</p>}
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
                <div className="overflow-x-auto border-t border-border px-6 py-5 md:px-8">
                  <ol className="flex min-w-[560px]">
                    {STAGES.map((s, i) => (
                      <li key={s} className="relative flex flex-1 flex-col items-center text-center">
                        {i < STAGES.length - 1 && <span className={`absolute left-1/2 top-3 h-px w-full ${i < idx ? "bg-primary" : "bg-border"}`} />}
                        <span className={`relative z-10 grid size-6 place-items-center rounded-full border text-[10px] ${i < idx ? "border-primary bg-primary text-primary-foreground" : i === idx ? "border-primary bg-card text-primary" : "border-border bg-background text-muted-foreground"}`}>{i < idx ? <Check className="size-3" /> : i + 1}</span>
                        <span className={`mt-2 text-[10px] font-semibold uppercase ${i <= idx ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
