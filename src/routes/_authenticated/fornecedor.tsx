import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PartnerShell, StatusPill, brl, fieldClass } from "@/components/PartnerShell";
import { PartnerApplication } from "@/components/PartnerApplication";

export const Route = createFileRoute("/_authenticated/fornecedor")({
  head: () => ({ meta: [{ title: "Área do fornecedor — ARQECO" }, { name: "description", content: "Envie produtos para a Curadoria ARQECO e acompanhe avaliações e vendas." }, { property: "og:title", content: "Área do fornecedor — ARQECO" }, { property: "og:description", content: "Produtos, avaliações e vendas dos parceiros da Curadoria ARQECO." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: SupplierPage,
});

const CATEGORIES = ["Revestimentos", "Tintas", "Iluminação", "Mobiliário", "Madeiras", "Metais", "Louças", "Decoração", "Paisagismo", "Tecnologia"];

function SupplierPage() {
  const { user } = Route.useRouteContext();
  const app = useQuery({
    queryKey: ["application", "supplier"],
    queryFn: async () => (await supabase.from("partner_applications").select("id,status,review_note,display_name,supplier_id").eq("user_id", user.id).eq("kind", "supplier").maybeSingle()).data,
  });
  return (
    <PartnerShell eyebrow="Área do fornecedor" title="Seus produtos na Curadoria">
      {app.isLoading ? <p className="text-sm text-muted-foreground">Carregando…</p>
        : app.data?.status === "approved" && app.data.supplier_id ? <SupplierDashboard supplierId={app.data.supplier_id} userId={user.id} />
        : <PartnerApplication kind="supplier" userId={user.id} application={app.data ?? null} />}
    </PartnerShell>
  );
}

const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  category: z.string().min(1),
  description: z.string().trim().max(2000).optional(),
  product_url: z.string().trim().url().max(500),
  image_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  commission_rate: z.coerce.number().min(0).max(100),
  sustainability_notes: z.string().trim().max(2000).optional(),
});

function SupplierDashboard({ supplierId, userId }: { supplierId: string; userId: string }) {
  const qc = useQueryClient();
  const subs = useQuery({ queryKey: ["submissions", supplierId], queryFn: async () => (await supabase.from("product_submissions").select("*").eq("supplier_id", supplierId).order("created_at", { ascending: false })).data ?? [] });
  const secret = useQuery({ queryKey: ["secret", supplierId], queryFn: async () => (await supabase.from("supplier_secrets").select("webhook_secret").eq("supplier_id", supplierId).maybeSingle()).data });
  const supplier = useQuery({ queryKey: ["supplier", supplierId], queryFn: async () => (await supabase.from("suppliers").select("name,slug").eq("id", supplierId).maybeSingle()).data });
  const sales = useQuery({ queryKey: ["supplier-sales", supplierId], queryFn: async () => (await supabase.from("affiliate_conversions").select("id,order_ref,sale_amount_cents,commission_cents,status,created_at").eq("supplier_id", supplierId).order("created_at", { ascending: false }).limit(50)).data ?? [] });
  const [form, setForm] = useState({ name: "", category: CATEGORIES[0], description: "", product_url: "", image_url: "", commission_rate: "5", sustainability_notes: "" });
  const [err, setErr] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = productSchema.safeParse(form);
    if (!p.success) { setErr("Confira nome, link do produto (https://…) e comissão entre 0 e 100%."); return; }
    setErr(null);
    const { error } = await supabase.from("product_submissions").insert({ name: p.data.name, category: p.data.category, product_url: p.data.product_url, commission_rate: p.data.commission_rate, description: p.data.description || null, sustainability_notes: p.data.sustainability_notes || null, image_url: p.data.image_url || null, supplier_id: supplierId, submitted_by: userId });
    if (error) { setErr("Não foi possível enviar agora."); return; }
    setForm({ ...form, name: "", description: "", product_url: "", image_url: "", sustainability_notes: "" });
    qc.invalidateQueries({ queryKey: ["submissions", supplierId] });
  }
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-card p-6">
        <h2 className="font-display text-2xl font-semibold">Enviar produto</h2>
        <p className="text-sm text-muted-foreground">Cada produto é avaliado pela equipe ARQECO (Índice Eco-Holístico™) antes de aparecer no catálogo.</p>
        <input className={fieldClass} placeholder="Nome do produto" value={form.name} onChange={set("name")} aria-label="Nome do produto" />
        <select className={fieldClass} value={form.category} onChange={set("category")} aria-label="Categoria">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <input className={fieldClass} placeholder="Link do produto na sua loja (https://…)" value={form.product_url} onChange={set("product_url")} aria-label="Link do produto" />
        <input className={fieldClass} placeholder="Link da imagem (opcional)" value={form.image_url} onChange={set("image_url")} aria-label="Imagem" />
        <label className="block text-xs font-semibold text-muted-foreground">Comissão para afiliados (% sobre a venda)
          <input className={`${fieldClass} mt-1`} type="number" min={0} max={100} step="0.5" value={form.commission_rate} onChange={set("commission_rate")} />
        </label>
        <textarea className={`${fieldClass} h-20 py-2`} placeholder="Descrição" value={form.description} onChange={set("description")} aria-label="Descrição" />
        <textarea className={`${fieldClass} h-20 py-2`} placeholder="Informações de sustentabilidade (certificações, composição, origem…)" value={form.sustainability_notes} onChange={set("sustainability_notes")} aria-label="Sustentabilidade" />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" variant="editorial" className="w-full">Enviar para avaliação</Button>
      </form>

      <div className="space-y-8">
        <section>
          <h2 className="font-display text-2xl font-semibold">Produtos enviados</h2>
          <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
            {(subs.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhum produto enviado ainda.</p>}
            {(subs.data ?? []).map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-4">
                <div className="flex-1"><p className="text-sm font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.category} · {Number(s.commission_rate)}% comissão{s.review_note ? ` · ${s.review_note}` : ""}</p></div>
                {s.eco_index != null && <span className="font-display text-lg text-primary">{s.eco_index}</span>}
                <StatusPill status={s.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold">Integração de vendas</h2>
          <p className="mt-2 text-sm text-muted-foreground">Quando alguém chega pela ARQECO, o link traz <code className="rounded bg-secondary px-1">?arqeco_ref=CÓDIGO</code>. Ao concluir a venda, sua loja avisa a ARQECO e a comissão do afiliado é calculada automaticamente.</p>
          <dl className="mt-4 space-y-2 text-xs">
            <div><dt className="font-semibold">Endereço</dt><dd className="break-all text-muted-foreground">POST {origin}/api/public/conversions</dd></div>
            <div><dt className="font-semibold">Identificador da loja</dt><dd className="text-muted-foreground">{supplier.data?.slug}</dd></div>
            <div><dt className="font-semibold">Chave secreta</dt><dd className="break-all text-muted-foreground">{showKey ? secret.data?.webhook_secret : "••••••••••••"} <button type="button" className="ml-2 text-primary underline" onClick={() => setShowKey(!showKey)}>{showKey ? "ocultar" : "mostrar"}</button></dd></div>
          </dl>
          <pre className="mt-4 overflow-x-auto rounded-md bg-secondary p-3 text-[11px] leading-relaxed">{`{ "supplier": "${supplier.data?.slug ?? "sua-loja"}",
  "ref": "CÓDIGO_DO_LINK",
  "order_ref": "PEDIDO-123",
  "sale_amount_cents": 45900 }
Cabeçalho x-arqeco-signature = HMAC-SHA256(corpo, chave)`}</pre>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold">Vendas via ARQECO</h2>
          <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
            {(sales.data ?? []).length === 0 && <p className="p-5 text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>}
            {(sales.data ?? []).map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-4 text-sm"><span className="flex-1">{c.order_ref}</span><span>{brl(c.sale_amount_cents)}</span><span className="text-muted-foreground">comissão {brl(c.commission_cents)}</span><StatusPill status={c.status} /></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
