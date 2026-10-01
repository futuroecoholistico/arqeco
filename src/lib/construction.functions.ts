import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inquiryInput = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().regex(/^[0-9()+ -]{10,20}$/),
  postalCode: z.string().trim().regex(/^\d{5}-?\d{3}$/),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/),
  description: z.string().trim().min(10).max(1500),
  scope: z.enum(["project_only", "project_build_followup"]),
  timeline: z.enum(["Até 3 meses", "De 3 a 6 meses", "De 6 a 12 meses", "Mais de 1 ano", "Ainda estou planejando"]),
});

const meetingInput = z.object({ inquiryId: z.string().uuid(), slotId: z.string().uuid() });

export const createConstructionInquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inquiryInput.parse(data))
  .handler(async ({ data, context }) => {
    const { data: inquiry, error } = await context.supabase.from("construction_inquiries").insert({
      client_id: context.userId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      postal_code: data.postalCode,
      city: data.city,
      state: data.state,
      construction_description: data.description,
      service_scope: data.scope,
      desired_timeline: data.timeline,
    }).select("id").single();
    if (error || !inquiry) throw new Error("Não foi possível enviar a solicitação.");
    return { id: inquiry.id };
  });

export const scheduleConstructionMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => meetingInput.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("schedule_construction_meeting", { _inquiry_id: data.inquiryId, _slot_id: data.slotId });
    if (error) throw new Error(error.message.includes("slot_not_available") ? "slot_not_available" : "Não foi possível marcar a reunião.");
    return { ok: true };
  });