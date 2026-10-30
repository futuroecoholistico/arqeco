import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Heart, HeartHandshake, MessageCircleHeart, Copy, Check } from "lucide-react";
import { enviarFeedback } from "@/lib/feedback.functions";
import { PIX_KEY, PIX_TITULAR } from "@/lib/contribuicao";
import { Button } from "@/components/ui/button";

const NOTAS = [1, 2, 3, 4, 5];

export function ReportFeedback() {
  const enviar = useServerFn(enviarFeedback);
  const [mensagem, setMensagem] = useState("");
  const [nota, setNota] = useState<number | null>(null);
  const [copiado, setCopiado] = useState(false);

  const mut = useMutation({
    mutationFn: () =>
      enviar({ data: { mensagem, nota, diagnosticoId: null } }),
  });

  const copiarPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = PIX_KEY;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const podeEnviar = mensagem.trim().length >= 3 && !mut.isPending && !mut.isSuccess;

  return (
    <section className="no-print border-t border-border pt-10">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contribuição */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5 md:p-6">
          <div className="flex items-center gap-2 text-primary">
            <HeartHandshake className="h-5 w-5" aria-hidden />
            <span className="text-xs uppercase tracking-[0.2em]">Contribua com o projeto</span>
          </div>
          <h3 className="font-display mt-3 text-2xl">O Dossiê Eco Holístico® é gratuito</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Nosso objetivo é trazer bem-estar e equilíbrio para todos que necessitam. Se esta leitura
            fez diferença para você, sua contribuição ajuda o projeto a evoluir e a alcançar mais pessoas.
          </p>
          {PIX_KEY ? (
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Chave PIX · {PIX_TITULAR}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <code className="rounded-md border border-border bg-background/60 px-3 py-2 text-sm">{PIX_KEY}</code>
                <Button
                  onClick={copiarPix}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
                >
                  {copiado ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                  {copiado ? "Chave copiada" : "Copiar chave"}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Qualquer valor é bem-vindo. Obrigada por caminhar com a gente.</p>
            </div>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">Chave PIX em configuração — em breve este botão estará ativo.</p>
          )}
        </div>

        {/* Feedback */}
        <div className="rounded-lg border border-border/60 bg-background/40 p-5 md:p-6">
          <div className="flex items-center gap-2 text-primary">
            <MessageCircleHeart className="h-5 w-5" aria-hidden />
            <span className="text-xs uppercase tracking-[0.2em]">Deixe sua contribuição</span>
          </div>
          <h3 className="font-display mt-3 text-2xl">Como foi sua experiência?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua opinião nos ajuda a melhorar o Dossiê e a servir mais pessoas.
          </p>
          {mut.isSuccess ? (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
              <Heart className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <p>Obrigada por sua contribuição! Ela foi registrada e vai nos ajudar a evoluir.</p>
            </div>
          ) : (
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (podeEnviar) mut.mutate();
              }}
            >
              <div className="flex items-center gap-2" role="group" aria-label="Nota geral">
                <span className="text-xs text-muted-foreground">Nota:</span>
                {NOTAS.map((n) => (
                  <Button
                    key={n}
                    type="button"
                    onClick={() => setNota(nota === n ? null : n)}
                    aria-pressed={nota === n}
                    className={`h-8 w-8 rounded-full border text-sm transition ${
                      nota === n ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {n}
                  </Button>
                ))}
              </div>
              <textarea
                aria-label="Seu feedback"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="O que sentiu ao ler seu dossiê? O que podemos melhorar?"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              {mut.isError && <p className="text-xs text-destructive">{(mut.error as Error).message}</p>}
              <Button
                type="submit"
                disabled={!podeEnviar}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-40"
              >
                {mut.isPending ? "Enviando..." : "Enviar feedback"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
