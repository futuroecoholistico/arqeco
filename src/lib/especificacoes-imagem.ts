import { z } from "zod";

export const especificacoesImagemSchema = z.object({
  itens: z.array(z.object({
    item: z.string().min(1).max(160),
    cor: z.string().max(160),
    material: z.string().max(200),
    localizacao: z.string().min(1).max(240),
    observacao: z.string().max(300),
  })).max(30),
});

export function parseEspecificacoesImagem(texto: string) {
  const semCerca = texto.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return especificacoesImagemSchema.parse(JSON.parse(semCerca)).itens;
}