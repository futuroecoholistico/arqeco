import { AudioLines, Gem, Hexagon, Lamp, Layers, Leaf, Shirt, Wind } from "lucide-react";
import type { ResultadoDiagnostico } from "@/domain/types";
import { montarMoodboard, type CategoriaMood } from "@/lib/moodboard-dossie";

const ICONES: Record<CategoriaMood, typeof Gem> = {
  cristal: Gem, tecido: Shirt, geometria: Hexagon, planta: Leaf, aroma: Wind, luz: Lamp, material: Layers, som: AudioLines,
};

export function ReportMoodboard({ resultado }: { resultado: ResultadoDiagnostico }) {
  const { itens, paleta } = montarMoodboard(resultado);
  if (itens.length === 0 && paleta.length === 0) return null;
  return (
    <section className="border-y border-border py-8">
      <p className="text-xs uppercase tracking-[0.25em] text-primary">Moodboard</p>
      <h3 className="font-display mt-1 text-2xl md:text-3xl">Elementos a incorporar</h3>
      {paleta.length > 0 && (
        <div className="mt-6">
          <div className="text-xs uppercase text-muted-foreground">Paleta de cores</div>
          <div className="mt-2 flex overflow-hidden rounded-lg border border-border">
            {paleta.map(c => (
              <div key={c.hex} className="flex-1">
                {/* Cor dinâmica vinda do dossiê: amostra de paleta, não token de tema */}
                <div className="h-20" style={{ backgroundColor: c.hex }} />
                <div className="px-2 py-1.5 text-center text-[11px]">{c.nome}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {itens.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {itens.map(item => {
            const Icone = ICONES[item.categoria];
            return (
              <figure key={item.nome} className="flex flex-col items-center rounded-lg border border-border bg-card/40 p-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: `${item.cor}33` }}>
                  <Icone className="h-10 w-10" style={{ color: item.cor }} strokeWidth={1.4} aria-hidden />
                </div>
                <figcaption className="mt-3">
                  <div className="font-display text-base">{item.nome}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.aplicacao}</p>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}
