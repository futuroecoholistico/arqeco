import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/manual")({
  head: () => ({
    meta: [
      { title: "Manual do Cliente — ARQECO" },
      { name: "description", content: "Guia completo para contratar, acompanhar e transformar seus ambientes com a ARQECO: etapas, prazos, briefing, revisões e entrega." },
      { property: "og:title", content: "Manual do Cliente ARQECO — Seu projeto começa aqui" },
      { property: "og:description", content: "Como funciona o projeto de interiores online ARQECO, do pagamento à entrega final." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Manual,
});

const chapters: [string, string, React.ReactNode][] = [
  ["boas-vindas", "Boas-vindas", <><p>Seja bem-vindo à ArqEco! Estamos felizes por fazer parte da transformação do seu espaço.</p><p>Acreditamos que a arquitetura vai muito além da estética. Um ambiente bem planejado pode transformar a maneira como vivemos, trabalhamos e nos relacionamos.</p><p>Por isso, desenvolvemos projetos personalizados que integram funcionalidade, conforto, bem-estar e escolhas mais conscientes. Com a ArqEco, você contrata seu projeto online, conversa diretamente com uma arquiteta e acompanha cada etapa de forma prática e transparente.</p></>],
  ["como-funciona", "Como funciona a contratação", <ol className="grid gap-3 sm:grid-cols-2">{["Contratação online", "Agendamento", "Briefing", "Primeira reunião", "Desenvolvimento", "Apresentação e revisões", "Entrega final"].map((s, i) => <li key={s} className="flex items-center gap-3 border border-border bg-card p-3"><span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>{s}</li>)}</ol>],
  ["contratacao", "Contratação e agendamento", <><p>Escolha o plano, informe os ambientes e a metragem aproximada de cada um, e revise o valor antes de pagar. Ambientes acima do limite de área do plano têm um adicional calculado automaticamente.</p><p>Depois que o pagamento é confirmado, a agenda da arquiteta é liberada para você escolher o dia e o horário da reunião de briefing, que acontece online.</p></>],
  ["briefing", "Briefing", <><p>No briefing você conta quem usa cada ambiente, sua rotina, o que incomoda hoje, o estilo, as cores e os materiais de que gosta, o orçamento e as prioridades. Também pode anexar plantas, medidas, fotos e referências.</p><p className="border-l-2 border-primary pl-4 font-display text-xl italic">Quanto mais conhecermos suas necessidades, mais personalizado será o desenvolvimento do seu projeto.</p></>],
  ["reuniao", "Primeira reunião", <p>A arquiteta já terá recebido seu briefing antes da conversa. Assim a reunião é mais objetiva: vocês aprofundam necessidades, tiram dúvidas e alinham expectativas. Separe referências, organize suas dúvidas, confira as medidas e verifique sua conexão com a internet.</p>],
  ["prazos", "Prazos", <><p className="border border-primary bg-card p-4 font-display text-xl font-semibold">Prazo padrão: até 15 dias úteis para a primeira entrega.</p><p>O prazo começa a contar após a realização da primeira reunião de briefing com a arquiteta. Ele não é contado a partir do pagamento, da contratação ou do agendamento.</p><p><strong>Entrega antecipada:</strong> você pode optar por um prazo reduzido mediante pagamento adicional, conforme as opções e condições disponíveis na plataforma no momento da contratação.</p><p>Os 15 dias úteis, ou o prazo antecipado, correspondem à primeira apresentação do projeto, e não necessariamente à entrega final após as revisões.</p></>],
  ["revisoes", "Apresentação e revisões", <p>Quando a primeira versão fica pronta, ela aparece em Minha ARQECO. Você visualiza imagens, plantas e arquivos e pode solicitar revisões descrevendo os ajustes, conforme as condições do serviço contratado. A arquiteta responde pela própria plataforma e disponibiliza as versões atualizadas.</p>],
  ["entregaveis", "O que você recebe", <ul className="grid gap-3 sm:grid-cols-3">{["Layout", "Cortes e elevações", "Iluminação", "Vistas em 3D", "Lista de materiais", "Links para compra"].map((s) => <li key={s} className="border border-border bg-card p-4 font-display text-lg">{s}</li>)}</ul>],
  ["medicao", "Como medir seu ambiente", <p>Não tem a planta? Sem problema. Siga nosso <Link to="/guia-medicao" className="text-primary underline">guia de medição</Link>: desenhe o ambiente visto de cima, meça paredes, altura, portas e janelas, marque tomadas e pontos hidráulicos e fotografe todos os cantos.</p>],
  ["checklist", "Checklist", <ul className="grid gap-2 sm:grid-cols-2">{["Contratação confirmada", "Reunião agendada", "Briefing preenchido", "Medidas enviadas", "Fotografias anexadas", "Reunião realizada", "Primeira apresentação recebida", "Revisões avaliadas", "Projeto final recebido"].map((s) => <li key={s} className="flex items-center gap-2"><span className="size-4 border border-primary" />{s}</li>)}</ul>],
  ["dicas", "Dicas para uma boa experiência", <ul className="list-disc space-y-1 pl-5">{["Compartilhe referências.", "Informe suas prioridades.", "Pense na rotina do ambiente.", "Defina um orçamento realista.", "Informe limitações.", "Mantenha a comunicação pela plataforma.", "Confira medidas antes da execução.", "Consulte fornecedores antes de comprar."].map((s) => <li key={s}>{s}</li>)}</ul>],
  ["encerramento", "Encerramento", <><p className="font-display text-2xl italic">Seu espaço. Seu estilo. Seu futuro.</p><p>Obrigado por escolher a ArqEco. Estamos felizes por participar da criação de um ambiente que represente suas necessidades, sua personalidade e seu jeito de viver.</p><p>Mais do que projetar espaços, queremos contribuir para um futuro em que arquitetura, bem-estar e sustentabilidade caminhem juntos.</p></>],
];

function Manual() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-primary px-5 py-16 text-primary-foreground print:bg-background print:text-foreground">
        <div className="mx-auto max-w-4xl">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-80 print:hidden">← ARQECO</Link>
          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.22em]">Manual do cliente ARQECO</p>
          <h1 className="mt-3 font-display text-5xl font-semibold md:text-6xl">Seu projeto começa aqui.</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">Guia completo para contratar, acompanhar e transformar seus ambientes.</p>
          <Button variant="paper" className="mt-8 print:hidden" onClick={() => window.print()}><Download /> Baixar em PDF</Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[220px_1fr]">
        <nav className="print:hidden lg:sticky lg:top-6 lg:self-start" aria-label="Capítulos">
          <ol className="flex gap-2 overflow-x-auto text-sm lg:flex-col">{chapters.map(([id, t], i) => <li key={id} className="shrink-0"><a href={`#${id}`} className="block py-1 text-muted-foreground hover:text-primary">{i + 1}. {t}</a></li>)}</ol>
        </nav>
        <main className="space-y-14">
          {chapters.map(([id, t, body], i) => (
            <section key={id} id={id} className="scroll-mt-6 break-inside-avoid">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Capítulo {i + 1}</p>
              <h2 className="mt-2 font-display text-3xl font-semibold">{t}</h2>
              <div className="mt-4 space-y-3 leading-relaxed text-foreground/90">{body}</div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
