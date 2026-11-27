import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow, SiteLayout } from "@/components/site/SiteChrome";
import { PortfolioGrid } from "@/components/site/sections";
import { PORTFOLIO_ATELIER_URL } from "@/lib/site-content";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfólio — Projetos residenciais e comerciais | ARQECO" },
      {
        name: "description",
        content:
          "Projetos de interiores e arquitetura sustentável da ARQECO e da arquiteta Karina Koch. Mais de 1.200 projetos entregues.",
      },
      { property: "og:title", content: "Portfólio ARQECO" },
      {
        property: "og:description",
        content: "Mais de 1.200 projetos entregues, de casas a clínicas, lojas e escritórios.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-5 py-16 lg:py-20">
        <Eyebrow>Portfólio</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold">
          Espaços que respiram.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Matéria, luz e natureza organizadas em torno de quem vive o espaço. São mais de 1.200
          projetos entregues, de diversas tipologias e tamanhos.
        </p>
        <div className="mt-10">
          <PortfolioGrid rooms />
        </div>
      </section>
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-5 py-14 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold">
              Projetos comerciais, institucionais e corporativos
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Veja o portfólio completo da arquiteta Karina Koch, fundadora da ARQECO.
            </p>
          </div>
          <Button asChild variant="paper" size="lg">
            <a href={PORTFOLIO_ATELIER_URL} target="_blank" rel="noopener noreferrer">
              Ver portfólio completo <ArrowRight />
            </a>
          </Button>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h2 className="font-display text-4xl font-semibold">Gostou? O próximo pode ser o seu.</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="editorial" size="lg">
            <Link to="/casa">Para sua casa</Link>
          </Button>
          <Button asChild variant="paper" size="lg">
            <Link to="/negocio">Para seu negócio</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
