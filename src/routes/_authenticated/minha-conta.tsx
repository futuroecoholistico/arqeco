import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { UserRound, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnerShell, fieldClass } from "@/components/PartnerShell";
import { getAccount, saveAccount, deleteMyDossiers } from "@/lib/account.functions";
import { CATEGORIES, categoryHome, type Category } from "@/lib/account";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/minha-conta")({
  head: () => ({ meta: [{ title: "Meus dados — ARQECO" }, { name: "description", content: "Seu cadastro e foto na ARQECO." }, { property: "og:title", content: "Meus dados — ARQECO" }, { property: "og:description", content: "Gerencie seus dados pessoais." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AccountPage,
});
function AccountPage() {
  const get = useServerFn(getAccount);
  const account = useQuery({ queryKey: ["account"], queryFn: () => get() });
  return <PartnerShell eyebrow="Minha conta" title="Meus dados">{account.data ? <AccountForm key={account.data.profile.updated_at} account={account.data} /> : <p>{account.error ? "Não foi possível carregar seu cadastro." : "Carregando…"}</p>}</PartnerShell>;
}
function AccountForm({ account }: { account: Awaited<ReturnType<typeof getAccount>> }) {
  const { user } = Route.useRouteContext();
  const p = account.profile;
  const [name, setName] = useState(p.full_name);
  const [phone, setPhone] = useState(p.phone ?? "");
  const [city, setCity] = useState(p.city ?? "");
  const [category, setCategory] = useState<Category>((CATEGORIES.find(c => c.id === p.registration_category)?.id) ?? "client");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const save = useServerFn(saveAccount);
  const removeDossiers = useServerFn(deleteMyDossiers);
  const qc = useQueryClient();
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    try {
      let path = p.avatar_path;
      if (file) {
        if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("Escolha uma foto JPG, PNG ou WebP de até 5 MB.");
        path = `${user.id}/${crypto.randomUUID()}.${file.type.split('/')[1]}`;
        const { error } = await supabase.storage.from("profile-photos").upload(path, file, { contentType: file.type });
        if (error) throw new Error("Não foi possível enviar sua foto.");
      }
      await save({ data: { full_name: name, phone, city, category, avatar_path: path } });
      await qc.invalidateQueries({ queryKey: ["account"] });
      if (!p.registration_category) navigate({ to: categoryHome(category) });
      else setMsg("Dados salvos.");
    } catch (err) { setMsg(err instanceof Error ? err.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="max-w-xl space-y-5">
    <div className="flex flex-wrap items-center gap-5">{account.photo ? <img src={account.photo} alt="Sua foto" className="size-24 rounded-full object-cover" /> : <UserRound className="size-20 text-muted-foreground" />}<label className="text-sm"><Camera className="mb-2 size-5" />Foto de perfil<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={e => setFile(e.target.files?.[0] ?? null)} /></label></div>
    <label className="block text-sm">Nome completo<input required minLength={2} className={`${fieldClass} mt-1`} value={name} onChange={e => setName(e.target.value)} /></label>
    <label className="block text-sm">E-mail<input className={`${fieldClass} mt-1`} readOnly value={user.email ?? ""} /></label>
    <label className="block text-sm">Telefone com DDD<input required minLength={10} className={`${fieldClass} mt-1`} value={phone} onChange={e => setPhone(e.target.value)} /></label>
    <label className="block text-sm">Cidade<input required minLength={2} className={`${fieldClass} mt-1`} value={city} onChange={e => setCity(e.target.value)} /></label>
    <label className="block text-sm">Categoria<select disabled={Boolean(p.registration_category)} className={`${fieldClass} mt-1`} value={category} onChange={e => setCategory(e.target.value as Category)}>{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
    {msg && <p role="status" className="text-sm text-primary">{msg}</p>}<Button type="submit" variant="editorial" disabled={busy}>{busy ? "Salvando…" : "Salvar dados"}</Button>
    <div className="border-t border-border pt-6"><Button type="button" variant="outline" disabled={busy} onClick={async () => { if (!window.confirm("Excluir todos os seus dossiês e feedbacks? Esta ação não pode ser desfeita.")) return; setBusy(true); try { await removeDossiers(); await qc.invalidateQueries({ queryKey: ["diagnosticos"] }); setMsg("Dossiês e feedbacks excluídos."); } catch { setMsg("Não foi possível excluir agora."); } finally { setBusy(false); } }}>Excluir meus dossiês e feedbacks</Button></div>
  </form>;
}