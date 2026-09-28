import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Check, Menu, Minus, X } from "lucide-react";
import heroImage from "@/assets/home-hero.jpg";
import bedroomImage from "@/assets/portfolio-quarto.jpg";
import projectImage from "@/assets/arqeco-project.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/components/PartnerShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARQECO — Projeto de interiores online, sustentável e com curadoria" },
      { name: "description", content: "Projetos de interiores que unem design, funcionalidade, sustentabilidade e tecnologia. Profissionais da rede ArqEco, 3D, curadoria de materiais e Zoe." },
      { property: "og:title", content: "ARQECO — Seu espaço pode fazer mais por você" },
      { property: "og:description", content: "Projeto online, 3D, curadoria de materiais, Zoe IA e Design Eco-Holístico." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const nav = [["Projetos", "#planos"], ["Como funciona", "#como-funciona"], ["Curadoria", "#curadoria"], ["ArqEco Pro", "#pro"], ["Sobre", "#sobre"]];

const comparison: [string, string, string, string][] = [
  ["Projeto de interiores", "✓", "✓", "✓"], ["Layout", "✓", "✓", "✓"], ["Estilo e estética", "✓", "✓", "✓"],
  ["Visualização 3D", "✓", "✓", "conforme plano"], ["Lista de materiais", "✓", "✓", "✓"], ["Curadoria ArqEco", "✓", "✓", "✓"],
  ["Sustentabilidade", "✓", "✓", "✓"], ["Conforto ambiental", "✓", "✓", "✓"], ["Rotina e hábitos", "—", "✓", "✓"],
  ["Biophilia", "—", "✓", "✓"], ["Neuroarquitetura", "—", "✓", "✓"], ["Sensorialidade", "—", "—", "✓"],
  ["Cinco elementos", "—", "—", "✓"], ["Dimensão vibracional", "—", "—", "✓"], ["Relatório Eco-Holístico", "—", "—", "✓"],
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
  ["A sensorialidade está em todos os projetos?", "Não. A dimensão sensorial, vibracional e dos cinco elementos é exclusiva do Design Eco-Holístico."],
  ["Zoe substitui o profissional?", "Não. Zoe é uma ferramenta de apoio e não substitui o arquiteto ou designer."],
  ["O que é o Certificado ArqEco?", "Um registro emitido para projetos elegíveis, conforme critérios e metodologia definidos pela plataforma."],
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-forest-soft">{children}</p>;
}

function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_plans").select("id,slug,name,tagline,description,badge,cta_label,deliverables,footnote,sort_order,service_plan_options(id,rooms_label,price_cents,installments,sort_order)").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return (data ?? []).map((p) => ({ ...p, service_plan_options: [...p.service_plan_options].sort((a, b) => a.sort_order - b.sort_order) }));
    },
  });
}

function Price({ cents, installments }: { cents: number | null; installments?: number }) {
  if (cents == null) return <p className="font-display text-2xl font-semibold">Preço em breve</p>;
  return <div><p className="font-display text-3xl font-semibold">{brl(cents)}</p>{installments ? <p className="text-xs text-muted-foreground">ou {installments}x de {brl(Math.ceil(cents / installments))}</p> : null}</div>;
}

function Home() {
  const [open, setOpen] = useState(false);
  const plans = usePlans();
  const [rooms, setRooms] = useState(0);
  const roomLabels = plans.data?.[0]?.service_plan_options.map((o) => o.rooms_label) ?? [];

  return (
    <div className="bg-background text-foreground">
      {/* 1. Menu */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link to="/" className="font-display text-2xl font-semibold tracking-wide text-primary">ARQECO</Link>
          <nav className="hidden gap-7 text-sm lg:flex">{nav.map(([l, h]) => <a key={l} href={h} className="text-muted-foreground hover:text-foreground">{l}</a>)}</nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/auth" className="text-sm font-medium">Entrar</Link>
            <Button asChild variant="editorial"><a href="#planos">Começar meu projeto</a></Button>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
        </div>
        {open && <div className="space-y-1 border-t border-border px-5 py-4 lg:hidden">{nav.map(([l, h]) => <a key={l} href={h} onClick={() => setOpen(false)} className="block py-2 text-sm">{l}</a>)}<Link to="/auth" className="block py-2 text-sm font-semibold">Entrar</Link></div>}
      </header>

      {/* 2. Hero */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:py-20">
        <div className="gentle-rise">
          <Eyebrow>Projeto de interiores online</Eyebrow>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] md:text-6xl">Seu espaço pode fazer mais por você.</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">Projetos de interiores que unem <strong className="text-foreground">design, funcionalidade, sustentabilidade e tecnologia</strong> para transformar espaços de acordo com a sua forma de viver.</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">Com profissionais da rede ArqEco, visualização 3D, curadoria de materiais e uma jornada simples, do briefing à execução.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="editorial" size="lg"><a href="#planos">Começar meu projeto <ArrowRight /></a></Button><Button asChild variant="paper" size="lg"><a href="#planos">Ver planos</a></Button></div>
          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Projeto online · 3D · Curadoria de materiais · Zoe IA · Design Eco-Holístico</p>
        </div>
        <div className="relative">
          <img src={heroImage} alt="Sala contemporânea com madeira, linho e plantas tropicais" width={1600} height={1104} className="aspect-[4/3] w-full rounded-lg object-cover shadow-editorial" />
          <div className="absolute -bottom-5 left-5 flex flex-wrap gap-2">{["Design", "Bem-estar", "Sustentabilidade", "Tecnologia"].map((t) => <span key={t} className="rounded-full bg-card px-3 py-1.5 text-[11px] font-semibold shadow-editorial">{t}</span>)}</div>
        </div>
      </section>

      {/* 3. O que é */}
      <section id="sobre-plataforma" className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Eyebrow>O que é a ArqEco?</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-4xl font-semibold">Uma nova forma de transformar espaços.</h2>
          <p className="mt-5 max-w-2xl text-muted-foreground">A ArqEco conecta <strong className="text-foreground">clientes, profissionais, tecnologia e curadoria de materiais</strong> para tornar a transformação dos espaços mais simples, acessível e consciente.</p>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
            {[["Projeto", "Desenvolvido por profissionais da rede ArqEco."], ["Tecnologia", "Projeto online, visualização 3D e ferramentas digitais."], ["Sustentabilidade", "Critérios para escolhas mais conscientes."], ["Curadoria", "Produtos selecionados de diferentes fornecedores."], ["Inteligência", "Zoe como copiloto para apoiar o processo."]].map(([t, d]) => (
              <div key={t} className="bg-card p-6"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{t}</p><p className="mt-3 text-sm text-muted-foreground">{d}</p></div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">E, para quem busca uma experiência mais profunda: <strong className="text-foreground">Design Eco-Holístico</strong>, nossa metodologia proprietária que amplia o olhar sobre a relação entre pessoa e espaço.</p>
        </div>
      </section>

      {/* 4. Posicionamento */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-5xl px-5 py-20 text-center">
          <h2 className="font-display text-4xl font-semibold md:text-5xl">Não é apenas sobre como o espaço fica.</h2>
          <p className="mt-3 font-display text-2xl italic opacity-90">É sobre como você vive nele.</p>
          <div className="mx-auto mt-10 grid max-w-3xl gap-3 text-sm opacity-85 sm:grid-cols-2"><p>Design para a estética.</p><p>Funcionalidade para a rotina.</p><p>Sustentabilidade para escolhas mais conscientes.</p><p>Tecnologia para tornar o processo mais simples.</p></div>
        </div>
      </section>

      {/* 5-7. Planos + 9. Ambientes */}
      <section id="planos" className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Encontre o projeto certo para você</Eyebrow>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold">Escolha como você quer transformar seu espaço.</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">Não precisa contratar um projeto maior do que precisa. Escolha a experiência de acordo com o nível de transformação que procura.</p>

        {roomLabels.length > 0 && (
          <div className="mt-10">
            <p className="text-sm font-semibold">Agora escolha o tamanho do seu projeto.</p>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Quantidade de ambientes">
              {roomLabels.map((l, i) => <button key={l} type="button" role="radio" aria-checked={rooms === i} onClick={() => setRooms(i)} className={`rounded-full border px-4 py-2 text-sm transition-colors ${rooms === i ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`}>{l}</button>)}
            </div>
          </div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.isLoading && [0, 1, 2].map((i) => <div key={i} className="h-[560px] animate-pulse rounded-lg bg-card" />)}
          {plans.isError && <p className="text-sm text-muted-foreground">Não foi possível carregar os planos agora.</p>}
          {plans.data?.map((p, idx) => {
            const opt = p.service_plan_options[rooms] ?? p.service_plan_options[0];
            const featured = idx === 1;
            return (
              <article key={p.id} className={`relative flex flex-col rounded-lg border p-7 ${featured ? "border-primary bg-card shadow-editorial" : "border-border bg-card"}`}>
                {p.badge && <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary-foreground">{p.badge}</span>}
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Plano 0{idx + 1}</p>
                <h3 className="mt-2 font-display text-3xl font-semibold">{p.name}</h3>
                <p className="mt-3 text-sm font-semibold">{p.tagline}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em]">Você recebe</p>
                <ul className="mt-3 flex-1 space-y-2 text-sm">{p.deliverables.map((d) => <li key={d} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{d}</li>)}</ul>
                <div className="mt-6 border-t border-border pt-5">
                  <p className="text-xs text-muted-foreground">{opt?.rooms_label} · a partir de</p>
                  <Price cents={opt?.price_cents ?? null} installments={opt?.installments} />
                  <Button asChild variant={featured ? "editorial" : "paper"} className="mt-4 w-full"><Link to="/auth">{p.cta_label}</Link></Button>
                  {p.footnote && <p className="mt-3 text-[11px] font-semibold text-forest-soft">{p.footnote}</p>}
                </div>
              </article>
            );
          })}
        </div>

        {/* 8. Comparador */}
        <div className="mt-16 overflow-x-auto rounded-lg border border-border bg-card">
          <h3 className="px-6 pt-6 font-display text-2xl font-semibold">O que muda entre os projetos?</h3>
          <table className="mt-4 w-full min-w-[640px] text-sm">
            <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground"><th className="px-6 py-3 font-semibold" /><th className="px-4 py-3">Viver Bem</th><th className="px-4 py-3">Viver Lifestyle</th><th className="px-4 py-3">Design Eco-Holístico</th></tr></thead>
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
            <li key={t} className="rounded-lg border border-border bg-card p-5"><span className="font-display text-3xl text-primary">0{i + 1}</span><h3 className="mt-3 text-sm font-semibold">{t}</h3><p className="mt-2 text-xs text-muted-foreground">{d}</p></li>
          ))}
        </ol>
      </section>

      {/* 12. 3D */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 lg:grid-cols-2 lg:items-center">
        <img src={projectImage} alt="Visualização de projeto de interiores" loading="lazy" width={1408} height={800} className="aspect-[4/3] w-full rounded-lg object-cover" />
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
          <div className="mt-8 flex flex-wrap gap-2">{["Revestimentos", "Tintas", "Iluminação", "Mobiliário", "Madeiras", "Metais", "Louças", "Decoração", "Paisagismo", "Tecnologia"].map((c) => <span key={c} className="rounded-full border border-border bg-card px-4 py-2 text-sm">{c}</span>)}</div>
          <p className="mt-6 text-xs text-muted-foreground">A compra é feita diretamente no fornecedor.</p>
        </div>
      </section>

      {/* 14-15. Índice */}
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2">
        <div>
          <Eyebrow>Índice Eco-Holístico™</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-semibold">Escolher melhor começa por entender melhor.</h2>
          <p className="mt-4 text-muted-foreground">Uma metodologia proprietária da ArqEco para organizar informações sobre materiais e produtos: sustentabilidade, composição, durabilidade, circularidade e transparência.</p>
          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <div className="flex items-end justify-between"><p className="text-xs text-muted-foreground">Exemplo ilustrativo</p><p className="font-display text-5xl font-semibold text-primary">86<span className="text-xl text-muted-foreground">/100</span></p></div>
            <div className="mt-5 space-y-3">{[["Sustentabilidade", 88], ["Circularidade", 82], ["Durabilidade", 91], ["Materiais", 85], ["Transparência", 76]].map(([k, v]) => <div key={k as string}><div className="flex justify-between text-xs"><span className="font-semibold uppercase tracking-[0.12em]">{k}</span><span>{v}</span></div><div className="mt-1 h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} /></div></div>)}</div>
            <p className="mt-5 text-[11px] text-muted-foreground">O índice é uma ferramenta de curadoria. Critérios e pesos seguem a metodologia vigente e podem considerar informações dos fabricantes.</p>
          </div>
        </div>
        <div className="rounded-lg bg-primary p-8 text-primary-foreground lg:self-center">
          <h3 className="font-display text-3xl font-semibold">E onde entra o Design Eco-Holístico?</h3>
          <p className="mt-4 text-sm opacity-90">O <strong>Índice Eco-Holístico™</strong> ajuda a interpretar materiais e produtos. Já o <strong>Design Eco-Holístico</strong> é uma experiência de projeto própria da ArqEco. É nele que entram:</p>
          <div className="mt-6 flex flex-wrap gap-2">{["Sensorialidade", "Cinco elementos", "Dimensão vibracional", "Leitura simbólica", "Diretrizes sensoriais", "Relação pessoa-espaço"].map((t) => <span key={t} className="rounded-full border border-primary-foreground/30 px-3 py-1 text-xs">{t}</span>)}</div>
          <p className="mt-6 text-xs opacity-75">Comprar um produto com Índice não significa contratar um projeto Eco-Holístico.</p>
        </div>
      </section>

      {/* 16. Zoe */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Conheça Zoe</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold">Seu projeto também pode contar com uma copiloto.</h2>
            <p className="mt-4 text-muted-foreground">Zoe é a inteligência artificial da ArqEco, criada para apoiar profissionais e projetos em escolhas mais conscientes. Ela não substitui o arquiteto ou designer.</p>
            <Button asChild variant="editorial" className="mt-8"><Link to="/painel">Conversar com Zoe <ArrowRight /></Link></Button>
          </div>
          <div className="flex flex-wrap gap-2">{["Interpretar briefings", "Organizar diretrizes", "Pesquisar materiais", "Comparar produtos", "Sugerir alternativas", "Apoiar especificações", "Organizar listas", "Analisar critérios de sustentabilidade"].map((t) => <span key={t} className="rounded-md border border-border bg-background px-4 py-3 text-sm">{t}</span>)}</div>
        </div>
      </section>

      {/* 17. Portfólio (inspirações) */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Inspirações</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-semibold">Espaços que respiram.</h2>
        <p className="mt-3 text-sm text-muted-foreground">Imagens ilustrativas. O portfólio de projetos realizados será publicado em breve.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[[heroImage, "Sala · Residencial", "Viver Lifestyle"], [bedroomImage, "Quarto · Residencial", "Viver Bem"], [projectImage, "Estar · Residencial", "Design Eco-Holístico"]].map(([src, t, p]) => (
            <figure key={t}><img src={src} alt={t} loading="lazy" className="aspect-[4/5] w-full rounded-lg object-cover" /><figcaption className="mt-3"><p className="text-sm font-semibold">{t}</p><p className="text-xs text-muted-foreground">{p}</p></figcaption></figure>
          ))}
        </div>
      </section>

      {/* 20. Para quem */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <h2 className="font-display text-4xl font-semibold">Um espaço pode ser residencial ou profissional.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[["Residencial", "Casas · Apartamentos · Quartos · Salas · Cozinhas · Home offices"], ["Comercial", "Clínicas · Escritórios · Lojas · Consultórios · Hospitalidade"], ["Imóveis", "Airbnb · Locação · Imóveis recém-entregues — ARQECO MOVE em breve"]].map(([t, d]) => <div key={t} className="rounded-lg bg-card p-7"><h3 className="font-display text-2xl font-semibold">{t}</h3><p className="mt-3 text-sm text-muted-foreground">{d}</p></div>)}
          </div>
        </div>
      </section>

      {/* 21-23. Pro / Creators / Parceiros */}
      <section id="pro" className="mx-auto grid max-w-7xl gap-6 px-5 py-20 lg:grid-cols-3">
        {[
          { t: "Você é arquiteto ou designer?", s: "Faça parte da rede ArqEco.", items: ["Oportunidades de projetos", "Clientes", "Curadoria e lista de materiais", "Zoe e ferramentas digitais", "Indicações e comissões", "Certificação ArqEco"], cta: "Quero ser ArqEco Pro", to: "/auth" as const, perfil: undefined },
          { t: "Você fala sobre casa, design ou lifestyle?", s: "Transforme sua audiência em novas possibilidades.", items: ["Link personalizado", "Materiais de divulgação", "Campanhas", "Rastreamento", "Comissões", "Dashboard"], cta: "Ser creator / afiliado", to: "/auth" as const, perfil: "afiliado" as const },
          { t: "Sua empresa pode fazer parte dessa jornada.", s: "Fornecedores, marcas, imobiliárias e incorporadoras.", items: ["Produtos na Curadoria ArqEco", "Avaliação pelo Índice Eco-Holístico™", "Vendas diretas na sua loja", "Rede de afiliados", "Integração automática de vendas"], cta: "Quero ser fornecedor", to: "/auth" as const, perfil: "fornecedor" as const },
        ].map((b) => (
          <div key={b.cta} className="flex flex-col rounded-lg border border-border bg-card p-7">
            <h3 className="font-display text-2xl font-semibold">{b.t}</h3><p className="mt-2 text-sm text-muted-foreground">{b.s}</p>
            <ul className="mt-5 flex-1 space-y-2 text-sm">{b.items.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 text-primary" />{i}</li>)}</ul>
            <Button asChild variant="paper" className="mt-6"><Link to={b.to} search={b.perfil ? { perfil: b.perfil } : {}}>{b.cta}</Link></Button>
          </div>
        ))}
      </section>

      {/* 24. Certificado */}
      <section className="bg-primary text-primary-foreground">
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
      <section id="sobre" className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Sobre a ArqEco</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-semibold">Da Arquitetura Ecológica à ArqEco.</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">A ArqEco nasce da trajetória da Arquitetura Ecológica, ampliando sua atuação para uma plataforma que conecta projetos, profissionais, materiais, tecnologia e conhecimento.</p>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {[["Arquitetura Ecológica", "Nossa origem."], ["Design Eco-Holístico", "Nossa metodologia."], ["ArqEco", "Nossa plataforma."], ["Zoe", "Nossa inteligência."], ["Curadoria", "Nossas escolhas."], ["Rede ArqEco", "As pessoas que tornam os projetos possíveis."]].map(([t, d]) => <div key={t} className="bg-card p-5"><p className="font-display text-lg font-semibold">{t}</p><p className="mt-1 text-xs text-muted-foreground">{d}</p></div>)}
        </div>
      </section>

      {/* 26. FAQ */}
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
          <div><p className="font-display text-2xl font-semibold">ARQECO</p><p className="mt-3 text-xs opacity-70">Projetos, profissionais e escolhas conscientes.</p></div>
          <FooterCol title="Para clientes" links={[["Começar projeto", "/#planos"], ["Ver planos", "/#planos"], ["Meus projetos", "/painel"]]} />
          <FooterCol title="Para profissionais" links={[["ArqEco Pro", "/auth"], ["Curadoria", "/#curadoria"]]} />
          <FooterCol title="Para empresas" links={[["Seja fornecedor", "/auth?perfil=fornecedor"], ["Seja afiliado", "/auth?perfil=afiliado"]]} />
          <FooterCol title="Legal" links={[["Termos de uso", "#"], ["Privacidade", "#"], ["Cookies", "#"], ["Política de indicações", "#"]]} />
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">{title}</p><ul className="mt-3 space-y-2 text-sm">{links.map(([l, h]) => <li key={l}><a href={h} className="opacity-85 hover:opacity-100">{l}</a></li>)}</ul></div>;
}
