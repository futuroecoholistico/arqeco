import { createFileRoute, Link } from "@tanstack/react-router";
import karinaKoch from "@/assets/karina-koch.jpg.asset.json";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/nossa-trajetoria")({
  head: () => ({
    meta: [
      { title: "Nossa trajetória — Karina Koch e a ArqEco" },
      { name: "description", content: "Karina Koch, arquiteta e criadora do Design Eco Holístico, conta como a Arquitetura Ecológica evoluiu para a ArqEco." },
      { property: "og:title", content: "Nossa trajetória — A arquitetura sempre foi sobre pessoas" },
      { property: "og:description", content: "Da Arquitetura Ecológica à ArqEco: arquitetura, sustentabilidade, bem-estar e inovação." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Trajetoria,
});

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 font-display text-2xl font-bold text-primary md:text-3xl">{children}</h2>;
}

function Trajetoria() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">← ARQECO</Link>
        <div className="mt-10 grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="lg:sticky lg:top-10 lg:self-start">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Nossa trajetória</p>
            <img src={karinaKoch.url} alt="Karina Koch, fundadora da ArqEco" className="mt-6 aspect-[4/5] w-full object-cover object-[20%_center]" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Karina Koch</p>
            <p className="mt-1 text-xs text-muted-foreground">Fundadora da ArqEco | Criadora do Design Eco Holístico</p>
          </aside>
          <article className="space-y-5 leading-relaxed text-muted-foreground">
            <h1 className="font-display text-4xl font-bold text-foreground md:text-5xl">A arquitetura sempre foi sobre pessoas. Eu só precisei ampliar o olhar.</h1>
            <p>Sou Karina Koch, arquiteta, empreendedora e pesquisadora das relações entre pessoas, espaços e futuro.</p>
            <p>Minha trajetória profissional nasceu da paixão pela arquitetura e da inquietação de compreender como os ambientes influenciam nossa saúde, nossas emoções, nossos comportamentos e a maneira como nos relacionamos com o mundo.</p>
            <p>Ao longo dos anos, percebi que projetar espaços vai muito além de escolher materiais, cores e mobiliário. Um ambiente pode acolher, estimular, inspirar, proporcionar bem-estar ou, quando mal planejado, comprometer nossa qualidade de vida.</p>
            <p>Foi dessa percepção que nasceu a Arquitetura Ecológica: uma proposta de aproximar arquitetura, sustentabilidade e consciência.</p>
            <H>Do propósito à inovação</H>
            <p>Minha jornada sempre foi movida pela curiosidade, pela pesquisa e pelo desejo de encontrar novas maneiras de fazer diferente.</p>
            <p>Em mais de duas décadas de estudos e experiências, aprofundei meus conhecimentos sobre sustentabilidade, comportamento humano, tendências, materiais, natureza e as relações entre os ambientes e as pessoas.</p>
            <p>Essa busca me levou a desenvolver o <strong className="text-foreground">Design Eco Holístico</strong>, uma metodologia que integra arquitetura, sustentabilidade e bem-estar, considerando o ambiente como um sistema conectado à experiência humana.</p>
            <p>Acredito que o futuro da arquitetura precisa considerar não apenas o impacto que construímos no planeta, mas também o impacto que os espaços provocam em nossas vidas.</p>
            <H>Uma nova forma de fazer arquitetura</H>
            <p>Ao longo dessa caminhada, também compreendi que uma arquitetura mais consciente não deveria ser um privilégio de poucos.</p>
            <p>Projetos personalizados, planejamento profissional e escolhas sustentáveis ainda são percebidos por muitas pessoas como algo distante ou inacessível.</p>
            <p>Decidi transformar essa realidade.</p>
            <p>Assim nasceu a evolução da Arquitetura Ecológica para a <strong className="text-foreground">ArqEco</strong>, uma plataforma que utiliza a tecnologia para aproximar pessoas, profissionais e soluções mais conscientes.</p>
            <p>Por meio de projetos online de arquitetura e interiores, queremos tornar o planejamento profissional mais acessível, simplificar a jornada de contratação e ajudar mais pessoas a transformarem seus ambientes com personalidade, funcionalidade e bem-estar.</p>
            <H>Uma visão que continua evoluindo</H>
            <p>Minha atuação também se expandiu para o universo das marcas, da inovação e dos negócios conscientes, dando origem ao movimento Futuro Eco Holístico.</p>
            <p>Acredito que marcas, espaços e pessoas precisam evoluir juntos.</p>
            <p>Por isso, minha visão de futuro integra arquitetura, design, sustentabilidade, tecnologia, inteligência artificial e novas formas de pensar e construir negócios.</p>
            <p>A ArqEco representa uma parte muito especial dessa jornada: transformar uma visão em soluções reais, acessíveis e capazes de gerar impacto positivo.</p>
            <blockquote className="border-l-2 border-primary pl-5 font-display text-2xl italic text-foreground">Não acredito que o futuro seja algo que simplesmente esperamos acontecer. É algo que projetamos, escolhemos e construímos todos os dias.</blockquote>
            <p className="pt-4"><strong className="text-foreground">Karina Koch</strong><br />Fundadora da ArqEco | Criadora do Design Eco Holístico</p>
            <p className="italic">Arquitetura, consciência e inovação para transformar a maneira como habitamos o mundo.</p>
            <Button asChild className="mt-6"><a href="/#planos">Conheça nossos projetos</a></Button>
          </article>
        </div>
      </div>
    </div>
  );
}
