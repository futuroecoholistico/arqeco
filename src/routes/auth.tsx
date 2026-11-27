import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { fieldClass } from "@/components/PartnerShell";
import { isProjectPurchase } from "@/lib/booking-flow";
import { CATEGORIES, categoryHome, safeDestination, type Category } from "@/lib/account";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({
    next: z.string().optional(),
    perfil: z.enum(["cliente", "fornecedor", "afiliado", "profissional"]).optional(),
    modo: z.enum(["entrar"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Cadastro e entrada — ARQECO" },
      { name: "description", content: "Entre na ARQECO como cliente, arquiteto, designer, fornecedor ou afiliado." },
      { property: "og:title", content: "Cadastro e entrada — ARQECO" },
      { property: "og:description", content: "Uma conta para seus projetos e Dossiês Eco-Holísticos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "choose" | "in" | "up" | "forgot";

function AuthPage() {
  const { next, perfil, modo } = Route.useSearch();
  const purchasing = isProjectPurchase(next);
  const initial = purchasing
    ? "client"
    : perfil === "cliente"
      ? "client"
      : perfil === "profissional"
        ? "professional"
        : perfil === "fornecedor"
          ? "supplier"
          : perfil === "afiliado"
            ? "affiliate"
            : "client";
  const [category, setCategory] = useState<Category | null>(initial);
  const [mode, setMode] = useState<AuthMode>(modo === "entrar" ? "in" : "up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [msg, setMsg] = useState("");
  const [accountExists, setAccountExists] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const finish = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user || !active) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("registration_category")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (!p?.registration_category && !purchasing) {
        navigate({ to: "/minha-conta" });
        return;
      }
      navigate({ to: safeDestination(next) ?? categoryHome(p?.registration_category) });
    };
    void finish();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") setTimeout(() => void finish(), 0);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [next, navigate, purchasing]);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMsg("");
    setAccountExists(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setAccountExists(false);
    const parsed = z
      .object({ email: z.string().trim().email(), password: z.string().min(8) })
      .safeParse({ email, password });
    if (!parsed.success) {
      setMsg("Informe e-mail válido e senha com pelo menos 8 caracteres.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) setMsg("Confira seu e-mail e senha, e confirme seu e-mail antes de entrar.");
      } else {
        if (!category || name.trim().length < 2 || phone.trim().length < 10 || city.trim().length < 2) {
          setMsg("Preencha nome, telefone com DDD e cidade.");
          return;
        }
        const { data: su, error } = await supabase.auth.signUp({
          ...parsed.data,
          options: {
            emailRedirectTo: `${window.location.origin}/auth${next ? `?next=${encodeURIComponent(next)}` : ""}`,
            data: {
              full_name: name.trim(),
              phone: phone.trim(),
              city: city.trim(),
              registration_category: category,
            },
          },
        });
        if (error) {
          const m = error.message.toLowerCase();
          const alreadyRegistered = m.includes("already") || m.includes("registered");
          setAccountExists(alreadyRegistered);
          setMsg(
            error.code === "email_address_invalid"
              ? "Não reconhecemos este endereço de e-mail. Confira se foi digitado corretamente."
              : m.includes("weak") || m.includes("pwned") || m.includes("easy to guess")
                ? "Essa senha é muito comum e fácil de adivinhar. Crie uma senha mais forte, misturando letras, números e símbolos."
                : alreadyRegistered
                  ? "Este e-mail já tem cadastro. Entre na conta ou recupere sua senha."
                  : m.includes("rate")
                    ? "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo."
                    : "Não foi possível criar sua conta. Confira os dados ou tente entrar.",
          );
        } else if (su.user && (su.user.identities?.length ?? 0) === 0) {
          setAccountExists(true);
          setMsg("Este e-mail já tem cadastro. Entre na conta ou recupere sua senha.");
        } else {
          setWelcome(true);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) {
      setMsg("Informe o e-mail usado no seu cadastro.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setMsg(
        error
          ? "Não foi possível enviar o link agora. Aguarde alguns minutos e tente novamente."
          : "Se este e-mail estiver cadastrado, você receberá um link para criar uma nova senha. Confira também a caixa de spam.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth${next ? `?next=${encodeURIComponent(next)}` : ""}`,
    });
    if (r.error) setMsg("Não foi possível entrar com Google.");
  }

  const title = welcome
    ? `Boas-vindas à ARQECO, ${name.trim().split(" ")[0]}!`
    : mode === "choose"
      ? "Qual é o seu perfil?"
      : mode === "in"
        ? "Bem-vindo de volta"
        : mode === "forgot"
          ? "Recupere sua senha"
          : "Crie sua conta";

  return (
    <main className="min-h-screen bg-background px-5 py-12">
      <div className="mx-auto w-full max-w-lg">
        <Link to="/" className="font-display text-2xl text-primary">ARQECO</Link>
        <h1 className="mt-10 font-display text-4xl">{title}</h1>

        {welcome ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Sua conta foi criada. Enviamos um link de confirmação para <strong>{email}</strong> — confirme seu e-mail para entrar. Depois, escolha por onde começar:
            </p>
            <div className="grid gap-3">
              <Button asChild variant="editorial" className="h-auto whitespace-normal py-4">
                <Link to="/" hash="planos">Contratar um projeto de interiores</Link>
              </Button>
              <Button asChild variant="paper" className="h-auto whitespace-normal py-4">
                <Link to="/diagnostico">Fazer seu Dossiê Eco-Holístico (gratuito)</Link>
              </Button>
            </div>
          </div>
        ) : mode === "choose" ? (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {CATEGORIES.map((c) => (
                <Button key={c.id} variant="paper" className="h-24 whitespace-normal text-base" onClick={() => { setCategory(c.id); changeMode("up"); }}>
                  {c.label}
                </Button>
              ))}
            </div>
            <Button variant="ghost" className="mt-6" onClick={() => changeMode("in")}>Já tenho conta · Entrar</Button>
          </>
        ) : mode === "forgot" ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">Enviaremos um link seguro para o e-mail do seu cadastro.</p>
            <form onSubmit={requestPasswordReset} className="mt-8 space-y-3">
              <input required type="email" autoComplete="email" className={fieldClass} placeholder="E-mail" aria-label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button disabled={busy} type="submit" variant="editorial" className="w-full">{busy ? "Aguarde…" : "Enviar link de recuperação"}</Button>
            </form>
            <Button variant="ghost" className="mt-5" onClick={() => changeMode("in")}>Voltar para entrar</Button>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              {mode === "up"
                ? purchasing
                  ? "Cadastre-se para contratar seu projeto."
                  : category === "professional"
                    ? "Seja um profissional ArqecoPro"
                    : "Crie sua conta gratuita com qualquer e-mail."
                : "Acesse seu painel e seus projetos."}
            </p>
            <Button variant="paper" className="mt-6 w-full" onClick={google}>Continuar com Google</Button>
            <div className="my-5 text-center text-xs text-muted-foreground">ou</div>
            <form onSubmit={submit} className="space-y-3">
              {mode === "up" && (
                <>
                  <input required className={fieldClass} placeholder="Nome completo" aria-label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
                  <input required className={fieldClass} placeholder="Telefone com DDD" aria-label="Telefone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <input required className={fieldClass} placeholder="Cidade" aria-label="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                </>
              )}
              <input required type="email" autoComplete="email" className={fieldClass} placeholder="E-mail" aria-label="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input required minLength={8} autoComplete={mode === "in" ? "current-password" : "new-password"} type="password" className={fieldClass} placeholder="Senha" aria-label="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button disabled={busy} type="submit" variant="editorial" className="w-full">{busy ? "Aguarde…" : mode === "in" ? "Entrar" : "Criar conta"}</Button>
            </form>
            {mode === "in" && (
              <Button variant="link" className="mt-3 px-0" onClick={() => changeMode("forgot")}>Esqueci minha senha</Button>
            )}
            <Button variant="ghost" className="mt-3 block" onClick={() => changeMode(mode === "in" ? "up" : "in")}>
              {mode === "in" ? "Criar uma conta" : "Já tenho conta · Entrar"}
            </Button>
          </>
        )}

        {msg && <p role="status" className="mt-5 text-sm text-primary">{msg}</p>}
        {accountExists && !welcome && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="paper" size="sm" onClick={() => changeMode("in")}>Entrar na conta</Button>
            <Button variant="paper" size="sm" onClick={() => changeMode("forgot")}>Esqueci minha senha</Button>
          </div>
        )}
        <p className="mt-8 text-xs text-muted-foreground">Ao continuar, você concorda com os <Link to="/termos" className="underline">Termos de Uso</Link> e a <Link to="/privacidade" className="underline">Política de Privacidade</Link>.</p>
      </div>
    </main>
  );
}
