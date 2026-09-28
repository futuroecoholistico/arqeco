import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fieldClass, StatusPill } from "@/components/PartnerShell";

type Kind = "supplier" | "affiliate";
type App = { id: string; status: string; review_note: string | null; display_name: string } | null;

const schema = z.object({
  display_name: z.string().trim().min(2).max(120),
  document: z.string().trim().max(30).optional(),
  website: z.string().trim().url().max(300).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1000).optional(),
});

export function PartnerApplication({ kind, userId, application }: { kind: Kind; userId: string; application: App }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ display_name: "", document: "", website: "", category: "", city: "", message: "" });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isSupplier = kind === "supplier";

  if (application && application.status !== "rejected") {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-card p-8">
        <StatusPill status={application.status} />
        <h2 className="mt-4 font-display text-2xl font-semibold">{application.display_name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">Recebemos seu cadastro. A equipe ARQECO está avaliando e você verá o acesso liberado aqui assim que for aprovado.</p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse(form);
    if (!p.success) { setErr("Confira os campos: nome obrigatório e site em formato https://…"); return; }
    setBusy(true); setErr(null);
    const payload = { ...p.data, website: p.data.website || null, user_id: userId, kind, status: "pending" as const, review_note: null };
    const { error } = application
      ? await supabase.from("partner_applications").delete().eq("id", "00000000-0000-0000-0000-000000000000").then(() => supabase.from("partner_applications").insert(payload))
      : await supabase.from("partner_applications").insert(payload);
    setBusy(false);
    if (error) setErr(error.message.includes("duplicate") ? "Você já enviou um cadastro. Fale com a equipe ARQECO para reavaliação." : "Não foi possível enviar agora.");
    else qc.invalidateQueries({ queryKey: ["application", kind] });
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="max-w-xl space-y-3 rounded-lg border border-border bg-card p-8">
      {application?.status === "rejected" && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">Cadastro anterior recusado{application.review_note ? `: ${application.review_note}` : "."}</p>}
      <h2 className="font-display text-2xl font-semibold">{isSupplier ? "Cadastro de fornecedor" : "Cadastro de afiliado"}</h2>
      <p className="text-sm text-muted-foreground">{isSupplier ? "Conte sobre sua marca. Após aprovação você poderá enviar produtos para a Curadoria." : "Conte sobre você e seu público. Após aprovação você gera links e recebe comissão por venda."}</p>
      <input className={fieldClass} placeholder={isSupplier ? "Nome da empresa/marca" : "Seu nome ou nome do perfil"} value={form.display_name} onChange={set("display_name")} aria-label="Nome" />
      <input className={fieldClass} placeholder={isSupplier ? "CNPJ" : "CPF ou CNPJ (opcional)"} value={form.document} onChange={set("document")} aria-label="Documento" />
      <input className={fieldClass} placeholder={isSupplier ? "Site da loja (https://…)" : "Instagram, site ou canal (https://…)"} value={form.website} onChange={set("website")} aria-label="Site" />
      <input className={fieldClass} placeholder={isSupplier ? "Categoria (ex.: Revestimentos)" : "Tema (ex.: Casa e lifestyle)"} value={form.category} onChange={set("category")} aria-label="Categoria" />
      <input className={fieldClass} placeholder="Cidade" value={form.city} onChange={set("city")} aria-label="Cidade" />
      <textarea className={`${fieldClass} h-24 py-2`} placeholder="Mensagem para a equipe ARQECO" value={form.message} onChange={set("message")} aria-label="Mensagem" />
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" variant="editorial" disabled={busy}>Enviar cadastro</Button>
    </form>
  );
}
