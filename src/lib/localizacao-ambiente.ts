import { z } from "zod";

export const DIRECOES_JANELA = ["Norte", "Nordeste", "Leste", "Sudeste", "Sul", "Sudoeste", "Oeste", "Noroeste", "Não sei informar"];

export const localizacaoInputSchema = z.object({
  endereco: z.string().trim().max(300),
  ruaJanela: z.string().trim().max(200),
  consultar: z.boolean(),
});

export function dadosLocalizacao(respostas: Record<string, unknown>) {
  return localizacaoInputSchema.parse({
    endereco: respostas['enderecoImovel'] ?? "",
    ruaJanela: respostas['ruaJanela'] ?? "",
    consultar: respostas['consultaLocalizacao'] === "Sim, autorizo a consulta",
  });
}

export const confortoAmbientalSchema = z.object({
  iluminacaoNatural: z.string().min(1).max(4000),
  ventilacaoNatural: z.string().min(1).max(4000),
  confortoTermico: z.string().min(1).max(4000),
  orientacoesInternas: z.array(z.string().min(1).max(1000)).max(12),
  limitacoes: z.array(z.string().min(1).max(1000)).max(8),
});

export interface ConsultaLocalizacao {
  status: "localizado" | "inconclusivo" | "indisponivel" | "nao_autorizado";
  latitude?: number | undefined;
  longitude?: number | undefined;
  ruaJanelaLocalizada?: boolean | undefined;
  fonte?: string | undefined;
  consultadoEm?: string | undefined;
  limitacao: string;
}