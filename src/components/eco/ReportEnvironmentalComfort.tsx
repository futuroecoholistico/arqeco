import { Compass, Sun, Wind, Thermometer } from "lucide-react";
import type { ResultadoDiagnostico } from "@/domain/types";

export function ReportEnvironmentalComfort({ resultado }: { resultado: ResultadoDiagnostico }) {
  const conforto = resultado.confortoAmbiental;
  if (!conforto) return null;
  const localizacao = resultado.consultaLocalizacao;
  return <section className="border-y border-border py-8">
    <div className="mb-6 flex items-center gap-3"><Compass className="h-8 w-8 shrink-0 text-primary" /><h3 className="font-display text-2xl md:text-3xl">Luz natural, ventilação e conforto ambiental</h3></div>
    <p className="mb-5 text-sm text-muted-foreground">Orientação da janela: {resultado.orientacaoJanelaInformada || "Não confirmada"}{resultado.orientacaoJanelaInformada ? " · informada pelo usuário, não verificada no mapa" : ""}.</p>
    <div className="grid gap-6 md:grid-cols-3">
      {[{ titulo: "Iluminação natural", texto: conforto.iluminacaoNatural, Icon: Sun }, { titulo: "Ventilação natural", texto: conforto.ventilacaoNatural, Icon: Wind }, { titulo: "Conforto térmico", texto: conforto.confortoTermico, Icon: Thermometer }].map(({ titulo, texto, Icon }) => <article key={titulo} className="min-w-0"><Icon className="mb-3 h-7 w-7 text-primary" /><h4 className="font-display text-xl">{titulo}</h4><p className="mt-2 text-sm leading-relaxed">{texto}</p></article>)}
    </div>
    {conforto.orientacoesInternas.length > 0 && <div className="mt-6"><h4 className="font-display text-xl">Ajustes internos recomendados</h4><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{conforto.orientacoesInternas.map((texto, i) => <li key={i}>{texto}</li>)}</ul></div>}
    <div className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
      <p>{localizacao?.status === "localizado" ? "Localização do imóvel consultada no Google Maps; orientação da janela não confirmada pela consulta." : "Localização não confirmada por consulta externa."}</p>
      {localizacao?.status === "localizado" && <p>{localizacao.ruaJanelaLocalizada ? "Rua indicada para a janela encontrada nas proximidades; a fachada ainda precisa de confirmação." : "Rua da janela não confirmada no mapa."}</p>}
      {localizacao?.fonte && <a className="underline" href={localizacao.fonte} target="_blank" rel="noopener noreferrer">Localização consultada · Google Maps</a>}
      <p className="mt-2">{localizacao?.limitacao}</p>
      {conforto.limitacoes.map((texto, i) => <p className="mt-1" key={i}>{texto}</p>)}
    </div>
  </section>;
}