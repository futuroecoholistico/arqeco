import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { START_REFERRAL_ECOS } from "@/lib/referrals";

// Called by the APP ECO HOLÍSTICO server when a referred person generates their dossiê.
// Signed with HMAC-SHA256 (header x-arqeco-signature) using the shared DOSSIE_REFERRAL_SECRET.
const schema = z.object({
  ref: z.string().regex(/^[a-f0-9]{6,20}$/),
  dossie_id: z.string().min(1).max(120),
  email: z.string().email().max(255),
});

export const Route = createFileRoute("/api/public/referrals/dossie")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["DOSSIE_REFERRAL_SECRET"];
        if (!secret) return Response.json({ error: "not configured" }, { status: 503 });
        const body = await request.text();
        const sig = Buffer.from(request.headers.get("x-arqeco-signature") ?? "");
        const exp = Buffer.from(createHmac("sha256", secret).update(body).digest("hex"));
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) return Response.json({ error: "unauthorized" }, { status: 401 });
        let p: z.infer<typeof schema>;
        try { p = schema.parse(JSON.parse(body)); } catch { return Response.json({ error: "invalid payload" }, { status: 400 }); }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: link } = await supabaseAdmin.from("referral_links").select("affiliate_id,plan_slug").eq("code", p.ref).maybeSingle();
        if (!link || link.plan_slug !== "start") return Response.json({ error: "unknown ref" }, { status: 404 });
        const email = p.email.trim().toLowerCase();
        const { data: aff } = await supabaseAdmin.auth.admin.getUserById(link.affiliate_id);
        if (aff?.user?.email?.toLowerCase() === email) return Response.json({ ok: false, reason: "self-referral" });

        // One reward per referred person (email), whatever the number of dossiês.
        const { error } = await supabaseAdmin.from("eco_ledger").upsert(
          { user_id: link.affiliate_id, amount: START_REFERRAL_ECOS, reason: "Indicação do Projeto Start (Dossiê gerado)", ref: `start:${email}` },
          { onConflict: "ref", ignoreDuplicates: true },
        );
        if (error) { console.error("eco ledger", error.message); return Response.json({ error: "server error" }, { status: 500 }); }
        return Response.json({ ok: true, ecos: START_REFERRAL_ECOS });
      },
    },
  },
});
