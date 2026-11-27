import heroVideoAsset from "@/assets/video/interiores-hero.mp4.asset.json";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Gift, Home as HomeIcon, Ruler } from "lucide-react";
import heroImage from "@/assets/home-hero.jpg";
import karinaKoch from "@/assets/karina-koch.jpg.asset.json";
import startPlanImageAsset from "@/assets/planos/plano-start-dossie.jpeg.asset.json";
import { Button } from "@/components/ui/button";
import { Eyebrow, SiteLayout } from "@/components/site/SiteChrome";
import {
  FaqList,
  HowItWorks,
  PortfolioGrid,
  ProofStrip,
  Supporters,
  Testimonials,
  VisualizeSection,
} from "@/components/site/sections";
import { faqGeneral } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARQECO — Arquitetura e interiores com bem-estar e sustentabilidade" },
      {
        name: "description",
        content:
          "Projetos de interiores e arquitetura online para sua casa, seu negócio e para profissionais. 22 anos de arquitetura sustentável e mais de 1.200 projetos entregues.",
      },
      { property: "og:title", content: "ARQECO — Ambientes que cuidam de você e do planeta" },
      {
        property: "og:description",
        content:
          "Projetos online para casas e negócios, com 3D, lista de compras e curadoria de materiais. Mais de 1.200 projetos entregues.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const doors = [
  {
    icon: HomeIcon,
    eyebrow: "Para sua casa",
    title: "Quero transformar minha casa",
    text: "Decorar, renovar sem obra, construir ou reformar. Planos com preço fechado e 3D.",
    to: "/casa",
    cta: "Ver planos para casa",
  },
  {
    icon: Building2,
    eyebrow: "Para seu negócio",
    title: "Quero um espaço que encante clientes",
    text: "Lojas, escritórios, clínicas e restaurantes com o Well Spaces Business.",
    to: "/negocio",
    cta: "Ver projetos comerciais",
  },
  {
    icon: Ruler,
    eyebrow: "Para arquitetos e designers",
    title: "Sou arquiteto(a) ou designer",
    text: "Formação, apoio técnico com IA, curadoria e programa de indicação.",
    to: "/profissionais",
    cta: "Conhecer a parceria",
  },
] as const;

function Home() {
  return (
    <SiteLayout>
      {/* Hero: proposta de valor + três portas de entrada */}
      <section className="home-cover relative isolate overflow-hidden bg-sidebar text-sidebar-foreground">
        <video
          src={heroVideoAsset.url}
          poster={heroImage}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Ambientes de interiores com vegetação, luz natural e materiais acolhedores"
          className="absolute inset-0 -z-20 size-full object-cover"
        />
        <div className="cover-shade absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 lg:px-10 lg:pt-24">
          <div className="max-w-3xl gentle-rise">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em]">
              ARQECO · Arquitetura Ecológica
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-7xl">
              Ambientes que cuidam de você <span className="italic text-accent">e do planeta.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed md:text-lg">
              Projetos de arquitetura e interiores online, com 3D, lista de compras e materiais
              conscientes. Mais de 1.200 projetos entregues em 22 anos.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {doors.map((d) => (
              <Link
                key={d.to}
                to={d.to}
                className="group flex flex-col border border-sidebar-foreground/25 bg-sidebar/70 p-6 backdrop-blur transition-colors hover:border-accent hover:bg-sidebar/85"
              >
                <d.icon className="size-7 text-accent" aria-hidden="true" />
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  {d.eyebrow}
                </p>
                <p className="mt-2 font-display text-2xl leading-tight">{d.title}</p>
                <p className="mt-2 flex-1 text-sm opacity-80">{d.text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                  {d.cta}{" "}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <ProofStrip />

      {/* Portfólio */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Portfólio</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold">Espaços que respiram.</h2>
          </div>
          <Button asChild variant="paper">
            <Link to="/portfolio">
              Ver portfólio completo <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-10">
          <PortfolioGrid limit={3} />
        </div>
      </section>

      <VisualizeSection />
      <Testimonials />
      <HowItWorks />

      {/* Isca: Dossiê gratuito */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid overflow-hidden border border-dashed border-primary bg-secondary md:grid-cols-[300px_1fr]">
          <img
            src={startPlanImageAsset.url}
            alt="Canto de meditação com almofada de chão, pedras e plantas"
            loading="lazy"
            decoding="async"
            className="h-full min-h-48 w-full object-cover"
          />
          <div className="p-7 md:p-10">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              <Gift className="size-4" aria-hidden="true" /> Ainda não sabe por onde começar?
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold">
              Receba grátis o Dossiê Eco-Holístico do seu ambiente.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Uma leitura de harmonização do seu espaço, com cores, iluminação, tapetes, quadros,
              plantas e cristais, para começar a sentir a diferença hoje.
            </p>
            <Button asChild variant="editorial" className="mt-5">
              <Link to="/diagnostico">
                Receber meu Dossiê grátis <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sobre e fundadora */}
      <section id="sobre" className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.6fr_1.4fr] lg:items-center">
          <img
            src={karinaKoch.url}
            alt="Karina Koch, arquiteta, fundadora e CEO da ARQECO"
            loading="lazy"
            className="aspect-[4/5] w-full max-w-sm object-cover object-[20%_center]"
          />
          <div>
            <Eyebrow>Quem está por trás</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold">
              Projetando espaços que cuidam das pessoas e do planeta.
            </h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground">
              A ARQECO nasceu da trajetória da Arquitetura Ecológica e da arquiteta{" "}
              <strong className="text-foreground">Karina Koch</strong>, especialista em
              sustentabilidade, com 22 anos de formação e mais de 1.200 projetos entregues, de
              diversas tipologias e tamanhos. Em 2025, ficou entre as{" "}
              <strong className="text-foreground">TOP startups do Prêmio Sebrae</strong>.
            </p>
            <div className="mt-8 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3">
              {[
                [
                  "Humanização",
                  "Design atento à rotina, ao conforto e à identidade de cada pessoa.",
                ],
                [
                  "Sustentabilidade",
                  "Materiais e escolhas que reduzem impactos e ampliam o bem-estar.",
                ],
                [
                  "Tecnologia",
                  "Um processo digital claro, do briefing à execução, com apoio de IA.",
                ],
              ].map(([t, d]) => (
                <div key={t} className="bg-background p-5">
                  <p className="font-display text-lg font-semibold">{t}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
            <Link
              to="/nossa-trajetoria"
              className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary"
            >
              Conheça nossa trajetória <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <Supporters />
      <FaqList items={faqGeneral} title="Ainda ficou com alguma dúvida?" />

      {/* CTA final */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center">
        <h2 className="font-display text-4xl font-semibold md:text-5xl">
          Seu espaço começa com uma escolha.
        </h2>
        <p className="mt-5 text-muted-foreground">
          Conte o que você quer transformar. A gente cuida do projeto, das escolhas conscientes e da
          lista do que comprar.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="editorial" size="lg">
            <Link to="/orcamento">
              Pedir orçamento <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="paper" size="lg">
            <Link to="/casa" hash="planos">
              Ver planos para casa
            </Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
