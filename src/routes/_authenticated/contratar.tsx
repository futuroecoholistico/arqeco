import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, CreditCard, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brl } from "@/components/PartnerShell";
import { supabase } from "@/integrations/supabase/client";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createBookingCheckout } from "@/lib/payments.functions";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const searchSchema = z.object({
  plano: z.string().uuid(),
  opcao: z.string().uuid(),
});

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome completo.").max(100),
  email: z.string().trim().email("Informe um e-mail válido.").max(255),
  phone: z.string().trim().regex(/^[0-9()+ -]{10,20}$/, "Informe um telefone válido."),
});

const propertySchema = z.object({
  propertyType: z.string().trim().min(2, "Selecione o tipo de imóvel.").max(60),
  postalCode: z.string().trim().regex(/^\d{5}-?\d{3}$/, "Informe um CEP válido."),
  street: z.string().trim().min(2, "Informe o endereço.").max(160),
  number: z.string().trim().min(1, "Informe o número.").max(20),
  complement: z.string().trim().max(100),
  neighborhood: z.string().trim().min(2, "Informe o bairro.").max(100),
  city: z.string().trim().min(2, "Informe a cidade.").max(100),
  state: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Use a sigla do estado."),
});

type Step = 1 | 2 | 3 | 4 | 5;

export const Route = createFileRoute("/_authenticated/contratar")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Agendar projeto — ARQECO" },
      { name: "description", content: "Agende seu projeto de interiores ARQECO e revise os dados da contratação." },
      { property: "og:title", content: "Agendar projeto — ARQECO" },
      { property: "og:description", content: "Escolha um horário e prepare a contratação do seu projeto ARQECO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookingPage,
});

const stepLabels = ["Agenda", "Seus dados", "Imóvel", "Revisão", "Pagamento"];

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function BookingPage() {
  const { plano, opcao } = Route.useSearch();
  const [step, setStep] = useState<Step>(1);
  const [selectedDay, setSelectedDay] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<string>();
  const [contact, setContact] = useState({ fullName: "", email: "", phone: "" });
  const [property, setProperty] = useState({ propertyType: "", postalCode: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" });
  const [extraRoomCount, setExtraRoomCount] = useState(0);
  const [urgent, setUrgent] = useState(false);
  const [roomCount, setRoomCount] = useState(1);
  const [bookingId, setBookingId] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const selection = useQuery({
    queryKey: ["booking-selection", plano, opcao],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("service_plan_options")
        .select("id,rooms_label,price_cents,price_per_room,extra_room_price_cents,urgent_fee_cents,service_plans!inner(id,name,tagline)")
        .eq("id", opcao)
        .eq("plan_id", plano)
        .single();
      if (queryError) throw queryError;
      return data;
    },
  });

  const pros = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => (await supabase.rpc("list_professionals")).data ?? [],
  });
  const [selectedPro, setSelectedPro] = useState<string>("");

  const allSlots = useQuery({
    queryKey: ["appointment-slots"],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("appointment_slots")
        .select("id,starts_at,ends_at,professional_id")
        .eq("is_available", true)
        .gt("starts_at", new Date().toISOString())
        .order("starts_at");
      if (queryError) throw queryError;
      return data ?? [];
    },
  });
  const slotsByPro = useMemo(() => (allSlots.data ?? []).filter((s) => (s.professional_id ?? "") === selectedPro), [allSlots.data, selectedPro]);
  const slots = { data: slotsByPro };
  const hasTeamSlots = (allSlots.data ?? []).some((s) => !s.professional_id);
  const proOptions = (pros.data ?? []).filter((p) => (allSlots.data ?? []).some((s) => s.professional_id === p.user_id));

  const availableDays = useMemo(() => new Set((slots.data ?? []).map((slot) => new Date(slot.starts_at).toDateString())), [slots.data]);
  const daySlots = useMemo(() => selectedDay ? (slots.data ?? []).filter((slot) => new Date(slot.starts_at).toDateString() === selectedDay.toDateString()) : [], [selectedDay, slots.data]);
  const chosenSlot = slots.data?.find((slot) => slot.id === selectedSlot);
  const perRoom = selection.data?.price_per_room === true;
  const unitPrice = selection.data?.price_cents ?? null;
  const basePrice = unitPrice == null ? null : perRoom ? unitPrice * roomCount : unitPrice;
  const extraRoomPrice = selection.data?.extra_room_price_cents ?? null;
  const selectedExtraPrice = extraRoomPrice == null ? null : extraRoomPrice * extraRoomCount;
  const urgentFee = selection.data?.urgent_fee_cents ?? null;
  const total = basePrice == null || selectedExtraPrice == null ? null : basePrice + selectedExtraPrice + (urgent ? urgentFee ?? 0 : 0);

  async function saveDraft() {
    if (bookingId) return bookingId;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sessão indisponível.");
    const { data, error: insertError } = await supabase.from("service_bookings").insert({
      client_id: auth.user.id,
      plan_id: plano,
      plan_option_id: opcao,
    }).select("id").single();
    if (insertError) throw insertError;
    setBookingId(data.id);
    return data.id;
  }

  async function goFromSchedule() {
    if (!selectedSlot) { setError("Escolha um horário disponível."); return; }
    setBusy(true); setError(undefined);
    try { await saveDraft(); setStep(2); } catch { setError("Não foi possível iniciar sua contratação. Tente novamente."); }
    setBusy(false);
  }

  function goFromContact() {
    const parsed = contactSchema.safeParse(contact);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revise seus dados."); return; }
    setContact(parsed.data); setError(undefined); setStep(3);
  }

  function goFromProperty() {
    const parsed = propertySchema.safeParse(property);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revise o endereço."); return; }
    setProperty({ ...parsed.data, complement: parsed.data.complement ?? "" }); setError(undefined); setStep(4);
  }

  async function preparePayment() {
    if (!bookingId || !selectedSlot || total == null) return;
    setBusy(true); setError(undefined);
    if (perRoom) await supabase.from("service_bookings").update({ room_count: roomCount }).eq("id", bookingId);
    const { error: reserveError } = await supabase.rpc("reserve_service_booking", {
      _booking_id: bookingId,
      _slot_id: selectedSlot,
      _full_name: contact.fullName,
      _email: contact.email,
      _phone: contact.phone,
      _property_type: property.propertyType,
      _postal_code: property.postalCode,
      _street: property.street,
      _street_number: property.number,
      _address_complement: property.complement,
      _neighborhood: property.neighborhood,
      _city: property.city,
      _state: property.state,
      _extra_room_count: extraRoomCount,
      _urgent_delivery: urgent,
    });
    if (reserveError) {
      setError(reserveError.message.includes("slot") ? "Este horário acabou de ser reservado. Escolha outro." : "Não foi possível preparar o pagamento.");
      setBusy(false);
      return;
    }
    setStep(5); setBusy(false);
  }

  const back = () => { setError(undefined); setStep((Math.max(1, step - 1)) as Step); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PaymentTestModeBanner />
      <header className="border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
          <Link to="/" className="font-display text-2xl font-semibold">ARQECO</Link>
          <p className="hidden text-xs uppercase tracking-[0.16em] opacity-65 sm:block">Contratação segura</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <section>
            <div className="mb-10 overflow-x-auto pb-2">
              <ol className="flex min-w-[590px]">
                {stepLabels.map((label, index) => {
                  const number = index + 1;
                  return <li key={label} className="relative flex flex-1 items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em]"><span className={`relative z-10 grid size-7 place-items-center rounded-full border ${number <= step ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>{number < step ? <Check className="size-3.5" /> : number}</span><span className={number <= step ? "text-foreground" : "text-muted-foreground"}>{label}</span>{number < 5 && <span className="absolute left-7 right-0 top-3.5 h-px bg-border" />}</li>;
                })}
              </ol>
            </div>

            {step === 1 && <div><StepTitle icon={CalendarDays} eyebrow="Etapa 1 de 5" title="Quando podemos conversar?" text="Escolha o arquiteto ou designer, depois um dia e um dos horários disponíveis dele." /><div className="mt-8"><p className="mb-3 text-sm font-semibold">Profissional</p><div className="flex flex-wrap gap-3">{hasTeamSlots && <Button type="button" variant={selectedPro === "" ? "editorial" : "paper"} aria-pressed={selectedPro === ""} onClick={() => { setSelectedPro(""); setSelectedDay(undefined); setSelectedSlot(undefined); }}>Equipe ARQECO</Button>}{proOptions.map((p) => <Button key={p.user_id} type="button" variant={selectedPro === p.user_id ? "editorial" : "paper"} aria-pressed={selectedPro === p.user_id} onClick={() => { setSelectedPro(p.user_id); setSelectedDay(undefined); setSelectedSlot(undefined); }}>{p.display_name}{p.city ? ` · ${p.city}` : ""}</Button>)}</div>{!hasTeamSlots && proOptions.length === 0 && <p className="text-sm text-muted-foreground">Nenhum horário disponível no momento.</p>}</div><div className="mt-8 grid gap-6 md:grid-cols-[auto_1fr]"><div className="border border-border bg-card p-2"><Calendar mode="single" selected={selectedDay} onSelect={(day) => { setSelectedDay(day); setSelectedSlot(undefined); }} disabled={(day) => !availableDays.has(day.toDateString())} className="pointer-events-auto" /></div><div><p className="text-sm font-semibold">{selectedDay ? formatDay(selectedDay) : "Selecione uma data"}</p><div className="mt-4 grid grid-cols-2 gap-3">{daySlots.map((slot) => <Button key={slot.id} type="button" variant={selectedSlot === slot.id ? "editorial" : "paper"} onClick={() => setSelectedSlot(slot.id)} aria-pressed={selectedSlot === slot.id}><Clock /> {formatTime(slot.starts_at)}</Button>)}</div>{selectedDay && daySlots.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Não há horários disponíveis neste dia.</p>}</div></div><StepActions next={goFromSchedule} busy={busy} /></div>}

            {step === 2 && <div><StepTitle icon={UserRound} eyebrow="Etapa 2 de 5" title="Conte como podemos falar com você." text="Usaremos estes dados somente para a contratação e o acompanhamento do projeto." /><div className="mt-8 grid gap-5 sm:grid-cols-2"><Field label="Nome completo" className="sm:col-span-2"><Input value={contact.fullName} onChange={(e) => setContact({ ...contact, fullName: e.target.value })} maxLength={100} autoComplete="name" /></Field><Field label="E-mail"><Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} maxLength={255} autoComplete="email" /></Field><Field label="Telefone"><Input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} maxLength={20} autoComplete="tel" /></Field></div><StepActions back={back} next={goFromContact} /></div>}

            {step === 3 && <div><StepTitle icon={MapPin} eyebrow="Etapa 3 de 5" title="Onde está o imóvel?" text="Essas informações ajudam a preparar a primeira conversa sobre o espaço." /><div className="mt-8 grid gap-5 sm:grid-cols-2"><Field label="Tipo de imóvel" className="sm:col-span-2"><Select value={property.propertyType} onValueChange={(value) => setProperty({ ...property, propertyType: value })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="Apartamento">Apartamento</SelectItem><SelectItem value="Casa">Casa</SelectItem><SelectItem value="Comercial">Espaço comercial</SelectItem><SelectItem value="Outro">Outro</SelectItem></SelectContent></Select></Field><Field label="CEP"><Input inputMode="numeric" value={property.postalCode} onChange={(e) => setProperty({ ...property, postalCode: e.target.value })} maxLength={9} autoComplete="postal-code" /></Field><Field label="Rua / avenida"><Input value={property.street} onChange={(e) => setProperty({ ...property, street: e.target.value })} maxLength={160} autoComplete="street-address" /></Field><Field label="Número"><Input value={property.number} onChange={(e) => setProperty({ ...property, number: e.target.value })} maxLength={20} /></Field><Field label="Complemento"><Input value={property.complement} onChange={(e) => setProperty({ ...property, complement: e.target.value })} maxLength={100} /></Field><Field label="Bairro"><Input value={property.neighborhood} onChange={(e) => setProperty({ ...property, neighborhood: e.target.value })} maxLength={100} /></Field><Field label="Cidade"><Input value={property.city} onChange={(e) => setProperty({ ...property, city: e.target.value })} maxLength={100} /></Field><Field label="Estado (UF)"><Input value={property.state} onChange={(e) => setProperty({ ...property, state: e.target.value.toUpperCase() })} maxLength={2} autoComplete="address-level1" /></Field></div><StepActions back={back} next={goFromProperty} /></div>}

            {step === 4 && <div><StepTitle icon={ShieldCheck} eyebrow="Etapa 4 de 5" title="Revise antes de continuar." text="Confira a contratação e escolha os adicionais que fazem sentido para você." /><div className="mt-8 divide-y divide-border border-y border-border"><ReviewRow label="Profissional" value={selectedPro ? (proOptions.find((p) => p.user_id === selectedPro)?.display_name ?? "—") : "Equipe ARQECO"} /><ReviewRow label="Atendimento" value={chosenSlot ? `${formatDay(new Date(chosenSlot.starts_at))}, ${formatTime(chosenSlot.starts_at)}` : "—"} /><ReviewRow label="Contato" value={`${contact.fullName} · ${contact.email} · ${contact.phone}`} /><ReviewRow label="Imóvel" value={`${property.propertyType} · ${property.street}, ${property.number}${property.complement ? `, ${property.complement}` : ""} · ${property.city}/${property.state}`} /></div><div className="mt-8 space-y-3">{perRoom && <div className="flex items-center gap-4 border border-border bg-card p-5"><span className="flex-1 text-sm font-semibold">Quantidade de ambientes</span><Button type="button" size="sm" variant="paper" onClick={() => setRoomCount((n) => Math.max(1, n - 1))} aria-label="Menos um ambiente">−</Button><span className="w-6 text-center font-semibold">{roomCount}</span><Button type="button" size="sm" variant="paper" onClick={() => setRoomCount((n) => Math.min(30, n + 1))} aria-label="Mais um ambiente">+</Button></div>}{!perRoom && <div className="flex items-center gap-4 border border-border bg-card p-5"><span className="min-w-0 flex-1 text-sm font-semibold">Ambientes extras <span className="block text-xs font-normal text-muted-foreground">{extraRoomPrice == null ? "Valor ainda não configurado" : `${brl(extraRoomPrice)} cada`}</span></span><Button type="button" size="sm" variant="paper" onClick={() => setExtraRoomCount((n) => Math.max(0, n - 1))} aria-label="Remover um ambiente extra" disabled={extraRoomCount === 0}>−</Button><span className="w-6 text-center font-semibold">{extraRoomCount}</span><Button type="button" size="sm" variant="paper" onClick={() => setExtraRoomCount((n) => Math.min(30, n + 1))} aria-label="Adicionar um ambiente extra" disabled={extraRoomPrice == null}>+</Button></div>}<ExtraOption checked={urgent} onCheckedChange={setUrgent} title="Prioridade na entrega" price={urgentFee == null ? "Valor ainda não configurado" : `+ ${brl(urgentFee)}`} disabled={urgentFee == null} /></div>{total == null && <p className="mt-5 border-l-2 border-primary pl-4 text-sm text-muted-foreground">O pagamento será liberado assim que o preço deste plano e dos adicionais estiver configurado.</p>}<StepActions back={back} next={preparePayment} busy={busy} disabled={total == null} nextLabel="Ir para pagamento seguro" /></div>}

            {step === 5 && bookingId && <div><StepTitle icon={CreditCard} eyebrow="Etapa 5 de 5" title="Pagamento seguro" text="Seu horário fica reservado enquanto você conclui o pagamento com cartão ou Pix. CPF e dados do cartão são informados diretamente no ambiente seguro do pagamento." /><div className="mt-8 border border-border bg-card"><BookingCheckout bookingId={bookingId} /></div><div className="mt-6"><Button type="button" variant="paper" onClick={back}><ArrowLeft /> Voltar à revisão</Button></div></div>}

            {error && <p role="alert" className="mt-6 border-l-2 border-destructive pl-4 text-sm text-destructive">{error}</p>}
          </section>

          <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Seu projeto</p>
            <h2 className="mt-3 font-display text-2xl font-semibold">{selection.data?.service_plans.name ?? "Carregando…"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{selection.data?.rooms_label}</p>
            <div className="mt-6 space-y-3 border-y border-border py-5 text-sm"><div className="flex justify-between gap-3"><span>Projeto{perRoom ? ` (${roomCount} amb.)` : ""}</span><span>{basePrice == null ? "A definir" : brl(basePrice)}</span></div>{extraRoomCount > 0 && <div className="flex justify-between gap-3"><span>{extraRoomCount} {extraRoomCount === 1 ? "ambiente extra" : "ambientes extras"} × {extraRoomPrice == null ? "—" : brl(extraRoomPrice)}</span><span>{selectedExtraPrice == null ? "A definir" : brl(selectedExtraPrice)}</span></div>}{urgent && urgentFee != null && <div className="flex justify-between gap-3"><span>Prioridade</span><span>{brl(urgentFee)}</span></div>}<div className="flex justify-between gap-3 text-primary"><span>Dossiê Eco-Holístico</span><span>Bônus gratuito</span></div></div>
            <div className="mt-5 flex items-end justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-[0.12em]">Total</span><span className="font-display text-2xl font-semibold">{total == null ? "A definir" : brl(total)}</span></div>
            <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">O agendamento é confirmado somente após a aprovação do pagamento.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StepTitle({ icon: Icon, eyebrow, title, text }: { icon: typeof CalendarDays; eyebrow: string; title: string; text: string }) {
  return <div><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary"><Icon className="size-4" />{eyebrow}</p><h1 className="mt-4 font-display text-4xl font-semibold md:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{text}</p></div>;
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><Label className="mb-2 block">{label}</Label>{children}</div>;
}

function StepActions({ back, next, busy, disabled, nextLabel = "Continuar" }: { back?: () => void; next: () => void; busy?: boolean; disabled?: boolean; nextLabel?: string }) {
  return <div className="mt-9 flex flex-wrap justify-between gap-3">{back ? <Button type="button" variant="paper" onClick={back}><ArrowLeft /> Voltar</Button> : <span />}<Button type="button" variant="editorial" onClick={next} disabled={busy || disabled}>{busy ? "Aguarde…" : nextLabel} <ArrowRight /></Button></div>;
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 py-4 sm:grid-cols-[130px_1fr]"><span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</span><span className="text-sm">{value}</span></div>;
}

function ExtraOption({ checked, onCheckedChange, title, price, disabled }: { checked: boolean; onCheckedChange: (value: boolean) => void; title: string; price: string; disabled?: boolean }) {
  return <label className={`flex items-center gap-4 border border-border bg-card p-5 ${disabled ? "opacity-60" : "cursor-pointer"}`}><Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} disabled={disabled} /><span className="flex-1 text-sm font-semibold">{title}</span><span className="text-sm text-muted-foreground">{price}</span></label>;
}
function BookingCheckout({ bookingId }: { bookingId: string }) {
  const [options] = useState(() => ({
    fetchClientSecret: async () => {
      const result = await createBookingCheckout({ data: { bookingId, environment: getStripeEnvironment(), returnUrl: `${window.location.origin}/pagamento?session_id={CHECKOUT_SESSION_ID}` } });
      if ("error" in result) throw new Error(result.error);
      return result.clientSecret;
    },
  }));
  return <EmbeddedCheckoutProvider stripe={getStripe()} options={options}><EmbeddedCheckout /></EmbeddedCheckoutProvider>;
}
