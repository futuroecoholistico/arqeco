import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fieldClass } from "@/components/PartnerShell";

const MAX_FILE = 10 * 1024 * 1024;

/** Dados bancários para recebimento. Um documento (RG/CNH) é obrigatório para salvar. */
export function PayoutAccount({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["payout-account", userId],
    queryFn: async () => {
      const [acc, apps] = await Promise.all([
        supabase.from("payout_accounts").select("*").eq("user_id", userId).maybeSingle(),
        supabase.from("partner_applications").select("document_path").eq("user_id", userId),
      ]);
      const appDoc = (apps.data ?? []).map((a) => a.document_path).find(Boolean) ?? null;
      return { acc: acc.data, appDoc };
    },
  });
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [doc, setDoc] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  if (q.isLoading) return null;
  const acc = q.data?.acc;
  const existingDoc = acc?.document_path ?? q.data?.appDoc ?? null;
  const f = form ?? { holder_name: acc?.holder_name ?? "", holder_cpf: acc?.holder_cpf ?? "", pix_key: acc?.pix_key ?? "", bank: acc?.bank ?? "", agency: acc?.agency ?? "", account: acc?.account ?? "" };
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...f, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (f.holder_name.trim().length < 2 || !/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(f.holder_cpf.trim())) { setMsg("Informe o nome do titular e um CPF válido."); return; }
    if (!f.pix_key.trim() && !(f.bank.trim() && f.agency.trim() && f.account.trim())) { setMsg("Informe uma chave Pix ou banco, agência e conta."); return; }
    if (!doc && !existingDoc) { setMsg("Para receber valores é obrigatório anexar um documento (RG ou CNH)."); return; }
    if (doc && doc.size > MAX_FILE) { setMsg("O documento pode ter no máximo 10 MB."); return; }
    setBusy(true);
    let document_path = existingDoc as string;
    if (doc) {
      const ext = (doc.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
      document_path = `${userId}/recebimento-documento-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("partner-kyc").upload(document_path, doc, doc.type ? { contentType: doc.type } : {});
      if (error) { setBusy(false); setMsg("Não foi possível enviar o documento."); return; }
    }
    const { error } = await supabase.from("payout_accounts").upsert({
      user_id: userId, holder_name: f.holder_name.trim(), holder_cpf: f.holder_cpf.trim(),
      pix_key: f.pix_key.trim() || null, bank: f.bank.trim() || null, agency: f.agency.trim() || null, account: f.account.trim() || null,
      document_path, updated_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) setMsg("Não foi possível salvar agora.");
    else { setMsg("Dados de recebimento salvos."); setDoc(null); qc.invalidateQueries({ queryKey: ["payout-account", userId] }); }
  }

  return (
    <form onSubmit={save} className="space-y-3 rounded-lg border border-border bg-card p-6">
      <h3 className="font-display text-xl">Dados bancários para recebimento</h3>
      <p className="text-sm text-muted-foreground">Os pagamentos só são liberados com um documento de identidade anexado.</p>
      <input className={fieldClass} placeholder="Nome do titular" value={f.holder_name} onChange={set("holder_name")} aria-label="Nome do titular" />
      <input className={fieldClass} placeholder="CPF do titular" inputMode="numeric" value={f.holder_cpf} onChange={set("holder_cpf")} aria-label="CPF do titular" />
      <input className={fieldClass} placeholder="Chave Pix" value={f.pix_key} onChange={set("pix_key")} aria-label="Chave Pix" />
      <div className="grid gap-3 sm:grid-cols-3">
        <input className={fieldClass} placeholder="Banco" value={f.bank} onChange={set("bank")} aria-label="Banco" />
        <input className={fieldClass} placeholder="Agência" value={f.agency} onChange={set("agency")} aria-label="Agência" />
        <input className={fieldClass} placeholder="Conta" value={f.account} onChange={set("account")} aria-label="Conta" />
      </div>
      <label className="block text-xs font-semibold text-muted-foreground">
        Documento — RG ou CNH {existingDoc ? "(já anexado; envie outro para substituir)" : "(obrigatório)"}
        <input type="file" accept="image/*,application/pdf" className="mt-1 block w-full text-sm" onChange={(e) => setDoc(e.target.files?.[0] ?? null)} />
      </label>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
      <Button type="submit" variant="editorial" disabled={busy}>Salvar dados de recebimento</Button>
    </form>
  );
}
