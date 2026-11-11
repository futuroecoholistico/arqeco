import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CODE_RE = /^[a-f0-9]{6,20}$/;

// Public: tells the referral landing which plan a code points to (no personal data).
export const getReferralPlan = createServerFn({ method: "GET" })
  .inputValidator((input: { code: string }) => {
    if (!CODE_RE.test(input.code)) throw new Error("invalid code");
    return input;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link } = await supabaseAdmin.from("referral_links").select("id, affiliate_id, plan_slug").eq("code", data.code).maybeSingle();
    if (link) await supabaseAdmin.from("referral_clicks").insert({ link_id: link.id, affiliate_id: link.affiliate_id });
    return { plan: (link?.plan_slug ?? null) as string | null };
  });

// Links the signed-in user to the affiliate whose code they arrived with (first link wins).
// Start ecos are granted only when the dossiê is generated (see /api/public/referrals/dossie).
export const claimReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    if (!CODE_RE.test(input.code)) throw new Error("invalid code");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link } = await supabaseAdmin.from("referral_links").select("id,affiliate_id,plan_slug").eq("code", data.code).maybeSingle();
    if (!link || link.affiliate_id === context.userId) return { ok: false };
    await supabaseAdmin
      .from("referral_attributions")
      .upsert({ referred_user_id: context.userId, link_id: link.id, affiliate_id: link.affiliate_id }, { onConflict: "referred_user_id", ignoreDuplicates: true });
    return { ok: true, plan: link.plan_slug };
  });
