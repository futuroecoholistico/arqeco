import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { BeforeAfter, ComparisonTable, Eyebrow, FaqSection, PageHero, PlansGrid, PortfolioGrid, QuoteSection, StepsSection, TestimonialsSection } from "@/components/site/sections";

export const Route = createFileRoute("/casa")({
  head: () => ({ meta: [
    { title: "Para sua casa — Projeto de interiores online | ARQECO" },
    { name: "description", content: "Renove sua casa sem obra e sem improviso, ou planeje sua construção do jeito certo. Planos com preço fechado e 3D antes de gastar." },
    { property: "og:title", content: "Para sua casa — ARQECO" },
    { property: "og:description", content: "Acorde num lar que descansa você. Planos de interiores online com 3D e lista de compras." },
  ] }),
  component: Casa,
});

const faq: [string, string][] = [
  ["O projeto é online?", "Sim. O processo é estruturado digitalmente, do briefing à entrega, de acordo com o plano contratado."],
  ["Quem desenvolve meu projeto?", "Profissionais da rede ArqEco, conforme o processo de seleção e atribuição da plataforma."],
  ["Posso escolher o profissional?", "Hoje a ArqEco faz a atribuição. A escolha pelo cliente poderá ser disponibilizada no futuro."],
  ["O que está incluído em cada plano?", "Cada plano tem seus próprios entregáveis. Consulte a tabela comparativa."],
  ["Recebo projeto em 3D?", "Nos planos em que o 3D estiver incluído, sim."],
  ["A ArqEco vende os produtos?", "Não. Os produtos são vendidos diretamente pelos fornecedores parceiros."],
  ["O Dossiê Eco-Holístico está incluído?", "Sim. Todos os pacotes de projeto ARQECO recebem o Dossiê Eco-Holístico como bônus gratuito."],
  ["E se eu for construir ou reformar?", "Peça um orçamento: o projeto completo é sob medida e o prazo é definido na proposta."],
];

function Casa() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Para sua casa" title={<>Acorde num lar que <span className="italic text-accent">descansa você.</span></>} text="Renove sua casa sem obra e sem improviso, ou planeje sua construção do jeito certo. Você vê tudo em 3D antes de gastar.">
        <Button asChild variant="editorial" size="lg"><a href="#planos">Ver planos e preços <ArrowRight /></a></Button>
        <Button asChild variant="paper" size="lg" className="border-primary-foreground/60 text-primary-foreground hover:border-accent hover:text-accent"><a href="#orcamento">Pedir orçamento</a></Button>
      </PageHero>

      <section id="planos" className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Design de interiores sustentável</Eyebrow>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold">Escolha o projeto sustentável ideal para o seu espaço.</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">Não precisa contratar um projeto maior do que precisa. Escolha a experiência de acordo com o nível de transformação que procura.</p>
        <PlansGrid />
        <ComparisonTable />
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <article className="flex min-w-0 flex-col border border-dashed border-primary bg-secondary p-7 md:p-10">
            <Gift className="size-8 text-primary" aria-hidden="true" />
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Gratuito</p>
            <h3 className="mt-3 font-display text-3xl font-semibold">Diagnóstico gratuito do seu ambiente</h3>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">O Dossiê Eco-Holístico é uma leitura gratuita de harmonização do seu ambiente — cores, iluminação, tapetes, quadros, plantas e cristais. Não é um projeto de interiores: é um primeiro olhar, com carinho, sobre o espaço onde você vive.</p>
            <div className="mt-auto pt-8"><Button asChild variant="paper"><Link to="/diagnostico">Receber meu dossiê <ArrowRight /></Link></Button></div>
          </article>
          <article className="flex min-w-0 flex-col bg-forest p-7 text-primary-foreground md:p-10">
            <Building2 className="size-8 text-accent" aria-hidden="true" />
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Sob orçamento · prazo definido na proposta</p>
            <h3 className="mt-3 font-display text-3xl font-semibold">Projeto completo para construir ou reformar</h3>
            <p className="mt-4 text-sm leading-relaxed opacity-75">Vai construir? Arquitetura sustentável para casas e reformas — somente o projeto ou a jornada completa com obra e acompanhamento.</p>
            <div className="mt-auto pt-8"><Button asChild variant="editorial"><a href="/orcamento?tipo=casa_construir">Pedir orçamento <ArrowRight /></a></Button></div>
          </article>
        </div>
      </section>

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

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center">
        <BeforeAfter />
        <div>
          <Eyebrow>Projeto 3D</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-semibold">Antes de transformar, visualize.</h2>
          <p className="mt-4 text-muted-foreground">Veja como seu ambiente poderá ficar antes de comprar móveis, revestimentos ou objetos.</p>
          <p className="mt-6 font-display text-xl">3D para entender. Visualização para decidir. Projeto para executar.</p>
          <p className="mt-6 text-sm text-muted-foreground"><strong className="text-foreground">Em planos selecionados:</strong> caminhe virtualmente pelo seu projeto com tour 360°.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <Eyebrow>Portfólio residencial</Eyebrow>
        <h2 className="mb-8 mt-4 font-display text-4xl font-bold">Espaços que respiram.</h2>
        <PortfolioGrid />
      </section>

      <TestimonialsSection />
      <StepsSection title="Do briefing ao espaço transformado." steps={[["Escolha seu plano", "Selecione a experiência e a quantidade de ambientes."], ["Conte o que você precisa", "Briefing online com fotos, plantas, vídeos e referências."], ["Veja seu espaço ganhar forma", "Um profissional da rede desenvolve o projeto, com visualização 3D."], ["Receba e execute", "Projeto, arquivos, lista de materiais da Curadoria e orientações."]]} />
      <QuoteSection tipo="casa_decorar" label="Projeto para minha casa" />
      <FaqSection items={faq} />
    </SiteLayout>
  );
}
