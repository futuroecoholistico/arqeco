import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fieldClass, StatusPill } from "@/components/PartnerShell";

type Kind = "supplier" | "affiliate" | "professional";
type App = { id: string; status: string; review_note: string | null; display_name: string } | null;

const schema = z.object({
  display_name: z.string().trim().min(2).max(120),
  document: z.string().trim().max(30).optional(),
  website: z.string().trim().url().max(300).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  message: z.string().trim().max(1000).optional(),
  cpf: z.string().trim().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/),
  phone: z.string().trim().regex(/^[0-9()+ -]{10,20}$/),
});
const MAX_FILE = 10 * 1024 * 1024;

export function PartnerApplication({ kind, userId, application }: { kind: Kind; userId: string; application: App }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ display_name: "", document: "", website: "", category: "", city: "", message: "", cpf: "", phone: "" });
  const [docFile, setDocFile] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isSupplier = kind === "supplier";
  const isPro = kind === "professional";

  if (application) {
    return (
      <div className="max-w-xl rounded-lg border border-border bg-card p-8">
        <StatusPill status={application.status} />
        <h2 className="mt-4 font-display text-2xl font-semibold">{application.display_name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{application.status === "rejected" ? `Seu cadastro não foi aprovado${application.review_note ? `: ${application.review_note}` : "."} Fale com a equipe ARQECO para uma nova avaliação.` : "Recebemos seu cadastro. A equipe ARQECO está avaliando e você verá o acesso liberado aqui assim que for aprovado."}</p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = schema.safeParse(form);
    if (!p.success) { setErr("Confira os campos: nome, CPF (000.000.000-00), telefone com DDD e site em formato https://…"); return; }
    if (!docFile || !selfie) { setErr("Envie a foto do documento (RG ou CNH) e uma selfie segurando o documento."); return; }
    if (docFile.size > MAX_FILE || selfie.size > MAX_FILE) { setErr("Cada arquivo pode ter no máximo 10 MB."); return; }
    setBusy(true); setErr(null);
    const d = p.data;
    const up = async (f: File, name: string) => {
      const ext = (f.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
      const path = `${userId}/${kind}-${name}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("partner-kyc").upload(path, f, f.type ? { contentType: f.type } : {});
      if (error) throw error;
      return path;
    };
    let document_path: string, selfie_path: string;
    try { document_path = await up(docFile, "documento"); selfie_path = await up(selfie, "selfie"); }
    catch { setBusy(false); setErr("Não foi possível enviar as fotos. Tente novamente."); return; }
    const payload = { cpf: d.cpf, phone: d.phone, document_path, selfie_path, display_name: d.display_name, document: d.document || null, category: d.category || null, city: d.city || null, message: d.message || null, website: d.website || null, user_id: userId, kind };
    const { error } = await supabase.from("partner_applications").insert(payload);
    setBusy(false);
    if (error) setErr(error.message.includes("duplicate") ? "Você já enviou um cadastro. Fale com a equipe ARQECO para reavaliação." : "Não foi possível enviar agora.");
    else qc.invalidateQueries({ queryKey: ["application", kind] });
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <form onSubmit={submit} className="max-w-xl space-y-3 rounded-lg border border-border bg-card p-8">
      <h2 className="font-display text-2xl font-semibold">{isPro ? "Cadastro de arquiteto ou designer" : isSupplier ? "Cadastro de fornecedor" : "Cadastro de afiliado"}</h2>
      <p className="text-sm text-muted-foreground">{isPro ? "Informe seu registro profissional e portfólio. Após aprovação da equipe ARQECO, você recebe projetos e acesso à Zoe." : isSupplier ? "Conte sobre sua marca. Após aprovação você poderá enviar produtos para a Curadoria." : "Conte sobre você e seu público. Após aprovação você gera links e recebe comissão por venda."}</p>
      <input className={fieldClass} placeholder={isPro ? "Nome completo ou escritório" : isSupplier ? "Nome da empresa/marca" : "Seu nome ou nome do perfil"} value={form.display_name} onChange={set("display_name")} aria-label="Nome" />
      <input className={fieldClass} placeholder={isPro ? "Registro CAU ou ABD" : isSupplier ? "CNPJ" : "CPF ou CNPJ (opcional)"} value={form.document} onChange={set("document")} aria-label="Documento" />
      <input className={fieldClass} placeholder={isPro ? "Portfólio ou Instagram (https://…)" : isSupplier ? "Site da loja (https://…)" : "Instagram, site ou canal (https://…)"} value={form.website} onChange={set("website")} aria-label="Site" />
      <input className={fieldClass} placeholder={isPro ? "Especialidade (ex.: Interiores residenciais)" : isSupplier ? "Categoria (ex.: Revestimentos)" : "Tema (ex.: Casa e lifestyle)"} value={form.category} onChange={set("category")} aria-label="Categoria" />
      <input className={fieldClass} placeholder="CPF do responsável" inputMode="numeric" value={form.cpf} onChange={set("cpf")} aria-label="CPF" />
      <input className={fieldClass} placeholder="Telefone com DDD" inputMode="tel" value={form.phone} onChange={set("phone")} aria-label="Telefone" />
      <label className="block text-xs font-semibold text-muted-foreground">Foto do documento (RG ou CNH)
        <input type="file" accept="image/*,application/pdf" className="mt-1 block w-full text-sm" onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
      </label>
      <label className="block text-xs font-semibold text-muted-foreground">Selfie segurando o documento
        <input type="file" accept="image/*" capture="user" className="mt-1 block w-full text-sm" onChange={(e) => setSelfie(e.target.files?.[0] ?? null)} />
      </label>
      <p className="text-xs text-muted-foreground">Usamos essas fotos apenas para confirmar sua identidade. Só a equipe ARQECO tem acesso.</p>
      <input className={fieldClass} placeholder="Cidade" value={form.city} onChange={set("city")} aria-label="Cidade" />
      <textarea className={`${fieldClass} h-24 py-2`} placeholder="Mensagem para a equipe ARQECO" value={form.message} onChange={set("message")} aria-label="Mensagem" />
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" variant="editorial" disabled={busy}>Enviar cadastro</Button>
    </form>
  );
}
