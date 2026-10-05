import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";

// Creates the client's project + empty briefing once a booking is paid (idempotent via projects.booking_id unique).
async function ensureProject(admin: any, bookingId: string, b: any) {
  const { data: existing } = await admin.from("projects").select("id").eq("booking_id", bookingId).maybeSingle();
  let projectId = existing?.id as string | undefined;
  if (!projectId) {
    const planName = b.service_plans?.name ?? "Projeto ARQECO";
    const { data: created } = await admin.from("projects").insert({
      client_id: b.client_id, professional_id: b.professional_id, booking_id: bookingId,
      name: `${planName}${b.service_plan_options?.rooms_label ? ` · ${b.service_plan_options.rooms_label}` : ""}`,
      service_name: planName, status: "BRIEFING_PENDING", progress: 5, next_action: "Responder o briefing",
    }).select("id").single();
    projectId = created?.id;
  }
  if (projectId) await admin.from("briefings").upsert({ project_id: projectId, client_id: b.client_id }, { onConflict: "project_id", ignoreDuplicates: true });
}

async function updateBooking(session: any, kind: "paid" | "pending" | "failed") {
  const bookingId = session?.metadata?.bookingId;
  if (!bookingId) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  if (kind === "paid") {
    const { data } = await supabaseAdmin
      .from("service_bookings")
      .update({ status: "confirmed", payment_status: "paid", paid_at: new Date().toISOString(), payment_reference: session.payment_intent ?? session.id })
      .eq("id", bookingId)
      .select("appointment_slot_id,client_id,professional_id,service_plans(name),service_plan_options(rooms_label)")
      .maybeSingle();
    if (data?.appointment_slot_id) {
      await supabaseAdmin.from("appointment_slots").update({ is_available: false }).eq("id", data.appointment_slot_id);
    }
    if (data) await ensureProject(supabaseAdmin, bookingId, data);
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
