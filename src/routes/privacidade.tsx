import { createFileRoute, Link } from "@tanstack/react-router";

const EMAIL = "contato.arquiteturaecologica@gmail.com";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade (LGPD) — ARQECO" },
      { name: "description", content: "Como a ARQECO coleta, usa, protege e compartilha seus dados pessoais, conforme a LGPD (Lei 13.709/2018)." },
      { property: "og:title", content: "Política de Privacidade — ARQECO" },
      { property: "og:description", content: "Transparência sobre o tratamento dos seus dados pessoais na ARQECO." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

const sections: [string, React.ReactNode][] = [
  ["1. Quem somos", <>A <strong>ARQECO – Arquitetura Ecológica</strong>, 63.373.509 Inova Simples (I.S.), CNPJ 63.373.509/0001-08, é a controladora dos dados pessoais tratados nesta plataforma. Encarregado pelo tratamento de dados (DPO): <a className="text-primary underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.</>],
  ["2. Dados que coletamos", <ul className="list-disc space-y-1 pl-5"><li>Cadastro: nome, e-mail, telefone e senha (armazenada de forma criptografada).</li><li>Contratação: endereço do imóvel, tipo de imóvel, horário agendado e plano escolhido.</li><li>Briefing: informações sobre rotina, pessoas que usam o espaço, preferências estéticas, orçamento, fotos, plantas e vídeos enviados por você.</li><li>Parceiros: dados de cadastro de arquitetos, fornecedores e afiliados (inclusive documento e site).</li><li>Pagamento: processado pelo provedor de pagamentos; a ARQECO não armazena número de cartão nem CVV.</li><li>Dados técnicos mínimos necessários ao funcionamento e à segurança (ex.: registros de acesso).</li></ul>],
  ["3. Para que usamos e bases legais (art. 7º LGPD)", <ul className="list-disc space-y-1 pl-5"><li><strong>Execução de contrato:</strong> agendar, elaborar e entregar seu projeto, e conectar você ao profissional responsável.</li><li><strong>Cumprimento de obrigação legal:</strong> emissão fiscal e guarda de registros exigidos por lei.</li><li><strong>Legítimo interesse:</strong> segurança da plataforma, prevenção a fraudes e melhoria dos serviços.</li><li><strong>Consentimento:</strong> uso dos arquivos do briefing e comunicações opcionais — você pode revogar a qualquer momento.</li></ul>],
  ["4. Dados sensíveis", <>Não solicitamos dados de saúde, religião ou outros dados sensíveis. Caso você os informe voluntariamente no briefing (ex.: necessidades de acessibilidade), eles serão usados apenas para adaptar o projeto, com seu consentimento específico. A ARQECO não realiza diagnósticos médicos ou psicológicos.</>],
  ["5. Compartilhamento", <><ul className="list-disc space-y-1 pl-5"><li>Arquiteto ou designer atribuído ao seu projeto (somente leitura do briefing).</li><li>Provedor de pagamentos, para processar a compra.</li><li>Provedores de hospedagem, banco de dados e inteligência artificial, que atuam como operadores sob contrato. Dados de clientes não são enviados à assistente Zoe automaticamente.</li><li>Autoridades, quando exigido por lei.</li></ul>Não vendemos seus dados. Alguns provedores podem armazenar dados fora do Brasil, com garantias adequadas (art. 33 LGPD).</>],
  ["6. Segurança", <>Usamos conexão criptografada (HTTPS), senhas protegidas e verificadas contra vazamentos conhecidos, controle de acesso por perfil (cada pessoa só vê os próprios dados), arquivos do briefing em armazenamento privado com links temporários, e confirmação de pagamento apenas por comunicação assinada do provedor.</>],
  ["7. Por quanto tempo guardamos", <>Pelo tempo necessário à prestação do serviço e, após o encerramento, pelos prazos legais (ex.: 5 anos para registros fiscais e de consumo). Depois disso, os dados são excluídos ou anonimizados.</>],
  ["8. Seus direitos (art. 18 LGPD)", <>Você pode solicitar: confirmação e acesso aos dados, correção, anonimização ou exclusão, portabilidade, informação sobre compartilhamentos, revogação do consentimento e revisão de decisões automatizadas. Envie seu pedido para <a className="text-primary underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>; respondemos em até 15 dias. Você também pode recorrer à ANPD (Autoridade Nacional de Proteção de Dados).</>],
  ["9. Cookies", <>Usamos apenas armazenamento essencial para manter você conectado e o funcionamento da plataforma. Não usamos cookies de publicidade.</>],
  ["10. Alterações", <>Esta política pode ser atualizada; a versão vigente estará sempre nesta página. Última atualização: 13 de outubro de 2026.</>],
];

function Privacy() {
  return (
    <main className="min-h-screen bg-background px-5 py-16">
      <article className="mx-auto max-w-3xl">
        <Link to="/" className="font-display text-2xl font-semibold text-primary">ARQECO</Link>
        <h1 className="mt-10 font-display text-4xl font-semibold">Política de Privacidade</h1>
        <p className="mt-3 text-muted-foreground">Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
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
