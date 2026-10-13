import { createFileRoute, Link } from "@tanstack/react-router";

const EMAIL = "contato.arquiteturaecologica@gmail.com";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — ARQECO" },
      { name: "description", content: "Regras de uso da plataforma ARQECO: contratação de projetos, pagamentos, agendamentos, responsabilidades e direitos." },
      { property: "og:title", content: "Termos de Uso — ARQECO" },
      { property: "og:description", content: "Condições para usar a plataforma e contratar projetos ARQECO." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Terms,
});

const sections: [string, React.ReactNode][] = [
  ["1. Aceitação", <>Estes Termos regem o uso da plataforma ARQECO – Arquitetura Ecológica, 63.373.509 Inova Simples (I.S.), CNPJ 63.373.509/0001-08. Ao criar uma conta ou contratar um serviço, você declara ter lido e aceitado estes Termos e a <Link to="/privacidade" className="text-primary underline">Política de Privacidade</Link>.</>],
  ["2. Serviços", <>A ARQECO oferece projetos de arquitetura e design de interiores sustentáveis, entregues de forma on-line por profissionais da rede, além de solicitações de projetos de construção, curadoria de materiais e o Dossiê Eco-Holístico gratuito como bônus. O conteúdo de cada plano é o descrito na página de planos no momento da contratação.</>],
  ["3. Conta", <>Você deve ter 18 anos ou mais, informar dados verdadeiros e manter sua senha em sigilo. Atividades realizadas na sua conta são de sua responsabilidade. Podemos suspender contas com uso fraudulento ou que violem estes Termos.</>],
  ["4. Contratação, preços e pagamento", <>Os preços são exibidos em reais na plataforma e confirmados na revisão antes do pagamento, incluindo adicionais (ambientes extras e taxa de urgência). O pagamento é processado por provedor seguro; a contratação e o horário só são confirmados após a aprovação do pagamento.</>],
  ["5. Agendamento", <>Os horários disponíveis são exibidos na agenda. Remarcações devem ser solicitadas com pelo menos 24 horas de antecedência pelo e-mail de contato, sujeitas à disponibilidade do profissional.</>],
  ["6. Direito de arrependimento e cancelamento", <>Conforme o art. 49 do Código de Defesa do Consumidor, você pode desistir da compra em até 7 dias após a contratação, com reembolso integral, desde que o desenvolvimento do projeto ainda não tenha começado com a sua autorização. Após o início, valores proporcionais ao trabalho já realizado poderão ser retidos. Planos de acompanhamento recorrentes podem ser cancelados a qualquer momento, com efeito ao final do ciclo pago.</>],
  ["7. Responsabilidades do cliente", <>Fornecer no briefing informações, medidas, fotos e plantas corretas. Projetos baseados em informações incorretas podem exigir ajustes fora do escopo contratado.</>],
  ["8. Limites do serviço", <>Os projetos de interiores não substituem projetos técnicos estruturais, elétricos ou hidráulicos, nem a responsabilidade técnica (ART/RRT) de engenheiro ou arquiteto em obras. A assistente Zoe é uma ferramenta de apoio aos profissionais e não substitui um profissional habilitado. O Dossiê Eco-Holístico não constitui diagnóstico médico ou psicológico. A execução de obras e a compra de materiais são de responsabilidade do cliente e de seus fornecedores.</>],
  ["9. Propriedade intelectual", <>Os projetos são de autoria dos profissionais e da ARQECO (Lei 9.610/1998). O cliente recebe licença para executar o projeto no imóvel indicado, sem direito de revenda ou reprodução para outros imóveis. Marca, textos e imagens da plataforma não podem ser copiados sem autorização. Podemos divulgar imagens do projeto em portfólio sem identificar o cliente, salvo se você se opuser por e-mail.</>],
  ["10. Fornecedores, afiliados e links", <>Produtos indicados na curadoria são vendidos por fornecedores parceiros, responsáveis por preço, entrega e garantia. Alguns links geram comissão à ARQECO ou a afiliados, sem custo adicional para você.</>],
  ["11. Profissionais parceiros", <>Arquitetos e designers são aprovados pela equipe ARQECO e devem manter registro profissional ativo, sigilo sobre os dados dos clientes e respeito à LGPD.</>],
  ["12. Alterações e foro", <>Estes Termos podem ser atualizados; a versão vigente estará sempre nesta página. Aplica-se a legislação brasileira, ficando eleito o foro do domicílio do consumidor. Dúvidas: <a className="text-primary underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>. Última atualização: 13 de outubro de 2026.</>],
];

function Terms() {
  return (
    <main className="min-h-screen bg-background px-5 py-16">
      <article className="mx-auto max-w-3xl">
        <Link to="/" className="font-display text-2xl font-semibold text-primary">ARQECO</Link>
        <h1 className="mt-10 font-display text-4xl font-semibold">Termos de Uso</h1>
        <div className="mt-10 space-y-8 text-sm leading-relaxed">
          {sections.map(([t, body]) => (
            <section key={t} className="border-t border-border pt-6">
              <h2 className="mb-3 font-display text-xl font-semibold">{t}</h2>
              <div className="text-foreground/85">{body}</div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
