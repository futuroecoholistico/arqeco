// Server functions de feedback — salvos no banco, visíveis ao admin.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const EnviarFeedbackInput = z.object({
  mensagem: z.string().trim().min(3).max(2000),
  nota: z.number().int().min(1).max(5).nullable().optional(),
  diagnosticoId: z.string().uuid().nullable().optional(),
});

export const enviarFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => EnviarFeedbackInput.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("feedbacks")
      .insert({
        user_id: context.userId,
        diagnostico_id: data.diagnosticoId ?? null,
        nota: data.nota ?? null,
        mensagem: data.mensagem,
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
