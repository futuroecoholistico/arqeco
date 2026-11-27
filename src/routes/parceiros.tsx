import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/sections";

export const Route = createFileRoute("/parceiros")({
  head: () => ({ meta: [
    { title: "Fornecedores e creators | ARQECO" },
    { name: "description", content: "Creators, afiliados, fornecedores e marcas: faça parte da rede ARQECO." },
    { property: "og:title", content: "Parceiros ARQECO" },
    { property: "og:description", content: "Creators, afiliados e fornecedores na jornada ARQECO." },
  ] }),
  component: Parceiros,
});

const blocks = [
          { t: "Você fala sobre casa, design ou lifestyle?", s: "Transforme sua audiência em novas possibilidades.", items: ["Link personalizado", "Materiais de divulgação", "Campanhas", "Rastreamento", "Comissões", "Dashboard"], cta: "Quero indicar e ganhar", to: "/auth" as const, perfil: "afiliado" as const },
          { t: "Sua empresa pode fazer parte dessa jornada.", s: "Fornecedores, marcas, imobiliárias e incorporadoras.", items: ["Produtos na Curadoria ArqEco", "Avaliação pelo Índice Eco-Holístico™", "Vendas diretas na sua loja", "Rede de afiliados", "Integração automática de vendas"], cta: "Quero ser fornecedor", to: "/auth" as const, perfil: "fornecedor" as const },
];

function Parceiros() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Profissionais e parceiros" title={<>Fornecedores e <span className="italic text-accent">creators.</span></>} text="Marcas, lojas e criadores de conteúdo que querem fazer parte da jornada de projetos conscientes." />
      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-20 lg:grid-cols-2">
        {blocks.map((b) => (
          <div key={b.cta} className="flex flex-col border border-border bg-card p-7">
            <h2 className="font-display text-2xl font-semibold">{b.t}</h2><p className="mt-2 text-sm text-muted-foreground">{b.s}</p>
            <ul className="mt-5 flex-1 space-y-2 text-sm">{b.items.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 text-primary" />{i}</li>)}</ul>
            <Button asChild variant="paper" className="mt-6"><Link to={b.to} search={{ perfil: b.perfil }}>{b.cta}</Link></Button>
          </div>
        ))}
      </section>
    </SiteLayout>
  );
}
