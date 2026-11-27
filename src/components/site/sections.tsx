import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronDown, Clock, Eye, MoveHorizontal, Quote } from "lucide-react";
import projectImage from "@/assets/arqeco-project.jpg";
import projectBeforeImage from "@/assets/arqeco-project-before.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/components/PartnerShell";
import { Eyebrow } from "@/components/site/SiteChrome";
import {
  portfolio,
  proofNumbers,
  supporters,
  type Faq,
  type PortfolioKind,
} from "@/lib/site-content";

/* ---------- Números e selos ---------- */

export function ProofStrip() {
  return (
    <div className="home-signature border-b border-border bg-card">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-7 lg:grid-cols-4">
        {proofNumbers.map(([v, l]) => (
          <div key={v} className="text-center">
            <dt className="font-display text-2xl text-primary md:text-3xl">{v}</dt>
            <dd className="mt-1 text-[11px] font-medium text-muted-foreground">{l}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Supporters() {
  return (
    <section id="apoiadores" className="border-y border-border bg-forest text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <p className="text-center font-display text-2xl italic text-accent md:text-3xl">
          Quem nos apoia
        </p>
        <p className="mx-auto mt-2 max-w-xl text-center text-xs leading-relaxed opacity-70">
          Instituições e iniciativas que caminham com a ARQECO.
        </p>
        <ul className="mt-9 grid gap-px overflow-hidden bg-primary-foreground/15 sm:grid-cols-2 lg:grid-cols-3">
          {supporters.map((nome) => (
            <li
              key={nome}
              className="flex min-h-[5.5rem] items-center justify-center bg-forest px-6 py-5 text-center"
            >
              <span className="text-xs font-semibold uppercase leading-relaxed tracking-[0.14em] opacity-80">
                {nome}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Como funciona ---------- */

export const howItWorks: [string, string][] = [
  [
    "Conte o que você precisa",
    "Escolha um plano ou peça um orçamento. Depois, envie fotos, medidas e referências no briefing online.",
  ],
  [
    "Seu projeto ganha forma",
    "Um profissional da rede ARQECO desenvolve layout, materiais e iluminação pensando na sua rotina.",
  ],
  [
    "Veja antes de executar",
    "Visualização 3D e apresentação do projeto para você decidir com segurança, com ajustes previstos no plano.",
  ],
  [
    "Transforme seu espaço",
    "Receba os arquivos e a lista de compras com links da Curadoria ARQECO para executar sem improviso.",
  ],
];

export function HowItWorks({
  steps = howItWorks,
  title = "Do primeiro contato ao espaço transformado.",
}: {
  steps?: [string, string][];
  title?: string;
}) {
  return (
    <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-20">
      <Eyebrow>Como funciona</Eyebrow>
      <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold">{title}</h2>
      <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="border-t border-border pt-6">
            <span className="font-display text-3xl text-primary">0{i + 1}</span>
            <h3 className="mt-3 text-base font-semibold">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Antes e depois ---------- */

export function BeforeAfter() {
  const [position, setPosition] = useState(50);
  return (
    <figure className="group relative aspect-[4/3] w-full touch-none select-none overflow-hidden bg-muted">
      <img
        src={projectBeforeImage}
        alt="Ambiente vazio antes do projeto de interiores"
        loading="lazy"
        width={1408}
        height={800}
        className="absolute inset-0 size-full object-cover"
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        aria-hidden="true"
      >
        <img
          src={projectImage}
          alt=""
          width={1408}
          height={800}
          className="absolute inset-0 size-full object-cover"
        />
      </div>
      <span className="absolute left-4 top-4 bg-foreground/85 px-3 py-1.5 text-[10px] font-semibold uppercase text-background">
        Depois
      </span>
      <span className="absolute right-4 top-4 bg-card/90 px-3 py-1.5 text-[10px] font-semibold uppercase text-foreground">
        Antes
      </span>
      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-background shadow-editorial"
        style={{ left: `${position}%` }}
      >
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
      <figcaption className="sr-only">
        Arraste o controle para comparar o ambiente antes e depois do projeto.
      </figcaption>
    </figure>
  );
}

export function VisualizeSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center">
      <BeforeAfter />
      <div>
        <Eyebrow>Projeto 3D</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-semibold">
          Antes de transformar, visualize.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Veja como seu ambiente vai ficar antes de comprar móveis, revestimentos ou objetos. Nada
          de gastar com o que não combina.
        </p>
        <p className="mt-6 font-display text-xl">
          3D para entender. Visualização para decidir. Projeto para executar.
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          <strong className="text-foreground">Em planos selecionados:</strong> caminhe virtualmente
          pelo seu projeto com tour 360°.
        </p>
      </div>
    </section>
  );
}

/* ---------- Depoimentos (tabela `testimonials`, gerida no admin) ---------- */

const BUSINESS_CONTEXT =
  /comerc|empresa|neg[oó]cio|cl[ií]nica|loja|escrit[oó]rio|restaurante|consult[oó]rio|spa|est[uú]dio/i;
const PRO_CONTEXT = /arquitet|designer|profissional|afiliad|creator/i;

export function useTestimonials(audience?: "casa" | "negocio" | "profissionais") {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () =>
      (
        await supabase
          .from("testimonials")
          .select("id,author_name,context,project_label,quote")
          .eq("is_active", true)
          .order("sort_order")
      ).data ?? [],
    select: (rows) => {
      if (!audience) return rows;
      const ctx = (r: (typeof rows)[number]) => `${r.context ?? ""} ${r.project_label ?? ""}`;
      if (audience === "negocio") return rows.filter((r) => BUSINESS_CONTEXT.test(ctx(r)));
      if (audience === "profissionais") return rows.filter((r) => PRO_CONTEXT.test(ctx(r)));
      return rows.filter((r) => !BUSINESS_CONTEXT.test(ctx(r)) && !PRO_CONTEXT.test(ctx(r)));
    },
  });
}

/** Mostra depoimentos reais; se ainda não houver nenhum para o público, a seção não aparece. */
export function Testimonials({
  audience,
  title = "Quem viveu a experiência ARQECO.",
}: {
  audience?: "casa" | "negocio" | "profissionais";
  title?: string;
}) {
  const rows = useTestimonials(audience).data ?? [];
  if (rows.length === 0) return null;
  return (
    <section id="depoimentos" className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Depoimentos</Eyebrow>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold">{title}</h2>
        <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-3">
          {rows.slice(0, 6).map((t) => (
            <figure key={t.id} className="flex min-h-64 flex-col bg-background p-7">
              <Quote className="size-7 text-primary" aria-hidden="true" />
              <blockquote className="mt-6 flex-1 font-display text-xl font-medium leading-snug">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-semibold">{t.author_name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[t.context, t.project_label].filter(Boolean).join(" · ")}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Portfólio ---------- */

export function PortfolioGrid({
  kind,
  limit,
  rooms,
}: {
  kind?: PortfolioKind;
  limit?: number;
  rooms?: boolean;
}) {
  const items = portfolio.filter((p) => !kind || p.kind === kind);
  const roomList = Array.from(new Set(items.map((p) => p.room)));
  const [room, setRoom] = useState<string | null>(null);
  const shown = items.filter((p) => !room || p.room === room).slice(0, limit ?? items.length);
  return (
    <div>
      {rooms && roomList.length > 1 && (
        <div
          className="mb-6 flex flex-wrap gap-2"
          role="group"
          aria-label="Filtrar por tipo de ambiente"
        >
          <Button
            type="button"
            size="sm"
            variant={room === null ? "editorial" : "paper"}
            aria-pressed={room === null}
            onClick={() => setRoom(null)}
          >
            Todos
          </Button>
          {roomList.map((r) => (
            <Button
              key={r}
              type="button"
              size="sm"
              variant={room === r ? "editorial" : "paper"}
              aria-pressed={room === r}
              onClick={() => setRoom(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <figure key={p.src}>
            <img
              src={p.src}
              alt={p.title}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full object-cover"
            />
            <figcaption className="mt-3 border-t border-border pt-3">
              <p className="text-sm font-semibold">{p.title}</p>
              <p className="text-xs text-muted-foreground">
                {[p.room, p.kind === "residencial" ? "Residencial" : "Comercial", p.plan]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/* ---------- FAQ ---------- */

export function FaqList({
  items,
  title = "Perguntas frequentes",
}: {
  items: Faq[];
  title?: string;
}) {
  return (
    <section id="perguntas" className="border-t border-border bg-card">
      <div className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="font-display text-4xl font-semibold">{title}</h2>
        <div className="mt-8 divide-y divide-border">
          {items.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold">
                {q}
                <ChevronDown
                  className="mt-0.5 size-4 shrink-0 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Planos residenciais (dados de `service_plans`; preços nunca no código) ---------- */

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_plans")
        .select(
          "id,slug,name,tagline,description,badge,cta_label,deliverables,footnote,image_url,sort_order,service_plan_options(id,rooms_label,description,price_cents,compare_at_price_cents,price_per_room,is_starting_price,installments,delivery_days,sort_order)",
        )
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []).map((p) => ({
        ...p,
        service_plan_options: [...p.service_plan_options].sort(
          (a, b) => a.sort_order - b.sort_order,
        ),
      }));
    },
  });
}

/** Contagem real de visitantes na página de planos, via presença em tempo real. */
function useLiveViewers() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Math.random());
    const channel = supabase.channel("home-plans-viewers", { config: { presence: { key } } });
    channel
      .on("presence", { event: "sync" }, () =>
        setCount(Object.keys(channel.presenceState()).length),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void channel.track({ at: Date.now() });
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);
  return count;
}

function LiveViewers({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <p
      className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-forest-soft"
      aria-live="polite"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-primary" />
      </span>
      <Eye className="size-3.5" aria-hidden="true" />
      {count === 1 ? "1 pessoa vendo agora" : `${count} pessoas vendo agora`}
    </p>
  );
}

type PlanOpt = {
  price_cents: number | null;
  compare_at_price_cents: number | null;
  price_per_room: boolean;
  is_starting_price: boolean;
  installments: number;
};

function Price({ opt }: { opt: PlanOpt | undefined }) {
  if (!opt || opt.price_cents == null)
    return <p className="font-display text-2xl font-semibold">Sob consulta</p>;
  const cents = opt.price_cents;
  const compare = opt.compare_at_price_cents;
  const off = compare && compare > cents ? (1 - cents / compare) * 100 : 0;
  const offLabel = Number(off.toFixed(2)).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return (
    <div>
      {off > 0 && compare && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="line-through">{brl(compare)}</span>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
            {offLabel}% off
          </span>
        </p>
      )}
      <p className="font-display text-3xl font-semibold">
        {opt.is_starting_price && (
          <span className="mr-1 text-sm font-normal text-muted-foreground">a partir de</span>
        )}
        {brl(cents)}
        {opt.price_per_room && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">/ ambiente</span>
        )}
      </p>
      {!opt.price_per_room && opt.installments ? (
        <p className="text-xs text-muted-foreground">
          ou {opt.installments}x de {brl(Math.ceil(cents / opt.installments))}
        </p>
      ) : null}
    </div>
  );
}

function PlanDetails({
  description,
  deliverables,
}: {
  description: string | null;
  deliverables: string[] | null;
}) {
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
        O que está incluso
        <ChevronDown
          className={`size-4 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </Button>
      {open && (
        <div className="mt-3 space-y-3 border-l-2 border-primary/30 pl-4">
          {description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
          {items.length > 0 && (
            <ul className="space-y-2 text-sm">
              {items.map((d) => (
                <li key={d} className="flex gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Cards de planos com o mesmo checkout de antes (/auth → /contratar). */
export function PlanCards() {
  const plans = usePlans();
  const [rooms, setRooms] = useState(1);
  const [modes, setModes] = useState<Record<string, number>>({});
  const viewers = useLiveViewers();
  const roomLabels =
    plans.data
      ?.find((p) => !p.service_plan_options.some((o) => o.price_per_room))
      ?.service_plan_options.map((o) => o.rooms_label) ?? [];

  return (
    <div>
      {roomLabels.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-semibold">Quantos ambientes você quer transformar?</p>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Quantidade de ambientes">
            {roomLabels.map((l, i) => (
              <Button
                key={l}
                type="button"
                aria-pressed={rooms === i}
                onClick={() => setRooms(i)}
                variant={rooms === i ? "editorial" : "paper"}
                size="sm"
              >
                {l}
              </Button>
            ))}
          </div>
        </div>
      )}
      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
        {plans.isLoading &&
          [0, 1].map((i) => <div key={i} className="h-[560px] animate-pulse bg-card" />)}
        {plans.isError && (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os planos agora. Fale com a gente pelo WhatsApp.
          </p>
        )}
        {plans.data?.map((p, idx) => {
          const perRoom = p.service_plan_options.some((o) => o.price_per_room);
          const priced = p.service_plan_options.find((o) => o.price_cents != null);
          const byLabel = p.service_plan_options.find((o) => o.rooms_label === roomLabels[rooms]);
          const opt = perRoom
            ? p.service_plan_options[modes[p.id] ?? 0]
            : byLabel?.price_cents != null
              ? byLabel
              : (priced ?? byLabel ?? p.service_plan_options[0]);
          const featured = idx === 0;
          return (
            <article
              key={p.id}
              className={`plan-card relative flex flex-col overflow-hidden border p-7 ${featured ? "border-primary bg-card" : "border-border bg-card"}`}
            >
              {p.badge && (
                <span className="absolute left-4 top-4 z-10 rounded-sm bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground">
                  {p.badge}
                </span>
              )}
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt={`Ambiente projetado no plano ${p.name}`}
                  loading="lazy"
                  decoding="async"
                  className="-mt-7 mb-6 aspect-[4/3] w-[calc(100%+3.5rem)] max-w-none self-center object-cover"
                />
              )}
              <h3 className="font-display text-3xl font-semibold">{p.name}</h3>
              <p className="mt-3 text-sm font-semibold">{p.tagline}</p>
              <LiveViewers count={viewers} />
              {perRoom && (
                <div className="mt-4 grid gap-2" aria-label={`Modalidades do ${p.name}`}>
                  {p.service_plan_options.map((o, i) => (
                    <Button
                      variant="paper"
                      key={o.id}
                      type="button"
                      aria-pressed={(modes[p.id] ?? 0) === i}
                      onClick={() => setModes((m) => ({ ...m, [p.id]: i }))}
                      className={`h-auto flex-col items-start whitespace-normal border px-3 py-2 text-left text-xs normal-case transition-colors ${(modes[p.id] ?? 0) === i ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"}`}
                    >
                      <span className="block font-semibold">{o.rooms_label}</span>
                      {o.description && (
                        <span className="text-muted-foreground">{o.description}</span>
                      )}
                    </Button>
                  ))}
                </div>
              )}
              <PlanDetails description={p.description} deliverables={p.deliverables} />
              <div className="mt-8 border-t border-border pt-5">
                <p className="text-xs text-muted-foreground">
                  {perRoom ? opt?.rooms_label : `Até ${opt?.rooms_label ?? ""}`}
                </p>
                <Price opt={opt} />
                {opt?.delivery_days ? (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-forest-soft">
                    <Clock className="size-3.5" aria-hidden="true" /> Primeira entrega em até{" "}
                    {opt.delivery_days} dias úteis
                  </p>
                ) : null}
                {opt && opt.price_cents != null ? (
                  <Button
                    asChild
                    variant={featured ? "editorial" : "paper"}
                    className="mt-4 w-full"
                  >
                    <Link
                      to="/auth"
                      search={{
                        perfil: "cliente",
                        next: `/contratar?plano=${encodeURIComponent(p.id)}&opcao=${encodeURIComponent(opt.id)}`,
                      }}
                    >
                      {p.cta_label || "Contratar agora"} <ArrowRight />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant={featured ? "editorial" : "paper"}
                    className="mt-4 w-full"
                  >
                    <Link to="/orcamento" search={{ tipo: "casa_decorar" }}>
                      Pedir orçamento
                    </Link>
                  </Button>
                )}
                <Link
                  to="/orcamento"
                  search={{ tipo: "casa_decorar" }}
                  className="mt-3 block text-center text-xs font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Ficou em dúvida? Peça um orçamento sem compromisso
                </Link>
                {p.footnote && (
                  <p className="mt-3 text-[11px] font-semibold text-forest-soft">{p.footnote}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export const planComparison: [string, string, string][] = [
  ["Formato", "Projeto sustentável", "Projeto sustentável ampliado"],
  ["Projeto de interiores", "✓", "✓"],
  ["Layout", "✓", "✓"],
  ["Estilo e estética", "✓", "✓"],
  ["Visualização 3D personalizada", "✓", "✓"],
  ["Lista de materiais", "✓", "✓"],
  ["Curadoria ArqEco", "✓", "✓"],
  ["Sustentabilidade", "✓", "✓"],
  ["Conforto ambiental", "✓", "✓"],
  ["Rotina e hábitos", "—", "✓"],
  ["Biofilia", "—", "✓"],
  ["Neuroarquitetura", "—", "✓"],
  ["Dossiê Eco-Holístico", "Bônus", "Bônus"],
];
