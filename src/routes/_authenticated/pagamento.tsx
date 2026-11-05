import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PaidBookingSchedule } from "@/components/PaidBookingSchedule";
import { brl } from "@/components/PartnerShell";

export const Route = createFileRoute("/_authenticated/pagamento")({
  validateSearch: (s: Record<string, unknown>): { session_id?: string } => (typeof s["session_id"] === "string" ? { session_id: s["session_id"] } : {}),
  head: () => ({
    meta: [
      { title: "Pagamento — ARQECO" },
      { name: "description", content: "Acompanhe a confirmação do pagamento do seu projeto ARQECO." },
      { property: "og:title", content: "Pagamento — ARQECO" },
      { property: "og:description", content: "Confirmação do pagamento do seu projeto ARQECO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentReturn,
});

function PaymentReturn() {
  const { session_id } = Route.useSearch();
  const q = useQuery({
    queryKey: ["payment-return", session_id],
    enabled: !!session_id,
    refetchInterval: (query) => (query.state.data?.payment_status === "paid" ? false : 3000),
    queryFn: async () => {
      if (!session_id) return null;
      const { data, error } = await supabase.from("service_bookings").select("id,status,payment_status,total_cents,service_plans(name)").eq("checkout_session_id", session_id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const paid = q.data?.payment_status === "paid";
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-16">
      {paid ? <CheckCircle2 className="size-10 text-primary" /> : <Clock className="size-10 text-primary" />}
      <h1 className="mt-6 font-display text-4xl font-semibold">{paid ? "Pagamento confirmado." : "Estamos confirmando seu pagamento."}</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {paid ? `Seu projeto ${q.data?.service_plans?.name ?? ""} está contratado (${brl(q.data?.total_cents)}). Agora escolha o dia e o horário da sua reunião.` : "Pagamentos com Pix podem levar alguns instantes. Esta página atualiza sozinha."}
      </p>
      {paid && q.data && <div className="mt-8"><PaidBookingSchedule bookingId={q.data.id} /></div>}
      <Button asChild variant="editorial" className="mt-8 w-fit"><Link to="/painel">Ir para meu painel</Link></Button>
    </main>
  );
}
