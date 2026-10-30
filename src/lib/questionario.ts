// Questionário adaptativo — cada público tem sua própria trilha de perguntas.
import { trilhaDe, type TipoAmbiente, type Trilha } from "@/domain/types";

import { ANAMNESE as ANAMNESE_BASE } from "./anamnese";
import { DIRECOES_JANELA } from "./localizacao-ambiente";

export type PerguntaTipo = "text" | "textarea" | "radio" | "checkbox" | "escala";

export interface Pergunta {
  id: string;
  label: string;
  tipo: PerguntaTipo;
  opcoes?: string[] | undefined;
  obrigatoria?: boolean | undefined;
  placeholder?: string | undefined;
  secao?: string | undefined;
  /** Itens avaliados numa pergunta de escala; cada item vira a chave `${id}::${item}`. */
  itens?: string[] | undefined;
  /** Limite de opções numa múltipla escolha. */
  max?: number | undefined;
  ajuda?: string | undefined;
  elemento?: string | undefined;
  /** Mostra a pergunta só quando a resposta de outra começa com o prefixo. */
  mostrarSe?: { id: string | undefined; prefixo: string };
}

export const ORIENTACAO_ANAMNESE = "Este questionário nos ajuda a compreender como você utiliza seu ambiente, quais características fazem parte da sua rotina e como percebe esse espaço no dia a dia. Suas respostas serão analisadas em conjunto com as imagens para gerar um Dossiê Eco Holístico® personalizado. Não existem respostas certas ou erradas: responda de acordo com sua experiência real.";

export function perguntaVisivel(p: Pergunta, respostas: Record<string, unknown>): boolean {
  if (!p.mostrarSe) return true;
  const v = respostas[p.mostrarSe.id];
  return typeof v === "string" && v.startsWith(p.mostrarSe.prefixo);
}


const LOCALIZACAO_PERGUNTAS: Pergunta[] = [
  { id: "consultaLocalizacao", secao: "Localização e orientação do ambiente", label: "Autoriza consultar o endereço no Google Maps para apoiar a análise ambiental?", tipo: "radio", opcoes: ["Sim, autorizo a consulta", "Não, prefiro analisar somente minhas respostas"], ajuda: "Opcional. Endereço e rua da janela ficam nas respostas do dossiê; quando autorizado, são enviados ao Google Maps. Não informe número do apartamento ou nomes de moradores." },
  { id: "enderecoImovel", secao: "Localização e orientação do ambiente", label: "Qual é o endereço do imóvel (rua, número, cidade, estado e país)?", tipo: "text", placeholder: "Rua, número do prédio, cidade, estado e país", mostrarSe: { id: "consultaLocalizacao", prefixo: "Sim" }, obrigatoria: true },
  { id: "destinoJanela", secao: "Localização e orientação do ambiente", label: "Para onde está voltada a principal janela do ambiente?", tipo: "radio", opcoes: ["Para a rua do endereço do imóvel", "Para outra rua", "Para pátio interno ou jardim", "Não há janela externa", "Não sei informar"] },
  { id: "ruaJanela", secao: "Localização e orientação do ambiente", label: "Em qual rua está voltada a janela do ambiente?", tipo: "text", placeholder: "Nome da rua da janela — pode ser diferente da entrada do prédio", mostrarSe: { id: "destinoJanela", prefixo: "Para outra" }, obrigatoria: true },
  { id: "orientacaoJanela", secao: "Localização e orientação do ambiente", label: "Se souber, qual é a direção para a qual a janela está voltada?", tipo: "radio", opcoes: DIRECOES_JANELA, ajuda: "Direção olhando para fora. Se não conhece, marque Não sei informar; a rua sozinha não confirma a orientação." },
  { id: "andarAmbiente", secao: "Localização e orientação do ambiente", label: "Em qual nível está o ambiente?", tipo: "radio", opcoes: ["Térreo", "1º ao 3º andar", "4º ao 10º andar", "Acima do 10º andar", "Subsolo", "Não sei informar"] },
  { id: "obstrucoesJanela", secao: "Localização e orientação do ambiente", label: "O que existe em frente à janela?", tipo: "checkbox", opcoes: ["Vista livre", "Prédio próximo", "Árvores", "Varanda ou beiral", "Muro", "Cortinas ou persianas", "Não sei informar"] },
  { id: "aberturasVentilacao", secao: "Localização e orientação do ambiente", label: "Quais aberturas podem renovar o ar?", tipo: "checkbox", opcoes: ["Uma janela que abre", "Janelas em lados opostos", "Janelas em lados adjacentes", "Porta e janela para o exterior", "Somente abertura para pátio", "Janelas fixas que não abrem", "Nenhuma abertura externa", "Não sei informar"] },
];
const ANAMNESE: Pergunta[] = [...ANAMNESE_BASE.slice(0, 6), ...LOCALIZACAO_PERGUNTAS, ...ANAMNESE_BASE.slice(6)];

// Opções que só fazem sentido fora de casa; home office e trabalho continuam.
export const OPCOES_NAO_RESIDENCIAIS = new Set([
  "Escritório corporativo",
  "Consultório ou sala de atendimento",
  "Sala de espera ou recepção",
  "Espaço comercial",
  "Atendimento a clientes ou pacientes",
  "Recepção e circulação de pessoas",
  "Exposição de produtos e vendas",
  "Profissionais e colaboradores",
  "Clientes, pacientes ou visitantes",
  "Imóvel comercial alugado",
  "Realizar atendimentos",
  "Expor produtos",
]);

// Only the residential presentation is shortened; canonical questions and saved IDs remain intact.
const PERGUNTAS_RESIDENCIAIS_REDUNDANTES = new Set(["anam04", "anam08", "anam10", "anam11", "anam12", "anam18", "anam26", "anam28", "anam29", "anam33", "anam37", "anam39", "anam50"]);
export const ANAMNESE_RESIDENCIAL: Pergunta[] = ANAMNESE.filter(p => !PERGUNTAS_RESIDENCIAIS_REDUNDANTES.has(p.id)).map((p) =>
  p.opcoes ? { ...p, opcoes: p.opcoes.filter((o) => !OPCOES_NAO_RESIDENCIAIS.has(o)) } : p,
);

export const MOMENTO_VIDA_RESIDENCIAL: Pergunta[] = [
  { id: "consentimentoMomentoVida", secao: "Você e seu momento de vida", label: "Deseja compartilhar seu momento de vida para personalizar o ambiente?", tipo: "radio", opcoes: ["Sim, autorizo o uso dessas respostas no meu dossiê", "Prefiro não compartilhar"], ajuda: "Opcional. As respostas podem revelar informações sensíveis, serão salvas no dossiê e enviadas à IA para personalizar as sugestões; sua conta e os administradores podem acessá-las. Você pode solicitar a revogação pelo contato de privacidade ou excluir os dados em Minha conta. Não é uma avaliação de saúde mental." },
  { id: "mudancasVida", secao: "Você e seu momento de vida", label: "Está passando por alguma mudança significativa na vida?", tipo: "checkbox", mostrarSe: { id: "consentimentoMomentoVida", prefixo: "Sim" }, opcoes: ["Mudança de casa ou cidade", "Mudança de trabalho ou carreira", "Início ou fim de relacionamento", "Chegada de um filho ou mudança na família", "Luto ou despedida", "Aposentadoria", "Recomeço pessoal ou novos projetos", "Mudança na rotina de saúde ou autocuidado", "Não estou passando por mudanças significativas", "Outra mudança", "Prefiro não responder"] },
  { id: "sentimentosAtuais", secao: "Você e seu momento de vida", label: "Como você tem se sentido neste momento da vida?", tipo: "checkbox", mostrarSe: { id: "consentimentoMomentoVida", prefixo: "Sim" }, opcoes: ["Ansioso(a) ou preocupado(a)", "Calmo(a) e em paz", "Triste ou desanimado(a)", "Cansado(a) ou sobrecarregado(a)", "Motivado(a) e confiante", "Inseguro(a) ou sem direção", "Sensível ou emocionalmente vulnerável", "Esperançoso(a) com uma nova fase", "Meus sentimentos variam bastante", "Não sei dizer", "Prefiro não responder"] },
  { id: "sentimentosDesejados", secao: "Você e seu momento de vida", label: "Como gostaria de se sentir nesse ambiente?", tipo: "checkbox", mostrarSe: { id: "consentimentoMomentoVida", prefixo: "Sim" }, opcoes: ["Calmo(a) e tranquilo(a)", "Acolhido(a) e seguro(a)", "Descansado(a) e renovado(a)", "Concentrado(a) e produtivo(a)", "Motivado(a) e com vitalidade", "Criativo(a) e inspirado(a)", "Confiante e conectado(a) comigo", "Conectado(a) com outras pessoas", "Conectado(a) com minha espiritualidade", "Leve e com liberdade", "Não sei dizer"] },
  { id: "areasVida", secao: "Você e seu momento de vida", label: "Quais áreas da vida gostaria de fortalecer neste momento?", tipo: "checkbox", mostrarSe: { id: "consentimentoMomentoVida", prefixo: "Sim" }, opcoes: ["Trabalho", "Carreira", "Amor-próprio e autoestima", "Relacionamento amoroso", "Família", "Amizades e vínculos sociais", "Espiritualidade", "Autocuidado e bem-estar", "Descanso e equilíbrio da rotina", "Criatividade e projetos pessoais", "Organização e estabilidade financeira", "Propósito e autoconhecimento", "Não sei dizer", "Prefiro não responder"] },
];

/** Never submit sensitive answers if consent was skipped or withdrawn. */
export function prepararRespostasQuestionario(tipo: TipoAmbiente, respostas: Record<string, string | number | boolean | string[] | null>) {
  const preparadas = { ...respostas };
  if (tipo !== "residencial" || !String(respostas['consentimentoMomentoVida'] ?? "").startsWith("Sim")) {
    for (const p of MOMENTO_VIDA_RESIDENCIAL) if (p.id !== "consentimentoMomentoVida") delete preparadas[p.id];
  }
  return preparadas;
}

// ─── Residencial (dossiê pessoal) ──────────────────────────────────────────
const RESIDENCIAL: Pergunta[] = [
  ...MOMENTO_VIDA_RESIDENCIAL,
  ...ANAMNESE_RESIDENCIAL,
  { id: "objetivoPrincipal", secao: "Seu objetivo", label: "Há algo mais que você deseja transformar ou sentir neste ambiente?", tipo: "textarea", placeholder: "Opcional — ex: mais foco, tranquilidade, acolhimento..." },
];

// ─── Empresarial (corporativo e comercial) ─────────────────────────────────
const EMPRESARIAL: Pergunta[] = [
  // Marca e posicionamento
  { id: "empresaNome", secao: "Marca e posicionamento", label: "Nome da empresa e segmento de atuação", tipo: "text", obrigatoria: true, placeholder: "Ex: Studio Aurora — arquitetura de interiores" },
  { id: "tipoEspaco", secao: "Marca e posicionamento", label: "Que espaço será analisado?", tipo: "text", obrigatoria: true, placeholder: "Ex: recepção, open space, loja, showroom..." },
  { id: "proposito", secao: "Marca e posicionamento", label: "Qual é o propósito, missão e principais valores da marca?", tipo: "textarea", obrigatoria: true },
  { id: "posicionamento", secao: "Marca e posicionamento", label: "Como a marca se posiciona no mercado?", tipo: "radio", opcoes: ["Luxo / alto padrão", "Premium acessível", "Inovação / tecnologia", "Artesanal / autoral", "Popular / volume", "Institucional"], obrigatoria: true },
  { id: "personalidadeMarca", secao: "Marca e posicionamento", label: "Três palavras que definem a personalidade da marca", tipo: "text", obrigatoria: true, placeholder: "Ex: acolhedora, ousada, precisa" },
  { id: "identidadeVisual", secao: "Marca e posicionamento", label: "Cores e elementos da identidade visual", tipo: "text", placeholder: "Ex: verde-oliva, off-white, logotipo em serifa" },
  { id: "comunicaValores", secao: "Marca e posicionamento", label: "Hoje o espaço comunica os valores da marca?", tipo: "radio", opcoes: ["Sim, claramente", "Parcialmente", "Pouco", "Não"], obrigatoria: true },
  // Público
  { id: "publicoAlvo", secao: "Público e clientes", label: "Com qual público a empresa trabalha?", tipo: "textarea", obrigatoria: true, placeholder: "Perfil, faixa etária, estilo de vida, B2B ou B2C..." },
  { id: "experienciaCliente", secao: "Público e clientes", label: "Como você quer que o cliente se sinta ao entrar no espaço?", tipo: "text", obrigatoria: true, placeholder: "Ex: encantado, confiante, acolhido..." },
  { id: "circulacaoClientes", secao: "Público e clientes", label: "Clientes frequentam este espaço?", tipo: "radio", opcoes: ["Diariamente", "Com agendamento", "Raramente", "Não frequentam"] },
  // Equipe
  { id: "numeroColaboradores", secao: "Equipe e bem-estar", label: "Quantas pessoas trabalham neste espaço?", tipo: "radio", opcoes: ["1–5", "6–20", "21–50", "51–200", "Mais de 200"], obrigatoria: true },
  { id: "sensacaoEquipeDesejada", secao: "Equipe e bem-estar", label: "Como você quer que os funcionários se sintam aqui?", tipo: "text", obrigatoria: true, placeholder: "Ex: focados, criativos, pertencentes, calmos..." },
  { id: "desafiosEquipe", secao: "Equipe e bem-estar", label: "Quais desafios a equipe enfrenta hoje?", tipo: "checkbox", opcoes: ["Cansaço / estresse", "Baixa concentração", "Pouca colaboração", "Rotatividade", "Ruído", "Desconforto térmico", "Falta de pausas/descanso"] },
  { id: "espacosBemEstar", secao: "Equipe e bem-estar", label: "Existem espaços de pausa, descompressão ou convivência?", tipo: "radio", opcoes: ["Sim, bem usados", "Sim, pouco usados", "Improvisados", "Não existem"] },
  // Sustentabilidade
  { id: "praticasSustentaveis", secao: "Sustentabilidade (ESG)", label: "O que a empresa já faz em sustentabilidade?", tipo: "checkbox", opcoes: ["Coleta seletiva / reciclagem", "Energia solar ou renovável", "Iluminação LED / automação", "Reúso de água", "Materiais certificados (FSC etc.)", "Fornecedores locais", "Redução de plásticos", "Compostagem", "Nenhuma ainda"] },
  { id: "certificacoes", secao: "Sustentabilidade (ESG)", label: "Possui certificações ou compromissos ambientais/sociais?", tipo: "text", placeholder: "Ex: B Corp, LEED, ISO 14001, ODS da ONU, relatório ESG..." },
  { id: "acoesSociais", secao: "Sustentabilidade (ESG)", label: "Há ações sociais, de diversidade ou com a comunidade?", tipo: "textarea", placeholder: "Descreva brevemente, se houver" },
  { id: "maturidadeESG", secao: "Sustentabilidade (ESG)", label: "Como você avalia a maturidade da empresa em sustentabilidade?", tipo: "radio", opcoes: ["Iniciante", "Em desenvolvimento", "Estruturada", "Referência no setor"], obrigatoria: true },
  { id: "objetivoPrincipal", secao: "Sustentabilidade (ESG)", label: "Qual é o principal resultado que a empresa espera com a transformação do espaço?", tipo: "textarea", obrigatoria: true, placeholder: "Ex: reforçar a marca, reter talentos, aumentar vendas..." },
  ...ANAMNESE,
];

// ─── Terapêutico ───────────────────────────────────────────────────────────
const TERAPEUTICO: Pergunta[] = [
  { id: "tipoAtendimento", secao: "O atendimento", label: "Que tipo de atendimento é oferecido neste espaço?", tipo: "text", obrigatoria: true, placeholder: "Ex: psicoterapia, massagem, reiki, fisioterapia..." },
  { id: "abordagem", secao: "O atendimento", label: "Qual é a abordagem ou filosofia do seu trabalho?", tipo: "textarea", obrigatoria: true },
  { id: "perfilPacientes", secao: "O atendimento", label: "Quem são os seus pacientes/clientes?", tipo: "textarea", obrigatoria: true, placeholder: "Idade, principais queixas, estado emocional ao chegar..." },
  { id: "duracaoSessao", secao: "O atendimento", label: "Duração média de uma sessão?", tipo: "radio", opcoes: ["Até 30 min", "30-60 min", "60-90 min", "Mais de 90 min"] },
  { id: "sensacaoPaciente", secao: "O atendimento", label: "Como você quer que o paciente se sinta ao entrar e ao sair?", tipo: "text", obrigatoria: true, placeholder: "Ex: seguro ao entrar, leve ao sair" },
  { id: "privacidadeAcustica", secao: "O atendimento", label: "Como é a privacidade acústica e visual?", tipo: "radio", opcoes: ["Excelente", "Boa", "Há vazamento de som", "Muito exposto"], obrigatoria: true },
  { id: "energiaTerapeuta", secao: "O atendimento", label: "Como você, terapeuta, se sente ao fim de um dia nesse espaço?", tipo: "radio", opcoes: ["Renovado(a)", "Normal", "Cansado(a)", "Esgotado(a)"] },
  { id: "objetivoPrincipal", secao: "O atendimento", label: "O que você deseja transformar neste espaço?", tipo: "textarea", obrigatoria: true },
  ...ANAMNESE,
];

// ─── Hotelaria ─────────────────────────────────────────────────────────────
const HOTELARIA: Pergunta[] = [
  { id: "tipoHospedagem", secao: "A hospedagem", label: "Que tipo de hospedagem?", tipo: "text", obrigatoria: true, placeholder: "Ex: hotel boutique, pousada, retreat..." },
  { id: "areaAnalisada", secao: "A hospedagem", label: "Qual área será analisada?", tipo: "radio", opcoes: ["Quarto / suíte", "Lobby / recepção", "Restaurante", "Spa / bem-estar", "Área externa"], obrigatoria: true },
  { id: "conceito", secao: "A hospedagem", label: "Qual é o conceito e a história do lugar?", tipo: "textarea", obrigatoria: true },
  { id: "publicoAlvo", secao: "A hospedagem", label: "Qual é o público-alvo principal?", tipo: "text", obrigatoria: true, placeholder: "Ex: casais, famílias, executivos..." },
  { id: "experienciaHospede", secao: "A hospedagem", label: "Que memória você quer que o hóspede leve?", tipo: "text", obrigatoria: true, placeholder: "Ex: descanso profundo, conexão com a natureza..." },
  { id: "avaliacoes", secao: "A hospedagem", label: "O que os hóspedes mais elogiam ou criticam?", tipo: "textarea" },
  { id: "praticasSustentaveis", secao: "A hospedagem", label: "Práticas sustentáveis já adotadas", tipo: "checkbox", opcoes: ["Energia renovável", "Reúso de água", "Amenities sem plástico", "Horta / alimentos locais", "Mão de obra local", "Nenhuma ainda"] },
  { id: "objetivoPrincipal", secao: "A hospedagem", label: "Qual resultado espera com a transformação?", tipo: "textarea", obrigatoria: true, placeholder: "Ex: aumentar diária média, melhorar avaliações..." },
  ...ANAMNESE,
];

const POR_TRILHA: Record<Trilha, Pergunta[]> = {
  residencial: RESIDENCIAL,
  empresarial: EMPRESARIAL,
  terapeutico: TERAPEUTICO,
  hotelaria: HOTELARIA,
};

export function getPerguntas(tipo: TipoAmbiente): Pergunta[] {
  return POR_TRILHA[trilhaDe(tipo)];
}
