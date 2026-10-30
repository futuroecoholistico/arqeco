// Adapter: persistence via Supabase (service role — RLS bypass; use only server-side).
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IDiagnosticoRepository } from "@/domain/ports";
import type {
  DiagnosticoEntity,
  ResultadoDiagnostico,
  TipoAmbiente,
} from "@/domain/types";

type Row = {
  id: string;
  user_id: string;
  tipo_ambiente: string;
  imagem_original_url: string | null;
  imagem_transformada_url: string | null;
  respostas: Record<string, string | number | boolean | string[] | null>;
  resultado: ResultadoDiagnostico | null;
  status: string;
  nivel: number | null;
  indice_regeneracao: number | null;
  created_at: string;
};

function mapRow(r: Row): DiagnosticoEntity {
  return {
    id: r.id,
    userId: r.user_id,
    tipoAmbiente: r.tipo_ambiente as TipoAmbiente,
    imagemOriginalUrl: r.imagem_original_url,
    imagemTransformadaUrl: r.imagem_transformada_url,
    respostas: r.respostas ?? {},
    resultado: r.resultado,
    status: r.status as DiagnosticoEntity["status"],
    nivel: r.nivel,
    indiceRegeneracao: r.indice_regeneracao,
    createdAt: r.created_at,
  };
}

export class SupabaseDiagnosticoRepository implements IDiagnosticoRepository {
  constructor(private readonly client: SupabaseClient) {}

  private async refreshImage(url: string | null): Promise<string | null> {
    if (!url) return null;
    const marker = "/storage/v1/object/sign/ambientes/";
    const start = url.indexOf(marker);
    if (start < 0) return url;
    const path = decodeURIComponent(url.slice(start + marker.length).split("?")[0] ?? "");
    const { data } = await this.client.storage.from("ambientes").createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  }
  private async hydrate(row: Row): Promise<DiagnosticoEntity> {
    const entity = mapRow(row);
    entity.imagemOriginalUrl = await this.refreshImage(entity.imagemOriginalUrl);
    entity.imagemTransformadaUrl = await this.refreshImage(entity.imagemTransformadaUrl);
    if (entity.resultado) entity.resultado.imagemTransformadaUrl = entity.imagemTransformadaUrl ?? undefined;
    return entity;
  }

  async criar(input: {
    userId: string;
    tipoAmbiente: TipoAmbiente;
    imagemOriginalUrl: string | null;
    respostas: Record<string, unknown>;
  }): Promise<{ id: string }> {
    const { data, error } = await this.client
      .from("diagnosticos")
      .insert({
        user_id: input.userId,
        tipo_ambiente: input.tipoAmbiente,
        imagem_original_url: input.imagemOriginalUrl,
        respostas: input.respostas,
        status: "processando",
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(`Falha ao criar diagnóstico: ${error?.message}`);
    return { id: data.id };
  }

  async atualizarResultado(
    id: string,
    userId: string,
    dados: {
      resultado: ResultadoDiagnostico;
      imagemTransformadaUrl?: string | null;
      status: "concluido" | "erro";
    },
  ): Promise<void> {
    const { error } = await this.client
      .from("diagnosticos")
      .update({
        resultado: dados.resultado,
        imagem_transformada_url: dados.imagemTransformadaUrl ?? null,
        status: dados.status,
        nivel: dados.resultado.nivelEcoHolistico,
        indice_regeneracao: dados.resultado.indiceGeralRegeneracao,
      })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(`Falha ao atualizar diagnóstico: ${error.message}`);
  }

  async buscarPorId(id: string, userId: string): Promise<DiagnosticoEntity | null> {
    const { data, error } = await this.client
      .from("diagnosticos")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? this.hydrate(data as Row) : null;
  }

  async listarPorUsuario(userId: string, limit = 50): Promise<DiagnosticoEntity[]> {
    const { data, error } = await this.client
      .from("diagnosticos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return Promise.all((data ?? []).map((r) => this.hydrate(r as Row)));
  }
}
