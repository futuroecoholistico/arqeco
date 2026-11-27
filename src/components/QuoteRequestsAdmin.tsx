import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fieldClass } from "@/components/PartnerShell";
import { quoteTypes } from "@/components/site/QuoteForm";

const statusLabel: Record<string, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  fechado: "Fechado",
  nao_fechado: "Não fechado",
};

/** Pedidos de orçamento do site (sem login). RLS: só admin lê e atualiza. */
export function QuoteRequestsAdmin() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-quote-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
  async function setStatus(id: string, status: string) {
    await supabase.from("quote_requests").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-quote-requests"] });
  }
  async function saveNotes(id: string, admin_notes: string) {
    await supabase
      .from("quote_requests")
      .update({ admin_notes: admin_notes.trim().slice(0, 2000) || null })
      .eq("id", id);
  }
  if (q.isError)
    return (
      <p className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
        Não foi possível carregar os pedidos. Verifique se a migração 0022_quote_requests já foi
        aplicada no banco.
      </p>
    );
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {(q.data ?? []).length === 0 && (
        <p className="p-5 text-sm text-muted-foreground">
          Nenhum pedido de orçamento recebido pelo site.
        </p>
      )}
      {(q.data ?? []).map((item) => {
        const digits = item.whatsapp.replace(/\D/g, "");
        const wa = `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
        return (
          <article key={item.id} className="grid gap-4 p-5 text-sm lg:grid-cols-[1fr_250px]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-semibold">{item.full_name}</h3>
                <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-semibold">
                  {statusLabel[item.status] ?? item.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleString("pt-BR")} · {item.city} · origem{" "}
                {item.source_page ?? "site"}
              </p>
              <p className="mt-2 text-xs font-semibold text-primary">
                {quoteTypes.find((t) => t.value === item.project_type)?.label ?? item.project_type}
              </p>
              {item.message && <p className="mt-3 leading-relaxed">{item.message}</p>}
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary"
              >
                <MessageCircle className="size-4" aria-hidden="true" /> {item.whatsapp}
              </a>
            </div>
            <div className="space-y-3">
              <select
                className={fieldClass}
                value={item.status}
                onChange={(e) => setStatus(item.id, e.target.value)}
                aria-label="Situação do pedido"
              >
                {Object.entries(statusLabel).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              <textarea
                className={`${fieldClass} min-h-24 py-2`}
                defaultValue={item.admin_notes ?? ""}
                onBlur={(e) => saveNotes(item.id, e.target.value)}
                maxLength={2000}
                placeholder="Anotações da equipe"
                aria-label="Anotações da equipe"
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
