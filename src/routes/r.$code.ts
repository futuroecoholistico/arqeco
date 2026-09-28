import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/r/$code")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const code = params.code;
        const home = new URL("/", request.url).toString();
        if (!/^[a-f0-9]{6,20}$/.test(code)) return Response.redirect(home, 302);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: link } = await supabaseAdmin
          .from("affiliate_links")
          .select("id, material:curated_materials(affiliate_url, is_active)")
          .eq("code", code)
          .maybeSingle();
        const target = link?.material?.is_active ? link.material.affiliate_url : null;
        if (!link || !target) return Response.redirect(home, 302);
        await supabaseAdmin.from("affiliate_clicks").insert({ link_id: link.id });
        let dest: URL;
        try { dest = new URL(target); } catch { return Response.redirect(home, 302); }
        dest.searchParams.set("arqeco_ref", code);
        return new Response(null, { status: 302, headers: { Location: dest.toString(), "Cache-Control": "no-store" } });
      },
    },
  },
});
