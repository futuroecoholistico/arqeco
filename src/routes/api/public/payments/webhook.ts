import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook } from "@/lib/stripe.server";
import { commissionCents, payoutDate, PAID_PLAN_COMMISSION_RATE } from "@/lib/referrals";

// 10% of the closed total for referred clients, payable on the 15th of the next month (idempotent per booking).
async function recordReferralCommission(admin: any, bookingId: string, clientId: string) {
  const { data: attr } = await admin.from("referral_attributions").select("link_id,affiliate_id").eq("referred_user_id", clientId).maybeSingle();
  if (!attr) return;
  const { data: b } = await admin.from("service_bookings").select("total_cents,paid_at,service_plans(name,slug)").eq("id", bookingId).maybeSingle();
  const total = b?.total_cents ?? 0;
  if (!b || total <= 0) return;
  await admin.from("referral_commissions").upsert({
    affiliate_id: attr.affiliate_id, link_id: attr.link_id, booking_id: bookingId,
    plan_name: b.service_plans?.name ?? "Projeto ARQECO", sale_cents: total,
    commission_rate: PAID_PLAN_COMMISSION_RATE, commission_cents: commissionCents(total),
    payout_date: payoutDate(new Date(b.paid_at ?? Date.now())),
  }, { onConflict: "booking_id", ignoreDuplicates: true });
}

// Creates the client's project + empty briefing once a booking is paid (idempotent via projects.booking_id unique).
async function ensureProject(admin: any, bookingId: string, b: any) {
  const { data: existing } = await admin.from("projects").select("id").eq("booking_id", bookingId).maybeSingle();
  let projectId = existing?.id as string | undefined;
  if (!projectId) {
    const planName = b.service_plans?.name ?? "Projeto ARQECO";
    // Priority delivery only when the paid booking included the urgency fee; days come from the plan option (null = to be set by the team).
    const { data: pay } = await admin.from("service_bookings").select("urgent_delivery,urgent_fee_cents,service_plan_options(delivery_days,urgent_delivery_days)").eq("id", bookingId).maybeSingle();
    const priority = !!pay?.urgent_delivery && (pay?.urgent_fee_cents ?? 0) > 0;
    const delivery = priority
      ? { delivery_mode: "priority", delivery_business_days: pay?.service_plan_options?.urgent_delivery_days ?? null }
      : { delivery_mode: "standard", delivery_business_days: 15 };
    const { data: created } = await admin.from("projects").insert({
      client_id: b.client_id, professional_id: b.professional_id, booking_id: bookingId,
      name: `${planName}${b.service_plan_options?.rooms_label ? ` · ${b.service_plan_options.rooms_label}` : ""}`,
      service_name: planName, status: "BRIEFING_PENDING", progress: 5, next_action: "Responder o briefing", ...delivery,
    }).select("id").single();
    projectId = created?.id;
  }
  if (projectId) {
    // Seed the briefing with the rooms (and areas) contracted at checkout, so each gets its own module.
    const { data: bk } = await admin.from("service_bookings").select("rooms").eq("id", bookingId).maybeSingle();
    const rooms = Array.isArray(bk?.rooms) ? bk.rooms.map((r: any) => ({ id: String(r.id), key: r.key ?? "outro", name: r.name, area: String(r.area_m2 ?? ""), contracted: true })) : [];
    await admin.from("briefings").upsert({ project_id: projectId, client_id: b.client_id, answers: rooms.length ? { rooms } : {} }, { onConflict: "project_id", ignoreDuplicates: true });
  }
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
    if (data) await recordReferralCommission(supabaseAdmin, bookingId, data.client_id);
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
