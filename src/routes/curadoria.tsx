import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Eyebrow } from "@/components/site/sections";

export const Route = createFileRoute("/curadoria")({
  head: () => ({ meta: [
    { title: "Curadoria, Índice Eco-Holístico™ e Certificado | ARQECO" },
    { name: "description", content: "Curadoria de materiais, Índice Eco-Holístico™ e Certificado ArqEco: escolhas mais conscientes em cada projeto." },
    { property: "og:title", content: "Curadoria ArqEco" },
    { property: "og:description", content: "O projeto encontra os materiais." },
  ] }),
  component: Curadoria,
});

function Curadoria() {
  return (
    <SiteLayout>
      <section id="curadoria" className="bg-secondary">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Eyebrow>Curadoria ArqEco</Eyebrow>
          <h1 className="mt-4 font-display text-4xl font-semibold">O projeto encontra os materiais.</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">Você não precisa começar a busca do zero. A ArqEco conecta seu projeto a produtos e materiais de diferentes fornecedores.</p>
          <p className="mt-8 font-display text-2xl">Encontre. Compare. Salve. Adicione ao projeto. Compre.</p>
          <div className="mt-8 flex flex-wrap gap-2">{["Revestimentos", "Tintas", "Iluminação", "Mobiliário", "Madeiras", "Metais", "Louças", "Decoração", "Paisagismo", "Tecnologia"].map((c) => <span key={c} className="border-b border-border px-4 py-2 text-sm">{c}</span>)}</div>
          <p className="mt-6 text-xs text-muted-foreground">A compra é feita diretamente no fornecedor.</p>
        </div>
      </section>

      
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

    </SiteLayout>
  );
}
