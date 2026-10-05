import { useEffect, useRef, useState } from "react";
import { ArrowRight, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import zoeAvatar from "@/assets/zoe-avatar.jpg.asset.json";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Gerar programa de necessidades detalhado",
  "Escrever um memorial descritivo",
  "Integrar biofilia ao projeto",
  "Propor telhado verde",
  "Relatório de CO₂ incorporado dos materiais",
  "Sugerir materiais ecológicos",
  "Simular reúso de água e energia solar",
];

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>,
    );
    return <p key={i} className={line.trim() === "" ? "h-2" : ""}>{parts}</p>;
  });
}

export function ZoeChat({ userName, context }: { userName: string; context: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [messages]);
  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    const history: Msg[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let answer = "";
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error("Entre como arquiteto ou designer para conversar com a Zoe.");
      const res = await fetch("/api/zoe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ messages: history, context }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "A Zoe não conseguiu responder agora.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === "response.output_text.delta" && evt.delta) {
              answer += evt.delta;
              setMessages([...history, { role: "assistant", content: answer }]);
            } else if (evt.type === "error" || evt.type === "response.failed") {
              throw new Error("A Zoe não conseguiu responder agora.");
            }
          } catch (e) {
            if (e instanceof Error && e.message.startsWith("A Zoe")) throw e;
          }
        }
      }
      if (!answer) throw new Error("A Zoe não trouxe uma resposta. Tente novamente.");
    } catch (e) {
      if (controller.signal.aborted) {
        if (!answer) setMessages(history.slice(0, -1));
      } else {
        setError(e instanceof Error ? e.message : "Erro inesperado.");
        setMessages(answer ? [...history, { role: "assistant", content: answer }] : history);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <img src={zoeAvatar.url} alt="Zoe" className="size-11 rounded-full object-cover" />
        <div>
          <p className="font-display text-lg font-semibold leading-tight">Zoe</p>
          <p className="text-xs text-muted-foreground">Estagiária criativa e consciente</p>
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto py-6">
        <div className="max-w-[88%] rounded-lg bg-secondary p-4 text-sm leading-relaxed">
          Olá, {userName}. Sou a Zoe. Antes de qualquer cálculo, me conta: o que esse espaço precisa expressar?
        </div>
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[88%] whitespace-pre-wrap rounded-lg bg-primary p-4 text-sm text-primary-foreground">{m.content}</div>
          ) : (
            <div key={i} className="max-w-[88%] space-y-1 rounded-lg bg-secondary p-4 text-sm leading-relaxed">
              {m.content ? renderText(m.content) : <span className="animate-pulse text-muted-foreground">Zoe está pensando…</span>}
            </div>
          ),
        )}
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        <div ref={endRef} />
      </div>
      <p className="pb-2 text-[10px] text-muted-foreground">A Zoe orienta, mas não substitui um profissional habilitado.</p>
      <form className="flex gap-2 border-t border-border pt-4" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring" placeholder="Pergunte à Zoe..." aria-label="Mensagem para Zoe" />
        {loading ? (
          <Button type="button" variant="paper" size="icon" aria-label="Parar" onClick={() => abortRef.current?.abort()}><Square /></Button>
        ) : (
          <Button type="submit" variant="editorial" size="icon" aria-label="Enviar" disabled={!input.trim()}><ArrowRight /></Button>
        )}
      </form>
    </>
  );
}
