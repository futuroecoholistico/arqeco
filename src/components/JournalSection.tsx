import { ArrowUpRight } from "lucide-react";

const BASE = "https://www.ecoholistico.com.br";

const ARTICLES = [
  { slug: "neuroarquitetura", edition: "Edição 01 · Ciência do habitar · 10 min", title: "Como os ambientes moldam a mente", excerpt: "Existe um motivo pelo qual algumas casas nos acalmam imediatamente enquanto outras parecem nos deixar cansados.", image: `${BASE}/__l5e/assets-v1/957258de-267a-4e0b-9ae6-ac7b6beeebd5/eco-interior.webp` },
  { slug: "arquitetura-regenerativa", edition: "Edição 02 · Sustentabilidade · 11 min", title: "Construir devolvendo mais do que se retira", excerpt: "Durante décadas, a arquitetura sustentável buscou reduzir danos. Hoje sabemos que isso já não basta.", image: `${BASE}/__l5e/assets-v1/122f8c0a-9daf-4a4c-9b04-ea0c8066d675/eco-project1.webp` },
  { slug: "ia-aplicada-a-arquitetura", edition: "Edição 03 · Inovação · 12 min", title: "Inteligência artificial a serviço do habitar", excerpt: "A arquitetura sempre evoluiu junto com as ferramentas disponíveis. Agora, a IA começa a alterar o modo de projetar.", image: `${BASE}/assets/eco-ia-BzdbLE87.jpg` },
];

export function JournalSection() {
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Journal</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">Leituras para o seu habitar</h2>
        </div>
        <a href={`${BASE}/journal`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">Ver todas</a>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {ARTICLES.map((a) => (
          <a key={a.slug} href={`${BASE}/journal/${a.slug}`} target="_blank" rel="noopener noreferrer" className="group flex flex-col overflow-hidden border border-border bg-card transition-colors hover:border-primary">
            <img src={a.image} alt={a.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{a.edition}</p>
              <h3 className="mt-2 font-display text-xl font-semibold">{a.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{a.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Ler matéria <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
