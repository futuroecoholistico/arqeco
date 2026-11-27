import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  HandCoins,
  Layers,
  Link2,
  MessageCircle,
  Users,
} from "lucide-react";
import karinaKoch from "@/assets/karina-koch.jpg.asset.json";
import { Button } from "@/components/ui/button";
import { Eyebrow, SiteLayout } from "@/components/site/SiteChrome";
import { FaqList, Testimonials } from "@/components/site/sections";
import { PAID_PLAN_COMMISSION_RATE, PAYOUT_DAY } from "@/lib/referrals";
import { faqPro, whatsappUrl } from "@/lib/site-content";

export const Route = createFileRoute("/profissionais")({
  head: () => ({
    meta: [
      { title: "Para arquitetos e designers — Formação, apoio e indicação | ARQECO" },
      {
        name: "description",
        content:
          "Formação Arquiteto com Propósito, apoio técnico com tecnologia de IA, curadoria de materiais e programa de indicação com comissão. Cresça com a ARQECO.",
      },
      { property: "og:title", content: "Para arquitetos e designers — ARQECO" },
      {
        property: "og:description",
        content:
          "Educação, apoio técnico e programa de indicação para profissionais de arquitetura e interiores.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ProfissionaisPage,
});

const support = [
  {
    icon: Bot,
    title: "Tecnologia com IA",
    text: "Apoio para interpretar briefings, pesquisar e comparar materiais, sugerir alternativas e organizar especificações e listas. Não substitui o profissional habilitado.",
  },
  {
    icon: Layers,
    title: "Curadoria de materiais",
    text: "Produtos de diferentes fornecedores avaliados pelo Índice Eco-Holístico™, prontos para entrar no seu projeto.",
  },
  {
    icon: Users,
    title: "Oportunidades de projeto",
    text: "Profissionais aprovados na rede ARQECO recebem projetos de clientes da plataforma.",
  },
  {
    icon: BadgeCheck,
    title: "Certificação ArqEco",
    text: "Registro para projetos elegíveis que seguem critérios de sustentabilidade, conforto e bem-estar.",
  },
];

function ProfissionaisPage() {
  const referralSteps: [string, string][] = [
    ["Cadastre-se como afiliado", "Crie sua conta gratuita e ative seu painel de indicações."],
    [
      "Compartilhe seu link",
      "Cada plano tem um link personalizado para você enviar a clientes, seguidores e amigos.",
    ],
    [
      "O cliente contrata",
      "Quando a pessoa indicada contrata um plano pago, a indicação é registrada automaticamente.",
    ],
    [
      "Você recebe",
      `${PAID_PLAN_COMMISSION_RATE}% do valor do plano, pago no dia ${PAYOUT_DAY} do mês seguinte à contratação.`,
    ],
  ];
  return (
    <SiteLayout
      quoteType="profissional"
      whatsappMessage="Olá! Sou arquiteto(a)/designer e quero saber mais sobre a parceria com a ARQECO."
    >
      {/* Hero */}
      <section className="bg-forest text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1.3fr_0.7fr] lg:items-center lg:py-24">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              Para arquitetos e designers de interiores
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] md:text-6xl">
              Projete com propósito. <span className="italic text-accent">Cresça em rede.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base opacity-90 md:text-lg">
              Uma parceria profissional para você se atualizar em arquitetura sustentável, ganhar
              tempo com tecnologia e ter renda extra indicando clientes.
            </p>
            <nav aria-label="Seções para profissionais" className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="editorial" size="lg">
                <a href="#educacao">Educação</a>
              </Button>
              <Button
                asChild
                variant="paper"
                size="lg"
                className="border-primary-foreground/50 text-primary-foreground hover:border-accent hover:text-accent"
              >
                <a href="#apoio">Apoio técnico</a>
              </Button>
              <Button
                asChild
                variant="paper"
                size="lg"
                className="border-primary-foreground/50 text-primary-foreground hover:border-accent hover:text-accent"
              >
                <a href="#indicacao">Programa de indicação</a>
              </Button>
            </nav>
          </div>
          <figure className="hidden lg:block">
            <img
              src={karinaKoch.url}
              alt="Karina Koch, arquiteta e fundadora da ARQECO"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover object-[20%_center]"
            />
            <figcaption className="mt-3 text-xs opacity-75">
              Karina Koch · 22 anos de arquitetura sustentável e mais de 1.200 projetos entregues
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Educação */}
      <section id="educacao" className="mx-auto max-w-7xl px-5 py-20">
        <Eyebrow>Educação</Eyebrow>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold">
          Aprenda com quem já entregou mais de 1.200 projetos.
        </h2>
        <article className="mt-10 grid overflow-hidden border border-primary bg-card lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-7 md:p-10">
            <BookOpen className="size-8 text-primary" aria-hidden="true" />
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Formação
            </p>
            <h3 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              Formação Arquiteto com Propósito
            </h3>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Para arquitetos e designers que querem unir sustentabilidade, bem-estar e um negócio
              próspero. Conduzida por Karina Koch, com a metodologia Design Eco-Holístico.
            </p>
          </div>
          <div className="flex flex-col justify-between gap-6 bg-secondary p-7 md:p-10">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Próxima turma</dt>
                <dd className="font-semibold">Vagas limitadas · consulte a data</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Investimento</dt>
                <dd className="font-semibold">Consulte condições</dd>
              </div>
            </dl>
            <Button asChild variant="editorial" size="lg">
              <a
                href={whatsappUrl(
                  "Olá! Quero saber sobre a próxima turma da Formação Arquiteto com Propósito.",
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle /> Quero saber da próxima turma
              </a>
            </Button>
          </div>
        </article>
      </section>

      {/* Apoio */}
      <section id="apoio" className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Eyebrow>Apoio técnico</Eyebrow>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-semibold">
            Menos tarefa repetitiva, mais tempo para criar.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {support.map((s) => (
              <div key={s.title} className="bg-background p-6">
                <s.icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild variant="editorial" size="lg">
              <Link to="/auth" search={{ perfil: "profissional" }}>
                Quero fazer parte da rede <ArrowRight />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Cadastro gratuito, com análise e aprovação da equipe ARQECO.
            </p>
          </div>
        </div>
      </section>

      {/* Programa de indicação */}
      <section id="indicacao" className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow>Programa de indicação</Eyebrow>
            <h2 className="mt-4 font-display text-4xl font-semibold">
              Indique a ARQECO e ganhe {PAID_PLAN_COMMISSION_RATE}% por plano contratado.
            </h2>
            <p className="mt-4 text-muted-foreground">
              O programa de afiliados é aberto a qualquer pessoa, não só a profissionais da área.
              Você acompanha cliques, indicações e comissões no seu painel.
            </p>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex gap-3">
                <HandCoins className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <strong>{PAID_PLAN_COMMISSION_RATE}% do valor do plano</strong>, pago somente após
                  a contratação do cliente indicado.
                </span>
              </li>
              <li className="flex gap-3">
                <Link2 className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span>Link personalizado por plano e materiais de divulgação.</span>
              </li>
              <li className="flex gap-3">
                <BadgeCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />
                <span>Status de cada indicação e data de pagamento no painel.</span>
              </li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="editorial" size="lg">
                <Link to="/auth" search={{ perfil: "afiliado" }}>
                  Quero indicar e ganhar <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="paper" size="lg">
                <Link to="/afiliado">Já sou afiliado: meu painel</Link>
              </Button>
            </div>
          </div>
          <ol className="grid gap-px self-start overflow-hidden border border-border bg-border sm:grid-cols-2">
            {referralSteps.map(([t, d], i) => (
              <li key={t} className="bg-card p-6">
                <span className="font-display text-3xl text-primary">0{i + 1}</span>
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Testimonials audience="profissionais" title="Profissionais que cresceram com a ARQECO." />
      <FaqList items={faqPro} />

      <section className="mx-auto max-w-4xl px-5 py-20 text-center">
        <h2 className="font-display text-4xl font-semibold">Vamos crescer juntos?</h2>
        <p className="mt-4 text-muted-foreground">
          Fale com a equipe ARQECO e descubra o melhor caminho para você: formação, rede de
          profissionais ou indicação.
        </p>
        <Button asChild variant="editorial" size="lg" className="mt-8">
          <a
            href={whatsappUrl(
              "Olá! Sou arquiteto(a)/designer e quero saber mais sobre a parceria com a ARQECO.",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle /> Conversar no WhatsApp
          </a>
        </Button>
      </section>
    </SiteLayout>
  );
}
