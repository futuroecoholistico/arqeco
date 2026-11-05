import heroVideoAsset from "@/assets/video/interiores-hero.mp4.asset.json";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, Building2, Check, ChevronDown, Eye, Hammer, Menu, Minus, MoveHorizontal, Quote, X } from "lucide-react";
import heroImage from "@/assets/home-hero.jpg";
import karinaKoch from "@/assets/karina-koch.jpg.asset.json";
import bedroomImage from "@/assets/portfolio-quarto.jpg";
import projectImage from "@/assets/arqeco-project.jpg";
import projectBeforeImage from "@/assets/arqeco-project-before.jpg";
import compactLogoAsset from "@/assets/arqeco-logo-branco.png.asset.json";
import startPlanImageAsset from "@/assets/planos/plano-start-dossie.jpeg.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/components/PartnerShell";
import { categoryHome } from "@/lib/account";
import { RegistrationChoiceDialog } from "@/components/RegistrationChoiceDialog";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARQECO — Projeto de interiores online, sustentável e com curadoria" },
      { name: "description", content: "Há 12 anos, a ARQECO cria projetos de interiores com design, bem-estar e sustentabilidade, conectando clientes, profissionais e curadoria." },
      { property: "og:title", content: "ARQECO — Seu espaço pode fazer mais por você" },
      { property: "og:description", content: "Projetos de interiores online que promovem bem-estar e sustentabilidade, com profissionais, 3D e curadoria de materiais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const nav = [["Serviços", "#servicos"], ["Projetos", "#planos"], ["Como funciona", "#como-funciona"], ["Curadoria", "#curadoria"], ["Sobre", "#sobre"]];
const startPlanImage = startPlanImageAsset.url;

const comparison: [string, string, string][] = [
  ["Formato", "Projeto sustentável", "Projeto sustentável ampliado"], ["Projeto de interiores", "✓", "✓"], ["Layout", "✓", "✓"], ["Estilo e estética", "✓", "✓"],
  ["Visualização 3D personalizada", "✓", "✓"], ["Lista de materiais", "✓", "✓"], ["Curadoria ArqEco", "✓", "✓"],
  ["Sustentabilidade", "✓", "✓"], ["Conforto ambiental", "✓", "✓"], ["Rotina e hábitos", "—", "✓"],
  ["Biofilia", "—", "✓"], ["Neuroarquitetura", "—", "✓"], ["Dossiê Eco-Holístico", "Bônus", "Bônus"],
];

const apoiadores = [
  "Sebrae",
  "Inovativa Brasil",
  "Think Beyond Plastic",
  "The Climate Reality Project",
  "Movimento Nacional ODS São Paulo",
  "Parque Tech São Caetano",
];

const faq: [string, string][] = [
  ["O que é a ArqEco?", "Uma plataforma de projetos de interiores que conecta clientes, profissionais, tecnologia e curadoria de materiais."],
  ["O projeto é online?", "Sim. O processo é estruturado digitalmente, do briefing à entrega, de acordo com o plano contratado."],
  ["Quem desenvolve meu projeto?", "Profissionais da rede ArqEco, conforme o processo de seleção e atribuição da plataforma."],
  ["Posso escolher o profissional?", "Hoje a ArqEco faz a atribuição. A escolha pelo cliente poderá ser disponibilizada no futuro."],
  ["O que está incluído em cada plano?", "Cada plano tem seus próprios entregáveis. Consulte a tabela comparativa."],
  ["Recebo projeto em 3D?", "Nos planos em que o 3D estiver incluído, sim."],
  ["A ArqEco vende os produtos?", "Não. Os produtos são vendidos diretamente pelos fornecedores parceiros."],
  ["O que é o Índice Eco-Holístico™?", "Uma metodologia proprietária para organizar e interpretar critérios relacionados a materiais e produtos."],
  ["O Dossiê Eco-Holístico está incluído?", "Sim. Todos os pacotes de projeto ARQECO recebem o Dossiê Eco-Holístico como bônus gratuito."],
  ["Quem pode usar a Zoe?", "A Zoe está disponível exclusivamente no painel de arquitetos e designers da rede ArqEco. Ela apoia o trabalho profissional, mas não substitui um responsável técnico habilitado."],
  ["O que é o Certificado ArqEco?", "Um registro emitido para projetos elegíveis, conforme critérios e metodologia definidos pela plataforma."],
];

const illustrativeResults = [
  ["01", "Mais clareza", "para visualizar o ambiente e decidir antes da execução."],
  ["02", "Escolhas organizadas", "com materiais, produtos e referências reunidos no projeto."],
  ["03", "Menos improviso", "com um caminho estruturado do briefing à lista de materiais."],
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

function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_plans").select("id,slug,name,tagline,description,badge,cta_label,deliverables,footnote,image_url,sort_order,service_plan_options(id,rooms_label,description,price_cents,compare_at_price_cents,price_per_room,is_starting_price,installments,sort_order)").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return (data ?? []).map((p) => ({ ...p, service_plan_options: [...p.service_plan_options].sort((a, b) => a.sort_order - b.sort_order) }));
    },
  });
}

/** Contagem real de visitantes na página de planos, via presença em tempo real. */
function useLiveViewers() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const key = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Math.random());
    const channel = supabase.channel("home-plans-viewers", { config: { presence: { key } } });
    channel
      .on("presence", { event: "sync" }, () => setCount(Object.keys(channel.presenceState()).length))
      .subscribe((status) => { if (status === "SUBSCRIBED") void channel.track({ at: Date.now() }); });
    return () => { void supabase.removeChannel(channel); };
  }, []);
  return count;
}

function LiveViewers({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <p className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-forest-soft" aria-live="polite">
      <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-primary" /></span>
      <Eye className="size-3.5" aria-hidden="true" />
      {count === 1 ? "1 pessoa vendo agora" : `${count} pessoas vendo agora`}
    </p>
  );
}

type PlanOpt = { price_cents: number | null; compare_at_price_cents: number | null; price_per_room: boolean; is_starting_price: boolean; installments: number };

function Price({ opt }: { opt: PlanOpt | undefined }) {
  if (!opt || opt.price_cents == null) return <p className="font-display text-2xl font-semibold">Preço em breve</p>;
  const cents = opt.price_cents;
  const compare = opt.compare_at_price_cents;
  const off = compare && compare > cents ? (1 - cents / compare) * 100 : 0;
  const offLabel = Number(off.toFixed(2)).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return (
    <div>
      {off > 0 && compare && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><span className="line-through">{brl(compare)}</span><span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground">{offLabel}% off</span></p>
      )}
      <p className="font-display text-3xl font-semibold">{opt.is_starting_price && <span className="mr-1 text-sm font-normal text-muted-foreground">a partir de</span>}{brl(cents)}{opt.price_per_room && <span className="ml-1 text-sm font-normal text-muted-foreground">/ ambiente</span>}</p>
      {!opt.price_per_room && opt.installments ? <p className="text-xs text-muted-foreground">ou {opt.installments}x de {brl(Math.ceil(cents / opt.installments))}</p> : null}
    </div>
  );
}

function PlanDetails({ description, deliverables }: { description: string | null; deliverables: string[] | null }) {
  const [open, setOpen] = useState(false);
  const [accountPath, setAccountPath] = useState<ReturnType<typeof categoryHome> | null>(null);
  useEffect(() => { let live=true; const refresh=async () => { const {data}=await supabase.auth.getSession(); if(!data.session){if(live)setAccountPath(null);return;}const {data:p}=await supabase.from("profiles").select("registration_category").eq("user_id",data.session.user.id).maybeSingle();if(live)setAccountPath(categoryHome(p?.registration_category));};void refresh();const {data}=supabase.auth.onAuthStateChange(()=>setTimeout(()=>void refresh(),0));return()=>{live=false;data.subscription.unsubscribe();};},[]);
  const items = deliverables ?? [];
  if (!description && items.length === 0) return <div className="flex-1" />;
  return (
    <div className="mt-3 flex-1">
      <Button
        variant="ghost"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="h-auto w-full justify-between gap-2 rounded-none px-0 py-2 text-left text-[11px] font-bold uppercase tracking-[0.16em] text-forest-soft transition-colors hover:text-primary"
      >
        Detalhes do plano
        <ChevronDown className={`size-4 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </Button>
      {open && (
        <div className="mt-3 space-y-3 border-l-2 border-primary/30 pl-4">
          {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
          {items.length > 0 && (
            <ul className="space-y-2 text-sm">{items.map((d) => <li key={d} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />{d}</li>)}</ul>
          )}
        </div>
      )}
    </div>
  );
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
  const [open, setOpen] = useState(false);
  const [accountPath, setAccountPath] = useState<ReturnType<typeof categoryHome> | null>(null);
  useEffect(() => { let live=true; const refresh=async () => { const {data}=await supabase.auth.getSession(); if(!data.session){if(live)setAccountPath(null);return;}const {data:p}=await supabase.from("profiles").select("registration_category").eq("user_id",data.session.user.id).maybeSingle();if(live)setAccountPath(categoryHome(p?.registration_category));};void refresh();const {data}=supabase.auth.onAuthStateChange(()=>setTimeout(()=>void refresh(),0));return()=>{live=false;data.subscription.unsubscribe();};},[]);
  const plans = usePlans();
  const testimonials = useTestimonials().data ?? [];
  const [rooms, setRooms] = useState(1);
  const [modes, setModes] = useState<Record<string, number>>({});
  const viewers = useLiveViewers();
  const roomLabels = plans.data?.find((p) => !p.service_plan_options.some((o) => o.price_per_room))?.service_plan_options.map((o) => o.rooms_label) ?? [];

  return (
    <div className="arqeco-home bg-background text-foreground">
      {/* 1. Menu */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 text-foreground backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
          <Link to="/" aria-label="ARQECO — Arquitetura Ecológica" className="flex items-center gap-3">
            <span className="brand-mark grid size-11 place-items-center bg-primary"><img src={compactLogoAsset.url} alt="ARQECO — Arquitetura Ecológica" width={500} height={500} className="size-10 object-contain" /></span><span className="font-display text-2xl font-semibold text-primary">ARQECO<span className="mt-0.5 block font-sans text-[9px] font-medium">Arquitetura Ecológica</span></span>
          </Link>
          <nav className="hidden gap-7 text-xs font-medium lg:flex">{nav.map(([l, h]) => <a key={l} href={h} className="opacity-65 transition-opacity hover:opacity-100">{l}</a>)}</nav>
          <div className="hidden items-center gap-3 lg:flex">
             <Link to={accountPath ?? "/auth"} className="text-sm font-medium opacity-75 hover:opacity-100">{accountPath ? "Meu painel" : "Entrar"}</Link>
             <Button asChild variant="editorial"><a href="#servicos">Começar meu projeto</a></Button>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
        </div>
        {open && <div className="space-y-1 border-t border-sidebar-border px-5 py-4 lg:hidden">{nav.map(([l, h]) => <a key={l} href={h} onClick={() => setOpen(false)} className="block py-2 text-sm">{l}</a>)}<Link to={accountPath ?? "/auth"} className="block py-2 text-sm font-semibold">{accountPath ? "Meu painel" : "Entrar"}</Link></div>}
      </header>

      {/* 2. Hero */}
      <section className="home-cover relative isolate overflow-hidden bg-sidebar text-sidebar-foreground">
        <video src={heroVideoAsset.url} poster={heroImage} autoPlay muted loop playsInline preload="auto" aria-label="Ambientes de interiores com vegetação, luz natural e materiais acolhedores" className="absolute inset-0 -z-20 size-full object-cover" />
        <div className="cover-shade absolute inset-0 -z-10" />
        <div className="mx-auto flex min-h-[620px] max-w-7xl items-center px-5 py-16 lg:min-h-[660px] lg:px-10">
          <div className="max-w-2xl gentle-rise">
            <p className="text-[10px] font-medium uppercase text-sidebar-foreground">Arquitetura sustentável</p>
            <h1 className="mt-5 font-display text-7xl font-normal md:text-8xl">ARQECO</h1>
            <p className="mt-4 max-w-xl font-display text-4xl leading-tight md:text-5xl">Espaços que criam o <span className="italic text-accent">Futuro Consciente</span></p>
            <p className="mt-6 max-w-lg text-sm leading-relaxed md:text-base">Criamos <strong className="font-medium">projetos de Arquitetura e Design de Interiores sustentáveis e conscientes</strong> — unindo rigor técnico e sensibilidade humana para promover bem-estar em cada espaço.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="editorial" size="lg"><a href="#servicos">Começar meu projeto <ArrowRight /></a></Button><RegistrationChoiceDialog label="Criar cadastro" className="border-sidebar-foreground/60 text-sidebar-foreground hover:border-accent hover:text-accent" /><Button asChild variant="paper" size="lg" className="border-sidebar-foreground/60 text-sidebar-foreground hover:border-accent hover:text-accent"><a href="#sobre">Conheça a ARQECO</a></Button></div>
          </div>
        </div>
      </section>
      <div className="home-signature border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:grid-cols-3">
          {[['12 anos', 'de trajetória'], ['TOP Startups 2025', 'Prêmio Sebrae'], ['Bem-estar + sustentabilidade', 'em cada decisão']].map(([v, l]) => <div key={v} className="text-center"><p className="font-display text-xl text-primary">{v}</p><p className="mt-1 text-[10px] font-medium text-muted-foreground">{l}</p></div>)}
        </div>
      </div>

      {/* 3. O que é */}
      <section id="sobre-plataforma" className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
          <Eyebrow>O que é a ArqEco?</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-bold">Estrutura profissional. Olhar humano.</h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">A ArqEco conecta <strong className="text-foreground">clientes, profissionais, tecnologia e curadoria de materiais</strong> para tornar a transformação dos espaços mais simples, acessível e consciente.</p>
           <p className="mt-8 text-sm text-muted-foreground">Em cada projeto, decisões de layout, materiais e conforto são organizadas para unir <strong className="text-foreground">estética, bem-estar e responsabilidade ambiental</strong>.</p>
          </div>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {[["Projeto", "Desenvolvido por profissionais da rede ArqEco."], ["Tecnologia", "Projeto online, visualização 3D e ferramentas digitais."], ["Sustentabilidade", "Critérios para escolhas mais conscientes."], ["Curadoria", "Produtos selecionados de diferentes fornecedores."], ["Inteligência", "Zoe apoia arquitetos e designers no desenvolvimento dos projetos."]].map(([t, d]) => (
              <div key={t} className="border-t border-border pt-5 last:sm:col-span-2"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{t}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Posicionamento */}
      <section className="bg-forest text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div><Eyebrow>Pilares ARQECO</Eyebrow><h2 className="mt-5 font-display text-4xl font-semibold md:text-5xl">Não é apenas sobre como o espaço fica.</h2><p className="mt-3 font-display text-2xl italic text-accent">É sobre como você vive nele.</p></div>
          <div className="space-y-6 border-l border-primary-foreground/25 pl-6 text-sm opacity-90"><p><strong>01 · Humanização</strong><br />Design atento à rotina, ao conforto e à identidade de cada pessoa.</p><p><strong>02 · Sustentabilidade</strong><br />Materiais e escolhas orientados para reduzir impactos e ampliar o bem-estar.</p><p><strong>03 · Tecnologia</strong><br />Um processo digital claro, do briefing à execução.</p></div>
        </div>
      </section>

      {/* Escolha de serviços */}
      <section id="servicos" className="border-y border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Eyebrow>Por onde você quer começar?</Eyebrow>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold md:text-5xl">Cada transformação pede um caminho diferente.</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">Identifique o momento do seu imóvel e encontre os serviços certos para seguir com clareza.</p>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="flex min-h-96 min-w-0 flex-col overflow-hidden bg-forest p-7 text-primary-foreground md:p-10">
              <Building2 className="size-8 text-accent" aria-hidden="true" />
              <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Arquitetura</p>
              <h3 className="mt-3 font-display text-4xl font-semibold">Vai construir?</h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed opacity-70">Conte onde fica o imóvel, o que pretende construir, quando deseja começar e se procura somente o projeto ou uma jornada completa com obra e acompanhamento.</p>
              <div className="mt-auto pt-8"><Button asChild variant="editorial" size="lg" className="h-auto w-full whitespace-normal py-3 text-center leading-snug sm:w-auto"><Link to="/auth" search={{ next: "/construir" }}>Solicitar projeto de construção <ArrowRight className="shrink-0" /></Link></Button></div>
            </article>
            <article className="flex min-h-96 min-w-0 flex-col overflow-hidden bg-card p-7 md:p-10">
              <Hammer className="size-8 text-primary" aria-hidden="true" />
              <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Interiores</p>
               <h3 className="mt-3 font-display text-4xl font-semibold">Design de interiores sustentável</h3>
               <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Conheça os projetos sustentáveis e conscientes Viver Bem e Viver Lifestyle, com contratação prática e diferenças claras entre cada experiência.</p>
               <div className="mt-8 flex flex-wrap gap-2 text-xs font-semibold"><span className="border border-border px-3 py-2">Viver Bem</span><span className="border border-border px-3 py-2">Viver Lifestyle</span></div>
               <div className="mt-auto pt-8"><Button asChild variant="paper" size="lg" className="h-auto w-full whitespace-normal py-3 text-center leading-snug sm:w-auto"><a href="#planos">Ver projetos de interiores <ArrowRight className="shrink-0" /></a></Button></div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-forest text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Bônus em todos os pacotes</p><h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">Dossiê Eco-Holístico gratuito</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-75">Todos os pacotes de projeto ARQECO incluem um Dossiê Eco-Holístico para ampliar o olhar sobre bem-estar, sustentabilidade e a relação com seus ambientes.</p></div>
          <Button asChild variant="editorial" size="lg"><Link to="/diagnostico">Conhecer o Dossiê <ArrowRight /></Link></Button>
        </div>
      </section>

      {/* 5-7. Planos + 9. Ambientes */}
      <section id="planos" className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Design de interiores sustentável</Eyebrow>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold">Escolha o projeto sustentável ideal para o seu espaço.</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">Não precisa contratar um projeto maior do que precisa. Escolha a experiência de acordo com o nível de transformação que procura.</p>

        {roomLabels.length > 0 && (
          <div className="mt-10">
            <p className="text-sm font-semibold">Agora escolha o tamanho do seu projeto.</p>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Quantidade de ambientes">
              {roomLabels.map((l, i) => <Button key={l} type="button" aria-pressed={rooms === i} onClick={() => setRooms(i)} variant={rooms === i ? "editorial" : "paper"} size="sm">{l}</Button>)}
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.isLoading && [0, 1].map((i) => <div key={i} className="h-[560px] animate-pulse bg-card" />)}
          {plans.isError && <p className="text-sm text-muted-foreground">Não foi possível carregar os planos agora.</p>}
          <article className="plan-card relative flex flex-col overflow-hidden border border-border bg-card p-7">
            <span className="absolute top-4 left-4 z-10 rounded-sm bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground">Gratuito</span>
            <img src={startPlanImage} alt="Canto de meditação com almofada de chão, pedras e plantas, no estilo do Dossiê Eco-Holístico" loading="lazy" decoding="async" className="-mt-7 mb-6 aspect-[4/3] w-[calc(100%+3.5rem)] max-w-none self-center object-cover" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Plano 01</p>
            <h3 className="mt-2 font-display text-3xl font-semibold">Projeto Start</h3>
            <p className="mt-3 text-sm font-semibold">Dossiê Eco-Holístico — o primeiro passo para entender o seu espaço.</p>
            <LiveViewers count={viewers} />
            <PlanDetails
              description="Um olhar eco-holístico sobre o seu ambiente: bem-estar, sustentabilidade e a relação entre você e o espaço em que vive. Ideal para começar a jornada antes de um projeto de interiores."
              deliverables={["Dossiê Eco-Holístico completo do seu ambiente", "Orientações de bem-estar e harmonização", "Leitura da relação pessoa-espaço", "Caminho sugerido para os próximos passos"]}
            />
            <div className="mt-8 border-t border-border pt-5">
              <p className="text-xs text-muted-foreground">Para qualquer ambiente</p>
              <p className="font-display text-3xl font-semibold">Gratuito</p>
              <Button asChild variant="paper" className="mt-4 w-full"><Link to="/diagnostico">Começar pelo Dossiê <ArrowRight /></Link></Button>
              <p className="mt-3 text-[11px] font-semibold text-forest-soft">Também incluso como bônus em todos os projetos pagos.</p>
            </div>
          </article>
          {plans.data?.map((p, idx) => {
            const perRoom = p.service_plan_options.some((o) => o.price_per_room);
            const priced = p.service_plan_options.find((o) => o.price_cents != null);
            const byLabel = p.service_plan_options.find((o) => o.rooms_label === roomLabels[rooms]);
            const opt = perRoom
              ? p.service_plan_options[modes[p.id] ?? 0]
              : byLabel?.price_cents != null ? byLabel : priced ?? byLabel ?? p.service_plan_options[0];
            const featured = idx === 1;
            return (
              <article key={p.id} className={`plan-card relative flex flex-col overflow-hidden border p-7 ${featured ? "border-primary bg-card" : "border-border bg-card"}`}>
                {p.badge && <span className="absolute top-4 left-4 z-10 rounded-sm bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground">{p.badge}</span>}
                {p.image_url && <img src={p.image_url} alt={`Ambiente de design de interiores do projeto ${p.name}`} loading="lazy" decoding="async" className="-mt-7 mb-6 aspect-[4/3] w-[calc(100%+3.5rem)] max-w-none self-center object-cover" />}
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Plano 0{idx + 2}</p>
                <h3 className="mt-2 font-display text-3xl font-semibold">{p.name}</h3>
                <p className="mt-3 text-sm font-semibold">{p.tagline}</p>
                <LiveViewers count={viewers} />
                {perRoom && (
                  <div className="mt-4 grid gap-2" aria-label={`Modalidades do ${p.name}`}>
                    {p.service_plan_options.map((o, i) => (
                      <Button variant="paper" key={o.id} type="button" aria-pressed={(modes[p.id] ?? 0) === i} onClick={() => setModes((m) => ({ ...m, [p.id]: i }))} className={`h-auto flex-col items-start whitespace-normal border px-3 py-2 text-left text-xs normal-case transition-colors ${(modes[p.id] ?? 0) === i ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"}`}>
                        <span className="block font-semibold">{o.rooms_label}</span>
                        {o.description && <span className="text-muted-foreground">{o.description}</span>}
                      </Button>
                    ))}
                  </div>
                )}
                <PlanDetails description={p.description} deliverables={p.deliverables} />
                <div className="mt-8 border-t border-border pt-5">
                  <p className="text-xs text-muted-foreground">{perRoom ? opt?.rooms_label : `Até ${opt?.rooms_label ?? ""}`}</p>
                  <Price opt={opt} />
                  {opt && opt.price_cents != null ? <Button asChild variant={featured ? "editorial" : "paper"} className="mt-4 w-full"><Link to="/auth" search={{ perfil: "cliente", next: `/contratar?plano=${encodeURIComponent(p.id)}&opcao=${encodeURIComponent(opt.id)}` }}>Começar agora</Link></Button> : <Button type="button" variant={featured ? "editorial" : "paper"} className="mt-4 w-full" disabled>Preço em configuração</Button>}
                  {p.footnote && <p className="mt-3 text-[11px] font-semibold text-forest-soft">{p.footnote}</p>}
                </div>
              </article>
            );
          })}
        </div>

        {/* 8. Comparador */}
        <div className="mt-16 overflow-x-auto border-y border-border">
          <h3 className="px-6 pt-6 font-display text-2xl font-semibold">O que muda entre os projetos?</h3>
          <table className="mt-4 w-full min-w-[640px] text-sm">
            <thead className="sticky top-20 z-10 bg-card"><tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground"><th className="px-6 py-3 font-semibold" /><th className="px-4 py-3">Viver Bem</th><th className="px-4 py-3">Viver Lifestyle</th></tr></thead>
            <tbody>{comparison.map(([f, ...v]) => <tr key={f} className="border-b border-border last:border-0"><td className="px-6 py-3">{f}</td>{v.map((c, i) => <td key={i} className="px-4 py-3">{c === "✓" ? <Check className="size-4 text-primary" /> : c === "—" ? <Minus className="size-4 text-muted-foreground/50" /> : <span className="text-xs text-muted-foreground">{c}</span>}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>

      {/* 10. O que você recebe */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Eyebrow>Mais do que uma imagem bonita</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold">Seu projeto acompanha o caminho até a execução.</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[["Briefing", "Você conta o que precisa, como vive e o que deseja transformar."], ["Projeto", "Um profissional desenvolve as soluções para o seu espaço."], ["Visualização", "Você visualiza o projeto antes de executar."], ["Curadoria", "Materiais e produtos organizados para facilitar suas escolhas."], ["Lista de materiais", "Especificações, quantidades e links de compra."], ["Execução", "Um caminho mais claro para colocar o projeto em prática."]].map(([t, d], i) => (
              <div key={t} className="border-t border-border pt-5"><p className="font-display text-sm text-forest-soft">0{i + 1}</p><h3 className="mt-2 font-display text-2xl font-semibold">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Como funciona</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-semibold">Do briefing ao espaço transformado.</h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          {[["Escolha seu plano", "Selecione a experiência e a quantidade de ambientes."], ["Conte o que você precisa", "Briefing online com fotos, plantas, vídeos e referências."], ["Desenvolvemos seu projeto", "Conectamos seu projeto a um profissional da rede."], ["Veja seu espaço ganhar forma", "Apresentações e visualizações previstas no plano."], ["Escolha os materiais", "Use a Curadoria ArqEco para encontrar soluções."], ["Receba e execute", "Projeto, arquivos, lista de materiais e orientações."]].map(([t, d], i) => (
            <li key={t} className="border-t border-border pt-6"><span className="font-display text-3xl text-primary">0{i + 1}</span><h3 className="mt-3 text-sm font-semibold">{t}</h3><p className="mt-2 text-xs text-muted-foreground">{d}</p></li>
          ))}
        </ol>
      </section>

      {/* 12. 3D */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 lg:grid-cols-2 lg:items-center">
        <BeforeAfter />
        <div>
          <Eyebrow>Projeto 3D</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-semibold">Antes de transformar, visualize.</h2>
          <p className="mt-4 text-muted-foreground">Veja como seu ambiente poderá ficar antes de comprar móveis, revestimentos ou objetos.</p>
          <p className="mt-6 font-display text-xl">3D para entender. Visualização para decidir. Projeto para executar.</p>
          <p className="mt-6 text-sm text-muted-foreground"><strong className="text-foreground">Em planos selecionados:</strong> caminhe virtualmente pelo seu projeto com tour 360°.</p>
        </div>
      </section>

      {/* 13. Curadoria */}
      <section id="curadoria" className="bg-secondary">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Eyebrow>Curadoria ArqEco</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-semibold">O projeto encontra os materiais.</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">Você não precisa começar a busca do zero. A ArqEco conecta seu projeto a produtos e materiais de diferentes fornecedores.</p>
          <p className="mt-8 font-display text-2xl">Encontre. Compare. Salve. Adicione ao projeto. Compre.</p>
          <div className="mt-8 flex flex-wrap gap-2">{["Revestimentos", "Tintas", "Iluminação", "Mobiliário", "Madeiras", "Metais", "Louças", "Decoração", "Paisagismo", "Tecnologia"].map((c) => <span key={c} className="border-b border-border px-4 py-2 text-sm">{c}</span>)}</div>
          <p className="mt-6 text-xs text-muted-foreground">A compra é feita diretamente no fornecedor.</p>
        </div>
      </section>

      {/* 14-15. Índice */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2">
        <div>
          <Eyebrow>Índice Eco-Holístico™</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-semibold">Escolher melhor começa por entender melhor.</h2>
          <p className="mt-4 text-muted-foreground">Uma metodologia proprietária da ArqEco para organizar informações sobre materiais e produtos: sustentabilidade, composição, durabilidade, circularidade e transparência.</p>
          <div className="mt-8 border border-border bg-card p-6">
            <div className="flex items-end justify-between"><p className="text-xs text-muted-foreground">Exemplo de avaliação</p><p className="font-display text-5xl font-semibold text-primary">86<span className="text-xl text-muted-foreground">/100</span></p></div>
            <div className="mt-5 space-y-3">{[["Sustentabilidade", 88], ["Circularidade", 82], ["Durabilidade", 91], ["Materiais", 85], ["Transparência", 76]].map(([k, v]) => <div key={k as string}><div className="flex justify-between text-xs"><span className="font-semibold uppercase tracking-[0.12em]">{k}</span><span>{v}</span></div><div className="mt-1 h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} /></div></div>)}</div>
            <p className="mt-5 text-[11px] text-muted-foreground">O índice é uma ferramenta de curadoria. Critérios e pesos seguem a metodologia vigente e podem considerar informações dos fabricantes.</p>
          </div>
        </div>
        <div className="bg-sidebar p-8 text-sidebar-foreground lg:self-center">
          <h3 className="font-display text-3xl font-semibold">Um olhar complementar para cada projeto.</h3>
          <p className="mt-4 text-sm opacity-90">O <strong>Índice Eco-Holístico™</strong> ajuda a interpretar materiais e produtos. O Dossiê oferecido como bônus reúne orientações para ampliar a relação entre bem-estar, escolhas conscientes e o espaço vivido.</p>
          <div className="mt-6 flex flex-wrap gap-2">{["Bem-estar", "Materiais conscientes", "Conforto", "Relação pessoa-espaço"].map((t) => <span key={t} className="rounded-full border border-primary-foreground/30 px-3 py-1 text-xs">{t}</span>)}</div>
          <Button asChild variant="editorial" className="mt-7"><Link to="/diagnostico">Acessar Dossiê <ArrowRight /></Link></Button>
        </div>
      </section>

      {/* 16. Zoe */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Conheça Zoe</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold">Uma copiloto para arquitetos e designers.</h2>
            <p className="mt-4 text-muted-foreground">Zoe é a inteligência artificial da ArqEco, disponível exclusivamente no painel de arquitetos e designers da nossa rede. Ela apoia escolhas mais conscientes e não substitui um profissional habilitado.</p>
            <p className="mt-8 text-sm font-semibold text-primary">Acesso pelo painel profissional ArqEco Pro.</p>
          </div>
          <div className="flex flex-wrap gap-2">{["Interpretar briefings", "Organizar diretrizes", "Pesquisar materiais", "Comparar produtos", "Sugerir alternativas", "Apoiar especificações", "Organizar listas", "Analisar critérios de sustentabilidade"].map((t) => <span key={t} className="rounded-md border border-border bg-background px-4 py-3 text-sm">{t}</span>)}</div>
        </div>
      </section>

      {/* 17. Portfólio (inspirações) */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="flex items-end justify-between gap-6"><div><Eyebrow>Inspirações</Eyebrow><h2 className="mt-4 font-display text-4xl font-bold">Espaços que respiram.</h2></div><p className="hidden max-w-xs text-right text-sm text-muted-foreground md:block">Matéria, luz e natureza organizadas em torno de quem vive o espaço.</p></div>
        <div className="mt-10 grid items-start gap-6 md:grid-cols-[1.15fr_0.85fr_1fr]">
          {[[heroImage, "Sala · Residencial", "Viver Lifestyle"], [bedroomImage, "Quarto · Residencial", "Viver Bem"], [projectImage, "Estar · Residencial", "Design Eco-Holístico"]].map(([src, t, p]) => (
             <figure key={t} className="even:md:mt-10"><img src={src} alt={t} loading="lazy" className="aspect-[4/5] w-full object-cover" /><figcaption className="mt-3 border-t border-border pt-3"><p className="text-sm font-semibold">{t}</p><p className="text-xs text-muted-foreground">{p}</p></figcaption></figure>
          ))}
        </div>
      </section>

      {/* 18-19. Depoimentos e resultados */}
      <section id="resultados" className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <Eyebrow>Experiências e resultados</Eyebrow>
              <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold md:text-5xl">Quando o projeto faz sentido, a transformação vai além da estética.</h2>
            </div>
            <p className="border-l border-border pl-5 text-sm leading-relaxed text-muted-foreground">Relatos de quem viveu a experiência ArqEco.</p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.id} className="flex min-h-72 flex-col bg-background p-7">
                <Quote className="size-7 text-primary" aria-hidden="true" />
                <blockquote className="mt-8 flex-1 font-display text-2xl font-medium leading-snug">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-8 border-t border-border pt-4">
                  <p className="text-sm font-semibold">{testimonial.author_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{[testimonial.context, testimonial.project_label].filter(Boolean).join(" · ")}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-[0.65fr_1.35fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest-soft">Resultados</p>
              <h3 className="mt-4 font-display text-3xl font-bold">O que uma jornada bem orientada pode gerar.</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Benefícios que um projeto bem conduzido entrega no dia a dia de quem vive o espaço.</p>
            </div>
            <div className="grid gap-px overflow-hidden bg-primary md:grid-cols-3">
              {illustrativeResults.map(([number, title, description]) => (
                <article key={number} className="flex min-h-64 flex-col bg-primary p-7 text-primary-foreground">
                  <p className="font-display text-4xl font-light text-accent">{number}</p>
                  <div className="mt-auto pt-10">
                    <h4 className="font-display text-2xl font-semibold">{title}</h4>
                    <p className="mt-3 text-sm leading-relaxed opacity-80">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 20. Para quem */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <h2 className="font-display text-4xl font-semibold">Um espaço pode ser residencial ou profissional.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[["Residencial", "Casas · Apartamentos · Quartos · Salas · Cozinhas · Home offices"], ["Comercial", "Clínicas · Escritórios · Lojas · Consultórios · Hospitalidade"], ["Imóveis", "Airbnb · Locação · Imóveis recém-entregues — ARQECO MOVE em breve"]].map(([t, d]) => <div key={t} className="border border-border bg-card p-7"><h3 className="font-display text-2xl font-semibold">{t}</h3><p className="mt-3 text-sm text-muted-foreground">{d}</p></div>)}
          </div>
        </div>
      </section>

      {/* 21-23. Pro / Creators / Parceiros */}
      <section id="pro" className="mx-auto grid max-w-7xl gap-6 px-5 py-20 lg:grid-cols-3">
        {[
          { t: "Você é arquiteto ou designer?", s: "Faça parte da rede ArqEco.", items: ["Oportunidades de projetos", "Clientes", "Curadoria e lista de materiais", "Zoe e ferramentas digitais", "Indicações e comissões", "Certificação ArqEco"], cta: "Quero ser ArqEco Pro", to: "/auth" as const, perfil: "profissional" as const },
          { t: "Você fala sobre casa, design ou lifestyle?", s: "Transforme sua audiência em novas possibilidades.", items: ["Link personalizado", "Materiais de divulgação", "Campanhas", "Rastreamento", "Comissões", "Dashboard"], cta: "Ser creator / afiliado", to: "/auth" as const, perfil: "afiliado" as const },
          { t: "Sua empresa pode fazer parte dessa jornada.", s: "Fornecedores, marcas, imobiliárias e incorporadoras.", items: ["Produtos na Curadoria ArqEco", "Avaliação pelo Índice Eco-Holístico™", "Vendas diretas na sua loja", "Rede de afiliados", "Integração automática de vendas"], cta: "Quero ser fornecedor", to: "/auth" as const, perfil: "fornecedor" as const },
        ].map((b) => (
          <div key={b.cta} className="flex flex-col border border-border bg-card p-7">
            <h3 className="font-display text-2xl font-semibold">{b.t}</h3><p className="mt-2 text-sm text-muted-foreground">{b.s}</p>
            <ul className="mt-5 flex-1 space-y-2 text-sm">{b.items.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 text-primary" />{i}</li>)}</ul>
            <Button asChild variant="paper" className="mt-6"><Link to={b.to} search={b.perfil ? { perfil: b.perfil } : {}}>{b.cta}</Link></Button>
          </div>
        ))}
      </section>

      {/* 24. Certificado */}
      <section className="bg-forest text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-75">Certificado ArqEco</p>
            <h2 className="mt-4 font-display text-4xl font-semibold">Um projeto pensado além da estética.</h2>
            <p className="mt-4 text-sm opacity-85">Nos projetos elegíveis, a ArqEco poderá emitir um certificado após a verificação dos critérios aplicáveis à metodologia.</p>
            <div className="mt-6 flex flex-wrap gap-2">{["Sustentabilidade", "Circularidade", "Biophilia", "Iluminação", "Ergonomia", "Conforto", "Neuroarquitetura", "Design Eco-Holístico"].map((t) => <span key={t} className="rounded-full border border-primary-foreground/30 px-3 py-1 text-xs">{t}</span>)}</div>
          </div>
          <div className="rounded-lg border border-primary-foreground/25 p-8">
            <p className="font-display text-2xl">ARQECO-2026-000001</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">{["Número único", "QR Code de validação", "Projeto", "Profissional", "Data", "Metodologia", "Critérios aplicados"].map((t) => <div key={t} className="flex gap-2"><Check className="size-4" />{t}</div>)}</dl>
          </div>
        </div>
      </section>

      {/* 25. Sobre */}
      <section id="sobre" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 lg:grid-cols-[0.75fr_1.25fr]">
        <div><Eyebrow>Sobre a ArqEco</Eyebrow><img src={karinaKoch.url} alt="Karina Koch, arquiteta especialista em Design Sustentável e CEO da ArqEco" loading="lazy" className="mt-7 aspect-[4/5] w-full object-cover object-[20%_center]" /><p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Karina Koch</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Arquiteta especialista em Design Sustentável e CEO da ArqEco</p><p className="mt-8 font-display text-7xl font-bold text-primary">12</p><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">anos de trajetória</p></div>
        <div><h2 className="font-display text-4xl font-bold">Projetando espaços que cuidam das pessoas e do planeta.</h2>
        <p className="mt-5 max-w-3xl leading-relaxed text-muted-foreground">A ArqEco nasceu da trajetória da Arquitetura Ecológica. Em 2025, ficou entre as <strong className="text-foreground">TOP startups do Prêmio Sebrae</strong>. Desde o início, prezamos por projetos que promovam bem-estar e sustentabilidade, conectando profissionais, materiais, tecnologia e conhecimento para transformar espaços de forma mais consciente.</p>
        <div className="mt-10 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {[["Arquitetura Ecológica", "Nossa origem."], ["Design Eco-Holístico", "Nossa metodologia."], ["ArqEco", "Nossa plataforma."], ["Zoe", "Nossa inteligência."], ["Curadoria", "Nossas escolhas."], ["Rede ArqEco", "As pessoas que tornam os projetos possíveis."]].map(([t, d]) => <div key={t} className="bg-card p-5"><p className="font-display text-lg font-semibold">{t}</p><p className="mt-1 text-xs text-muted-foreground">{d}</p></div>)}
        </div></div>
      </section>

      {/* 26. Quem nos apoia */}
      <section id="apoiadores" className="border-y border-border bg-forest text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <p className="text-center font-display text-2xl italic text-accent md:text-3xl">Quem nos apoia:</p>
          <p className="mx-auto mt-2 max-w-xl text-center text-xs leading-relaxed opacity-70">Instituições e iniciativas que caminham com a ARQECO.</p>
          <ul className="mt-9 grid gap-px overflow-hidden bg-primary-foreground/15 sm:grid-cols-2 lg:grid-cols-3">
            {apoiadores.map((nome) => (
              <li key={nome} className="flex min-h-[5.5rem] items-center justify-center bg-forest px-6 py-5 text-center transition-opacity hover:opacity-100">
                <span className="text-xs font-semibold uppercase leading-relaxed tracking-[0.14em] opacity-75 hover:opacity-100">{nome}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 27. FAQ */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="font-display text-4xl font-semibold">Ainda ficou com alguma dúvida?</h2>
          <div className="mt-8 divide-y divide-border">{faq.map(([q, a]) => <details key={q} className="group py-4"><summary className="cursor-pointer list-none font-semibold">{q}</summary><p className="mt-2 text-sm text-muted-foreground">{a}</p></details>)}</div>
        </div>
      </section>

      {/* 27. CTA final */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center">
        <h2 className="font-display text-5xl font-semibold">Seu espaço começa com uma escolha.</h2>
        <p className="mt-5 text-muted-foreground">Conte o que você quer transformar. Nós conectamos <strong className="text-foreground">projeto, profissional, tecnologia e escolhas conscientes</strong> para ajudar você a chegar lá.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild variant="editorial" size="lg"><a href="#planos">Começar meu projeto</a></Button><Button asChild variant="paper" size="lg"><a href="#planos">Ver planos</a></Button></div>
      </section>

      {/* 28. Footer */}
      <footer className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:grid-cols-2 lg:grid-cols-5">
           <div><img src={compactLogoAsset.url} alt="ARQECO" width={500} height={500} className="h-14 w-auto object-contain" /><p className="mt-3 text-xs opacity-70">Arquitetura ecológica, projetos e escolhas conscientes.</p></div>
          <FooterCol title="Para clientes" links={[["Começar projeto", "/#planos"], ["Ver planos", "/#planos"], ["Meus projetos", "/painel"]]} />
          <FooterCol title="Para profissionais" links={[["ArqEco Pro", "/auth"], ["Curadoria", "/#curadoria"]]} />
          <FooterCol title="Para empresas" links={[["Seja fornecedor", "/auth?perfil=fornecedor"], ["Seja afiliado", "/auth?perfil=afiliado"]]} />
          <FooterCol title="Legal" links={[["Termos de uso", "/termos"], ["Política de Privacidade (LGPD)", "/privacidade"], ["Cookies", "/cookies"], ["Fale com o encarregado", "mailto:contato.arquiteturaecologica@gmail.com"]]} />
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">{title}</p><ul className="mt-3 space-y-2 text-sm">{links.map(([l, h]) => <li key={l}><a href={h} className="opacity-85 hover:opacity-100">{l}</a></li>)}</ul></div>;
}
