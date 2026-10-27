import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { START_REFERRAL_ECOS } from "./referrals";

// Links the signed-in user to the affiliate whose code they arrived with (first link wins).
export const claimReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => {
    if (!/^[a-f0-9]{6,20}$/.test(input.code)) throw new Error("invalid code");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link } = await supabaseAdmin.from("referral_links").select("id,affiliate_id,plan_slug").eq("code", data.code).maybeSingle();
    if (!link || link.affiliate_id === context.userId) return { ok: false };
    const { data: inserted } = await supabaseAdmin
      .from("referral_attributions")
      .upsert({ referred_user_id: context.userId, link_id: link.id, affiliate_id: link.affiliate_id }, { onConflict: "referred_user_id", ignoreDuplicates: true })
      .select("id");
    if (inserted?.length && link.plan_slug === "start") {
      await supabaseAdmin.from("eco_ledger").upsert(
        { user_id: link.affiliate_id, amount: START_REFERRAL_ECOS, reason: "Indicação do Projeto Start", ref: `start:${context.userId}` },
        { onConflict: "ref", ignoreDuplicates: true },
      );
    }
    return { ok: true, plan: link.plan_slug };
  });
