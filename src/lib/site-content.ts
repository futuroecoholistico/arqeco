// Conteúdo público do site (textos, números e listas) usado pelas páginas de cada público.
// Preços NÃO ficam aqui: planos e valores continuam vindo de `service_plans`/`service_plan_options`.
import heroImage from "@/assets/home-hero.jpg";
import bedroomImage from "@/assets/portfolio-quarto.jpg";
import projectImage from "@/assets/arqeco-project.jpg";
import viverBemImage from "@/assets/planos/plano-viver-bem.jpeg.asset.json";
import viverLifestyleImage from "@/assets/planos/plano-viver-lifestyle.jpeg.asset.json";
import startPlanImage from "@/assets/planos/plano-start-dossie.jpeg.asset.json";

export const WHATSAPP_NUMBER = "5511964710505";
export const WHATSAPP_LABEL = "(11) 96471-0505";
export const PORTFOLIO_ATELIER_URL = "https://atelier-in-space.lovable.app";

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Números institucionais confirmados pela fundadora (27/11/2026). */
export const proofNumbers: [string, string][] = [
  ["22 anos", "de arquitetura sustentável"],
  ["+1.200", "projetos entregues"],
  ["TOP Startups 2025", "Prêmio Sebrae"],
  ["100% online", "do briefing à lista de compras"],
];

export const supporters = [
  "Sebrae",
  "Inovativa Brasil",
  "Think Beyond Plastic",
  "The Climate Reality Project",
  "Movimento Nacional ODS São Paulo",
  "Parque Tech São Caetano",
];

export type PortfolioKind = "residencial" | "comercial";
export type PortfolioItem = {
  src: string;
  title: string;
  kind: PortfolioKind;
  room: string;
  plan?: string;
};

/** Projetos com imagem já disponível no site. Novos projetos entram aqui. */
export const portfolio: PortfolioItem[] = [
  {
    src: heroImage,
    title: "Sala de estar com luz natural",
    kind: "residencial",
    room: "Sala",
    plan: "Viver Lifestyle",
  },
  {
    src: bedroomImage,
    title: "Quarto para descansar de verdade",
    kind: "residencial",
    room: "Quarto",
    plan: "Viver Bem",
  },
  {
    src: projectImage,
    title: "Estar integrado e acolhedor",
    kind: "residencial",
    room: "Estar",
    plan: "Design Eco-Holístico",
  },
  {
    src: viverBemImage.url,
    title: "Ambiente renovado sem obra",
    kind: "residencial",
    room: "Sala",
    plan: "Viver Bem",
  },
  {
    src: viverLifestyleImage.url,
    title: "Casa pensada para a rotina",
    kind: "residencial",
    room: "Casa inteira",
    plan: "Viver Lifestyle",
  },
  {
    src: startPlanImage.url,
    title: "Canto de bem-estar e meditação",
    kind: "residencial",
    room: "Bem-estar",
    plan: "Dossiê Eco-Holístico",
  },
];

export type Faq = [string, string];

export const faqGeneral: Faq[] = [
  [
    "O que é a ARQECO?",
    "Uma plataforma de projetos de arquitetura e interiores que une bem-estar e sustentabilidade, com profissionais da rede ARQECO, tecnologia e curadoria de materiais.",
  ],
  [
    "O projeto é online?",
    "Sim. Todo o processo é digital, do briefing à entrega dos arquivos, o que permite atender clientes em todo o Brasil.",
  ],
  [
    "Preciso criar conta para pedir um orçamento?",
    "Não. O pedido de orçamento é feito em poucos campos, sem cadastro. A conta só é criada se você decidir contratar um plano.",
  ],
  [
    "Quem desenvolve meu projeto?",
    "Profissionais da rede ARQECO, selecionados e acompanhados pela equipe da arquiteta Karina Koch, fundadora da ARQECO.",
  ],
];

export const faqHome: Faq[] = [
  [
    "Qual plano é ideal para mim?",
    "Se você quer renovar um ou poucos ambientes sem obra, o Viver Bem resolve. Se quer repensar a casa a partir da sua rotina e do seu bem-estar, o Viver Lifestyle é o mais completo. Vai construir ou fazer uma reforma maior? Peça um orçamento de projeto completo.",
  ],
  [
    "Recebo projeto em 3D?",
    "Sim, nos planos em que a visualização 3D está incluída. Em planos selecionados você também pode caminhar pelo projeto com tour 360°.",
  ],
  [
    "Preciso fazer obra?",
    "Não necessariamente. Os planos de interiores foram pensados para transformar sem quebra-quebra, com layout, materiais, iluminação e lista de compras.",
  ],
  [
    "A ARQECO vende os produtos?",
    "Não. Você compra diretamente dos fornecedores. Nós organizamos a lista com especificações, quantidades e links.",
  ],
  [
    "O Dossiê Eco-Holístico está incluído?",
    "Sim. Todos os pacotes de projeto recebem o Dossiê Eco-Holístico como bônus gratuito. Ele também pode ser pedido gratuitamente antes de contratar.",
  ],
  [
    "Posso escolher o profissional?",
    "Hoje a ARQECO faz a atribuição de acordo com o seu projeto. A escolha pelo cliente poderá ser disponibilizada no futuro.",
  ],
];

export const faqBusiness: Faq[] = [
  [
    "Que tipos de espaço vocês projetam?",
    "Lojas, escritórios, clínicas, consultórios, spas, estúdios, restaurantes, hospedagens e imóveis para locação. Mais de 1.200 projetos entregues, de diversas tipologias e tamanhos.",
  ],
  [
    "Por que não há preço no site?",
    "Cada espaço comercial tem área, uso e exigências diferentes. Por isso o valor é sob orçamento: você conta o que precisa e recebemos sua proposta personalizada.",
  ],
  [
    "Quanto tempo leva para receber a proposta?",
    "Nossa equipe responde pelo WhatsApp com os próximos passos e, se necessário, agenda uma conversa para entender o espaço.",
  ],
  [
    "O projeto considera a experiência do meu cliente?",
    "Sim. Trabalhamos com conforto ambiental, biofilia, iluminação e neuroarquitetura para criar espaços que acolhem quem atende e quem é atendido.",
  ],
  [
    "Vocês acompanham a obra?",
    "Podemos entregar somente o projeto ou a jornada completa, com obra e acompanhamento. Isso é definido na proposta.",
  ],
];

export const faqPro: Faq[] = [
  [
    "Preciso ser arquiteto para participar do programa de indicação?",
    "Não. O programa de afiliados é aberto a qualquer pessoa: arquitetos, designers, criadores de conteúdo e clientes que querem indicar a ARQECO.",
  ],
  [
    "Como entro para a rede de profissionais ARQECO?",
    "Faça seu cadastro como profissional. A equipe analisa o perfil e, após a aprovação, libera o painel com oportunidades de projeto, curadoria e as ferramentas com IA.",
  ],
  [
    "A tecnologia com IA substitui o profissional?",
    "Não. Ela apoia a pesquisa de materiais, a organização de briefings e as especificações, mas não substitui um responsável técnico habilitado.",
  ],
  [
    "Como acompanho minhas indicações?",
    "No seu painel de afiliado você vê seus links, cliques, indicações, comissões e a data de pagamento de cada uma.",
  ],
];
