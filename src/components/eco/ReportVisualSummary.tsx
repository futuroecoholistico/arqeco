import { Images, ClipboardList, Check, Leaf, Sun, Gem, Wind, Palette, Sparkles, CalendarDays } from "lucide-react";
import { ELEMENTOS_META, NIVEIS_LABELS, type ResultadoDiagnostico } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { ReportSolutionBlocks } from "./ReportSolutionBlocks";

export function ElementRadar({ resultado }: { resultado: ResultadoDiagnostico }) {
  const point = (index: number, radius: number) => {
    const angle = index * Math.PI * 2 / 5 - Math.PI / 2;
    return [160 + Math.cos(angle) * radius, 160 + Math.sin(angle) * radius] as const;
  };
  const polygon = (radius: number) => ELEMENTOS_META.map((_, index) => point(index, radius).join(",")).join(" ");
  return <svg role="img" aria-label={`Equilíbrio dos cinco elementos: ${ELEMENTOS_META.map(el => `${el.label} ${resultado.pontuacaoElementos[el.key]}/100`).join(", ")}`} viewBox="0 0 320 320" className="mx-auto w-full max-w-80">
    {[25, 50, 75, 100].map(radius => <polygon key={radius} points={polygon(radius)} fill="none" stroke="var(--border)" />)}
    {ELEMENTOS_META.map((_, index) => { const [x, y] = point(index, 100); return <line key={index} x1="160" y1="160" x2={x} y2={y} stroke="var(--border)" />; })}
    <polygon points={ELEMENTOS_META.map((el, index) => point(index, Math.min(100, Math.max(0, resultado.pontuacaoElementos[el.key] ?? 0))).join(",")).join(" ")} fill="var(--primary)" fillOpacity="0.16" stroke="var(--primary)" strokeWidth="2" />
    {ELEMENTOS_META.map((el, index) => {
      const [x, y] = point(index, 128);
      const [px, py] = point(index, Math.min(100, Math.max(0, resultado.pontuacaoElementos[el.key] ?? 0)));
      return <g key={el.key}><circle cx={px} cy={py} r="4" fill={el.color} /><text x={x} y={y - 2} textAnchor="middle" fill="var(--foreground)" fontSize="12">{el.label}</text><text x={x} y={y + 15} textAnchor="middle" fill="var(--primary)" fontSize="12" fontWeight="600">{resultado.pontuacaoElementos[el.key] ?? 0}/100</text></g>;
    })}
  </svg>;
}

export function InterventionIcon({ text }: { text: string }) {
  const normalized = text.toLowerCase();
  const Icon = /aroma|sensorial/.test(normalized) ? Wind : /cristal/.test(normalized) ? Gem : /planta|biofilia|sustent/.test(normalized) ? Leaf : /luz|ilumina/.test(normalized) ? Sun : /cor|cromo|têxt/.test(normalized) ? Palette : Sparkles;
  return <Icon aria-hidden="true" className="h-10 w-10 text-primary" strokeWidth={1.2} />;
}

export function ReportVisualSummary({ resultado, imagemOriginal, empresarial }: { resultado: ResultadoDiagnostico; imagemOriginal: string | null; empresarial: boolean }) {
  const score = Math.min(100, Math.max(0, resultado.indiceGeralRegeneracao));
  const hasImages = imagemOriginal || resultado.imagemTransformadaUrl;
  return <>
    <header className="border-b border-border pb-6 text-center">
      <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">{empresarial ? "Dossiê Estratégico Corporativo" : "Dossiê Eco Holístico®"}</h2>
      <div className="mx-auto my-3 h-px w-12 bg-primary" />
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Relatório de transformação</p>
    </header>
    <section className="flex items-center justify-between gap-4 py-6">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Nível {resultado.nivelEcoHolistico}</p><h3 className="font-display mt-2 text-2xl italic md:text-3xl">{NIVEIS_LABELS[resultado.nivelEcoHolistico]}</h3></div>
      <div className="relative flex h-24 w-24 shrink-0 items-center justify-center" aria-label={`Índice geral de regeneração ${score}/100`}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" strokeWidth="2" /><circle cx="50" cy="50" r="44" fill="none" stroke="var(--primary)" strokeWidth="4" strokeDasharray="276.46" strokeDashoffset={276.46 * (1 - score / 100)} /></svg>
        <span className="text-2xl font-semibold text-primary">{resultado.indiceGeralRegeneracao}<span className="text-xs">/100</span></span>
      </div>
    </section>
    <section aria-label="Transformação visual" className="border-y border-border py-6">
      <div className="mb-5 flex items-center gap-3"><Images aria-hidden="true" className="h-8 w-8 text-primary" strokeWidth={1.3} /><h3 className="font-display text-2xl">Transformação visual</h3></div>
      {hasImages ? <div className="grid grid-cols-2 items-start gap-3 md:gap-5">
        <figure className="min-w-0"><figcaption className="mb-2 text-xs font-semibold uppercase text-foreground">Antes</figcaption>{imagemOriginal ? <img src={imagemOriginal} alt="Ambiente original antes da transformação" className="aspect-[4/3] w-full rounded-lg border border-border object-contain" /> : <p className="flex aspect-[4/3] items-center justify-center border border-border p-3 text-xs text-muted-foreground">Imagem original indisponível</p>}</figure>
        <figure className="min-w-0"><figcaption className="mb-2 text-xs font-semibold uppercase text-primary">Depois · visão IA</figcaption>{resultado.imagemTransformadaUrl ? <img src={resultado.imagemTransformadaUrl} alt="Proposta de transformação do mesmo ambiente gerada por IA" className="aspect-[4/3] w-full rounded-lg border border-primary object-contain" /> : <p className="flex aspect-[4/3] items-center justify-center border border-border p-3 text-xs text-muted-foreground">Transformação não disponível neste dossiê</p>}</figure>
      </div> : <p className="text-sm text-muted-foreground">Este dossiê não possui imagens de transformação.</p>}
      <div className="mt-6 border-t border-border pt-5">
        <div className="mb-4 flex items-center gap-3"><ClipboardList aria-hidden="true" className="h-6 w-6 text-primary" /><h4 className="font-display text-xl">Especificação dos elementos do Depois</h4></div>
        {resultado.especificacoesImagem?.length ? <ul className="grid gap-4 md:grid-cols-2">{resultado.especificacoesImagem.map((item, index) => <li key={index} className="rounded-lg border border-border p-4"><p className="font-medium">{item.item}</p><dl className="mt-3 space-y-2 text-sm"><div><dt className="inline font-medium">Cor: </dt><dd className="inline">{item.cor || "Não identificável"}</dd></div><div><dt className="inline font-medium">Material / aparência: </dt><dd className="inline">{item.material || "Não identificável pela imagem"}</dd></div><div><dt className="inline font-medium">Localização: </dt><dd className="inline">{item.localizacao}</dd></div></dl>{item.observacao && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.observacao}</p>}</li>)}</ul> : <p className="text-sm text-muted-foreground">Este dossiê não possui um inventário visual registrado dos elementos inseridos.</p>}
        {Boolean(resultado.especificacoesImagem?.length) && <p className="mt-4 text-xs leading-relaxed text-muted-foreground">Leitura visual por IA: cores, materiais e espécies podem ser aproximados; confirme a especificação antes da compra.</p>}
      </div>
    </section>
    <section className="mt-8 grid items-center gap-6 border-y border-border py-8 md:grid-cols-2">
      <div><h3 className="text-center text-xs font-semibold uppercase tracking-widest text-primary">Equilíbrio dos 5 elementos</h3><ElementRadar resultado={resultado} /></div>
      <div><p className="text-xs uppercase tracking-widest text-primary">Resumo do ambiente</p><p className="mt-3 text-sm leading-relaxed">{resultado.resumoAmbiente}</p></div>
    </section>
    <ReportSolutionBlocks resultado={resultado} />
    <div className="flex justify-center"><Button variant="outline" onClick={() => document.getElementById("report-action-plan")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}><CalendarDays className="h-4 w-4" />Ver plano completo</Button></div>
    {resultado.descobertasPrincipais?.length > 0 && <section className="border-y border-border py-6"><h3 className="font-display mb-4 text-xl">Descobertas principais</h3><ul className="grid gap-4 md:grid-cols-2">{resultado.descobertasPrincipais.map((item, index) => <li key={index} className="flex gap-3 text-sm leading-relaxed"><Check className="mt-1 h-4 w-4 shrink-0 text-primary" />{item}</li>)}</ul></section>}
  </>;
}