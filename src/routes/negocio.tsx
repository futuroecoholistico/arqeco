import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { COMMERCIAL_PORTFOLIO_URL, Eyebrow, FaqSection, PageHero, QuoteSection, StepsSection } from "@/components/site/sections";

export const Route = createFileRoute("/negocio")({
  head: () => ({ meta: [
    { title: "Para seu negócio — Well Spaces Business | ARQECO" },
    { name: "description", content: "Projetos de espaços comerciais: clínicas, escritórios, lojas, restaurantes e estúdios com conforto, biofilia e identidade de marca." },
    { property: "og:title", content: "Well Spaces Business — ARQECO" },
    { property: "og:description", content: "Espaços que fazem seu cliente querer voltar." },
  ] }),
  component: Negocio,
});

const segments: [string, string][] = [
  ["Clínicas, consultórios e spas", "Ambientes acolhedores e biofílicos que cuidam de quem atende e de quem é atendido."],
  ["Escritórios", "Layout, conforto e foco para equipes produtivas e saudáveis."],
  ["Lojas e showrooms", "Experiência de marca que convida a entrar e a ficar."],
  ["Restaurantes e hospitalidade", "Atmosfera, fluxo e materiais pensados para receber bem."],
  ["Estúdios e bem-estar", "Espaços para yoga, terapias, beleza e saúde integrativa."],
  ["Imóveis para renda", "Airbnb e locação com projeto que valoriza o imóvel — ARQECO MOVE em breve."],
];

const included = ["Layout e fluxo", "Identidade da marca no espaço", "Conforto, iluminação e biofilia", "Visualização 3D", "Lista de materiais", "Opção de acompanhamento de obra"];

const faq: [string, string][] = [
  ["Quanto custa um projeto comercial?", "Cada espaço é único. Enviamos uma proposta sob orçamento depois de entender o seu negócio."],
  ["Qual o prazo?", "O prazo é definido na proposta, conforme o tamanho e a complexidade do espaço."],
  ["Vocês acompanham a obra?", "Sim, como opção. O acompanhamento pode ser incluído na proposta."],
  ["Atendem fora de São Paulo?", "Sim. O processo é online, do briefing à entrega."],
];

function Negocio() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Para seu negócio · Well Spaces Business" title={<>Espaços que fazem seu cliente <span className="italic text-accent">querer voltar.</span></>} text="Projetos de arquitetura e interiores para negócios que querem encantar, acolher e vender melhor — com sustentabilidade e bem-estar.">
        <Button asChild variant="editorial" size="lg"><a href="#orcamento">Pedir orçamento <ArrowRight /></a></Button>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <Eyebrow>Well Spaces Business</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-semibold">Projetos de espaços comerciais</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {segments.map(([t, d]) => <div key={t} className="border-t border-border pt-5"><h3 className="font-display text-xl font-semibold">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>)}
          </div>
          <a href={COMMERCIAL_PORTFOLIO_URL} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">Ver portfólio comercial <ArrowRight className="size-4" /></a>
        </div>
        <aside className="h-fit border border-primary bg-card p-7 lg:sticky lg:top-28">
          <h3 className="font-display text-2xl font-semibold">O que está incluso</h3>
          <ul className="mt-5 space-y-2 text-sm">{included.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{i}</li>)}</ul>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
            <div><dt className="text-xs text-muted-foreground">Investimento</dt><dd className="font-semibold">Sob orçamento</dd></div>
            <div><dt className="text-xs text-muted-foreground">Prazo</dt><dd className="font-semibold">Definido na proposta</dd></div>
          </dl>
          <Button asChild variant="editorial" className="mt-6 w-full"><a href="#orcamento">Pedir orçamento</a></Button>
        </aside>
      </section>

      <StepsSection title="Do briefing ao espaço que encanta." steps={[["Conte sobre o seu negócio", "Segmento, público, metragem e o que precisa mudar."], ["Receba a proposta", "Escopo, investimento e prazo definidos para o seu espaço."], ["Veja antes de executar", "Layout e 3D para decidir com segurança."], ["Transforme seu espaço", "Arquivos, lista de materiais e, se quiser, acompanhamento de obra."]]} />
      <QuoteSection tipo="negocio" label="Projeto para meu negócio" />
      <FaqSection items={faq} />
    </SiteLayout>
  );
}
