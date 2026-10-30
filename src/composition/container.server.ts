// Composition Root — instancia adapters e injeta em use cases.
// Server-only: NUNCA importe deste arquivo do bundle cliente.
import type { SupabaseClient } from "@supabase/supabase-js";

import { AnalisarAmbienteUseCase } from "@/application/AnalisarAmbienteUseCase";
import { LovableAIAnalyzer } from "@/infrastructure/LovableAIAnalyzer.server";
import { LovableImageGenerator } from "@/infrastructure/LovableImageGenerator.server";
import { SupabaseDiagnosticoRepository } from "@/infrastructure/SupabaseDiagnosticoRepository.server";
import { SupabaseStorageAdapter } from "@/infrastructure/SupabaseStorageAdapter.server";
import { GoogleMapsLocalizacao } from "@/infrastructure/GoogleMapsLocalizacao.server";

export interface Container {
  analisar: AnalisarAmbienteUseCase;
  storage: SupabaseStorageAdapter;
  repo: SupabaseDiagnosticoRepository;
}

export function buildContainer(adminClient: SupabaseClient): Container {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada");

  const analyzer = new LovableAIAnalyzer(apiKey);
  const imageGen = new LovableImageGenerator(apiKey);
  const storage = new SupabaseStorageAdapter(adminClient);
  const repo = new SupabaseDiagnosticoRepository(adminClient);
  const localizacao = new GoogleMapsLocalizacao(apiKey, process.env['GOOGLE_MAPS_API_KEY']);
  const analisar = new AnalisarAmbienteUseCase(analyzer, imageGen, storage, repo, localizacao);

  return { analisar, storage, repo };
}
