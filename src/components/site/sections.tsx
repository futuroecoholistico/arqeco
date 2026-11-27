import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronDown, Eye, Minus, MoveHorizontal, Quote } from "lucide-react";
import projectImage from "@/assets/arqeco-project.jpg";
import projectBeforeImage from "@/assets/arqeco-project-before.jpg";
import heroImage from "@/assets/home-hero.jpg";
import bedroomImage from "@/assets/portfolio-quarto.jpg";
import viverBem from "@/assets/planos/plano-viver-bem.jpeg.asset.json";
import viverLifestyle from "@/assets/planos/plano-viver-lifestyle.jpeg.asset.json";
import startDossie from "@/assets/planos/plano-start-dossie.jpeg.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/components/PartnerShell";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-forest-soft"><span className="h-px w-8 bg-forest-soft" />{children}</p>;
}

const comparison: [string, string, string][] = [
  ["Formato", "Projeto sustentável", "Projeto sustentável ampliado"], ["Projeto de interiores", "✓", "✓"], ["Layout", "✓", "✓"], ["Estilo e estética", "✓", "✓"],
  ["Visualização 3D personalizada", "✓", "✓"], ["Lista de materiais", "✓", "✓"], ["Curadoria ArqEco", "✓", "✓"],
  ["Sustentabilidade", "✓", "✓"], ["Conforto ambiental", "✓", "✓"], ["Rotina e hábitos", "—", "✓"],
  ["Biofilia", "—", "✓"], ["Neuroarquitetura", "—", "✓"], ["Dossiê Eco-Holístico", "Bônus", "Bônus"],
];

function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_plans").select("id,slug,name,tagline,description,badge,cta_label,deliverables,footnote,image_url,sort_order,service_plan_options(id,rooms_label,description,price_cents,compare_at_price_cents,price_per_room,is_starting_price,installments,delivery_days,sort_order)").eq("is_active", true).order("sort_order");
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

export type PlanOpt = { price_cents: number | null; compare_at_price_cents: number | null; price_per_room: boolean; is_starting_price: boolean; installments: number };

export function Price({ opt }: { opt: PlanOpt | undefined }) {
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

export function BeforeAfter() {
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


export function PlansGrid() {
  const plans = usePlans();
  const [rooms, setRooms] = useState(1);
  const [modes, setModes] = useState<Record<string, number>>({});
  const viewers = useLiveViewers();
  const roomLabels = plans.data?.find((p) => !p.service_plan_options.some((o) => o.price_per_room))?.service_plan_options.map((o) => o.rooms_label) ?? [];
  return (
    <>
        {roomLabels.length > 0 && (
          <div className="mt-10">
            <p className="text-sm font-semibold">Agora escolha o tamanho do seu projeto.</p>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Quantidade de ambientes">
              {roomLabels.map((l, i) => <Button key={l} type="button" aria-pressed={rooms === i} onClick={() => setRooms(i)} variant={rooms === i ? "editorial" : "paper"} size="sm">{l}</Button>)}
            </div>
          </div>
        )}

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
          {plans.isLoading && [0, 1].map((i) => <div key={i} className="h-[560px] animate-pulse bg-card" />)}
          {plans.isError && <p className="text-sm text-muted-foreground">Não foi possível carregar os planos agora.</p>}
          {plans.data?.map((p, idx) => {
            const perRoom = p.service_plan_options.some((o) => o.price_per_room);
            const priced = p.service_plan_options.find((o) => o.price_cents != null);
            const byLabel = p.service_plan_options.find((o) => o.rooms_label === roomLabels[rooms]);
            const opt = perRoom
              ? p.service_plan_options[modes[p.id] ?? 0]
              : byLabel?.price_cents != null ? byLabel : priced ?? byLabel ?? p.service_plan_options[0];
            const featured = idx === 0;
            return (
              <article key={p.id} className={`plan-card relative flex flex-col overflow-hidden border p-7 ${featured ? "border-primary bg-card" : "border-border bg-card"}`}>
                {p.badge && <span className="absolute top-4 left-4 z-10 rounded-sm bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground">{p.badge}</span>}
                {p.image_url && <img src={p.image_url} alt={`Ambiente de design de interiores do projeto ${p.name}`} loading="lazy" decoding="async" className="-mt-7 mb-6 aspect-[4/3] w-[calc(100%+3.5rem)] max-w-none self-center object-cover" />}
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Plano 0{idx + 1}</p>
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
                  {opt?.delivery_days ? <p className="mt-3 text-xs font-semibold">Primeira entrega em até {opt.delivery_days} dias úteis</p> : null}
                  {p.footnote && <p className="mt-3 text-[11px] font-semibold text-forest-soft">{p.footnote}</p>}
                  <a href="/orcamento?tipo=casa_decorar" className="mt-3 block text-xs text-muted-foreground underline underline-offset-4 hover:text-primary">Ficou em dúvida? Peça um orçamento sem compromisso</a>
                </div>
              </article>
            );
          })}
        </div>

    </>
  );
}

export function ComparisonTable() {
  return (
    <div className="mt-16 overflow-x-auto border-y border-border">
      <h3 className="px-6 pt-6 font-display text-2xl font-semibold">O que muda entre os projetos?</h3>
      <table className="mt-4 w-full min-w-[640px] text-sm">
        <thead className="sticky top-20 z-10 bg-card"><tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground"><th className="px-6 py-3 font-semibold" /><th className="px-4 py-3">Viver Bem</th><th className="px-4 py-3">Viver Lifestyle</th></tr></thead>
        <tbody>{comparison.map(([f, ...v]) => <tr key={f} className="border-b border-border last:border-0"><td className="px-6 py-3">{f}</td>{v.map((c, i) => <td key={i} className="px-4 py-3">{c === "✓" ? <Check className="size-4 text-primary" /> : c === "—" ? <Minus className="size-4 text-muted-foreground/50" /> : <span className="text-xs text-muted-foreground">{c}</span>}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function PageHero({ eyebrow, title, text, children }: { eyebrow: string; title: ReactNode; text?: string; children?: ReactNode }) {
  return (
    <section className="bg-forest text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:py-28">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl font-normal leading-tight md:text-6xl">{title}</h1>
        {text && <p className="mt-6 max-w-2xl text-sm leading-relaxed opacity-85 md:text-base">{text}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function StepsSection({ title, steps, className = "" }: { title: string; steps: [string, string][]; className?: string }) {
  return (
    <section id="como-funciona" className={`bg-secondary ${className}`}>
      <div className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Como funciona</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-semibold">{title}</h2>
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([t, d], i) => <li key={t} className="border-t border-border pt-6"><span className="font-display text-3xl text-primary">0{i + 1}</span><h3 className="mt-3 text-base font-semibold">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></li>)}
        </ol>
      </div>
    </section>
  );
}

export function FaqSection({ title = "Perguntas frequentes", items }: { title?: string; items: [string, string][] }) {
  return (
    <section className="bg-card">
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="font-display text-4xl font-semibold">{title}</h2>
        <div className="mt-8 divide-y divide-border">{items.map(([q, a]) => <details key={q} className="py-4"><summary className="cursor-pointer list-none font-semibold">{q}</summary><p className="mt-2 text-sm text-muted-foreground">{a}</p></details>)}</div>
      </div>
    </section>
  );
}

/** Chamada para o pedido de orçamento; o formulário completo entra aqui na próxima etapa. */
export function QuoteSection({ tipo, label }: { tipo: string; label: string }) {
  return (
    <section id="orcamento" className="border-y border-border bg-card">
      <div className="mx-auto max-w-3xl px-5 py-20 text-center">
        <Eyebrow>Pedir orçamento</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-semibold">Conte sobre o seu espaço.</h2>
        <p className="mt-4 text-sm text-muted-foreground">{label} — sem compromisso. Nosso time responde com o melhor caminho para o seu projeto.</p>
        <Button asChild variant="editorial" size="lg" className="mt-8"><a href={`/orcamento?tipo=${tipo}`}>Pedir orçamento</a></Button>
      </div>
    </section>
  );
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => (await supabase.from("testimonials").select("id,author_name,context,project_label,quote").eq("is_active", true).order("sort_order")).data ?? [],
  });
}

export function TestimonialsSection() {
  const list = useTestimonials().data ?? [];
  if (list.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-5 py-24">
      <Eyebrow>Depoimentos</Eyebrow>
      <h2 className="mt-4 max-w-3xl font-display text-4xl font-bold">Quem viveu a experiência ArqEco.</h2>
      <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:pb-0">
        {list.map((t) => (
          <figure key={t.id} className="flex min-w-[78%] snap-start flex-col border border-border bg-background p-5 sm:min-w-[46%] lg:min-w-0 lg:flex-1">
            <Quote className="size-5 text-primary" aria-hidden="true" />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed">“{t.quote}”</blockquote>
            <figcaption className="mt-4 border-t border-border pt-3"><p className="text-xs font-semibold">{t.author_name}</p><p className="mt-1 text-[11px] text-muted-foreground">{[t.context, t.project_label].filter(Boolean).join(" · ")}</p></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export const portfolioItems: { src: string; room: string; label: string; plan: string }[] = [
  { src: heroImage, room: "Sala", label: "Sala · Residencial", plan: "Viver Lifestyle" },
  { src: bedroomImage, room: "Quarto", label: "Quarto · Residencial", plan: "Viver Bem" },
  { src: projectImage, room: "Estar", label: "Estar · Residencial", plan: "Design Eco-Holístico" },
  { src: viverBem.url, room: "Quarto", label: "Quarto · Residencial", plan: "Viver Bem" },
  { src: viverLifestyle.url, room: "Sala", label: "Sala · Residencial", plan: "Viver Lifestyle" },
  { src: startDossie.url, room: "Bem-estar", label: "Canto de meditação · Residencial", plan: "Dossiê Eco-Holístico" },
];

export const COMMERCIAL_PORTFOLIO_URL = "https://atelier-in-space.lovable.app";

export function PortfolioGrid() {
  const [room, setRoom] = useState("Todos");
  const rooms = ["Todos", ...Array.from(new Set(portfolioItems.map((i) => i.room)))];
  const shown = portfolioItems.filter((i) => room === "Todos" || i.room === room);
  return (
    <div>
      <div className="flex flex-wrap gap-2" aria-label="Filtrar por ambiente">
        {rooms.map((r) => <Button key={r} type="button" size="sm" variant={room === r ? "editorial" : "paper"} aria-pressed={room === r} onClick={() => setRoom(r)}>{r}</Button>)}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((i, idx) => (
          <figure key={i.src + idx}><img src={i.src} alt={i.label} loading="lazy" className="aspect-[4/5] w-full object-cover" /><figcaption className="mt-3 border-t border-border pt-3"><p className="text-sm font-semibold">{i.label}</p><p className="text-xs text-muted-foreground">{i.plan}</p></figcaption></figure>
        ))}
      </div>
    </div>
  );
}

