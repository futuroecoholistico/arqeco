// Use case: orchestrates AI analysis + image generation + persistence.
import type {
  DocumentoMarca,
  IAIAnalyzer,
  IDiagnosticoRepository,
  IImageGenerator,
  IStorageAdapter,
  ILocalizacaoAdapter,
} from "@/domain/ports";
import type { ResultadoDiagnostico, TipoAmbiente } from "@/domain/types";
import { buildImagePrompt } from "@/lib/prompts";

export interface AnalisarAmbienteInput {
  userId: string;
  diagnosticoId: string;
  tipoAmbiente: TipoAmbiente;
  imagemUrl: string | null;
  respostas: import("@/domain/ports").RespostasMap;
  documentoMarca?: DocumentoMarca | null | undefined;
}

export class AnalisarAmbienteUseCase {
  constructor(
    private readonly analyzer: IAIAnalyzer,
    private readonly imageGen: IImageGenerator,
    private readonly storage: IStorageAdapter,
    private readonly repo: IDiagnosticoRepository,
    private readonly localizacao?: ILocalizacaoAdapter,
  ) {}

  async execute(input: AnalisarAmbienteInput): Promise<ResultadoDiagnostico> {
    let resultado: ResultadoDiagnostico;
    try {
      const consultaLocalizacao = await this.localizacao?.consultar(input.respostas);
      resultado = await this.analyzer.analisar({
        tipoAmbiente: input.tipoAmbiente,
        imagemUrl: input.imagemUrl,
        respostas: input.respostas,
        documentoMarca: input.documentoMarca,
        consultaLocalizacao,
      });
      resultado.consultaLocalizacao = consultaLocalizacao;
      const direcao = input.respostas['orientacaoJanela'];
      if (typeof direcao === "string" && direcao !== "Não sei informar") resultado.orientacaoJanelaInformada = direcao;
    } catch (err) {
      await this.repo.atualizarResultado(input.diagnosticoId, input.userId, {
        resultado: fallbackResultado((err as Error).message),
        status: "erro",
      });
      throw err;
    }

    // Best-effort image generation (não bloqueia o diagnóstico se falhar)
    let imagemTransformadaUrl: string | null = null;
    try {
      const prompt = buildImagePrompt(input.tipoAmbiente, resultado, input.respostas);
      const img = await this.imageGen.gerarTransformacao(prompt, input.imagemUrl);
      const buffer = Buffer.from(img.base64, "base64");
      const path = await this.storage.uploadImagem(input.userId, buffer, img.mimeType);
      imagemTransformadaUrl = await this.storage.signedUrl(path);
      resultado.imagemTransformadaUrl = imagemTransformadaUrl ?? undefined;
      // Inspect the produced image, not the requested design, before naming inserted items.
      if (input.imagemUrl && this.imageGen.especificarTransformacao) {
        try {
          resultado.especificacoesImagem = await this.imageGen.especificarTransformacao(img, input.imagemUrl);
        } catch {
          console.warn("[AnalisarAmbienteUseCase] especificação visual indisponível");
        }
      }
    } catch (err) {
      console.warn("[AnalisarAmbienteUseCase] geração de imagem falhou:", err);
    }

    await this.repo.atualizarResultado(input.diagnosticoId, input.userId, {
      resultado,
      imagemTransformadaUrl,
      status: "concluido",
    });

    return resultado;
  }
}

function fallbackResultado(msg: string): ResultadoDiagnostico {
  return {
    resumoAmbiente: `Não foi possível concluir a análise: ${msg}`,
    descobertasPrincipais: [],
    indiceGeralRegeneracao: 0,
    nivelEcoHolistico: 1,
    descricaoNivel: "Análise indisponível no momento.",
    perfil: {
      nome: "—",
      descricao: "",
      forca: "",
      desafio: "",
      recomendacaoPrioritaria: "",
      fraseIdentidade: "",
    },
    dimensoes: {
      vitalidade: { pontuacao: 0, analise: "", recomendacoes: [] },
      regeneracao: { pontuacao: 0, analise: "", recomendacoes: [] },
      conexao: { pontuacao: 0, analise: "", recomendacoes: [] },
      consciencia: { pontuacao: 0, analise: "", recomendacoes: [] },
      proposito: { pontuacao: 0, analise: "", recomendacoes: [] },
    },
    pontuacaoElementos: { terra: 0, agua: 0, fogo: 0, ar: 0, eter: 0 },
    leituraElemental: [],
    recomendacoesPrioritarias: [],
    planoAcao: { sete_dias: [], trinta_dias: [], noventa_dias: [] },
    fraseFinal: "Tente novamente em alguns instantes.",
  };
}
