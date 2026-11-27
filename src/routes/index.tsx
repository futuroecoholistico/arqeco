import heroVideoAsset from "@/assets/video/interiores-hero.mp4.asset.json";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Briefcase, Gift, Home as HomeIcon, MoveHorizontal, PenTool, Quote } from "lucide-react";
import heroImage from "@/assets/home-hero.jpg";
import karinaKoch from "@/assets/karina-koch.jpg.asset.json";
import bedroomImage from "@/assets/portfolio-quarto.jpg";
import projectImage from "@/assets/arqeco-project.jpg";
import projectBeforeImage from "@/assets/arqeco-project-before.jpg";
import startPlanImageAsset from "@/assets/planos/plano-start-dossie.jpeg.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, WHATSAPP_URL } from "@/components/site/SiteLayout";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARQECO — Projeto de interiores online, sustentável e com curadoria" },
      { name: "description", content: "Há 22 anos criando ambientes que cuidam de você e do planeta: projetos de arquitetura e interiores online, com 3D, lista de compras e materiais conscientes. Mais de 1.200 projetos entregues." },
      { property: "og:title", content: "ARQECO — Ambientes que cuidam de você e do planeta" },
      { property: "og:description", content: "Projetos de interiores online que promovem bem-estar e sustentabilidade, com profissionais, 3D e curadoria de materiais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const apoiadores = [
  "Sebrae",
  "Inovativa Brasil",
  "Think Beyond Plastic",
  "The Climate Reality Project",
  "Movimento Nacional ODS São Paulo",
  "Parque Tech São Caetano",
];

const faq: [string, string][] = [
  ["O que é a ArqEco?", "Uma plataforma de projetos de arquitetura e interiores que conecta clientes, profissionais, tecnologia e curadoria de materiais."],
  ["O projeto é online?", "Sim. O processo é estruturado digitalmente, do briefing à entrega, de acordo com o plano contratado."],
  ["Atendem casas e também negócios?", "Sim. Temos planos com preço fechado para residências e projetos sob orçamento para lojas, escritórios, clínicas e restaurantes."],
  ["A ArqEco vende os produtos?", "Não. Os produtos são vendidos diretamente pelos fornecedores parceiros."],
];

const audiences = [
  { icon: HomeIcon, eyebrow: "Para sua casa", title: "Quero transformar minha casa", text: "Decorar, renovar sem obra, construir ou reformar. Planos com preço fechado e 3D.", href: "/casa" },
  { icon: Briefcase, eyebrow: "Para seu negócio", title: "Quero um espaço que encante clientes", text: "Lojas, escritórios, clínicas e restaurantes com o Well Spaces Business.", href: "/negocio" },
  { icon: PenTool, eyebrow: "Para arquitetos e designers", title: "Sou arquiteto(a) ou designer", text: "Formação, apoio técnico com IA, curadoria e programa de indicação.", href: "/profissionais" },
];

const numbers: [string, string][] = [["22 anos", "de arquitetura sustentável"], ["+1.200", "projetos entregues"], ["TOP Startups 2025", "Prêmio Sebrae"], ["100% online", "do briefing à lista de compras"]];

const steps: [string, string][] = [
  ["Conte o que você precisa", "Briefing online com fotos, medidas, rotina e referências."],
  ["Seu projeto ganha forma", "Um profissional da rede desenvolve as soluções para o seu espaço."],
  ["Veja antes de executar", "Visualização 3D para decidir com segurança."],
  ["Transforme seu espaço", "Arquivos do projeto e lista de compras da Curadoria ArqEco."],
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-forest-soft"><span className="h-px w-8 bg-forest-soft" />{children}</p>;
}

function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => (await supabase.from("testimonials").select("id,author_name,context,project_label,quote").eq("is_active", true).order("sort_order")).data ?? [],
  });
}


function BeforeAfter() {
  const [position, setPosition] = useState(50);

  return (
    <figure className="group relative aspect-[4/3] w-full touch-none select-none overflow-hidden bg-muted">
      <img src={projectBeforeImage} alt="Ambiente vazio antes do projeto de interiores" loading="lazy" width={1408} height={800} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }} aria-hidden="true">
        <img src={projectImage} alt="" width={1408} height={800} className="absolute inset-0 size-full object-cover" />
      </div>
      <span className="absolute left-4 top-4 bg-foreground/85 px-3 py-1.5 text-[10px] font-semibold uppercase text-background">Depois</span>
      <span className="absolute right-4 top-4 bg-card/90 px-3 py-1.5 text-[10px] font-semibold uppercase text-foreground">Antes</span>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-background shadow-editorial" style={{ left: `${position}%` }}>
        <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-background/60 bg-primary text-primary-foreground shadow-editorial">
          <MoveHorizontal className="size-5" />
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="Comparar ambiente antes e depois"
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
      <figcaption className="sr-only">Arraste o controle para comparar o ambiente antes e depois do projeto.</figcaption>
    </figure>
  );
}

function Home() {
  const testimonials = useTestimonials().data ?? [];
  return (
    <SiteLayout>
      <section className="home-cover relative isolate overflow-hidden bg-sidebar text-sidebar-foreground">
        <video src={heroVideoAsset.url} poster={heroImage} autoPlay muted loop playsInline preload="auto" aria-label="Ambientes de interiores com vegetação, luz natural e materiais acolhedores" className="absolute inset-0 -z-20 size-full object-cover" />
        <div className="cover-shade absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-5 pb-14 pt-20 lg:px-10 lg:pt-28">
          <div className="max-w-3xl gentle-rise">
            <h1 className="font-display text-5xl font-normal leading-tight md:text-7xl">Ambientes que cuidam de você <span className="italic text-accent">e do planeta.</span></h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed md:text-base">Projetos de arquitetura e interiores online, com 3D, lista de compras e materiais conscientes. Mais de 1.200 projetos entregues em 22 anos.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {audiences.map(({ icon: Icon, eyebrow, title, text, href }) => (
              <a key={href} href={href} className="group flex min-w-0 flex-col border border-sidebar-foreground/25 bg-sidebar/70 p-6 backdrop-blur-md transition-colors hover:border-accent">
                <Icon className="size-6 text-accent" aria-hidden="true" />
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed opacity-85">{text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em]">Ver caminho <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="home-signature border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 lg:grid-cols-4">
          {numbers.map(([v, l]) => <div key={v} className="text-center"><p className="font-display text-2xl text-primary">{v}</p><p className="mt-1 text-[11px] font-medium text-muted-foreground">{l}</p></div>)}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="flex items-end justify-between gap-6"><div><Eyebrow>Portfólio</Eyebrow><h2 className="mt-4 font-display text-4xl font-bold">Espaços que respiram.</h2></div><p className="hidden max-w-xs text-right text-sm text-muted-foreground md:block">Matéria, luz e natureza organizadas em torno de quem vive o espaço.</p></div>
        <div className="mt-10 grid items-start gap-6 md:grid-cols-[1.15fr_0.85fr_1fr]">
          {[[heroImage, "Sala · Residencial", "Viver Lifestyle"], [bedroomImage, "Quarto · Residencial", "Viver Bem"], [projectImage, "Estar · Residencial", "Design Eco-Holístico"]].map(([src, t, p]) => (
            <figure key={t} className="even:md:mt-10"><img src={src} alt={t} loading="lazy" className="aspect-[4/5] w-full object-cover" /><figcaption className="mt-3 border-t border-border pt-3"><p className="text-sm font-semibold">{t}</p><p className="text-xs text-muted-foreground">{p}</p></figcaption></figure>
          ))}
        </div>
        <div className="mt-10 text-center"><Button asChild variant="paper" size="lg"><a href="/portfolio">Ver portfólio completo <ArrowRight /></a></Button></div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center">
          <BeforeAfter />
          <div>
            <Eyebrow>Projeto 3D</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold">Antes de transformar, visualize.</h2>
            <p className="mt-4 text-muted-foreground">Veja como seu ambiente poderá ficar antes de comprar móveis, revestimentos ou objetos.</p>
            <p className="mt-6 font-display text-xl">3D para entender. Visualização para decidir. Projeto para executar.</p>
            <p className="mt-6 text-sm text-muted-foreground"><strong className="text-foreground">Em planos selecionados:</strong> caminhe virtualmente pelo seu projeto com tour 360°.</p>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section id="depoimentos" className="mx-auto max-w-7xl px-5 py-24">
          <Eyebrow>Depoimentos</Eyebrow>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold">Quando o projeto faz sentido, a transformação vai além da estética.</h2>
          <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0">
            {testimonials.map((t) => (
              <figure key={t.id} className="flex min-w-[78%] snap-start flex-col border border-border bg-background p-5 sm:min-w-[46%] lg:min-w-0 lg:flex-1">
                <Quote className="size-5 text-primary" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed">“{t.quote}”</blockquote>
                <figcaption className="mt-4 border-t border-border pt-3"><p className="text-xs font-semibold">{t.author_name}</p><p className="mt-1 text-[11px] text-muted-foreground">{[t.context, t.project_label].filter(Boolean).join(" · ")}</p></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section id="como-funciona" className="bg-secondary">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-semibold">Do briefing ao espaço transformado.</h2>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([t, d], i) => <li key={t} className="border-t border-border pt-6"><span className="font-display text-3xl text-primary">0{i + 1}</span><h3 className="mt-3 text-base font-semibold">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto grid max-w-5xl overflow-hidden border border-dashed border-primary bg-secondary md:grid-cols-[260px_1fr]">
          <img src={startPlanImageAsset.url} alt="Canto de meditação com almofada de chão, pedras e plantas" loading="lazy" decoding="async" className="h-full min-h-48 w-full object-cover" />
          <div className="p-7">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary"><Gift className="size-4" aria-hidden="true" /> Um presente da ARQECO para você</p>
            <h2 className="mt-3 font-display text-3xl font-semibold">Dossiê Eco-Holístico gratuito</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Uma leitura gratuita de harmonização do seu ambiente — cores, iluminação, tapetes, quadros, plantas e cristais — para melhorar o seu bem-estar. Não é um projeto de interiores: é um primeiro olhar, com carinho, sobre o espaço onde você vive.</p>
            <Button asChild variant="paper" className="mt-5"><Link to="/diagnostico">Receber meu presente <ArrowRight /></Link></Button>
          </div>
        </div>
      </section>

      <section id="sobre" className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[0.75fr_1.25fr]">
          <div><img src={karinaKoch.url} alt="Karina Koch, arquiteta especialista em Design Sustentável e CEO da ArqEco" loading="lazy" className="aspect-[4/5] w-full object-cover object-[20%_center]" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Karina Koch</p><p className="mt-1 text-xs text-muted-foreground">Arquiteta especialista em Design Sustentável e CEO da ArqEco</p></div>
          <div>
            <Eyebrow>Sobre a ArqEco</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-bold">Projetando espaços que cuidam das pessoas e do planeta.</h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground">A ARQECO nasceu da trajetória da Arquitetura Ecológica e da arquiteta Karina Koch, especialista em sustentabilidade, com 22 anos de formação e mais de 1.200 projetos entregues, de diversas tipologias e tamanhos. Em 2025, ficou entre as <strong className="text-foreground">TOP startups do Prêmio Sebrae</strong>.</p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {[["Humanização", "Design atento à rotina, ao conforto e à identidade de cada pessoa."], ["Sustentabilidade", "Materiais e escolhas orientados para reduzir impactos e ampliar o bem-estar."], ["Tecnologia", "Um processo digital claro, do briefing à execução."]].map(([t, d], i) => <div key={t} className="border-t border-border pt-5"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">0{i + 1} · {t}</p><p className="mt-3 text-sm text-muted-foreground">{d}</p></div>)}
            </div>
            <Link to="/nossa-trajetoria" className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">Conheça nossa trajetória <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>

      <section id="apoiadores" className="bg-forest text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <p className="text-center font-display text-2xl italic text-accent md:text-3xl">Quem nos apoia:</p>
          <p className="mx-auto mt-2 max-w-xl text-center text-xs leading-relaxed opacity-70">Instituições e iniciativas que caminham com a ARQECO.</p>
          <ul className="mt-9 grid gap-px overflow-hidden bg-primary-foreground/15 sm:grid-cols-2 lg:grid-cols-3">
            {apoiadores.map((nome) => <li key={nome} className="flex min-h-[5.5rem] items-center justify-center bg-forest px-6 py-5 text-center"><span className="text-xs font-semibold uppercase leading-relaxed tracking-[0.14em] opacity-75">{nome}</span></li>)}
          </ul>
        </div>
      </section>

      <section className="bg-card">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="font-display text-4xl font-semibold">Perguntas frequentes</h2>
          <div className="mt-8 divide-y divide-border">{faq.map(([q, a]) => <details key={q} className="py-4"><summary className="cursor-pointer list-none font-semibold">{q}</summary><p className="mt-2 text-sm text-muted-foreground">{a}</p></details>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-24 text-center">
        <h2 className="font-display text-5xl font-semibold">Seu espaço começa com uma conversa.</h2>
        <p className="mt-5 text-muted-foreground">Conte o que você quer transformar e nosso time indica o melhor caminho.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild variant="editorial" size="lg"><a href="/orcamento">Pedir orçamento</a></Button><Button asChild variant="paper" size="lg"><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a></Button></div>
      </section>
    </SiteLayout>
  );
}
