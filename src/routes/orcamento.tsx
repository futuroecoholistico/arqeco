import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Clock, MessageCircle, ShieldCheck } from "lucide-react";
import { Eyebrow, SiteLayout } from "@/components/site/SiteChrome";
import { QuoteForm, isQuoteType, type QuoteType } from "@/components/site/QuoteForm";
import { WHATSAPP_LABEL, whatsappUrl } from "@/lib/site-content";

export const Route = createFileRoute("/orcamento")({
  validateSearch: z.object({ tipo: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Pedir orçamento — ARQECO" },
      {
        name: "description",
        content:
          "Peça um orçamento de projeto de arquitetura ou interiores em menos de 1 minuto, sem criar conta. Resposta pelo WhatsApp.",
      },
      { property: "og:title", content: "Pedir orçamento — ARQECO" },
      {
        property: "og:description",
        content: "Conte o que você precisa e receba sua proposta pelo WhatsApp.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: OrcamentoPage,
});

function OrcamentoPage() {
  const { tipo } = Route.useSearch();
  const defaultType: QuoteType = isQuoteType(tipo) ? tipo : "casa_decorar";
  return (
    <SiteLayout quoteType={defaultType}>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
        <div>
          <Eyebrow>Orçamento sem compromisso</Eyebrow>
          <h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">
            Conte o que você quer transformar.
          </h1>
          <p className="mt-5 text-muted-foreground">
            Leva menos de 1 minuto e não precisa criar conta. Nossa equipe responde pelo WhatsApp
            com os próximos passos.
          </p>
          <ul className="mt-8 space-y-4 text-sm">
            <li className="flex gap-3">
              <Clock className="size-5 shrink-0 text-primary" aria-hidden="true" />5 campos, sem
              cadastro
            </li>
            <li className="flex gap-3">
              <MessageCircle className="size-5 shrink-0 text-primary" aria-hidden="true" />
              Resposta direto no seu WhatsApp
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />
              Mais de 1.200 projetos entregues em 22 anos
            </li>
          </ul>
          <p className="mt-8 text-sm text-muted-foreground">
            Prefere conversar agora?{" "}
            <a
              className="font-semibold text-primary underline-offset-4 hover:underline"
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chame no WhatsApp {WHATSAPP_LABEL}
            </a>
          </p>
        </div>
        <QuoteForm key={defaultType} defaultType={defaultType} source="/orcamento" />
      </section>
    </SiteLayout>
  );
}
