import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Check, Gift, Minus } from "lucide-react";
import startPlanImageAsset from "@/assets/planos/plano-start-dossie.jpeg.asset.json";
import heroImage from "@/assets/home-hero.jpg";
import { Button } from "@/components/ui/button";
import { Eyebrow, SiteLayout } from "@/components/site/SiteChrome";
import {
  FaqList,
  HowItWorks,
  PlanCards,
  PortfolioGrid,
  Testimonials,
  VisualizeSection,
  planComparison,
} from "@/components/site/sections";
import { QuoteForm } from "@/components/site/QuoteForm";
import { faqGeneral, faqHome } from "@/lib/site-content";

export const Route = createFileRoute("/casa")({
  head: () => ({
    meta: [
      { title: "Para sua casa — Projeto de interiores online | ARQECO" },
      {
        name: "description",
        content:
          "Transforme sua casa sem obra ou planeje sua construção e reforma. Planos de interiores online com 3D, lista de compras e bem-estar.",
      },
      { property: "og:title", content: "Para sua casa — ARQECO" },
      {
        property: "og:description",
        content:
          "Planos de interiores com preço fechado, 3D e lista de compras. Ou um projeto completo para construir ou reformar.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CasaPage,
});

const receive: [string, string][] = [
  ["Briefing", "Você conta o que precisa, como vive e o que deseja transformar."],
  ["Projeto", "Um profissional desenvolve as soluções para o seu espaço."],
  ["Visualização", "Você vê o projeto em 3D antes de executar."],
  ["Curadoria", "Materiais e produtos organizados para facilitar suas escolhas."],
  ["Lista de materiais", "Especificações, quantidades e links de compra."],
  ["Execução", "Um caminho claro para colocar o projeto em prática."],
];

function CasaPage() {
  return (
    <SiteLayout
      quoteType="casa_decorar"
      whatsappMessage="Olá! Vim pelo site da ARQECO e quero transformar minha casa."
    >
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-sidebar text-sidebar-foreground">
        <img src={heroImage} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
        <div className="cover-shade absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            Para sua casa
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] md:text-6xl">
            Acorde num lar que <span className="italic text-accent">descansa você.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg">
            Renove sua casa sem obra e sem improviso, ou planeje sua construção do jeito certo. Você
            vê tudo em 3D antes de gastar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="editorial" size="lg">
              <a href="#planos">
                Ver planos e preços <ArrowRight />
              </a>
            </Button>
            <Button
              asChild
              variant="paper"
              size="lg"
              className="border-sidebar-foreground/60 text-sidebar-foreground hover:border-accent hover:text-accent"
            >
              <a href="#orcamento">Pedir orçamento</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Serviços por categoria */}
      <section id="planos" className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Renovar sem obra</Eyebrow>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold">
          Escolha o projeto ideal para o seu espaço.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Não precisa contratar mais do que precisa. Escolha pelo nível de transformação que você
          procura.
        </p>
        <PlanCards />

        {/* Comparativo */}
        <div className="mt-14 overflow-x-auto border-y border-border">
          <h3 className="px-6 pt-6 font-display text-2xl font-semibold">
            O que muda entre os planos?
          </h3>
          <table className="mt-4 w-full min-w-[560px] text-sm">
            <thead className="bg-card">
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-6 py-3 font-semibold">
                  <span className="sr-only">Item</span>
                </th>
                <th className="px-4 py-3">Viver Bem</th>
                <th className="px-4 py-3">Viver Lifestyle</th>
              </tr>
            </thead>
            <tbody>
              {planComparison.map(([f, ...v]) => (
                <tr key={f} className="border-b border-border last:border-0">
                  <td className="px-6 py-3">{f}</td>
                  {v.map((c, i) => (
                    <td key={i} className="px-4 py-3">
                      {c === "✓" ? (
                        <Check className="size-4 text-primary" aria-label="Incluso" />
                      ) : c === "—" ? (
                        <Minus
                          className="size-4 text-muted-foreground/50"
                          aria-label="Não incluso"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">{c}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Comece sem custo + Construir ou reformar */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <article className="flex flex-col overflow-hidden border border-dashed border-primary bg-secondary">
            <img
              src={startPlanImageAsset.url}
              alt="Canto de meditação com almofada de chão, pedras e plantas"
              loading="lazy"
              decoding="async"
              className="aspect-[16/7] w-full object-cover"
            />
            <div className="flex flex-1 flex-col p-7">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                <Gift className="size-4" aria-hidden="true" /> Comece sem custo
              </p>
              <h3 className="mt-3 font-display text-3xl font-semibold">
                Diagnóstico gratuito do seu ambiente
              </h3>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                Dossiê Eco-Holístico
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                Uma leitura de harmonização com cores, iluminação, tapetes, quadros, plantas e
                cristais. Não é um projeto de interiores: é um primeiro olhar, com carinho, sobre o
                espaço onde você vive.
              </p>
              <p className="mt-4 text-xs">
                <strong>Investimento:</strong> gratuito · <strong>Prazo:</strong> na hora, online
              </p>
              <Button asChild variant="paper" className="mt-5 self-start">
                <Link to="/diagnostico">
                  Receber meu Dossiê grátis <ArrowRight />
                </Link>
              </Button>
            </div>
          </article>
          <article className="flex flex-col bg-forest p-7 text-primary-foreground md:p-10">
            <Building2 className="size-8 text-accent" aria-hidden="true" />
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Construir ou reformar
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold">
              Projeto completo para construir ou reformar
            </h3>
            <p className="mt-4 text-sm leading-relaxed opacity-80">
              Arquitetura sustentável para casas e reformas maiores: somente o projeto ou a jornada
              completa com obra e acompanhamento.
            </p>
            <ul className="mt-5 space-y-2 text-sm opacity-90">
              {[
                "Projeto arquitetônico e de interiores",
                "Soluções de conforto e eficiência",
                "Opção de acompanhamento de obra",
              ].map((i) => (
                <li key={i} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                  {i}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs opacity-80">
              <strong>Investimento:</strong> sob orçamento · <strong>Prazo:</strong> definido na
              proposta
            </p>
            <div className="mt-auto pt-8">
              <Button asChild variant="editorial">
                <Link to="/orcamento" search={{ tipo: "casa_construir" }}>
                  Pedir orçamento <ArrowRight />
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </section>

      {/* O que você recebe */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Eyebrow>Mais do que uma imagem bonita</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold">
            Seu projeto acompanha você até a execução.
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {receive.map(([t, d], i) => (
              <div key={t} className="border-t border-border pt-5">
                <p className="font-display text-sm text-forest-soft">0{i + 1}</p>
                <h3 className="mt-2 font-display text-2xl font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <VisualizeSection />

      {/* Portfólio residencial */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <Eyebrow>Projetos residenciais</Eyebrow>
        <h2 className="mt-4 mb-8 font-display text-4xl font-semibold">Casas que ganharam alma.</h2>
        <PortfolioGrid kind="residencial" rooms />
      </section>

      <Testimonials audience="casa" title="Quem transformou a casa com a ARQECO." />
      <HowItWorks />

      {/* Formulário */}
      <section id="orcamento" className="bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Orçamento sem compromisso</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold">
              Ficou em dúvida sobre qual plano escolher?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Conte sobre sua casa em menos de 1 minuto, sem criar conta. Respondemos pelo WhatsApp
              com a melhor indicação para você.
            </p>
          </div>
          <QuoteForm defaultType="casa_decorar" source="/casa" />
        </div>
      </section>

      <FaqList items={[...faqHome, ...faqGeneral.slice(1, 3)]} />
    </SiteLayout>
  );
}
