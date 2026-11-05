import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canScheduleBooking } from "@/lib/booking-flow";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PaidBookingSchedule({ bookingId }: { bookingId: string }) {
  const qc = useQueryClient();
  const [professional, setProfessional] = useState("team");
  const [day, setDay] = useState<Date>();
  const [slotId, setSlotId] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const booking = useQuery({
    queryKey: ["meeting-booking", bookingId],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_bookings").select("id,status,payment_status,professional_id,appointment_slot_id,appointment_slots(starts_at)").eq("id", bookingId).single();
      if (error) throw error;
      return data;
    },
  });
  const paid = booking.data ? canScheduleBooking(booking.data) : false;
  const unscheduled = paid && !booking.data?.appointment_slot_id;
  const slots = useQuery({
    queryKey: ["meeting-slots", bookingId], enabled: unscheduled,
    queryFn: async () => {
      const { data, error } = await supabase.from("appointment_slots").select("id,starts_at,professional_id").eq("is_available", true).gt("starts_at", new Date().toISOString()).order("starts_at");
      if (error) throw error;
      return data ?? [];
    },
  });
  const pros = useQuery({ queryKey: ["meeting-professionals"], enabled: unscheduled, queryFn: async () => (await supabase.rpc("list_professionals")).data ?? [] });
  const assigned = booking.data?.professional_id;
  const eligible = (slots.data ?? []).filter(s => !assigned || s.professional_id === assigned);
  const visible = eligible.filter(s => (s.professional_id ?? "team") === (assigned ?? professional));
  const days = useMemo(() => new Set(visible.map(s => new Date(s.starts_at).toDateString())), [visible]);
  const times = visible.filter(s => day && new Date(s.starts_at).toDateString() === day.toDateString());
  async function reserve() {
    if (!slotId || !paid) return;
    setBusy(true); setError("");
    try {
      const { error } = await supabase.rpc("schedule_paid_booking", { _booking_id: bookingId, _slot_id: slotId });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["meeting-booking", bookingId] });
      await qc.invalidateQueries({ queryKey: ["my-meeting-bookings"] });
      await qc.invalidateQueries({ queryKey: ["meeting-slots", bookingId] });
    } catch {
      setError("Não foi possível reservar este horário. Atualize a agenda e escolha outro.");
      await slots.refetch(); setSlotId(undefined);
    } finally { setBusy(false); }
  }
  if (booking.isLoading) return <p className="text-sm text-muted-foreground">Carregando reunião…</p>;
  if (booking.isError) return <p role="alert" className="text-sm text-destructive">Não foi possível carregar a reunião.</p>;
  if (!paid) return null;
  if (booking.data?.appointment_slot_id) return <p className="flex items-center gap-2 text-sm text-primary"><CheckCircle2 className="size-4 shrink-0" /> Reunião agendada{booking.data.appointment_slots?.starts_at ? ` · ${new Date(booking.data.appointment_slots.starts_at).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}` : ""}</p>;
  return <section className="border-t border-border pt-6">
    <h2 className="flex items-center gap-2 font-display text-2xl"><CalendarDays className="size-5" /> Agendar reunião</h2>
    {!assigned && <div className="mt-5 max-w-sm"><Select value={professional} onValueChange={v => { setProfessional(v); setDay(undefined); setSlotId(undefined); }}><SelectTrigger aria-label="Profissional para reunião"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="team">Equipe ARQECO</SelectItem>{(pros.data ?? []).filter(p => eligible.some(s => s.professional_id === p.user_id)).map(p => <SelectItem key={p.user_id} value={p.user_id}>{p.display_name}</SelectItem>)}</SelectContent></Select></div>}
    {slots.isLoading ? <p className="mt-5 text-sm text-muted-foreground">Carregando horários…</p> : slots.isError ? <p role="alert" className="mt-5 text-sm text-destructive">Não foi possível carregar a agenda.</p> : visible.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">Nenhum horário disponível para este atendimento no momento. Seu projeto está contratado.</p> : <div className="mt-5 grid gap-5 md:grid-cols-[auto_1fr]"><Calendar mode="single" selected={day} onSelect={d => { setDay(d); setSlotId(undefined); }} disabled={d => !days.has(d.toDateString())} className="max-w-full" /><div><p className="text-sm font-semibold">{day ? day.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }) : "Selecione uma data"}</p><div className="mt-4 flex flex-wrap gap-2">{times.map(s => <Button key={s.id} variant={slotId === s.id ? "editorial" : "paper"} aria-pressed={slotId === s.id} onClick={() => setSlotId(s.id)}><Clock className="size-4" />{new Date(s.starts_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</Button>)}</div><Button variant="editorial" className="mt-6" disabled={!slotId || busy} onClick={reserve}>{busy ? "Agendando…" : "Confirmar reunião"}</Button></div></div>}
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
  </section>;
}