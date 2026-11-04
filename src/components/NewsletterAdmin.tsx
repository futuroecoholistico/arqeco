import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { getNewsletterAudience, sendNewsletter } from "@/lib/newsletter.functions";
import { DEFAULT_NEWSLETTER_HTML, DEFAULT_NEWSLETTER_SUBJECT } from "@/lib/newsletter-template";

export function NewsletterAdmin() {
  const audience = useServerFn(getNewsletterAudience);
  const send = useServerFn(sendNewsletter);
  const [count, setCount] = useState<number | null>(null);
  const [subject, setSubject] = useState(DEFAULT_NEWSLETTER_SUBJECT);
  const [html, setHtml] = useState(DEFAULT_NEWSLETTER_HTML);
  const [testEmail, setTestEmail] = useState("dunderkoch@gmail.com");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { audience().then((r) => setCount(r.subscribed)).catch((e) => setMsg(e.message)); }, [audience]);

  const run = async (test: boolean) => {
    if (!test && !confirm(`Enviar para ${count ?? 0} inscritos agora?`)) return;
    setBusy(true); setMsg(null);
    try {
      await send({ data: { subject, html, testEmail: test ? testEmail : undefined } });
      setMsg(test ? `Teste enviado para ${testEmail}.` : "Newsletter enviada para os inscritos.");
    } catch (e) { setMsg((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl">Newsletter de novidades</h2>
        <p className="text-sm text-muted-foreground">Enviada pelo Brevo apenas para quem assinou: {count ?? "…"} inscritos.</p>
      </div>
      <label className="block space-y-1 text-sm">Assunto
        <input className="w-full border border-border bg-background px-3 py-2" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </label>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-1 text-sm">Conteúdo (HTML)
          <textarea className="h-[600px] w-full border border-border bg-background p-3 font-mono text-xs" value={html} onChange={(e) => setHtml(e.target.value)} />
        </label>
        <div className="space-y-1 text-sm">Pré-visualização
          <iframe title="Pré-visualização" srcDoc={html} sandbox="" className="h-[600px] w-full border border-border bg-background" />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-sm">E-mail de teste
          <input className="block border border-border bg-background px-3 py-2" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
        </label>
        <Button variant="paper" disabled={busy} onClick={() => run(true)}>Enviar teste</Button>
        <Button variant="editorial" disabled={busy || !count} onClick={() => run(false)}>Enviar para inscritos</Button>
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
