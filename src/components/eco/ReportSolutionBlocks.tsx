import { Sun, Wind, Palette, Flower2, Gem, AudioLines, Leaf, Sparkles } from "lucide-react";
import type { ResultadoDiagnostico } from "@/domain/types";
import { organizarBlocosDossie } from "@/lib/blocos-dossie";

const icons = { iluminacao: Sun, ventilacao: Wind, cores: Palette, aromas: Flower2, cristais: Gem, frequencias: AudioLines, biofilia: Leaf, rituais: Sparkles };

export function ReportSolutionBlocks({ resultado }: { resultado: ResultadoDiagnostico }) {
  return <section aria-label="Soluções por campo" className="border-y border-border py-8">
    <h3 className="font-display mb-6 text-2xl md:text-3xl">Soluções para o seu ambiente</h3>
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {organizarBlocosDossie(resultado).map(campo => {
        const Icon = icons[campo.id];
        const texto = campo.itens.find(item => campo.termos.test(item.texto))?.texto || campo.necessidade || "Sem indicação específica para este ambiente.";
        const primeiraFrase = texto.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || texto;
        const indicacao = primeiraFrase.length > 130 ? `${primeiraFrase.slice(0, 127).replace(/\s+\S*$/, "")}…` : primeiraFrase;
        return <article key={campo.id} aria-label={campo.titulo} className="flex flex-col items-center rounded-lg border border-border bg-card/40 p-4 text-center">
          <h4 className="min-h-9 text-xs font-semibold uppercase">{campo.titulo}</h4>
          <Icon aria-hidden="true" className="my-3 h-10 w-10 shrink-0 text-primary" strokeWidth={1.2} />
          <p className="text-xs leading-relaxed text-muted-foreground">{indicacao}</p>
        </article>;
      })}
    </div>
    <p className="mt-4 text-xs text-muted-foreground">Aromas, cristais, sons e rituais são opcionais; respeite sensibilidades e preferências. Não substituem cuidados de saúde.</p>
  </section>;
}