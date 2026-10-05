import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { fieldClass } from "@/components/PartnerShell";

type Slot = { id: string; starts_at: string; is_available: boolean };

const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return (h ?? 0) * 60 + (m ?? 0); };

/** Gera e gerencia horários em lote. professionalId null = agenda da equipe ARQECO. */
export function SlotManager({ professionalId }: { professionalId: string | null }) {
  const qc = useQueryClient();
  const key = ["slots", professionalId ?? "team"];
  const q = useQuery({
    queryKey: key,
    queryFn: async () => {
      let query = supabase.from("appointment_slots").select("id,starts_at,is_available").gte("starts_at", new Date().toISOString()).order("starts_at");
      query = professionalId ? query.eq("professional_id", professionalId) : query.is("professional_id", null);
      return ((await query).data ?? []) as Slot[];
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  const [days, setDays] = useState<Date[]>([]);
  const [from, setFrom] = useState("10:00");
  const [to, setTo] = useState("16:00");
  const [interval, setIntervalMin] = useState("120");
  const [duration, setDuration] = useState("60");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const preview = useMemo(() => {
    const start = toMin(from), end = toMin(to), step = Number(interval), dur = Number(duration);
    if (!(step >= 15) || !(dur >= 15) || end <= start) return [] as string[];
    const out: string[] = [];
    for (let t = start; t + dur <= end; t += step) out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
    return out;
  }, [from, to, interval, duration]);

  async function generate() {
    if (days.length === 0 || preview.length === 0) { setMsg({ ok: false, text: "Escolha ao menos um dia e um período válido." }); return; }
    const existing = new Set((q.data ?? []).map((s) => new Date(s.starts_at).getTime()));
    const now = Date.now(), dur = Number(duration);
    const rows = days.flatMap((d) => preview.map((t) => new Date(`${dayKey(d)}T${t}:00`)))
      .filter((s) => s.getTime() > now && !existing.has(s.getTime()))
      .map((s) => ({ professional_id: professionalId, starts_at: s.toISOString(), ends_at: new Date(s.getTime() + dur * 60000).toISOString() }));
    if (rows.length === 0) { setMsg({ ok: false, text: "Esses horários já existem ou já passaram." }); return; }
    setBusy(true);
    const { error } = await supabase.from("appointment_slots").insert(rows);
    setBusy(false);
    setMsg(error ? { ok: false, text: "Não foi possível criar os horários." } : { ok: true, text: `${rows.length} horário${rows.length === 1 ? "" : "s"} criado${rows.length === 1 ? "" : "s"}.` });
    if (!error) setDays([]);
    refresh();
  }

  async function removeMany(ids: string[]) {
    let blocked = 0;
    for (const id of ids) {
      const { error } = await supabase.from("appointment_slots").delete().eq("id", id);
      if (error) { blocked++; await supabase.from("appointment_slots").update({ is_available: false }).eq("id", id); }
    }
    if (blocked) setMsg({ ok: false, text: `${blocked} horário${blocked === 1 ? " já tinha" : "s já tinham"} cliente e foi bloqueado em vez de excluído.` });
    refresh();
  }
  async function toggle(id: string, is_available: boolean) { await supabase.from("appointment_slots").update({ is_available }).eq("id", id); refresh(); }

  const grouped = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of q.data ?? []) { const k = dayKey(new Date(s.starts_at)); m.set(k, [...(m.get(k) ?? []), s]); }
    return [...m.entries()];
  }, [q.data]);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 rounded-lg border border-border bg-card p-5 md:grid-cols-[auto_1fr]">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">1. Toque nos dias de atendimento</p>
          <Calendar mode="multiple" selected={days} onSelect={(d) => setDays(d ?? [])} disabled={{ before: today }} className="pointer-events-auto p-0 pt-2" />
        </div>
        <div className="space-y-4">
          <p className="text-xs font-semibold text-muted-foreground">2. Defina o período</p>
          <div className="flex flex-wrap gap-3">
            <label className="text-xs font-semibold text-muted-foreground">Das<input type="time" className={`${fieldClass} mt-1`} value={from} onChange={(e) => setFrom(e.target.value)} /></label>
            <label className="text-xs font-semibold text-muted-foreground">Até<input type="time" className={`${fieldClass} mt-1`} value={to} onChange={(e) => setTo(e.target.value)} /></label>
            <label className="text-xs font-semibold text-muted-foreground">Um a cada
              <select className={`${fieldClass} mt-1`} value={interval} onChange={(e) => setIntervalMin(e.target.value)}>
                {[30, 60, 90, 120, 180].map((m) => <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60}h`.replace(".5h", "h30")}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-muted-foreground">Duração da reunião
              <select className={`${fieldClass} mt-1`} value={duration} onChange={(e) => setDuration(e.target.value)}>
                {[30, 45, 60, 90, 120].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </label>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Horários que serão criados em cada dia</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {preview.length === 0 ? <span className="text-sm text-muted-foreground">Período inválido.</span> : preview.map((t) => <span key={t} className="rounded-full border border-primary/40 px-3 py-1 text-sm text-primary">{t}</span>)}
            </div>
          </div>
          <Button variant="editorial" size="sm" disabled={busy} onClick={generate}>
            {days.length ? `Criar ${days.length * preview.length} horários em ${days.length} dia${days.length === 1 ? "" : "s"}` : "Selecione os dias"}
          </Button>
          {msg && <p className={`text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p>}
        </div>
      </div>

      <div className="space-y-3">
        {grouped.length === 0 && <p className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">Nenhum horário futuro cadastrado.</p>}
        {grouped.map(([k, slots]) => (
          <div key={k} className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <p className="flex-1 text-sm font-semibold capitalize">{new Date(`${k}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</p>
              <Button size="sm" variant="ghost" onClick={() => { if (confirm("Excluir todos os horários deste dia?")) removeMany(slots.map((s) => s.id)); }}>Excluir dia</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {slots.map((s) => (
                <div key={s.id} className={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${s.is_available ? "border-primary/40 text-primary" : "border-border text-muted-foreground line-through"}`}>
                  <button type="button" title={s.is_available ? "Bloquear" : "Liberar"} onClick={() => toggle(s.id, !s.is_available)}>
                    {new Date(s.starts_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </button>
                  <button type="button" aria-label="Excluir horário" className="ml-1 opacity-60 hover:opacity-100" onClick={() => removeMany([s.id])}>×</button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {grouped.length > 0 && <p className="text-xs text-muted-foreground">Toque no horário para bloquear/liberar; no × para excluir.</p>}
      </div>
    </div>
  );
}
