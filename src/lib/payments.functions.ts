import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type Result = { clientSecret: string } | { error: string };

const input = z.object({
  bookingId: z.string().uuid(),
  returnUrl: z.string().url().max(500),
  environment: z.enum(["sandbox", "live"]),
});

/**
 * Abre o pagamento de uma contratação. O valor cobrado é sempre o total já
 * gravado na contratação (valores fixos definidos no painel), nunca um valor
 * enviado pelo navegador.
 */
export const createBookingCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => input.parse(data))
  .handler(async ({ data, context }): Promise<Result> => {
    const { data: booking, error } = await context.supabase
      .from("service_bookings")
      .select("id,client_id,status,payment_status,total_cents,email,room_count,service_plans(name),service_plan_options(rooms_label)")
      .eq("id", data.bookingId)
      .eq("client_id", context.userId)
      .maybeSingle();
    if (error || !booking) return { error: "Contratação não encontrada." };
    if (booking.status !== "awaiting_payment" || !["not_started", "failed", "pending"].includes(booking.payment_status)) {
      return { error: "Esta contratação não está aguardando pagamento." };
    }
    if (!booking.total_cents || booking.total_cents < 100) return { error: "Valor da contratação não configurado." };

    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: ["arqeco_projeto_base"] });
      const base = prices.data[0];
      if (!base) return { error: "Produto de pagamento não encontrado." };
      const productId = typeof base.product === "string" ? base.product : base.product.id;

      const userId = context.userId;
      let customerId: string | undefined;
      const found = await stripe.customers.search({ query: `metadata['userId']:'${userId}'`, limit: 1 });
      if (found.data[0]) customerId = found.data[0].id;
      else if (booking.email) {
        const existing = await stripe.customers.list({ email: booking.email, limit: 1 });
        const c = existing.data[0];
        if (c) {
          if (c.metadata?.["userId"] !== userId) await stripe.customers.update(c.id, { metadata: { ...c.metadata, userId } });
          customerId = c.id;
        }
      }
      if (!customerId) {
        const created = await stripe.customers.create({ ...(booking.email ? { email: booking.email } : {}), metadata: { userId } });
        customerId = created.id;
      }

      const description = `${booking.service_plans?.name ?? "Projeto ARQECO"} · ${booking.service_plan_options?.rooms_label ?? ""}`.trim();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        line_items: [{ quantity: 1, price_data: { currency: "brl", product: productId, unit_amount: booking.total_cents } }],
        payment_intent_data: { description, metadata: { bookingId: booking.id, userId } },
        metadata: { bookingId: booking.id, userId, managed_payments: "false" },
      });

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("service_bookings").update({ checkout_session_id: session.id }).eq("id", booking.id);

      return { clientSecret: session.client_secret ?? "" };
    } catch (e) {
      console.error(e);
      return { error: getStripeErrorMessage(e) };
    }
  });
