import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getAccount = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: profile, error } = await context.supabase.from("profiles").select("*").eq("user_id", context.userId).single();
  if (error) throw new Error("Não foi possível carregar seu cadastro.");
  const { data: admin } = await context.supabase.rpc("is_admin");
  let photo: string | null = null;
  if (profile.avatar_path) {
    photo = (await context.supabase.storage.from("profile-photos").createSignedUrl(profile.avatar_path, 3600)).data?.signedUrl ?? null;
  }
  return { profile, admin: admin === true, photo };
});

export const saveAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ full_name: z.string().trim().min(2).max(120), phone: z.string().trim().min(10).max(30), city: z.string().trim().min(2).max(80), category: z.enum(["client", "professional", "supplier", "affiliate"]), avatar_path: z.string().max(500).nullable().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    if (data.avatar_path && !data.avatar_path.startsWith(`${context.userId}/`)) throw new Error("Foto inválida.");
    const { data: current } = await context.supabase.from("profiles").select("registration_category").eq("user_id", context.userId).single();
    if (current?.registration_category && current.registration_category !== data.category) throw new Error("Para mudar sua categoria, fale com a equipe ARQECO.");
    const { error } = await context.supabase.from("profiles").update({ full_name: data.full_name, phone: data.phone, city: data.city, registration_category: data.category, ...(data.avatar_path !== undefined ? { avatar_path: data.avatar_path } : {}) }).eq("user_id", context.userId);
    if (error) throw new Error("Não foi possível salvar seu cadastro.");
    return { ok: true };
  });