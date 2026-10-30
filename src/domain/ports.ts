// Ports — abstract contracts (DIP). Adapters live in infrastructure/.
import type {
  DiagnosticoEntity,
  ResultadoDiagnostico,
  TipoAmbiente,
} from "./types";

export type RespostasMap = Record<string, string | number | boolean | string[] | null>;

export interface DocumentoMarca {
  nome: string;
  mimeType: "application/pdf";
  base64: string;
}

export interface AnaliseInput {
  tipoAmbiente: TipoAmbiente;
  imagemUrl: string | null;
  respostas: RespostasMap;
  documentoMarca?: DocumentoMarca | null | undefined;
  consultaLocalizacao?: import("@/lib/localizacao-ambiente").ConsultaLocalizacao | undefined;
}

export interface ILocalizacaoAdapter {
  consultar(respostas: Record<string, unknown>): Promise<import("@/lib/localizacao-ambiente").ConsultaLocalizacao>;
}

export interface IAIAnalyzer {
  analisar(input: AnaliseInput): Promise<ResultadoDiagnostico>;
}

export interface IImageGenerator {
  gerarTransformacao(
    promptContexto: string,
    imagemOriginalUrl?: string | null,
  ): Promise<{ base64: string; mimeType: string }>;
  especificarTransformacao?(
    imagemDepois: { base64: string; mimeType: string },
    imagemAntesUrl: string,
  ): Promise<NonNullable<ResultadoDiagnostico["especificacoesImagem"]>>;
}

export interface IStorageAdapter {
  uploadImagem(userId: string, buffer: Buffer, mimeType: string): Promise<string>;
  signedUrl(path: string, expiresIn?: number): Promise<string> | undefined;
}

export interface IDiagnosticoRepository {
  criar(input: {
    userId: string;
    tipoAmbiente: TipoAmbiente;
    imagemOriginalUrl: string | null;
    respostas: RespostasMap;
  }): Promise<{ id: string }>;

  atualizarResultado(
    id: string,
    userId: string,
    dados: {
      resultado: ResultadoDiagnostico;
      imagemTransformadaUrl?: string | null | undefined;
      status: "concluido" | "erro";
    },
  ): Promise<void>;

  buscarPorId(id: string, userId: string): Promise<DiagnosticoEntity | null>;
  listarPorUsuario(userId: string, limit?: number): Promise<DiagnosticoEntity[]> | undefined;
}
