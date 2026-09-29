import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function PartnerShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="font-display text-xl font-semibold tracking-wide text-primary">ARQECO</Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link to="/profissional" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 font-semibold text-primary" }}>Arquiteto</Link>
            <Link to="/fornecedor" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 font-semibold text-primary" }}>Fornecedor</Link>
            <Link to="/afiliado" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 font-semibold text-primary" }}>Afiliado</Link>
            <Link to="/admin" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "rounded-md px-3 py-2 font-semibold text-primary" }}>Admin</Link>
            <Button variant="ghost" size="icon" aria-label="Sair" onClick={async () => { await supabase.auth.signOut(); qc.clear(); navigate({ to: "/" }); }}><LogOut /></Button>
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
