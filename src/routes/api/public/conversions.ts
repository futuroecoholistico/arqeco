import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

const payloadSchema = z.object({
  supplier: z.string().min(1).max(120),
  ref: z.string().regex(/^[a-f0-9]{6,20}$/),
  order_ref: z.string().min(1).max(120),
  sale_amount_cents: z.number().int().min(0).max(1_000_000_000),
});

export const Route = createFileRoute("/api/public/conversions")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        let payload: z.infer<typeof payloadSchema>;
        try { payload = payloadSchema.parse(JSON.parse(body)); } catch { return Response.json({ error: "invalid payload" }, { status: 400 }); }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: supplier } = await supabaseAdmin.from("suppliers").select("id, is_active, supplier_secrets(webhook_secret)").eq("slug", payload.supplier).maybeSingle();
        const secret = (supplier?.supplier_secrets as { webhook_secret: string } | null)?.webhook_secret;
        if (!supplier || !secret || !supplier.is_active) return Response.json({ error: "unauthorized" }, { status: 401 });

        const signature = request.headers.get("x-arqeco-signature") ?? "";
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        const a = Buffer.from(signature); const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ error: "unauthorized" }, { status: 401 });

        const { data: link } = await supabaseAdmin
          .from("affiliate_links")
          .select("id, affiliate_id, material:curated_materials(id, supplier_id, commission_rate)")
          .eq("code", payload.ref)
          .maybeSingle();
        if (!link?.material || link.material.supplier_id !== supplier.id) return Response.json({ error: "unknown ref for this supplier" }, { status: 404 });

        const rate = Number(link.material.commission_rate);
        const commission = Math.round((payload.sale_amount_cents * rate) / 100);
        const { error } = await supabaseAdmin.from("affiliate_conversions").upsert({
          link_id: link.id, affiliate_id: link.affiliate_id, material_id: link.material.id, supplier_id: supplier.id,
          order_ref: payload.order_ref, sale_amount_cents: payload.sale_amount_cents, commission_rate: rate, commission_cents: commission,
        }, { onConflict: "supplier_id,order_ref", ignoreDuplicates: true });
        if (error) { console.error("conversion insert", error.message); return Response.json({ error: "server error" }, { status: 500 }); }
        return Response.json({ ok: true, commission_cents: commission });
      },
    },
  },
});
