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
    if ((docFile && docFile.size > MAX_FILE) || (selfie && selfie.size > MAX_FILE)) { setErr("Cada arquivo pode ter no máximo 10 MB."); return; }
    setBusy(true); setErr(null);
    const d = p.data;
    const up = async (f: File, name: string) => {
      const ext = (f.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
      const path = `${userId}/${kind}-${name}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("partner-kyc").upload(path, f, f.type ? { contentType: f.type } : {});
      if (error) throw error;
      return path;
    };
    let document_path: string | null = null, selfie_path: string | null = null;
    try { if (docFile) document_path = await up(docFile, "documento"); if (selfie) selfie_path = await up(selfie, "selfie"); }
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
      <label className="block text-xs font-semibold text-muted-foreground">Selfie para o perfil (opcional)
        <input type="file" accept="image/*" capture="user" className="mt-1 block w-full text-sm" onChange={(e) => setSelfie(e.target.files?.[0] ?? null)} />
      </label>
      <label className="block text-xs font-semibold text-muted-foreground">Documento — RG ou CNH (opcional)
        <input type="file" accept="image/*,application/pdf" className="mt-1 block w-full text-sm" onChange={(e) => setDocFile(e.target.files?.[0] ?? null)} />
      </label>
      <p className="text-xs text-muted-foreground">Não é obrigatório para o cadastro, mas o documento será exigido para cadastrar seus dados bancários e receber valores. Só a equipe ARQECO tem acesso.</p>
      <input className={fieldClass} placeholder="Cidade" value={form.city} onChange={set("city")} aria-label="Cidade" />
      <textarea className={`${fieldClass} h-24 py-2`} placeholder="Mensagem para a equipe ARQECO" value={form.message} onChange={set("message")} aria-label="Mensagem" />
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" variant="editorial" disabled={busy}>Enviar cadastro</Button>
    </form>
  );
}

export const AFFILIATE_ROLES = ["Afiliado(a)", "Creator / influenciador(a)", "Corretor(a) de imóveis", "Arquiteto(a) ou designer", "Outro"] as const;

export function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const affiliateSchema = z.object({
  display_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/),
  role: z.enum(AFFILIATE_ROLES),
  other: z.string().trim().max(60),
  website: z.string().trim().max(300),
}).refine((v) => v.role !== "Outro" || v.other.length > 0, { path: ["other"] });

export function affiliateRoleLabel(category: string | null) {
  return category ? category.replace(/^Outro: /, "") : "afiliado(a)";
}

export function AffiliatePending({ name, category }: { name: string; category: string | null }) {
  return (
    <div className="max-w-xl rounded-lg border border-border bg-card p-8">
      <StatusPill status="pending" />
      <h2 className="mt-4 font-display text-2xl font-semibold">Cadastro recebido!</h2>
      <p className="mt-2 text-sm text-muted-foreground">Obrigada, {name.split(" ")[0]}! Seu cadastro como {affiliateRoleLabel(category)} foi enviado e depende da aprovação da equipe ArqEco. Em breve você receberá o retorno por e-mail ou WhatsApp, com a liberação do seu painel de indicações.</p>
      <p className="mt-4 text-xs text-muted-foreground">Os dados para pagamento das comissões serão pedidos só depois da aprovação.</p>
    </div>
  );
}

export function AffiliateApplication({ userId, email }: { userId: string; email: string }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ display_name: "", phone: "", role: "", other: "", website: "" });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = affiliateSchema.safeParse(form);
    if (!p.success) { setErr("Confira seu nome, WhatsApp com DDD e sua função."); return; }
    setBusy(true); setErr(null);
    const d = p.data;
    const category = d.role === "Outro" ? `Outro: ${d.other}` : d.role;
    const { error } = await supabase.from("partner_applications").insert({ user_id: userId, kind: "affiliate", display_name: d.display_name, phone: d.phone, category, website: d.website || null });
    setBusy(false);
    if (error) setErr(error.message.includes("duplicate") ? "Você já enviou um cadastro. Fale com a equipe ARQECO para reavaliação." : "Não foi possível enviar agora.");
    else qc.invalidateQueries({ queryKey: ["application", "affiliate"] });
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-3 rounded-lg border border-border bg-card p-8">
      <h2 className="font-display text-2xl font-semibold">Cadastro de afiliado / creator</h2>
      <p className="text-sm text-muted-foreground">Leva menos de um minuto. Após a aprovação você gera seus links e acompanha suas indicações.</p>
      <input className={fieldClass} placeholder="Nome completo" maxLength={120} value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} aria-label="Nome completo" />
      <input className={fieldClass} placeholder="WhatsApp com DDD — (11) 99999-9999" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} aria-label="WhatsApp" />
      <input className={`${fieldClass} opacity-70`} value={email} readOnly aria-label="E-mail" />
      <select className={fieldClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} aria-label="Sua função">
        <option value="">Sua função</option>
        {AFFILIATE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
      </select>
      {form.role === "Outro" && <input className={fieldClass} placeholder="Qual?" maxLength={60} value={form.other} onChange={(e) => setForm({ ...form, other: e.target.value })} aria-label="Qual?" />}
      <input className={fieldClass} placeholder="Instagram, site ou canal (opcional) — @usuario ou link" maxLength={300} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} aria-label="Instagram, site ou canal" />
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" variant="editorial" disabled={busy}>Enviar cadastro</Button>
    </form>
  );
}
