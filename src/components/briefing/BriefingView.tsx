import type { ReactNode } from "react";
import { FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HOUSEHOLD_FLAGS, type BriefingAnswers } from "@/lib/briefing/config";
import type { ProjectDNA, VisualOption } from "@/lib/briefing/profile";

export type BriefingFile = { id: string; file_name: string; category: string; url?: string | null; mime_type: string | null };

const NI = "Não informado";
const list = (v?: string[] | null) => (v && v.length ? v.join(", ") : NI);
const txt = (v?: string | null) => (v && v.trim() ? v : NI);

export function DNACard({ dna, profile }: { dna: ProjectDNA; profile: string | null }) {
  const rows: [string, string][] = [
    ["Ambientes", dna.rooms.join(" + ") || NI],
    ["Sensação", dna.feel.join(" + ").toLowerCase() || NI],
    ["Estilos", dna.styles.join(" + ") || NI],
    ["Cores", dna.colors.join(" + ") || NI],
    ["Materiais", dna.materials.join(" + ") || NI],
    ["Prioridades", dna.priorities.join(" + ") || NI],
    ["Investimento", dna.budget ?? NI],
  ];
  return (
    <section className="bg-sidebar p-6 text-sidebar-foreground md:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-60">DNA do Projeto</p>
      {profile && <><h2 className="mt-3 font-display text-3xl font-semibold italic md:text-4xl">{profile}</h2><p className="mt-1 text-xs opacity-60">Perfil estético identificado a partir das escolhas.</p></>}
      <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {rows.map(([k, v]) => <div key={k} className="border-t border-sidebar-border pt-3"><dt className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-55">{k}</dt><dd className="mt-1 text-sm">{v}</dd></div>)}
      </dl>
    </section>
  );
}

function Block({ title, step, onEdit, children }: { title: string; step?: number; onEdit?: (step: number) => void; children: ReactNode }) {
  return (
    <section className="border border-border bg-card p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        {onEdit && step != null && <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(step)}><Pencil /> Editar</Button>}
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">{children}</dl>
    </section>
  );
}
function Row({ label, value, wide }: { label: string; value: ReactNode; wide?: boolean }) {
  return <div className={wide ? "sm:col-span-2" : ""}><dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</dt><dd className="mt-1 whitespace-pre-line">{value}</dd></div>;
}

export function BriefingAnswersView({ a, options, files, onEdit }: { a: BriefingAnswers; options: VisualOption[]; files: BriefingFile[]; onEdit?: (step: number) => void }) {
  const names = (ids?: string[]) => list((ids ?? []).map((id) => options.find((o) => o.id === id)?.name ?? "").filter(Boolean));
  return (
    <div className="space-y-4">
      <Block title="Sobre você" step={1} onEdit={onEdit}>
        <Row label="Nome" value={txt(a.fullName)} />
        <Row label="Contato" value={[a.email, a.phone].filter(Boolean).join(" · ") || NI} />
        <Row label="Projeto para" value={a.projectFor === "Outro" ? txt(a.projectForOther) : txt(a.projectFor)} />
        <Row label="Casa" value={HOUSEHOLD_FLAGS.filter((f) => a.household?.[f.key] !== undefined).map((f) => `${f.label.replace("?", "")}: ${a.household?.[f.key] ? "sim" : "não"}`).join(" · ") || NI} />
        <Row wide label="Pessoas que usam o espaço" value={(a.people ?? []).length ? (a.people ?? []).map((p) => `${p.name || "Sem nome"}${p.age ? `, ${p.age} anos` : ""}${p.relation ? ` (${p.relation})` : ""}${p.occupation ? ` — ${p.occupation}` : ""}${p.usage ? `. Uso: ${p.usage}` : ""}${p.notes ? `. ${p.notes}` : ""}`).join("\n") : NI} />
        <Row wide label="Acessibilidade / conforto" value={txt(a.accessibility)} />
      </Block>
      <Block title="O imóvel" step={2} onEdit={onEdit}>
        <Row label="Tipo e situação" value={[a.propertyType, a.propertySituation].filter(Boolean).join(" · ") || NI} />
        <Row label="Local" value={[a.address, a.city].filter(Boolean).join(", ") || NI} />
        <Row label="Área do imóvel" value={a.propertyArea ? `${a.propertyArea} m²` : NI} />
        <Row label="Área a projetar" value={a.roomArea ? `${a.roomArea} m²` : NI} />
        <Row label="Início da execução" value={txt(a.startWhen)} />
        <Row wide label="Arquivos" value={files.length ? <ul className="space-y-1">{files.map((f) => <li key={f.id} className="flex items-center gap-2"><FileText className="size-4 text-primary" />{f.url ? <a href={f.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">{f.file_name}</a> : f.file_name}<span className="text-xs text-muted-foreground">· {f.category}</span></li>)}</ul> : NI} />
      </Block>
      <Block title="Ambientes e rotina" step={4} onEdit={onEdit}>
        <Row wide label="Ambientes" value={list((a.rooms ?? []).map((r) => r.name))} />
        <Row wide label="Usos" value={list(a.uses)} />
        <Row wide label="Maiores desafios" value={txt(a.challenges)} />
        <Row wide label="Problema principal" value={txt(a.mainProblem)} />
        <Row wide label="O que quer conseguir fazer" value={txt(a.wishToDo)} />
        <Row label="Quer sentir" value={list(a.feelYes)} />
        <Row label="Não quer sentir" value={list(a.feelNo)} />
        <Row wide label="Um lugar onde eu possa…" value={txt(a.spaceIs)} />
      </Block>
      <Block title="Estilo, cores e materiais" step={5} onEdit={onEdit}>
        <Row label="Estilos" value={names(a.styles)} />
        <Row label="Não gostaria" value={names(a.stylesNo)} />
        <Row label="Misturar estilos" value={a.mixStyles === undefined ? NI : a.mixStyles ? `Sim — ${names(a.stylesMix)}` : "Não"} />
        <Row label="Paletas" value={names(a.palettes)} />
        <Row label="Cores que ama" value={txt(a.colorsLove)} />
        <Row label="Cores a evitar" value={txt(a.colorsAvoid)} />
        <Row label="Materiais" value={names(a.materials)} />
        <Row label="Combinações" value={names(a.moodboards)} />
      </Block>
      <Block title="Necessidades por ambiente" step={6} onEdit={onEdit}>
        {(a.rooms ?? []).length === 0 && <Row wide label="Ambientes" value={NI} />}
        {(a.rooms ?? []).map((r) => { const n = a.roomNeeds?.[r.id]; return <Row wide key={r.id} label={r.name} value={n ? [`Itens: ${list(n.items)}`, n.usage && `Uso: ${n.usage}`, n.problem && `Problema: ${n.problem}`, n.change && `Mudar: ${n.change}`, n.mustHave && `Não pode faltar: ${n.mustHave}`].filter(Boolean).join("\n") : NI} />; })}
        <Row wide label="Móveis e objetos existentes" value={(a.existing ?? []).length ? (a.existing ?? []).map((e) => `${e.name} — ${e.action}${e.notes ? ` (${e.notes})` : ""}`).join("\n") : NI} />
        <Row label="Investimento" value={txt(a.budget)} />
        <Row label="Prioridades" value={list(a.priorities)} />
        <Row wide label="Referências" value={txt(a.referenceLinks)} />
        <Row wide label="Transformação desejada" value={txt(a.transformation)} />
        <Row wide label="“Agora sim, tem a minha cara”" value={txt(a.myFace)} />
      </Block>
    </div>
  );
}
