import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/guia-medicao")({
  head: () => ({
    meta: [
      { title: "Como medir seu ambiente — ARQECO" },
      { name: "description", content: "Não tem a planta do imóvel? Aprenda a medir paredes, altura, portas, janelas e pontos de instalação para o seu projeto de interiores." },
      { property: "og:title", content: "Não tem a planta do seu imóvel? Aprenda a medir" },
      { property: "og:description", content: "Guia simples de medição para projetos de interiores online ARQECO." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Guide,
});

const steps: [string, React.ReactNode][] = [
  ["Materiais necessários", <ul className="list-disc pl-5">{["Trena convencional ou a laser", "Papel", "Lápis", "Celular", "Ajuda de outra pessoa, se possível"].map((s) => <li key={s}>{s}</li>)}</ul>],
  ["Desenhe o ambiente", <p>Desenhe o cômodo visto de cima, como uma caixa aberta. Identifique as paredes como A, B, C e D e marque onde ficam portas e janelas.</p>],
  ["Meça as paredes", <p>Meça cada parede de uma extremidade à outra, rente ao piso. Anote a medida ao lado da parede no desenho e indique a unidade (metros ou centímetros).</p>],
  ["Meça a altura", <p>Meça do piso ao teto. Informe rebaixos de gesso, sancas, vigas e diferenças de altura.</p>],
  ["Meça portas e janelas", <ul className="list-disc pl-5">{["Largura", "Altura", "Distância até a parede lateral", "Altura do peitoril (janelas)", "Sentido de abertura"].map((s) => <li key={s}>{s}</li>)}</ul>],
  ["Identifique pontos importantes", <p>Marque no desenho tomadas, interruptores, pontos de luz, pontos hidráulicos, ralos, registros, pilares e vigas.</p>],
  ["Fotografe o ambiente", <p>Tire fotos de todos os cantos e de cada parede, de frente. Se puder, grave um vídeo panorâmico girando devagar no centro do ambiente.</p>],
  ["Envie as informações", <p>Anexe o croqui, as medidas, as fotos e os vídeos no seu briefing, na parte de arquivos.</p>],
];
const CHECK = ["Desenhei o ambiente", "Medi todas as paredes", "Medi a altura do teto", "Medi portas e janelas", "Identifiquei instalações", "Fotografei todos os ângulos", "Anexei os arquivos"];

function Sketch() {
  return (
    <svg viewBox="0 0 320 220" className="w-full max-w-md text-primary" role="img" aria-label="Exemplo de croqui de um ambiente com paredes A, B, C e D, porta e janela">
      <rect x="40" y="30" width="240" height="160" fill="none" stroke="currentColor" strokeWidth="3" />
      <line x1="40" y1="150" x2="40" y2="110" stroke="var(--background)" strokeWidth="5" />
      <path d="M40 150 A40 40 0 0 1 80 110" fill="none" stroke="currentColor" strokeDasharray="4 3" />
      <line x1="130" y1="30" x2="200" y2="30" stroke="currentColor" strokeWidth="7" opacity=".35" />
      <g fill="currentColor" fontSize="13" fontFamily="Montserrat, sans-serif" fontWeight="700">
        <text x="155" y="20">A · 4,20 m</text><text x="288" y="115">B</text><text x="152" y="210">C · 4,20 m</text><text x="20" y="80">D</text>
        <text x="130" y="48" fontSize="10" fontWeight="500">janela 1,20 × 1,00</text><text x="48" y="168" fontSize="10" fontWeight="500">porta 0,80</text>
      </g>
    </svg>
  );
}

function Guide() {
  const [done, setDone] = useState<string[]>([]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-4xl px-5 py-14">
        <Link to="/painel" className="text-sm text-primary">← Minha ARQECO</Link>
        <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Guia de medição</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Não tem a planta do seu imóvel? Não se preocupe!</h1>
        <p className="mt-4 text-muted-foreground">Com uma trena e um celular você faz um levantamento básico das medidas para a arquiteta começar seu projeto.</p>
        <div className="mt-10 border border-border bg-card p-6"><Sketch /><p className="mt-3 text-xs text-muted-foreground">Exemplo de croqui: ambiente visto de cima, com paredes nomeadas, porta e janela.</p></div>
        <ol className="mt-12 space-y-8">
          {steps.map(([t, body], i) => (
            <li key={t} className="grid gap-4 sm:grid-cols-[56px_1fr]">
              <span className="grid size-12 place-items-center rounded-full bg-primary font-display text-xl text-primary-foreground">{i + 1}</span>
              <div><h2 className="font-display text-2xl font-semibold">{t}</h2><div className="mt-2 text-foreground/90">{body}</div></div>
            </li>
          ))}
        </ol>
        <section className="mt-14 border border-border bg-card p-6">
          <h2 className="font-display text-2xl font-semibold">Checklist de medição</h2>
          <ul className="mt-4 space-y-2">{CHECK.map((c) => <li key={c}><label className="flex items-center gap-3"><input type="checkbox" className="size-4 accent-primary" checked={done.includes(c)} onChange={() => setDone(done.includes(c) ? done.filter((x) => x !== c) : [...done, c])} />{c}</label></li>)}</ul>
          <p className="mt-3 text-xs text-muted-foreground">{done.length} de {CHECK.length} itens.</p>
        </section>
        <aside className="mt-8 border-l-4 border-primary bg-card p-5 text-sm"><strong>Aviso importante:</strong> as medidas informadas pelo cliente são referências iniciais para o desenvolvimento do projeto. Antes de executar marcenaria, adquirir itens sob medida ou iniciar obras, todas as dimensões devem ser conferidas no local. Em caso de dúvidas ou irregularidades, recomenda-se uma conferência técnica profissional.</aside>
        <Button asChild variant="editorial" className="mt-8"><Link to="/painel">Voltar e anexar no briefing</Link></Button>
      </main>
    </div>
  );
}
