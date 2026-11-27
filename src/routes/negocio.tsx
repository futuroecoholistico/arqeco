import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Briefcase,
  Check,
  Coffee,
  HeartPulse,
  KeyRound,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import projectImage from "@/assets/arqeco-project.jpg";
import { Button } from "@/components/ui/button";
import { Eyebrow, SiteLayout } from "@/components/site/SiteChrome";
import { FaqList, Testimonials } from "@/components/site/sections";
import { QuoteForm } from "@/components/site/QuoteForm";
import { PORTFOLIO_ATELIER_URL, faqBusiness } from "@/lib/site-content";

export const Route = createFileRoute("/negocio")({
  head: () => ({
    meta: [
      { title: "Para seu negócio — Well Spaces Business | ARQECO" },
      {
        name: "description",
        content:
          "Projetos de espaços comerciais que acolhem clientes e equipes: lojas, escritórios, clínicas, restaurantes e hospedagens. Orçamento sob medida.",
      },
      { property: "og:title", content: "Well Spaces Business — ARQECO" },
      {
        property: "og:description",
        content:
          "Espaços comerciais com bem-estar, sustentabilidade e identidade. Peça seu orçamento.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: NegocioPage,
});

const segments = [
  {
    icon: HeartPulse,
    title: "Clínicas, consultórios e spas",
    text: "Ambientes acolhedores e biofílicos que cuidam de quem atende e de quem é atendido.",
  },
  {
    icon: Briefcase,
    title: "Escritórios",
    text: "Layouts que aumentam o foco, o conforto e o orgulho da equipe.",
  },
  {
    icon: ShoppingBag,
    title: "Lojas e showrooms",
    text: "Espaços que contam a história da marca e fazem o cliente querer ficar.",
  },
  {
    icon: Coffee,
    title: "Restaurantes e hospitalidade",
    text: "Atmosfera, fluxo e conforto que viram experiência e indicação.",
  },
  {
    icon: Sparkles,
    title: "Estúdios e bem-estar",
    text: "Yoga, pilates, terapias e beleza com luz, materiais naturais e calma.",
  },
  {
    icon: KeyRound,
    title: "Imóveis para renda",
    text: "Airbnb e locação que se destacam nas fotos e nas avaliações. ARQECO MOVE em breve.",
  },
];

const included = [
  "Estudo de layout e fluxo de pessoas",
  "Identidade do espaço alinhada à marca",
  "Conforto ambiental, iluminação e biofilia",
  "Visualização 3D do projeto",
  "Lista de materiais com a Curadoria ARQECO",
  "Opção de acompanhamento de obra",
];

const businessSteps: [string, string][] = [
  [
    "Conte sobre o seu negócio",
    "Tipo de espaço, área aproximada e o que precisa mudar. Leva menos de 1 minuto.",
  ],
  [
    "Conversa e proposta",
    "Entendemos o espaço com você e enviamos uma proposta sob medida, com escopo e prazo.",
  ],
  ["Projeto e 3D", "Desenvolvemos o projeto e você aprova tudo em 3D antes de investir na obra."],
  [
    "Execução",
    "Você recebe os arquivos, a lista de materiais e, se quiser, o acompanhamento da obra.",
  ],
];

function NegocioPage() {
  return (
    <SiteLayout
      quoteType="comercial"
      whatsappMessage="Olá! Vim pelo site da ARQECO e quero um projeto para meu negócio."
    >
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-sidebar text-sidebar-foreground">
        <img src={projectImage} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
        <div className="cover-shade absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            Para seu negócio · Well Spaces Business
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] md:text-6xl">
            Espaços que fazem seu cliente <span className="italic text-accent">querer voltar.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg">
            Projetos comerciais com bem-estar, sustentabilidade e a identidade da sua marca. Para
            equipes mais felizes e clientes mais encantados.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="editorial" size="lg">
              <a href="#orcamento">
                Pedir orçamento <ArrowRight />
              </a>
            </Button>
            <Button
              asChild
              variant="paper"
              size="lg"
              className="border-sidebar-foreground/60 text-sidebar-foreground hover:border-accent hover:text-accent"
            >
              <a href="#servico">Como funciona</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Serviço */}
      <section
        id="servico"
        className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div>
          <Eyebrow>Projetos de espaços comerciais</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-semibold">Well Spaces Business</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Um único serviço, pensado sob medida para o seu tipo de negócio. Unimos estética,
            funcionalidade e bem-estar para que o espaço trabalhe a favor dos seus resultados.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
            {segments.map((s) => (
              <div key={s.title} className="bg-card p-6">
                <s.icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="h-fit border border-primary bg-card p-7 lg:sticky lg:top-28">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            O que está incluso
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {included.map((i) => (
              <li key={i} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {i}
              </li>
            ))}
          </ul>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Investimento</dt>
              <dd className="font-semibold">Sob orçamento</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Prazo</dt>
              <dd className="font-semibold">Definido na proposta</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            Cada espaço tem área e uso diferentes, por isso o valor é calculado para o seu projeto.
          </p>
          <Button asChild variant="editorial" className="mt-6 w-full">
            <a href="#orcamento">
              Pedir orçamento <ArrowRight />
            </a>
          </Button>
        </aside>
      </section>

      {/* Portfólio comercial */}
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-5 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <Eyebrow>Portfólio comercial</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold">
              Mais de 1.200 projetos entregues, de clínicas a escritórios e lojas.
            </h2>
          </div>
          <Button asChild variant="paper" size="lg">
            <a href={PORTFOLIO_ATELIER_URL} target="_blank" rel="noopener noreferrer">
              Ver projetos comerciais <ArrowRight />
            </a>
          </Button>
        </div>
      </section>

      <Testimonials audience="negocio" title="Negócios que se transformaram." />

      {/* Como funciona */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Como funciona</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-semibold">
          Do primeiro contato à inauguração.
        </h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {businessSteps.map(([t, d], i) => (
            <li key={t} className="border-t border-border pt-6">
              <span className="font-display text-3xl text-primary">0{i + 1}</span>
              <h3 className="mt-3 text-base font-semibold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Formulário */}
      <section id="orcamento" className="bg-forest text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Orçamento sob medida
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold">Conte sobre o seu espaço.</h2>
            <p className="mt-4 opacity-85">
              Informe o tipo de negócio e, se souber, a área aproximada em m². Respondemos pelo
              WhatsApp com os próximos passos.
            </p>
            <Link
              to="/casa"
              className="mt-6 inline-block text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
            >
              O projeto é para sua casa? Veja os planos residenciais
            </Link>
          </div>
          <div className="text-foreground">
            <QuoteForm defaultType="comercial" source="/negocio" />
          </div>
        </div>
      </section>

      <FaqList items={faqBusiness} />
    </SiteLayout>
  );
}
