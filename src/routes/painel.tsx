import { ZoeChat } from "@/components/ZoeChat";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleUserRound,
  FolderKanban,
  Leaf,
  Menu,
  MessageSquare,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react";

import projectImage from "@/assets/arqeco-project.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Meu projeto — ARQECO" },
      { name: "description", content: "Acompanhe seu projeto, converse com especialistas e faça escolhas conscientes com a ARQECO." },
      { property: "og:title", content: "Meu projeto — ARQECO" },
      { property: "og:description", content: "Projetos, profissionais e escolhas conscientes em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArqEcoDashboard,
});

const navigation = [
  { label: "Visão geral", icon: FolderKanban },
  { label: "Meus projetos", icon: BriefcaseBusiness },
  { label: "Zoe", icon: Bot, badge: "IA" },
  { label: "Curadoria", icon: Sparkles },
  { label: "Certificação", icon: Award },
  { label: "Fornecedores", icon: Store },
];

const stages = ["Briefing", "Reunião", "Desenvolvimento", "Apresentação", "Ajustes", "Entrega", "Certificação"];

const materials = [
  { name: "Piso Cumaru Certificado", supplier: "Madeira Viva", score: 92, meta: "FSC · baixo VOC" },
  { name: "Tinta Mineral Névoa", supplier: "Terracor", score: 89, meta: "Base mineral · respirável" },
  { name: "Pendente Atemporal", supplier: "Lumini", score: 86, meta: "LED · 2700K" },
];

function ArqEcoDashboard() {
  const [active, setActive] = useState("Visão geral");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [panel, setPanel] = useState<"zoe" | "task" | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-24 items-center justify-between border-b border-sidebar-border px-7">
          <div>
            <div className="font-display text-2xl font-semibold">ARQECO</div>
            <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-sidebar-foreground/55">Design Eco-Holístico</div>
          </div>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground lg:hidden" onClick={() => setMobileMenu(false)} aria-label="Fechar menu"><X /></Button>
        </div>

        <nav className="space-y-1 px-4 py-7" aria-label="Navegação principal">
          {navigation.map((item) => (
            <button key={item.label} type="button" onClick={() => { setActive(item.label); setMobileMenu(false); if (item.label === "Zoe") setPanel("zoe"); }} className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors ${active === item.label ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/68 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"}`}>
              <item.icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {item.badge && <span className="text-[9px] font-bold uppercase text-sidebar-primary">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="mx-4 mt-auto border-t border-sidebar-border py-6">
          <div className="flex items-center gap-3 px-3">
            <div className="grid size-9 place-items-center rounded-full bg-sidebar-primary font-display text-sm font-semibold text-sidebar-primary-foreground">MS</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">Marina Silveira</div>
              <div className="text-[10px] uppercase text-sidebar-foreground/50">Cliente</div>
            </div>
            <ChevronRight className="size-4 text-sidebar-foreground/50" />
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-border px-5 sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenu(true)} aria-label="Abrir menu"><Menu /></Button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Segunda-feira, 28 de setembro</p>
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">Olá, Marina.</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Buscar"><Search /></Button>
            <Button variant="ghost" size="icon" aria-label="Notificações" className="relative"><Bell /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-clay" /></Button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-forest-soft">Projeto em destaque</p>
              <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Apartamento Aurora</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">Uma casa que acolhe melhor sua rotina, com escolhas conscientes do briefing à certificação.</p>
          </div>

          <section className="grid overflow-hidden rounded-lg bg-card shadow-editorial gentle-rise lg:grid-cols-[1.05fr_1fr]">
            <div className="relative min-h-72 lg:min-h-[390px]">
              <img src={projectImage} alt="Sala do projeto Apartamento Aurora com madeira natural e marcenaria verde" width={1408} height={800} className="absolute inset-0 size-full object-cover" />
              <div className="absolute left-5 top-5 rounded-sm bg-card/90 px-3 py-2 backdrop-blur-sm">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Índice Eco-Holístico™</p>
                <p className="font-display text-2xl font-semibold text-primary">87<span className="text-sm">/100</span></p>
              </div>
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-forest-soft"><span className="size-1.5 rounded-full bg-forest-soft" /> Em desenvolvimento</span>
                  <p className="mt-3 text-sm text-muted-foreground">Viver Bem · Sala e varanda</p>
                </div>
                <div className="text-right"><p className="font-display text-3xl font-semibold">46%</p><p className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">concluído</p></div>
              </div>
              <div className="mt-6 h-1 bg-secondary"><div className="h-full w-[46%] bg-primary" /></div>
              <div className="mt-7 grid grid-cols-3 gap-4 border-y border-border py-5">
                <div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Profissional</p><p className="mt-1 text-sm font-semibold">Ana Costa</p></div>
                <div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Entrega</p><p className="mt-1 text-sm font-semibold">18 nov.</p></div>
                <div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Ambientes</p><p className="mt-1 text-sm font-semibold">02</p></div>
              </div>
              <div className="mt-auto pt-6">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Sua próxima ação</p>
                <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <p className="max-w-xs text-sm font-semibold leading-snug">Revisar a primeira seleção de materiais da Curadoria.</p>
                  <Button variant="editorial" onClick={() => setPanel("task")}>Revisar agora <ArrowRight /></Button>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-2xl font-semibold">Jornada do projeto</h3><span className="text-xs text-muted-foreground">Etapa 3 de 7</span></div>
            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-[760px] items-start">
                {stages.map((stage, index) => (
                  <div key={stage} className="relative flex flex-1 flex-col items-center text-center">
                    {index < stages.length - 1 && <div className={`absolute left-1/2 top-3 h-px w-full ${index < 2 ? "bg-primary" : "bg-border"}`} />}
                    <div className={`relative z-10 grid size-6 place-items-center rounded-full border text-[10px] ${index < 2 ? "border-primary bg-primary text-primary-foreground" : index === 2 ? "border-primary bg-card text-primary" : "border-border bg-background text-muted-foreground"}`}>{index < 2 ? <Check className="size-3" /> : index + 1}</div>
                    <p className={`mt-2 text-[10px] font-semibold uppercase ${index <= 2 ? "text-foreground" : "text-muted-foreground"}`}>{stage}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
            <section>
              <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-forest-soft">Curadoria ARQECO</p><h3 className="font-display text-2xl font-semibold">Escolhas para o seu projeto</h3></div><Button variant="link" className="hidden sm:inline-flex">Ver lista completa <ArrowRight /></Button></div>
              <div className="divide-y divide-border rounded-lg border border-border bg-card">
                {materials.map((material) => (
                  <button key={material.name} type="button" onClick={() => setPanel("task")} className="grid w-full grid-cols-[48px_1fr_auto] items-center gap-4 p-4 text-left transition-colors hover:bg-secondary/55">
                    <div className="grid size-12 place-items-center rounded-sm bg-secondary"><Leaf className="size-5 text-primary" /></div>
                    <div><p className="text-sm font-semibold">{material.name}</p><p className="mt-1 text-xs text-muted-foreground">{material.supplier} · {material.meta}</p></div>
                    <div className="text-right"><p className="font-display text-xl font-semibold text-primary">{material.score}</p><p className="text-[8px] uppercase text-muted-foreground">Índice Eco</p></div>
                  </button>
                ))}
              </div>
            </section>

            <aside className="space-y-5">
              <button type="button" onClick={() => setPanel("zoe")} className="w-full rounded-lg bg-primary p-6 text-left text-primary-foreground transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between"><Bot className="size-6" /><span className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary-foreground/60">Copiloto ARQECO</span></div>
                <h3 className="mt-7 font-display text-2xl font-semibold">Converse com a Zoe</h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">Entenda materiais, compare escolhas e prepare perguntas para sua profissional.</p>
                <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase">Iniciar conversa <ArrowRight className="size-3.5" /></div>
              </button>
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Equipe conectada</p>
                <div className="mt-4 flex items-center gap-3"><div className="grid size-11 place-items-center rounded-full bg-secondary font-display font-semibold">AC</div><div><p className="text-sm font-semibold">Ana Costa</p><p className="text-xs text-muted-foreground">Arquiteta responsável</p></div><Button variant="ghost" size="icon" className="ml-auto" aria-label="Enviar mensagem"><MessageSquare /></Button></div>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center"><div><Users className="mx-auto size-4 text-primary"/><p className="mt-1 text-[9px] text-muted-foreground">Cliente</p></div><div><CircleUserRound className="mx-auto size-4 text-primary"/><p className="mt-1 text-[9px] text-muted-foreground">Profissional</p></div><div><BookOpen className="mx-auto size-4 text-primary"/><p className="mt-1 text-[9px] text-muted-foreground">Creator</p></div></div>
              </div>
            </aside>
          </div>

          <section className="mt-10 border-t border-border pt-8">
            <div className="grid gap-5 md:grid-cols-3">
              {[{ icon: Sparkles, title: "Zoe", text: "Apoio para escolhas conscientes" }, { icon: Award, title: "Certificação", text: "Critérios e evidências do projeto" }, { icon: ShoppingBag, title: "Fornecedores", text: "Marcas e links afiliados selecionados" }].map((item) => (
                <button type="button" key={item.title} onClick={() => item.title === "Zoe" ? setPanel("zoe") : setActive(item.title)} className="flex items-center gap-4 border-l border-border py-2 pl-5 text-left hover:border-primary"><item.icon className="size-5 text-primary"/><div><p className="font-display text-lg font-semibold">{item.title}</p><p className="text-xs text-muted-foreground">{item.text}</p></div><ChevronRight className="ml-auto size-4 text-muted-foreground"/></button>
              ))}
            </div>
          </section>
        </div>
      </main>

      {panel && <div className="fixed inset-0 z-50 flex justify-end bg-foreground/35" role="presentation" onClick={() => setPanel(null)}><section role="dialog" aria-modal="true" aria-label={panel === "zoe" ? "Conversa com Zoe" : "Revisar curadoria"} onClick={(event) => event.stopPropagation()} className="flex h-full w-full max-w-md flex-col bg-card p-6 shadow-editorial gentle-rise"><div className="flex items-center justify-between border-b border-border pb-5"><div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-forest-soft">{panel === "zoe" ? "Copiloto ARQECO" : "Próxima ação"}</p><h2 className="font-display text-2xl font-semibold">{panel === "zoe" ? "Zoe" : "Revisar materiais"}</h2></div><Button variant="ghost" size="icon" onClick={() => setPanel(null)} aria-label="Fechar"><X /></Button></div>{panel === "zoe" ? <ZoeChat userName="Marina" context="Cliente: Marina Silveira. Projeto: Apartamento Aurora (46% concluído, etapa de desenvolvimento). Profissional: Ana Costa. Entrega prevista: 18 nov. Materiais em curadoria com Índice Eco-Holístico." /> : <div className="py-6"><p className="text-sm leading-relaxed text-muted-foreground">A Curadoria selecionou três materiais compatíveis com o briefing e as diretrizes do projeto.</p><div className="mt-6 space-y-3">{materials.map(material => <label key={material.name} className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-4"><input type="checkbox" defaultChecked className="accent-primary"/><span className="flex-1 text-sm font-semibold">{material.name}</span><span className="font-display text-lg text-primary">{material.score}</span></label>)}</div><Button variant="editorial" className="mt-6 w-full" onClick={() => setPanel(null)}>Enviar revisão para Ana <ArrowRight /></Button><p className="mt-3 text-center text-[10px] text-muted-foreground">A compra é concluída diretamente no fornecedor.</p></div>}</section></div>}
    </div>
  );
}