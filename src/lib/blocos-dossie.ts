import type { ResultadoDiagnostico } from "@/domain/types";

export const CAMPOS_DOSSIE = [
  { id: "iluminacao", titulo: "Iluminação", termos: /ilumina|lumin[aá]ria|l[aâ]mpada|luz|led\b|circadian/i },
  { id: "ventilacao", titulo: "Ventilação", termos: /ventila|circula[çc][aã]o de ar|qualidade do ar|resfriamento|exaust|renova[çc][aã]o do ar/i },
  { id: "cores", titulo: "Cores e elementos", termos: /\bcor\b|cores|cromo|paleta|tons|elemento|geometria|mandala|flor da vida|textur|tecido|madeira|cer[aâ]mica/i },
  { id: "aromas", titulo: "Aromas", termos: /aroma|[óo]leo essencial|[óo]leos essenciais|difusor|lavanda|alecrim|cipreste|s[aâ]ndalo|incenso/i },
  { id: "cristais", titulo: "Cristais", termos: /crista[lí]|cristais|ametista|quartzo|turmalina|selenita|citrino/i },
  { id: "frequencias", titulo: "Frequências de cura", termos: /frequ[eê]ncia|solfeggio|binaura|paisage[mn] sonora|paisagens sonoras|sons da natureza|\bhz\b|m[úu]sica|ac[úu]stic/i },
  { id: "biofilia", titulo: "Biofilia", termos: /biof[ií]li|planta|jardim|paisagismo|vegeta|parede viva|natureza/i },
  { id: "rituais", titulo: "Rituais", termos: /ritua|medita|respira|contempla|intencional|autocuidado|pausa|altar/i },
] as const;

export function organizarBlocosDossie(resultado: ResultadoDiagnostico) {
  const orientacoes: { texto: string; contexto: string; origem: string }[] = [];
  for (const item of resultado.recomendacoesPrioritarias ?? []) {
    orientacoes.push({ texto: item.oQueFazer, contexto: `${item.principio} ${item.tipoIntervencao}`, origem: `${item.prioridade} · ${item.prazo}` });
  }
  for (const dimensao of Object.values(resultado.dimensoes ?? {})) {
    for (const texto of dimensao.recomendacoes ?? []) orientacoes.push({ texto, contexto: "", origem: "Leitura das dimensões" });
  }
  for (const elemento of resultado.leituraElemental ?? []) {
    for (const texto of elemento.sugestoesEquilibrio ?? []) orientacoes.push({ texto, contexto: "", origem: `Equilíbrio de ${elemento.elemento}` });
  }
  for (const eixo of resultado.leituraEspecifica?.eixos ?? []) {
    for (const texto of eixo.recomendacoes ?? []) orientacoes.push({ texto, contexto: "", origem: eixo.nome });
  }
  return CAMPOS_DOSSIE.map(campo => {
    const especifico = resultado.camposAmbiente?.find(item => item.campo === campo.id);
    if (especifico) return { ...campo, necessidade: especifico.necessidade, itens: (especifico.orientacoes ?? []).map(texto => ({ texto, contexto: "", origem: "Aplicação recomendada" })) };
    const vistos = new Set<string>();
    const itens = orientacoes.filter(item => {
      const texto = item.texto?.trim();
      if (!texto || !campo.termos.test(`${item.contexto} ${texto}`) || vistos.has(texto)) return false;
      vistos.add(texto);
      return true;
    });
    return { ...campo, necessidade: "", itens };
  });
}