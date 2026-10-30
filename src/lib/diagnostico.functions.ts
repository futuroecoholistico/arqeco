import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { ResultadoDiagnostico, DiagnosticoEntity } from "@/domain/types";
import { dadosLocalizacao } from "@/lib/localizacao-ambiente";
import { prepararRespostasQuestionario } from "@/lib/questionario";

export const uploadImagem = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ base64: z.string().min(10).max(15000000), mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]) }).parse(input))
  .handler(async ({ data, context }) => {
    const { SupabaseStorageAdapter } = await import("@/infrastructure/SupabaseStorageAdapter.server");
    const storage = new SupabaseStorageAdapter(context.supabase);
    const buffer = Buffer.from(data.base64, "base64");
    if (buffer.byteLength > 8 * 1024 * 1024) throw new Error("Imagem acima de 8 MB.");
    const path = await storage.uploadImagem(context.userId, buffer, data.mimeType);
    return { path, signedUrl: await storage.signedUrl(path) };
  });

export const analisarAmbiente = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ tipoAmbiente: z.enum(["residencial", "corporativo", "comercial", "terapeutico", "hotelaria"]), imagemPath: z.string().max(500).nullable(), respostas: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.null()])), documentoMarca: z.object({ nome: z.string().min(1).max(180), mimeType: z.literal("application/pdf"), base64: z.string().min(100).max(14000000) }).nullable().optional(), ref: z.string().regex(/^[a-f0-9]{6,20}$/).nullable().optional() }).parse(input))
  .handler(async ({ data, context }): Promise<{ id: string; resultado: ResultadoDiagnostico; imagemOriginalUrl: string | null; bloqueado: boolean }> => {
    if (data.imagemPath && !data.imagemPath.startsWith(`${context.userId}/`)) throw new Error("Imagem não pertence à sua conta.");
    if (data.ref) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: link } = await supabaseAdmin.from("referral_links").select("id,affiliate_id,plan_slug").eq("code", data.ref).maybeSingle();
      if (link?.plan_slug === "start" && link.affiliate_id !== context.userId) {
        const { error } = await supabaseAdmin.from("referral_attributions").upsert({ referred_user_id: context.userId, link_id: link.id, affiliate_id: link.affiliate_id }, { onConflict: "referred_user_id", ignoreDuplicates: true });
        if (error) throw new Error("Não foi possível registrar a indicação. Tente novamente.");
      }
    }
    const { buildContainer } = await import("@/composition/container.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Only the validated analysis handler may write completion; browser writes are revoked.
    const container = buildContainer(supabaseAdmin);
    const respostas = prepararRespostasQuestionario(data.tipoAmbiente, data.respostas);
    const location = dadosLocalizacao(respostas);
    if (location.consultar && !location.endereco) throw new Error("Informe o endereço do imóvel.");
    const imagemOriginalUrl = data.imagemPath ? await container.storage.signedUrl(data.imagemPath) : null;
    const { id } = await container.repo.criar({ userId: context.userId, tipoAmbiente: data.tipoAmbiente, imagemOriginalUrl, respostas });
    const resultado = await container.analisar.execute({ userId: context.userId, diagnosticoId: id, tipoAmbiente: data.tipoAmbiente, imagemUrl: imagemOriginalUrl, respostas, documentoMarca: data.documentoMarca });
    return { id, resultado, imagemOriginalUrl, bloqueado: false };
  });

export const listarMeusDiagnosticos = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<DiagnosticoEntity[]> => {
  const { SupabaseDiagnosticoRepository } = await import("@/infrastructure/SupabaseDiagnosticoRepository.server");
  return new SupabaseDiagnosticoRepository(context.supabase).listarPorUsuario(context.userId);
});
export const buscarDiagnostico = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { SupabaseDiagnosticoRepository } = await import("@/infrastructure/SupabaseDiagnosticoRepository.server");
    return new SupabaseDiagnosticoRepository(context.supabase).buscarPorId(data.id, context.userId);
  });