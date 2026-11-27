import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { COMMERCIAL_PORTFOLIO_URL, PageHero, PortfolioGrid } from "@/components/site/sections";

export const Route = createFileRoute("/portfolio")({
  head: () => ({ meta: [
    { title: "Portfólio | ARQECO" },
    { name: "description", content: "Projetos de interiores sustentáveis da ARQECO: salas, quartos e espaços de bem-estar." },
    { property: "og:title", content: "Portfólio ARQECO" },
    { property: "og:description", content: "Espaços que respiram: matéria, luz e natureza." },
  ] }),
  component: Portfolio,
});

function Portfolio() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Portfólio" title={<>Espaços que <span className="italic text-accent">respiram.</span></>} text="Matéria, luz e natureza organizadas em torno de quem vive o espaço." />
      <section className="mx-auto max-w-7xl px-5 py-20">
        <PortfolioGrid />
        <div className="mt-12 text-center"><Button asChild variant="editorial" size="lg"><a href={COMMERCIAL_PORTFOLIO_URL} target="_blank" rel="noopener noreferrer">Ver portfólio completo <ArrowRight /></a></Button></div>
      </section>
    </SiteLayout>
  );
}
