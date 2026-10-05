import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PartnerShell, StatusPill, brl, fieldClass } from "@/components/PartnerShell";
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
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">Minha agenda</h2>
      <p className="mt-1 mb-4 text-sm text-muted-foreground">Escolha os dias, o período e o intervalo — os horários são criados automaticamente. Os clientes escolhem você e um destes horários ao contratar.</p>
      <SlotManager professionalId={userId} />
    </section>
  );
}
