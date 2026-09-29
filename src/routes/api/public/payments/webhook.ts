import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

async function updateBooking(session: any, kind: "paid" | "pending" | "failed") {
  const bookingId = session?.metadata?.bookingId;
  if (!bookingId) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  if (kind === "paid") {
    const { data } = await supabaseAdmin
      .from("service_bookings")
      .update({ status: "confirmed", payment_status: "paid", paid_at: new Date().toISOString(), payment_reference: session.payment_intent ?? session.id })
      .eq("id", bookingId)
      .select("appointment_slot_id")
      .maybeSingle();
    if (data?.appointment_slot_id) {
      await supabaseAdmin.from("appointment_slots").update({ is_available: false }).eq("id", data.appointment_slot_id);
    }
  } else if (kind === "pending") {
    await supabaseAdmin.from("service_bookings").update({ status: "payment_processing", payment_status: "pending" }).eq("id", bookingId).neq("payment_status", "paid");
  } else {
    await supabaseAdmin.from("service_bookings").update({ status: "awaiting_payment", payment_status: "failed" }).eq("id", bookingId).neq("payment_status", "paid");
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") return Response.json({ received: true, ignored: "invalid env" });
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          const obj = event.data.object;
          switch (event.type) {
            case "checkout.session.completed":
              await updateBooking(obj, obj.payment_status === "unpaid" ? "pending" : "paid");
              break;
            case "checkout.session.async_payment_succeeded":
              await updateBooking(obj, "paid");
              break;
            case "checkout.session.async_payment_failed":
            case "checkout.session.expired":
              await updateBooking(obj, "failed");
              break;
            default:
              console.log("Unhandled event:", event.type);
          }
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
