import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Bot, Briefcase, GraduationCap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Eyebrow, FaqSection, PageHero } from "@/components/site/sections";
import { PAID_PLAN_COMMISSION_RATE, PAYOUT_DAY } from "@/lib/referrals";

export const Route = createFileRoute("/profissionais")({
  head: () => ({ meta: [
    { title: "Para arquitetos e designers | ARQECO" },
    { name: "description", content: "Formação Arquiteto com Propósito, tecnologia com IA, curadoria, oportunidades de projeto e programa de indicação." },
    { property: "og:title", content: "Para arquitetos e designers — ARQECO" },
    { property: "og:description", content: "Projete com propósito. Cresça em rede." },
  ] }),
  component: Profissionais,
});

const COURSE_WHATSAPP = `https://wa.me/5511964710505?text=${encodeURIComponent("Olá! Quero saber da próxima turma da Formação Arquiteto com Propósito.")}`;

const support = [
  { icon: Bot, t: "Tecnologia com IA", d: "Apoio para interpretar briefings, organizar diretrizes, pesquisar e comparar materiais, sugerir alternativas e analisar critérios de sustentabilidade. Não substitui um profissional habilitado." },
  { icon: Layers, t: "Curadoria de materiais", d: "Produtos selecionados de diferentes fornecedores, com listas de materiais organizadas por projeto." },
  { icon: Briefcase, t: "Oportunidades de projeto", d: "Clientes e projetos da plataforma atribuídos a profissionais da rede." },
  { icon: BadgeCheck, t: "Certificação ArqEco", d: "Registro emitido para projetos elegíveis, conforme a metodologia da plataforma." },
];

const faq: [string, string][] = [
  ["Preciso ser formado(a) para entrar na rede?", "Sim. A rede é para arquitetos(as) e designers de interiores; a participação passa por aprovação da equipe ArqEco."],
  ["Como recebo projetos?", "Depois de aprovado(a), você passa a receber projetos atribuídos pela plataforma e acessa o painel profissional."],
  ["A tecnologia com IA substitui o profissional?", "Não. Ela apoia o trabalho, mas a responsabilidade técnica é sempre de um profissional habilitado."],
  ["Preciso ser da rede para indicar?", "Não. O programa de indicação é aberto a qualquer pessoa cadastrada."],
];

function Profissionais() {
  return (
    <SiteLayout>
      <PageHero eyebrow="Para arquitetos e designers" title={<>Projete com propósito. <span className="italic text-accent">Cresça em rede.</span></>} text="Uma parceria profissional para quem acredita em arquitetura que cuida das pessoas e do planeta.">
        {[["Formação", "#educacao"], ["Apoio técnico", "#apoio"], ["Indicação", "#indicacao"]].map(([l, h]) => <Button key={h} asChild variant="paper" className="border-primary-foreground/60 text-primary-foreground hover:border-accent hover:text-accent"><a href={h}>{l}</a></Button>)}
      </PageHero>

      <section id="educacao" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20">
        <Eyebrow>Educação</Eyebrow>
        <article className="mt-6 grid gap-8 border border-primary bg-card p-7 md:grid-cols-[1fr_auto] md:items-end md:p-10">
          <div>
            <GraduationCap className="size-8 text-primary" aria-hidden="true" />
            <h2 className="mt-6 font-display text-4xl font-semibold">Formação Arquiteto com Propósito</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">Conduzida por Karina Koch, com a metodologia Design Eco-Holístico: sustentabilidade, biofilia e bem-estar aplicados à prática de projeto.</p>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-muted-foreground">Próxima turma</dt><dd className="font-semibold">Vagas limitadas · consulte a data</dd></div>
              <div><dt className="text-xs text-muted-foreground">Investimento</dt><dd className="font-semibold">Consulte condições</dd></div>
            </dl>
          </div>
          <Button asChild variant="editorial" size="lg"><a href={COURSE_WHATSAPP} target="_blank" rel="noopener noreferrer">Quero saber da próxima turma</a></Button>
        </article>
      </section>

      <section id="apoio" className="scroll-mt-24 border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Eyebrow>Apoio técnico</Eyebrow>
          <h2 className="mt-4 font-display text-4xl font-semibold">Faça parte da rede ArqEco.</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {support.map(({ icon: Icon, t, d }) => <div key={t} className="border-t border-border pt-5"><Icon className="size-6 text-primary" aria-hidden="true" /><h3 className="mt-4 font-display text-xl font-semibold">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>)}
          </div>
          <Button asChild variant="editorial" size="lg" className="mt-10"><Link to="/auth" search={{ perfil: "profissional" }}>Quero fazer parte da rede <ArrowRight /></Link></Button>
        </div>
      </section>

      <section id="indicacao" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20">
        <Eyebrow>Programa de indicação</Eyebrow>
        <h2 className="mt-4 font-display text-4xl font-semibold">Indique e ganhe {PAID_PLAN_COMMISSION_RATE}% do valor do plano.</h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">Aberto a qualquer pessoa. A comissão é de {PAID_PLAN_COMMISSION_RATE}% do valor do plano contratado, paga no dia {PAYOUT_DAY} do mês seguinte à contratação.</p>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[["Cadastre-se", "Crie sua conta e ative seu link de indicação."], ["Compartilhe seu link", "Envie para amigos, clientes ou sua audiência."], ["O cliente contrata", "A indicação vale quando o plano é pago."], ["Você recebe", `${PAID_PLAN_COMMISSION_RATE}% do plano, no dia ${PAYOUT_DAY} do mês seguinte.`]].map(([t, d], i) => <li key={t} className="border-t border-border pt-6"><span className="font-display text-3xl text-primary">0{i + 1}</span><h3 className="mt-3 font-semibold">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></li>)}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="editorial" size="lg"><Link to="/auth" search={{ perfil: "afiliado" }}>Quero indicar e ganhar</Link></Button>
          <Button asChild variant="paper" size="lg"><Link to="/afiliado">Já sou afiliado: meu painel</Link></Button>
        </div>
      </section>

      <FaqSection title="Perguntas de profissionais" items={faq} />
    </SiteLayout>
  );
}
