import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAccount } from "@/lib/account.functions";
import { CATEGORIES, categoryHome } from "@/lib/account";

export function PartnerShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(getAccount);
  const account = useQuery({ queryKey: ["account"], queryFn: () => get() });
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="font-display text-xl font-semibold tracking-wide text-primary">ARQECO</Link>
          <nav className="flex flex-wrap items-center justify-end gap-2 text-xs sm:text-sm">
            {account.data && <Link to={categoryHome(account.data.profile.registration_category)} className="text-primary">Meu painel</Link>}
            <Link to="/minha-conta">Meus dados</Link>
            {account.data?.admin && <Link to="/admin" className="text-primary">Administração</Link>}
            <Button variant="ghost" size="icon" aria-label="Sair" onClick={async () => { await qc.cancelQueries(); qc.clear(); await supabase.auth.signOut(); navigate({ to: "/auth", replace: true }); }}><LogOut /></Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest-soft">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

export function CategoryBoundary({ category, children }: { category: string; children: ReactNode }) {
  const get = useServerFn(getAccount);
  const q = useQuery({ queryKey: ["account"], queryFn: () => get() });
  if (!q.data) return <p className="p-8">{q.error ? "Não foi possível carregar seu cadastro." : "Carregando…"}</p>;
  if (!q.data.profile.registration_category) return <div className="p-8"><Button asChild variant="editorial"><Link to="/minha-conta">Completar meu cadastro</Link></Button></div>;
  if (!q.data.admin && q.data.profile.registration_category !== category) return <div className="p-8"><p className="mb-4">Esta área pertence a outra categoria.</p><Button asChild variant="editorial"><Link to={categoryHome(q.data.profile.registration_category)}>Voltar ao meu painel</Link></Button></div>;
  return children;
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "Em avaliação", approved: "Aprovado", rejected: "Recusado", paid: "Pago", cancelled: "Cancelado",
  };
  const tone = status === "approved" || status === "paid" ? "bg-primary text-primary-foreground" : status === "rejected" || status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-secondary text-foreground";
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tone}`}>{map[status] ?? status}</span>;
}

export const brl = (cents: number | null | undefined) =>
  cents == null ? "—" : (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fieldClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring";
