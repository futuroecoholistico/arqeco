import type { ResultadoDiagnostico } from "@/domain/types";

export type CategoriaMood = "cristal" | "tecido" | "geometria" | "planta" | "aroma" | "luz" | "material" | "som";

// Catálogo visual: termo encontrado no dossiê → ilustração e cor representativa.
const CATALOGO: { termo: RegExp; nome: string; categoria: CategoriaMood; cor: string }[] = [
  { termo: /quartzo (branco|transparente|cristal)|cristal de rocha/i, nome: "Quartzo branco", categoria: "cristal", cor: "#e9ecef" },
  { termo: /quartzo rosa/i, nome: "Quartzo rosa", categoria: "cristal", cor: "#e8b4bc" },
  { termo: /quartzo fum[êe]/i, nome: "Quartzo fumê", categoria: "cristal", cor: "#6b5a4e" },
  { termo: /ametista/i, nome: "Ametista", categoria: "cristal", cor: "#8e6bb0" },
  { termo: /citrino/i, nome: "Citrino", categoria: "cristal", cor: "#e3b23c" },
  { termo: /turmalina negra/i, nome: "Turmalina negra", categoria: "cristal", cor: "#2b2b2b" },
  { termo: /selenita/i, nome: "Selenita", categoria: "cristal", cor: "#f4f1ea" },
  { termo: /cornalina/i, nome: "Cornalina", categoria: "cristal", cor: "#c8553d" },
  { termo: /[áa]gua-marinha/i, nome: "Água-marinha", categoria: "cristal", cor: "#8fc9d6" },
  { termo: /hematita/i, nome: "Hematita", categoria: "cristal", cor: "#4a4a4f" },
  { termo: /jaspe/i, nome: "Jaspe vermelho", categoria: "cristal", cor: "#9c3d2e" },
  { termo: /manta|almofada|tapete|cortina|linho|algod[ãa]o|tecido/i, nome: "Têxteis naturais", categoria: "tecido", cor: "#c07a52" },
  { termo: /flor da vida/i, nome: "Flor da Vida", categoria: "geometria", cor: "#b08d57" },
  { termo: /metatron/i, nome: "Cubo de Metatron", categoria: "geometria", cor: "#b08d57" },
  { termo: /fibonacci|espiral/i, nome: "Espiral de Fibonacci", categoria: "geometria", cor: "#b08d57" },
  { termo: /mandala|geometria sagrada/i, nome: "Geometria sagrada", categoria: "geometria", cor: "#b08d57" },
  { termo: /costela-de-ad[ãa]o|jiboia|samambaia|esp[aá]da-de-s[ãa]o-jorge|zamioculca|planta|biof[ií]li|parede viva/i, nome: "Biofilia", categoria: "planta", cor: "#50613c" },
  { termo: /alecrim/i, nome: "Aroma de alecrim", categoria: "aroma", cor: "#7a9a5b" },
  { termo: /lavanda/i, nome: "Aroma de lavanda", categoria: "aroma", cor: "#9f8fc4" },
  { termo: /cipreste/i, nome: "Aroma de cipreste", categoria: "aroma", cor: "#4f6b4a" },
  { termo: /s[âa]ndalo/i, nome: "Aroma de sândalo", categoria: "aroma", cor: "#a7754d" },
  { termo: /laranja|bergamota|lim[ãa]o|citr[ou]s/i, nome: "Aroma cítrico", categoria: "aroma", cor: "#e59a3a" },
  { termo: /eucalipto|hortel[ãa]/i, nome: "Aroma de eucalipto", categoria: "aroma", cor: "#6fa58f" },
  { termo: /lumin[aá]ria|luz quente|abajur|pendente|ilumina[çc][ãa]o/i, nome: "Luz quente", categoria: "luz", cor: "#e8c070" },
  { termo: /madeira/i, nome: "Madeira natural", categoria: "material", cor: "#8b6440" },
  { termo: /cer[âa]mica|argila|terracota/i, nome: "Cerâmica e argila", categoria: "material", cor: "#b5623e" },
  { termo: /pedra|m[áa]rmore/i, nome: "Pedra natural", categoria: "material", cor: "#a39b8f" },
  { termo: /fibra|palha|vime|junco|r[áa]fia/i, nome: "Fibras naturais", categoria: "material", cor: "#c9a86a" },
  { termo: /sons da natureza|paisage[mn] sonora|\bhz\b|solfeggio|sino|ta[çc]a tibetana/i, nome: "Paisagem sonora", categoria: "som", cor: "#7d8f9c" },
];

const CORES: { termo: RegExp; nome: string; hex: string }[] = [
  { termo: /terracota/i, nome: "Terracota", hex: "#b5623e" },
  { termo: /terros/i, nome: "Terroso", hex: "#8b6440" },
  { termo: /bege|areia|cru\b/i, nome: "Areia", hex: "#d9c7a7" },
  { termo: /off[- ]?white|branco/i, nome: "Off-white", hex: "#f2eee6" },
  { termo: /verde[- ]oliva|oliva/i, nome: "Verde oliva", hex: "#6b7340" },
  { termo: /verde[- ]s[áa]lvia|s[áa]lvia/i, nome: "Verde sálvia", hex: "#9caf88" },
  { termo: /verde/i, nome: "Verde", hex: "#50613c" },
  { termo: /azul[- ]turquesa|turquesa/i, nome: "Turquesa", hex: "#3fa7a3" },
  { termo: /azul[- ]marinho|marinho/i, nome: "Azul marinho", hex: "#1f3a5f" },
  { termo: /azul/i, nome: "Azul", hex: "#4a78a8" },
  { termo: /amarelo|mostarda|dourad/i, nome: "Amarelo", hex: "#e3b23c" },
  { termo: /laranja/i, nome: "Laranja", hex: "#e07b39" },
  { termo: /vermelh/i, nome: "Vermelho", hex: "#a8382c" },
  { termo: /rosa/i, nome: "Rosa", hex: "#e2a9b1" },
  { termo: /lil[áa]s|violeta|roxo/i, nome: "Violeta", hex: "#8e6bb0" },
  { termo: /marrom|chocolate|caf[ée]/i, nome: "Marrom", hex: "#5c4033" },
  { termo: /cinza|grafite/i, nome: "Cinza", hex: "#8a8a85" },
  { termo: /preto/i, nome: "Preto", hex: "#24271f" },
];

export type ItemMoodboard = { nome: string; categoria: CategoriaMood; cor: string; aplicacao: string };

function textosDoDossie(r: ResultadoDiagnostico) {
  const t: string[] = [];
  for (const e of r.especificacoesImagem ?? []) t.push(`${e.item} ${e.cor} ${e.material} — ${e.localizacao}`);
  for (const c of r.camposAmbiente ?? []) t.push(...(c.orientacoes ?? []));
  for (const rec of r.recomendacoesPrioritarias ?? []) t.push(rec.oQueFazer);
  for (const el of r.leituraElemental ?? []) t.push(...(el.sugestoesEquilibrio ?? []));
  return t.filter(Boolean);
}

/** Moodboard derivado só do conteúdo do dossiê (adaptador puro, não altera dados salvos). */
export function montarMoodboard(r: ResultadoDiagnostico, limite = 12) {
  const textos = textosDoDossie(r);
  const itens: ItemMoodboard[] = [];
  const vistos = new Set<string>();
  for (const texto of textos) {
    for (const c of CATALOGO) {
      if (vistos.has(c.nome) || !c.termo.test(texto)) continue;
      vistos.add(c.nome);
      itens.push({ nome: c.nome, categoria: c.categoria, cor: c.cor, aplicacao: texto.length > 110 ? `${texto.slice(0, 107)}…` : texto });
    }
  }
  const paleta: { nome: string; hex: string }[] = [];
  const todo = textos.join(" \n ");
  for (const cor of CORES) {
    if (paleta.length >= 6) break;
    if (cor.termo.test(todo) && !paleta.some(p => p.hex === cor.hex)) paleta.push({ nome: cor.nome, hex: cor.hex });
  }
  return { itens: itens.slice(0, limite), paleta };
}
