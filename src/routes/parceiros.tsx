import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow, SiteLayout } from "@/components/site/SiteChrome";
import { PAID_PLAN_COMMISSION_RATE } from "@/lib/referrals";

export const Route = createFileRoute("/parceiros")({
  head: () => ({
    meta: [
      { title: "Parceiros — Fornecedores, marcas e creators | ARQECO" },
      {
        name: "description",
        content:
          "Seja fornecedor da Curadoria ARQECO ou creator/afiliado com link personalizado e comissão.",
      },
      { property: "og:title", content: "Parceiros ARQECO" },
      {
        property: "og:description",
        content:
          "Fornecedores, marcas, imobiliárias, incorporadoras e creators que caminham com a ARQECO.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ParceirosPage,
});

function ParceirosPage() {
  const blocks = [
    {
      t: "Você fala sobre casa, design ou lifestyle?",
      s: `Transforme sua audiência em renda: ${PAID_PLAN_COMMISSION_RATE}% de comissão por plano contratado.`,
      items: [
        "Link personalizado",
        "Materiais de divulgação",
        "Campanhas",
        "Rastreamento",
        "Comissões",
        "Dashboard",
      ],
      cta: "Ser creator / afiliado",
      perfil: "afiliado" as const,
    },
    {
      t: "Sua empresa pode fazer parte dessa jornada.",
      s: "Fornecedores, marcas, imobiliárias e incorporadoras.",
      items: [
        "Produtos na Curadoria ArqEco",
        "Avaliação pelo Índice Eco-Holístico™",
        "Vendas diretas na sua loja",
        "Rede de afiliados",
        "Integração automática de vendas",
      ],
      cta: "Quero ser fornecedor",
      perfil: "fornecedor" as const,
    },
  ];
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Parceiros</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold">
          Quem caminha com a ARQECO cresce junto.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Programas para quem produz conteúdo e para empresas do setor de construção, decoração e
          imóveis.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {blocks.map((b) => (
            <div key={b.cta} className="flex flex-col border border-border bg-card p-7 md:p-10">
              <h2 className="font-display text-3xl font-semibold">{b.t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{b.s}</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {b.items.map((i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="mt-0.5 size-4 text-primary" aria-hidden="true" />
                    {i}
                  </li>
                ))}
              </ul>
              <Button asChild variant="editorial" className="mt-8 self-start">
                <Link to="/auth" search={{ perfil: b.perfil }}>
                  {b.cta} <ArrowRight />
                </Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          É arquiteto(a) ou designer?{" "}
          <Link
            to="/profissionais"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Conheça a parceria para profissionais
          </Link>
        </p>
      </section>
    </SiteLayout>
  );
}
