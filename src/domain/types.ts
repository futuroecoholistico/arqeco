// Domain types — pure data structures, no dependencies

export type TipoAmbiente =
  | "residencial"
  | "corporativo"
  | "comercial"
  | "terapeutico"
  | "hotelaria";

export const TIPOS_AMBIENTE: { id: TipoAmbiente; label: string; descricao: string }[] = [
  { id: "residencial", label: "Residencial", descricao: "Casa, apartamento, quarto — dossiê pessoal" },
  { id: "corporativo", label: "Corporativo", descricao: "Escritório, sede, coworking — dossiê de marca e equipe" },
  { id: "comercial", label: "Comercial", descricao: "Loja, showroom, restaurante — dossiê de marca e cliente" },
  { id: "terapeutico", label: "Terapêutico", descricao: "Consultório, sala de terapia, clínica" },
  { id: "hotelaria", label: "Hotelaria", descricao: "Hotel, pousada, hospedagem" },
];

// Cada público recebe uma trilha própria de perguntas e de relatório.
export type Trilha = "residencial" | "empresarial" | "terapeutico" | "hotelaria";

export function trilhaDe(tipo: TipoAmbiente): Trilha {
  if (tipo === "corporativo" || tipo === "comercial") return "empresarial";
  return tipo;
}

export const TRILHA_LABELS: Record<Trilha, string> = {
  residencial: "Dossiê Residencial",
  empresarial: "Dossiê Empresarial",
  terapeutico: "Dossiê Terapêutico",
  hotelaria: "Dossiê de Hotelaria",
};

export interface EixoEstrategico {
  nome: string;
  pontuacao: number;
  analise: string;
  pontosFortes: string[];
  lacunas: string[];
  recomendacoes: string[];
}

// Bloco específico da trilha (ex.: marca, ESG, equipe, cliente).
export interface LeituraEspecifica {
  titulo: string;
  indice: number;
  sintese: string;
  eixos: EixoEstrategico[];
}

export interface PontuacaoElementos {
  terra: number;
  agua: number;
  fogo: number;
  ar: number;
  eter: number;
}

export interface LeituraElemento {
  elemento: string;
  pontuacao: number;
  interpretacao: string;
  impacto: string;
  sugestoesEquilibrio: string[];
}

export interface DimensaoEcoHolistica {
  pontuacao: number;
  analise: string;
  riscos?: string[] | undefined;
  recomendacoes: string[];
}

export interface DimensoesEcoHolisticas {
  vitalidade: DimensaoEcoHolistica;
  regeneracao: DimensaoEcoHolistica;
  conexao: DimensaoEcoHolistica;
  consciencia: DimensaoEcoHolistica;
  proposito: DimensaoEcoHolistica;
}

export interface PerfilEcoHolistico {
  nome: string;
  descricao: string;
  forca: string;
  desafio: string;
  recomendacaoPrioritaria: string;
  fraseIdentidade: string;
}

export interface RecomendacaoEstruturada {
  principio: string;
  observacao: string;
  porqueImporta: string;
  oQueFazer: string;
  prioridade: "alta" | "media" | "baixa";
  prazo: "7 dias" | "30 dias" | "90 dias";
  tipoIntervencao: string;
}

export interface PlanoAcaoItem {
  acao: string;
  descricao?: string | undefined;
}

export interface PlanoAcaoEcoHolistico {
  sete_dias: PlanoAcaoItem[];
  trinta_dias: PlanoAcaoItem[];
  noventa_dias: PlanoAcaoItem[];
}

export interface ResultadoDiagnostico {
  resumoAmbiente: string;
  descobertasPrincipais: string[];
  indiceGeralRegeneracao: number;
  nivelEcoHolistico: 1 | 2 | 3 | 4 | 5;
  descricaoNivel: string;
  perfil: PerfilEcoHolistico;
  dimensoes: DimensoesEcoHolisticas;
  pontuacaoElementos: PontuacaoElementos;
  leituraElemental: LeituraElemento[];
  recomendacoesPrioritarias: RecomendacaoEstruturada[];
  planoAcao: PlanoAcaoEcoHolistico;
  fraseFinal: string;
  leituraEspecifica?: LeituraEspecifica | undefined;
  confortoAmbiental?: { iluminacaoNatural: string | undefined; ventilacaoNatural: string; confortoTermico: string; orientacoesInternas: string[]; limitacoes: string[] };
  consultaLocalizacao?: import("@/lib/localizacao-ambiente").ConsultaLocalizacao | undefined;
  orientacaoJanelaInformada?: string | undefined;
  imagemTransformadaUrl?: string | undefined;
  especificacoesImagem?: { item: string | undefined; cor: string; material: string; localizacao: string; observacao: string }[];
  camposAmbiente?: { campo: "iluminacao" | "ventilacao" | "cores" | "aromas" | "cristais" | "frequencias" | "biofilia" | "rituais" | undefined; necessidade: string; orientacoes: string[] }[];
}

export interface DiagnosticoEntity {
  id: string;
  userId: string;
  tipoAmbiente: TipoAmbiente;
  imagemOriginalUrl: string | null;
  imagemTransformadaUrl: string | null;
  respostas: Record<string, string | number | boolean | string[] | null>;
  resultado: ResultadoDiagnostico | null;
  status: "processando" | "concluido" | "erro";
  nivel: number | null;
  indiceRegeneracao: number | null;
  createdAt: string;
  /** true quando o usuário não tem acesso completo; conteúdo já vem reduzido do servidor. */
  bloqueado?: boolean | undefined;
}

export const NIVEIS_LABELS: Record<number, string> = {
  1: "Desconectado",
  2: "Em Transição",
  3: "Em Alinhamento",
  4: "Regenerativo",
  5: "Eco Holístico",
};

export const ELEMENTOS_META = [
  { key: "terra" as const, label: "Terra", color: "var(--terra)", desc: "Estabilidade & enraizamento" },
  { key: "agua" as const, label: "Água", color: "var(--agua)", desc: "Fluidez & emoções" },
  { key: "fogo" as const, label: "Fogo", color: "var(--fogo)", desc: "Transformação & motivação" },
  { key: "ar" as const, label: "Ar", color: "var(--ar)", desc: "Clareza & comunicação" },
  { key: "eter" as const, label: "Éter", color: "var(--eter)", desc: "Consciência & propósito" },
];

export const DIMENSOES_META = [
  { key: "vitalidade" as const, label: "Vitalidade" },
  { key: "regeneracao" as const, label: "Regeneração" },
  { key: "conexao" as const, label: "Conexão" },
  { key: "consciencia" as const, label: "Consciência" },
  { key: "proposito" as const, label: "Propósito" },
];
