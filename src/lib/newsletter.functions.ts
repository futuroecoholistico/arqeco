import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/brevo";
const SENDER = { name: "Arquitetura Ecológica", email: "contato.arquiteturaecologica@gmail.com" };
const LIST_NAME = "ARQECO Newsletter";

async function brevo(path: string, init: { method?: string; body?: unknown } = {}) {
  const lk = process.env.LOVABLE_API_KEY;
  const bk = process.env.BREVO_API_KEY;
  if (!lk || !bk) throw new Error("Brevo não está conectado.");
  const res = await fetch(`${GATEWAY}${path}`, {
    method: init.method ?? "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": bk },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Brevo ${path} [${res.status}]: ${text}`);
    let msg = text;
    try { msg = JSON.parse(text).message ?? text; } catch { /* keep */ }
    throw new Error(`Brevo recusou (${res.status}): ${msg}`);
  }
  return text ? JSON.parse(text) : {};
}

async function assertAdmin(ctx: { supabase: any }) {
  const { data } = await ctx.supabase.rpc("is_admin");
  if (!data) throw new Error("Acesso restrito à administração.");
}

async function ensureList(): Promise<number> {
  const lists = await brevo("/contacts/lists?limit=50");
  const found = (lists.lists ?? []).find((l: any) => l.name === LIST_NAME);
  if (found) return found.id;
  const folders = await brevo("/contacts/folders?limit=10");
  let folderId = folders.folders?.[0]?.id;
  if (!folderId) folderId = (await brevo("/contacts/folders", { method: "POST", body: { name: "ARQECO" } })).id;
  return (await brevo("/contacts/lists", { method: "POST", body: { name: LIST_NAME, folderId } })).id;
}

type Input = { subject: string; html: string; testEmail?: string };
const validate = (d: Input) => {
  if (!d?.subject?.trim() || d.subject.length > 200) throw new Error("Assunto inválido.");
  if (!d?.html?.trim() || d.html.length > 200_000) throw new Error("Conteúdo inválido.");
  if (d.testEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.testEmail)) throw new Error("E-mail de teste inválido.");
  return d;
};

export const getNewsletterAudience = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { count } = await context.supabase.from("email_contacts").select("id", { count: "exact", head: true }).eq("subscriber_status", "subscribed");
    return { subscribed: count ?? 0 };
  });

export const sendNewsletter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const listId = await ensureList();

    if (!data.testEmail) {
      // Only contacts who opted in; Brevo keeps its own unsubscribes blocked.
      const { data: rows, error } = await context.supabase.from("email_contacts").select("email, full_name").eq("subscriber_status", "subscribed");
      if (error) throw new Error(error.message);
      if (!rows?.length) throw new Error("Nenhum inscrito para enviar.");
      await brevo("/contacts/import", {
        method: "POST",
        body: { listIds: [listId], updateExistingContacts: true, emptyContactsAttributes: false,
          jsonBody: rows.map((r: any) => ({ email: r.email, attributes: r.full_name ? { NOME: r.full_name } : {} })) },
      });
    }

    const campaign = await brevo("/emailCampaigns", {
      method: "POST",
      body: { name: `${data.testEmail ? "[Teste] " : ""}${data.subject}`.slice(0, 200), subject: data.subject, sender: SENDER, htmlContent: data.html, recipients: { listIds: [listId] } },
    });
    if (data.testEmail) {
      await brevo(`/emailCampaigns/${campaign.id}/sendTest`, { method: "POST", body: { emailTo: [data.testEmail] } });
      return { ok: true, mode: "test" as const };
    }
    await brevo(`/emailCampaigns/${campaign.id}/sendNow`, { method: "POST" });
    return { ok: true, mode: "sent" as const };
  });
