import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { fieldClass } from "@/components/PartnerShell";

const search = z.object({ next: z.string().optional(), perfil: z.enum(["fornecedor", "afiliado", "profissional"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Entrar — ARQECO" },
      { name: "description", content: "Entre ou crie sua conta ARQECO como cliente, fornecedor ou afiliado." },
      { property: "og:title", content: "Entrar — ARQECO" },
      { property: "og:description", content: "Acesse sua conta ARQECO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function safeNext(next?: string, perfil?: string) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  if (perfil === "fornecedor") return "/fornecedor";
  if (perfil === "afiliado") return "/afiliado";
  if (perfil === "profissional") return "/profissional";
  return "/painel";
}

function AuthPage() {
  const { next, perfil } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">(perfil ? "up" : "in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const target = safeNext(next, perfil);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) navigate({ to: target }); });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: target });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate, target]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const parsed = z.object({ email: z.string().trim().email(), password: z.string().min(8) }).safeParse({ email, password });
    if (!parsed.success) { setMsg("Informe um e-mail válido e uma senha com pelo menos 8 caracteres."); return; }
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) setMsg("E-mail ou senha incorretos.");
    } else {
      const { error } = await supabase.auth.signUp({
        ...parsed.data,
        options: { emailRedirectTo: `${window.location.origin}/auth?next=${encodeURIComponent(target)}`, data: { full_name: name.trim().slice(0, 120) } },
      });
      setMsg(error ? error.message : "Enviamos um link de confirmação para o seu e-mail.");
    }
    setBusy(false);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(target)}` });
    if (r.error) setMsg("Não foi possível entrar com Google.");
  }

  const label = perfil === "fornecedor" ? "Seja fornecedor ARQECO" : perfil === "afiliado" ? "Seja afiliado ARQECO" : mode === "in" ? "Bem-vindo de volta" : "Crie sua conta";

  return (
    <div className="grid min-h-screen place-items-center bg-background px-5">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display text-2xl font-semibold text-primary">ARQECO</Link>
        <h1 className="mt-8 font-display text-3xl font-semibold">{label}</h1>
        {perfil && <p className="mt-2 text-sm text-muted-foreground">Crie sua conta e envie seu cadastro. A equipe ARQECO avalia antes de liberar o acesso.</p>}
        <Button variant="paper" className="mt-8 w-full" onClick={google}>Continuar com Google</Button>
        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted-foreground"><span className="h-px flex-1 bg-border" />ou<span className="h-px flex-1 bg-border" /></div>
        <form onSubmit={submit} className="space-y-3">
          {mode === "up" && <input className={fieldClass} placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nome" />}
          <input className={fieldClass} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="E-mail" />
          <input className={fieldClass} type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Senha" />
          <Button type="submit" variant="editorial" className="w-full" disabled={busy}>{mode === "in" ? "Entrar" : "Criar conta"}</Button>
        </form>
        {msg && <p className="mt-4 text-sm text-muted-foreground" role="status">{msg}</p>}
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-6 text-sm text-primary underline-offset-4 hover:underline">
          {mode === "in" ? "Ainda não tem conta? Criar conta" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
