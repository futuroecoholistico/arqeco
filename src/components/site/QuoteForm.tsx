import { useState, type FormEvent } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { whatsappUrl } from "@/lib/site-content";

export const quoteTypes = [
  { value: "casa_decorar", label: "Decorar ou renovar minha casa (sem obra)" },
  { value: "casa_construir", label: "Construir ou reformar minha casa" },
  { value: "comercial", label: "Projeto para meu negócio (Well Spaces Business)" },
  { value: "profissional", label: "Sou arquiteto(a) ou designer" },
  { value: "outro", label: "Outro assunto" },
] as const;
export type QuoteType = (typeof quoteTypes)[number]["value"];

export function isQuoteType(v: unknown): v is QuoteType {
  return quoteTypes.some((t) => t.value === v);
}

const field =
  "h-12 w-full rounded-md border border-input bg-background px-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

function formatPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

/**
 * Pedido de orçamento sem login: 5 campos. Salva em `quote_requests` (RLS: qualquer visitante cria,
 * só admin lê) e abre o WhatsApp da equipe com a mensagem pronta. Se o banco falhar, o WhatsApp
 * ainda abre, para nenhum contato se perder.
 */
export function QuoteForm({
  defaultType = "casa_decorar",
  source,
  compact = false,
}: {
  defaultType?: QuoteType;
  source: string;
  compact?: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<QuoteType>(defaultType);
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const digits = phone.replace(/\D/g, "");
    if (name.trim().length < 2) return setError("Informe seu nome.");
    if (digits.length < 10) return setError("Informe um WhatsApp com DDD.");
    if (city.trim().length < 2) return setError("Informe sua cidade.");
    setSending(true);
    const typeLabel = quoteTypes.find((t) => t.value === type)?.label ?? type;
    const text = [
      "Olá! Quero um orçamento ARQECO.",
      `Nome: ${name.trim()}`,
      `Projeto: ${typeLabel}`,
      `Cidade: ${city.trim()}`,
      message.trim() ? `Sobre o projeto: ${message.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");
    const url = whatsappUrl(text);
    try {
      await supabase.from("quote_requests").insert({
        full_name: name.trim().slice(0, 100),
        whatsapp: formatPhone(digits),
        project_type: type,
        city: city.trim().slice(0, 100),
        message: message.trim().slice(0, 1500) || null,
        source_page: source.slice(0, 100),
      });
    } catch {
      // O WhatsApp abaixo garante o contato mesmo se o registro falhar.
    }
    setSending(false);
    setSentUrl(url);
    window.location.href = url;
  }

  if (sentUrl) {
    return (
      <div className="border border-primary bg-card p-7 text-center" role="status">
        <CheckCircle2 className="mx-auto size-10 text-primary" aria-hidden="true" />
        <p className="mt-4 font-display text-2xl font-semibold">Pedido recebido!</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Estamos abrindo o WhatsApp com sua mensagem pronta. É só tocar em enviar para nossa equipe
          responder mais rápido.
        </p>
        <Button asChild variant="editorial" className="mt-5">
          <a href={sentUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle /> Abrir WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className={`grid gap-4 border border-border bg-card p-6 md:p-8 ${compact ? "" : "md:grid-cols-2"}`}
    >
      <label className="grid gap-1.5 text-sm font-medium">
        Seu nome
        <input
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          maxLength={100}
          required
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        WhatsApp com DDD
        <input
          className={field}
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          inputMode="tel"
          autoComplete="tel"
          placeholder="(11) 99999-9999"
          required
        />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        O que você precisa?
        <select
          className={field}
          value={type}
          onChange={(e) => setType(e.target.value as QuoteType)}
        >
          {quoteTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Cidade / UF
        <input
          className={field}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          autoComplete="address-level2"
          placeholder="São Paulo / SP"
          maxLength={100}
          required
        />
      </label>
      <label className={`grid gap-1.5 text-sm font-medium ${compact ? "" : "md:col-span-2"}`}>
        Conte um pouco sobre o espaço{" "}
        <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
        <textarea
          className={`${field} h-28 py-2`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1500}
          placeholder="Ex.: sala e cozinha de 40 m², quero um ambiente mais acolhedor"
        />
      </label>
      {error && (
        <p
          className={`text-sm font-semibold text-destructive ${compact ? "" : "md:col-span-2"}`}
          role="alert"
        >
          {error}
        </p>
      )}
      <div className={compact ? "" : "md:col-span-2"}>
        <Button
          type="submit"
          variant="editorial"
          size="lg"
          className="w-full md:w-auto"
          disabled={sending}
        >
          {sending ? "Enviando…" : "Enviar e falar no WhatsApp"}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Sem cadastro e sem compromisso. Seus dados são usados apenas para responder ao seu pedido,
          conforme nossa{" "}
          <a href="/privacidade" className="underline">
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </form>
  );
}
