import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/PartnerShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Criar nova senha — ARQECO" },
      { name: "description", content: "Crie uma nova senha para acessar sua conta ARQECO com segurança." },
      { property: "og:title", content: "Criar nova senha — ARQECO" },
      { property: "og:description", content: "Redefina sua senha e volte a acessar seus projetos ARQECO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function hasRecoveryHash() {
  return new URLSearchParams(window.location.hash.replace(/^#/, "")).get("type") === "recovery";
}

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setReady(hasRecoveryHash());
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    if (!ready && !hasRecoveryHash()) {
      setMessage("Este link de recuperação é inválido ou expirou. Solicite um novo link.");
      return;
    }
    if (password.length < 8) {
      setMessage("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setMessage("As senhas não coincidem. Digite a mesma senha nos dois campos.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage("Não foi possível alterar a senha. Solicite um novo link e tente novamente.");
        return;
      }
      await supabase.auth.signOut();
      setSuccess(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-12">
      <div className="mx-auto w-full max-w-lg">
        <Link to="/" className="font-display text-2xl text-primary">ARQECO</Link>
        <h1 className="mt-10 font-display text-4xl">{success ? "Senha atualizada" : "Crie uma nova senha"}</h1>
        {success ? (
          <>
            <p className="mt-4 text-sm text-muted-foreground">Sua nova senha já está valendo. Entre na conta para acessar seus projetos.</p>
            <Button asChild variant="editorial" className="mt-8 w-full">
              <Link to="/auth" search={{ modo: "entrar" }}>Entrar na minha conta</Link>
            </Button>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">Use pelo menos 8 caracteres e evite senhas fáceis de adivinhar.</p>
            <form onSubmit={submit} className="mt-8 space-y-3">
              <input required minLength={8} autoComplete="new-password" type="password" className={fieldClass} placeholder="Nova senha" aria-label="Nova senha" value={password} onChange={(event) => setPassword(event.target.value)} />
              <input required minLength={8} autoComplete="new-password" type="password" className={fieldClass} placeholder="Repita a nova senha" aria-label="Repita a nova senha" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
              <Button disabled={busy} type="submit" variant="editorial" className="w-full">{busy ? "Aguarde…" : "Salvar nova senha"}</Button>
            </form>
            {message && <p role="alert" className="mt-5 text-sm text-primary">{message}</p>}
            <Button asChild variant="ghost" className="mt-5">
              <Link to="/auth" search={{ modo: "entrar" }}>Solicitar um novo link</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
