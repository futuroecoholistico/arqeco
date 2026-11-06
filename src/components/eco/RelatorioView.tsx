import { ELEMENTOS_META, DIMENSOES_META, type EixoEstrategico, type ResultadoDiagnostico, type TipoAmbiente } from "@/domain/types";
import { ChapterArt, ElementArt } from "./ReportIllustrations";
import { ReportVisualSummary, InterventionIcon } from "./ReportVisualSummary";
import { ReportFeedback } from "./ReportFeedback";
import { prepararSolucoesDossie } from "@/lib/solucoes-dossie";
import { ElementRadar } from "./ReportVisualSummary";

import { ReportMoodboard } from "./ReportMoodboard";
import { ReportEnvironmentalComfort } from "./ReportEnvironmentalComfort";

function ChapterHeading({ title, chapter }: { title: string; chapter: "overview" | "profile" | "strategy" | "dimensions" | "recommendations" | "plan" | "transformation" }) {
  return <div className="mb-6 flex flex-col-reverse items-start justify-between gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center">
    <h3 className="font-display text-2xl md:text-3xl">{title}</h3>
    <ChapterArt chapter={chapter} />
  </div>;
}

export function RelatorioView({ resultado: resultadoSalvo, imagemOriginal, tipoAmbiente, bloqueado, dossieId }: { resultado: ResultadoDiagnostico; imagemOriginal: string | null; tipoAmbiente?: TipoAmbiente | undefined; bloqueado?: boolean | undefined; dossieId?: string | undefined }) {
  const resultado = prepararSolucoesDossie(resultadoSalvo);
  const isEmpresarial = tipoAmbiente === "corporativo" || tipoAmbiente === "comercial";

  return (
    <div className="report-view report-light space-y-8 bg-background p-5 text-foreground md:p-8">
      <section className="border-b border-border pb-6">
        <p className="text-xs uppercase tracking-widest text-primary">O que é o Design Eco-Holístico</p>
        <p className="mt-3 text-sm leading-relaxed">O Design Eco-Holístico é uma harmonização de ambientes: pequenas mudanças em cores, iluminação, tapetes, quadros, plantas, cristais e objetos que ajudam a melhorar o bem-estar de quem vive ou trabalha no espaço, sem obra e sem reforma.</p>
        <div role="note" className="mt-5 border-l-4 border-primary bg-secondary p-4 text-sm leading-relaxed">
          <p className="font-bold uppercase tracking-wide text-primary">Importante</p>
          <p className="mt-1">A imagem gerada <strong>NÃO É um projeto de design de interiores</strong>. A I.A. apenas sugere a harmonização do ambiente com tapetes, cristais, quadros, cores, iluminação e outros elementos. As principais instruções constam no Dossiê abaixo.</p>
        </div>
      </section>
      <ReportVisualSummary resultado={resultado} imagemOriginal={imagemOriginal} empresarial={isEmpresarial} />
      <section className="border-b border-border py-6"><p className="text-xs uppercase tracking-widest text-primary">Leitura do nível</p><p className="mt-3 text-sm leading-relaxed">{resultado.descricaoNivel}</p></section>

      <ReportMoodboard resultado={resultado} />
      <ReportEnvironmentalComfort resultado={resultado} />

      {/* Perfil */}
      <section className="border-y border-border py-8">
        <ChapterHeading chapter="profile" title="Seu perfil Eco Holístico" />
        <h3 className="font-display mt-1 text-3xl">{resultado.perfil.nome}</h3>
        <p className="mt-1 italic text-muted-foreground">"{resultado.perfil.fraseIdentidade}"</p>
        <p className="mt-4 leading-relaxed">{resultado.perfil.descricao}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <PerfilCard title="Força" text={resultado.perfil.forca} />
          <PerfilCard title="Desafio" text={resultado.perfil.desafio} />
          <PerfilCard title="Recomendação prioritária" text={resultado.perfil.recomendacaoPrioritaria} />
        </div>
      </section>

      {/* Leitura específica do público (marca/ESG, terapêutico, hotelaria) */}
      {isEmpresarial && resultado.leituraEspecifica && resultado.leituraEspecifica.eixos?.length > 0 ? (
        <RelatorioCorporativo leitura={resultado.leituraEspecifica} />
      ) : resultado.leituraEspecifica && resultado.leituraEspecifica.eixos?.length > 0 && (
        <section className="border-y border-border py-8">
          <ChapterHeading chapter="strategy" title="Leitura estratégica" />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="font-display mt-1 text-3xl">{resultado.leituraEspecifica.titulo}</h3>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase text-muted-foreground">Índice</div>
              <div className="font-display text-5xl text-primary">{resultado.leituraEspecifica.indice}<span className="text-base text-muted-foreground">/100</span></div>
            </div>
          </div>
          {resultado.leituraEspecifica.sintese && <p className="mt-3 max-w-3xl text-muted-foreground">{resultado.leituraEspecifica.sintese}</p>}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {resultado.leituraEspecifica.eixos.map((e, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-background/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="font-display text-xl">{e.nome}</div>
                  <div className="text-primary">{e.pontuacao}<span className="text-xs text-muted-foreground">/100</span></div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, e.pontuacao ?? 0))}%` }} />
                </div>
                {e.analise && <p className="mt-3 text-sm text-muted-foreground">{e.analise}</p>}
                <ListaEixo titulo="Pontos fortes" itens={e.pontosFortes} />
                <ListaEixo titulo="Lacunas" itens={e.lacunas} />
                <ListaEixo titulo="Recomendações" itens={e.recomendacoes} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5 Dimensões */}
      <section className="border-y border-border py-8">
        <ChapterHeading chapter="dimensions" title="5 Dimensões Eco Holísticas" />
        <div className="grid gap-8 md:grid-cols-[280px_1fr] items-start">
          <RadarDimensoes dimensoes={resultado.dimensoes} />
          <div className="space-y-4">
            {DIMENSOES_META.map((d) => {
              const val = resultado.dimensoes[d.key];
              return (
                <div key={d.key} className="rounded-lg border border-border/60 bg-background/40 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-display text-lg">{d.label}</div>
                    <div className="text-primary">{val?.pontuacao ?? 0}<span className="text-xs text-muted-foreground">/100</span></div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary" style={{ width: `${val?.pontuacao ?? 0}%` }} />
                  </div>
                  {val?.analise && <p className="mt-2 text-sm text-muted-foreground">{val.analise}</p>}
                  {val?.recomendacoes && val.recomendacoes.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      {val.recomendacoes.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Elementos */}
      <section className="border-y border-border py-8">
        <div className="mb-6 border-b border-border/60 pb-5">
          <h3 className="font-display text-2xl md:text-3xl">Leitura Elemental</h3>
        </div>
        {resultado.leituraElemental && resultado.leituraElemental.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {resultado.leituraElemental.map((le, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="flex justify-start [&_svg]:mx-0"><ElementArt element={ELEMENTOS_META.find(el => el.label.toLowerCase() === le.elemento.toLowerCase())?.key ?? "eter"} /></div>
                <div className="font-display text-lg">{le.elemento} — {le.pontuacao}</div>
                <p className="mt-1 text-sm">{le.interpretacao}</p>
                <p className="mt-1 text-xs text-muted-foreground">{le.impacto}</p>
                {le.sugestoesEquilibrio?.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                    {le.sugestoesEquilibrio.map((s, j) => <li key={j}>{s}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recomendações */}
      {resultado.recomendacoesPrioritarias?.length > 0 && (
        <section className="border-y border-border py-8">
          <ChapterHeading chapter="recommendations" title="Recomendações prioritárias" />
          <div className="space-y-3">
            {resultado.recomendacoesPrioritarias.map((r, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="mb-4"><InterventionIcon text={`${r.tipoIntervencao} ${r.principio}`} /></div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${r.prioridade === "alta" ? "bg-terracota text-terracota-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    {r.prioridade}
                  </span>
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs">{r.prazo}</span>
                  <span className="text-xs text-muted-foreground">{r.tipoIntervencao}</span>
                </div>
                <div className="mt-2 font-display text-lg">{r.principio}</div>
                <p className="mt-1 text-sm text-muted-foreground">{r.observacao}</p>
                <p className="mt-2 text-sm"><strong>Por quê importa:</strong> {r.porqueImporta}</p>
                <p className="mt-1 text-sm"><strong>O que fazer:</strong> {r.oQueFazer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Plano de Ação */}
      <section id="report-action-plan" className="scroll-mt-8 border-y border-border py-8">
        <ChapterHeading chapter="plan" title="Plano de ação Eco Holístico" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "7 dias", itens: resultado.planoAcao.sete_dias },
            { label: "30 dias", itens: resultado.planoAcao.trinta_dias },
            { label: "90 dias", itens: resultado.planoAcao.noventa_dias },
          ].map((col) => (
            <div key={col.label} className="rounded-lg border border-primary/30 bg-background/40 p-4">
              <div className="text-xs uppercase tracking-wide text-primary">{col.label}</div>
              <ol className="mt-3 space-y-3">
                {col.itens?.map((it, i) => (
                  <li key={i}>
                    <div className="text-sm font-medium">{i + 1}. {it.acao}</div>
                    {it.descricao && <div className="text-xs text-muted-foreground">{it.descricao}</div>}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Frase final */}
      <section className="border-t border-border py-8 text-center">
        <p className="font-display text-2xl italic text-primary md:text-3xl">"{resultado.fraseFinal}"</p>
      </section>

      {/* Feedback e contribuição */}
      <ReportFeedback dossieId={dossieId} />
      <section className="border border-primary bg-secondary p-6 md:p-8">
        <p className="text-xs uppercase tracking-widest text-primary">Próximo passo</p>
        <h3 className="mt-2 font-display text-2xl md:text-3xl">Quer um projeto de design de interiores para o seu ambiente?</h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Para contratar um projeto completo, com layout, visual 3D, lista de compras e acompanhamento da implementação, acesse www.arquiteturaecologica.com.br e conheça os planos Viver Bem e Viver Lifestyle.</p>
        <a href="https://www.arquiteturaecologica.com.br/#planos" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 bg-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground hover:opacity-90">Ver planos de contratação →</a>
      </section>
    </div>
  );
}

function RelatorioGratuito({ resultado, dossieId }: { resultado: ResultadoDiagnostico; dossieId?: string | undefined }) {
  return (
    <div className="report-view report-light space-y-8 bg-background p-5 text-foreground md:p-8">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Versão gratuita</p>
        <h2 className="font-display mt-1 text-3xl md:text-4xl">Dossiê Eco Holístico®</h2>
      </header>
      <section className="border-y border-border py-8">
        <ChapterHeading chapter="profile" title="Seu perfil Eco Holístico" />
        <h3 className="font-display mt-1 text-3xl">{resultado.perfil.nome}</h3>
        {resultado.perfil.fraseIdentidade && <p className="mt-1 italic text-muted-foreground">"{resultado.perfil.fraseIdentidade}"</p>}
        <p className="mt-4 leading-relaxed">{resultado.perfil.descricao}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <PerfilCard title="Força" text={resultado.perfil.forca} />
          <PerfilCard title="Desafio" text={resultado.perfil.desafio} />
          <PerfilCard title="Recomendação prioritária" text={resultado.perfil.recomendacaoPrioritaria} />
        </div>
      </section>
      <section className="border-y border-border py-8">
        <ChapterHeading chapter="dimensions" title="Equilíbrio dos 5 elementos" />
        <div className="mx-auto max-w-sm"><ElementRadar resultado={resultado} /></div>
      </section>
      
    </div>
  );
}

const EIXOS_CORPORATIVOS = [
  { nome: "Branding", numero: "01", aliases: ["branding", "alinhamento com a marca", "marca"] },
  { nome: "Posicionamento", numero: "02", aliases: ["posicionamento", "experiência do cliente", "experiencia do cliente"] },
  { nome: "Sustentabilidade", numero: "03", aliases: ["sustentabilidade", "sustentabilidade (esg)", "esg"] },
  { nome: "Bem-estar dos funcionários", numero: "04", aliases: ["bem-estar dos funcionários", "bem-estar dos funcionarios", "bem-estar da equipe"] },
];

function RelatorioCorporativo({ leitura }: { leitura: NonNullable<ResultadoDiagnostico["leituraEspecifica"]> }) {
  const usados = new Set<EixoEstrategico>();
  const eixos = EIXOS_CORPORATIVOS.map((meta) => {
    const eixo = leitura.eixos.find((item) => meta.aliases.includes(item.nome.toLocaleLowerCase("pt-BR")));
    if (eixo) usados.add(eixo);
    return { ...meta, eixo };
  });
  const extras = leitura.eixos.filter((eixo) => !usados.has(eixo));

  return (
    <section className="border-y border-border py-8">
      <div className="mb-6 flex justify-end"><ChapterArt chapter="strategy" /></div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Resumo executivo</p>
          <h3 className="font-display mt-1 text-3xl">Marca, impacto e pessoas</h3>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{leitura.sintese}</p>
        </div>
        <div className="min-w-32 border-l border-primary/40 pl-5">
          <div className="text-xs uppercase text-muted-foreground">Índice estratégico</div>
          <div className="font-display mt-1 text-5xl text-primary">{leitura.indice}<span className="text-base text-muted-foreground">/100</span></div>
        </div>
      </div>

      <div className="mt-10 divide-y divide-border border-y border-border">
        {eixos.map(({ nome, numero, eixo }) => (
          <EixoCorporativo key={nome} numero={numero} nome={nome} eixo={eixo} />
        ))}
        {extras.map((eixo, index) => (
          <EixoCorporativo key={eixo.nome} numero={String(index + 5).padStart(2, "0")} nome={eixo.nome} eixo={eixo} />
        ))}
      </div>
    </section>
  );
}

function EixoCorporativo({ numero, nome, eixo }: { numero: string; nome: string; eixo?: EixoEstrategico | undefined }) {
  return (
    <article className="grid gap-5 py-7 md:grid-cols-[180px_1fr]">
      <div>
        <div className="text-xs text-primary">{numero}</div>
        <h4 className="font-display mt-1 text-2xl">{nome}</h4>
        {eixo && <div className="font-display mt-3 text-4xl text-primary">{eixo.pontuacao}<span className="text-sm text-muted-foreground">/100</span></div>}
      </div>
      {eixo ? (
        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, eixo.pontuacao ?? 0))}%` }} />
          </div>
          <p className="mt-4 leading-relaxed text-muted-foreground">{eixo.analise}</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <ListaEixo titulo="Pontos fortes" itens={eixo.pontosFortes} />
            <ListaEixo titulo="Lacunas" itens={eixo.lacunas} />
            <ListaEixo titulo="Recomendações" itens={eixo.recomendacoes} />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Este eixo estará disponível nos próximos dossiês gerados.</p>
      )}
    </article>
  );
}

function ListaEixo({ titulo, itens }: { titulo: string; itens?: string[] }) {
  if (!itens || itens.length === 0) return null;
  return (
    <div className="mt-3">
      <div className="text-xs uppercase text-muted-foreground">{titulo}</div>
      <ul className="mt-1 list-disc pl-5 text-sm">
        {itens.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  );
}

function PerfilCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-4">
      <div className="text-xs uppercase text-muted-foreground">{title}</div>
      <p className="mt-1 text-sm">{text}</p>
    </div>
  );
}

function RadarDimensoes({ dimensoes }: { dimensoes: ResultadoDiagnostico["dimensoes"] }) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 100;
  const values = DIMENSOES_META.map((d, i) => {
    const p = (dimensoes[d.key]?.pontuacao ?? 0) / 100;
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r * p, y: cy + Math.sin(angle) * r * p, label: d.label, angle, base: { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r } };
  });
  const path = values.map((v, i) => `${i === 0 ? "M" : "L"}${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(" ") + " Z";
  const grid = [0.25, 0.5, 0.75, 1].map((f) =>
    DIMENSOES_META.map((_, i) => {
      const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      return `${i === 0 ? "M" : "L"}${(cx + Math.cos(a) * r * f).toFixed(1)},${(cy + Math.sin(a) * r * f).toFixed(1)}`;
    }).join(" ") + " Z"
  );
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[280px]">
      {grid.map((g, i) => (
        <path key={i} d={g} fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.6" />
      ))}
      {values.map((v, i) => (
        <line key={i} x1={cx} y1={cy} x2={v.base.x} y2={v.base.y} stroke="var(--border)" strokeWidth="0.5" opacity="0.5" />
      ))}
      <path d={path} fill="var(--primary)" fillOpacity="0.25" stroke="var(--primary)" strokeWidth="1.5" />
      {values.map((v, i) => {
        const lx = cx + Math.cos(v.angle) * (r + 20);
        const ly = cy + Math.sin(v.angle) * (r + 20);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
            className="font-display" fontSize="11" fill="var(--foreground)">{v.label}</text>
        );
      })}
    </svg>
  );
}
