// Briefing ARQECO — question catalogue. Keep labels here so admin views, summaries and future AI use one source.

export const BRIEFING_STEPS = [
  "Boas-vindas",
  "Sobre você",
  "Sobre o imóvel",
  "Ambientes",
  "Como você vive",
  "Estilo, cores e texturas",
  "Necessidades e referências",
  "Resumo e envio",
] as const;

export const PROJECT_FOR = ["Residência", "Apartamento", "Casa de férias", "Imóvel para locação", "Imóvel para venda", "Espaço profissional", "Outro"];
export const HOUSEHOLD_FLAGS: { key: string; label: string }[] = [
  { key: "children", label: "Há crianças?" },
  { key: "elderly", label: "Há idosos?" },
  { key: "pets", label: "Há pets?" },
  { key: "workFromHome", label: "Alguém trabalha em casa?" },
  { key: "studyAtHome", label: "Alguém estuda em casa?" },
];
export const PROPERTY_TYPES = ["Casa", "Apartamento", "Studio", "Escritório", "Consultório", "Loja", "Outro"];
export const PROPERTY_SITUATION = ["Novo", "Existente", "Em reforma", "Em construção"];
export const START_WHEN = ["Imediatamente", "Até 3 meses", "3–6 meses", "6–12 meses", "Ainda não sei"];
export const FILE_CATEGORIES = ["Planta", "Croqui", "Medidas", "Fotos", "Vídeos", "Projetos anteriores", "Referências", "Outros"];

export type RoomKey = "sala" | "jantar" | "cozinha" | "dormitorio" | "banheiro" | "varanda" | "office" | "servico" | "outro";
export const ROOM_CATALOG: { label: string; key: RoomKey }[] = [
  { label: "Sala de estar", key: "sala" },
  { label: "Sala de jantar", key: "jantar" },
  { label: "Cozinha", key: "cozinha" },
  { label: "Suíte", key: "dormitorio" },
  { label: "Dormitório", key: "dormitorio" },
  { label: "Banheiro", key: "banheiro" },
  { label: "Lavabo", key: "banheiro" },
  { label: "Home office", key: "office" },
  { label: "Escritório", key: "office" },
  { label: "Varanda", key: "varanda" },
  { label: "Área gourmet", key: "varanda" },
  { label: "Lavanderia", key: "servico" },
  { label: "Closet", key: "outro" },
  { label: "Sala de TV", key: "sala" },
  { label: "Área externa", key: "varanda" },
  { label: "Paisagismo", key: "outro" },
];

export const ROOM_ITEMS: Record<RoomKey, string[]> = {
  sala: ["Sofá", "TV", "Rack", "Mesa de centro", "Poltronas", "Tapete", "Cortina", "Almofadas", "Aparador", "Cristaleira", "Luminárias", "Quadros", "Plantas", "Espaço de leitura", "Home office"],
  jantar: ["Mesa", "Cadeiras", "Aparador", "Buffet", "Cristaleira", "Pendente", "Tapete", "Quadros", "Plantas", "Adega"],
  cozinha: ["Geladeira", "Fogão", "Cooktop", "Forno", "Microondas", "Armários", "Prateleiras", "Bancada", "Mesa", "Cadeiras", "Bancos", "Lava-louças", "Freezer", "Adega", "Máquina de café", "Air fryer"],
  dormitorio: ["Cama", "Guarda-roupa", "Closet", "Mesa de cabeceira", "TV", "Penteadeira", "Escrivaninha", "Poltrona", "Estante", "Luminária", "Ar-condicionado", "Ventilador", "Cortina", "Tapete"],
  banheiro: ["Chuveiro", "Box", "Cuba", "Espelho", "Armário", "Nichos", "Porta-toalhas", "Cesto", "Espaço para produtos"],
  varanda: ["Mesa", "Cadeiras", "Poltronas", "Sofá", "Futon", "Rede", "Plantas", "Paisagismo", "Churrasqueira", "Frigobar", "Adega", "Armário", "Iluminação", "Fonte de água"],
  office: ["Bancada", "Monitor", "Notebook", "Impressora", "Armários", "Prateleiras", "Cadeira", "Iluminação", "Mesa de reunião", "Área de café", "Cenário para vídeo", "Área de descanso", "Paisagismo"],
  servico: ["Máquina de lavar", "Secadora", "Varal", "Tanque", "Armários", "Tábua de passar", "Aspirador", "Produtos de limpeza", "Escada"],
  outro: [],
};

export const USES = ["Relaxar", "Receber amigos", "Receber família", "Assistir TV", "Ler", "Trabalhar", "Estudar", "Fazer refeições", "Cozinhar", "Descansar", "Praticar hobbies", "Brincar com crianças", "Cuidar de plantas", "Praticar exercícios"];
export const FEEL_YES = ["Acolhido", "Relaxado", "Tranquilo", "Leve", "Inspirado", "Criativo", "Energizado", "Sofisticado", "Elegante", "Aconchegante", "Conectado à natureza", "Sensorial", "Equilibrado", "Intimista", "Organizado", "Livre"];
export const FEEL_NO = ["Frio", "Impessoal", "Escuro", "Pesado", "Bagunçado", "Exagerado", "Formal", "Sem personalidade"];
export const BUDGETS = ["Até R$ 10 mil", "R$ 10–30 mil", "R$ 30–60 mil", "R$ 60–100 mil", "R$ 100–200 mil", "Acima de R$ 200 mil", "Prefiro conversar"];
export const PRIORITIES = ["Funcionalidade", "Conforto", "Estética", "Organização", "Sustentabilidade", "Bem-estar", "Custo-benefício", "Durabilidade"];
export const EXISTING_ACTIONS = ["Manter", "Reaproveitar", "Reformar", "Substituir"];

export type Person = { id: string; name: string; age: string; relation: string; occupation: string; usage: string; notes: string };
export type Room = { id: string; key: RoomKey; name: string };
export type RoomNeeds = { items: string[]; usage: string; problem: string; change: string; mustHave: string };
export type ExistingItem = { id: string; name: string; action: string; notes: string };

export type BriefingAnswers = {
  fullName?: string; email?: string; phone?: string;
  projectFor?: string; projectForOther?: string;
  people?: Person[];
  household?: Record<string, boolean | undefined>;
  accessibility?: string;
  propertyType?: string; propertySituation?: string; city?: string; address?: string;
  propertyArea?: string; roomArea?: string; startWhen?: string;
  rooms?: Room[];
  uses?: string[]; challenges?: string; mainProblem?: string; wishToDo?: string;
  feelYes?: string[]; feelNo?: string[]; spaceIs?: string;
  styles?: string[]; stylesNo?: string[]; mixStyles?: boolean; stylesMix?: string[];
  palettes?: string[]; colorsLove?: string; colorsAvoid?: string;
  materials?: string[]; moodboards?: string[];
  roomNeeds?: Record<string, RoomNeeds>;
  existing?: ExistingItem[];
  budget?: string; priorities?: string[];
  referenceLinks?: string;
  transformation?: string; myFace?: string;
};

export const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

/** Rough completion estimate across the main questions. */
export function computeProgress(a: BriefingAnswers): number {
  const checks = [
    a.fullName, a.email, a.phone, a.projectFor, a.propertyType, a.propertySituation, a.city, a.startWhen,
    a.rooms?.length, a.uses?.length, a.mainProblem, a.feelYes?.length, a.styles?.length, a.palettes?.length,
    a.materials?.length, a.budget, a.transformation,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 95);
}
