import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PartnerShell, StatusPill, brl, fieldClass } from "@/components/PartnerShell";
import { PartnerApplication } from "@/components/PartnerApplication";
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
  component: ProfessionalPage,
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
          <MySchedule userId={user.id} />
          </div>
          <div className="rounded-lg border border-border bg-card p-4"><ZoeChat userName={app.data?.display_name ?? "profissional"} context="Painel profissional ArqEco" /></div>
        </div>
      )}
    </PartnerShell>
  );
}

function MySchedule({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["pro-slots", userId], queryFn: async () => (await supabase.from("appointment_slots").select("id,starts_at,is_available").eq("professional_id", userId).gte("starts_at", new Date().toISOString()).order("starts_at")).data ?? [] });
  const [date, setDate] = useState(""); const [time, setTime] = useState(""); const [minutes, setMinutes] = useState("60");
  const [err, setErr] = useState<string | null>(null);
  const refresh = () => qc.invalidateQueries({ queryKey: ["pro-slots", userId] });
  async function add() {
    const start = new Date(`${date}T${time}`); const dur = Number(minutes);
    if (!date || !time || Number.isNaN(start.getTime()) || start <= new Date() || !(dur >= 15 && dur <= 480)) { setErr("Informe data e hora futuras e duração entre 15 e 480 minutos."); return; }
    setErr(null);
    const { error } = await supabase.from("appointment_slots").insert({ professional_id: userId, starts_at: start.toISOString(), ends_at: new Date(start.getTime() + dur * 60000).toISOString() });
    if (error) setErr("Não foi possível adicionar o horário."); refresh();
  }
  async function toggle(id: string, is_available: boolean) { await supabase.from("appointment_slots").update({ is_available }).eq("id", id); refresh(); }
  async function remove(id: string) { const { error } = await supabase.from("appointment_slots").delete().eq("id", id); if (error) alert("Este horário já tem contratação; bloqueie em vez de excluir."); refresh(); }
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">Minha agenda</h2>
      <p className="mt-1 text-sm text-muted-foreground">Cadastre os horários em que você pode atender. Os clientes escolhem você e um destes horários ao contratar.</p>
      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-5">
        <label className="text-xs font-semibold text-muted-foreground">Data<input type="date" className={`${fieldClass} mt-1`} value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="text-xs font-semibold text-muted-foreground">Hora<input type="time" className={`${fieldClass} mt-1`} value={time} onChange={(e) => setTime(e.target.value)} /></label>
        <label className="text-xs font-semibold text-muted-foreground">Duração (min)<input type="number" className={`${fieldClass} mt-1 w-28`} value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label>
        <Button variant="editorial" size="sm" onClick={add}>Adicionar horário</Button>
        {err && <p className="w-full text-sm text-destructive">{err}</p>}
      </div>
      <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
        {(q.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhum horário futuro cadastrado.</p>}
        {(q.data ?? []).map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
            <span className="flex-1">{new Date(s.starts_at).toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
            <span className={s.is_available ? "text-primary" : "text-muted-foreground"}>{s.is_available ? "Disponível" : "Bloqueado"}</span>
            <Button size="sm" variant="paper" onClick={() => toggle(s.id, !s.is_available)}>{s.is_available ? "Bloquear" : "Liberar"}</Button>
            <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>Excluir</Button>
          </div>
        ))}
      </div>
    </section>
  );
}
