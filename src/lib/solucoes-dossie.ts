import type { ResultadoDiagnostico } from "@/domain/types";
import { TABELA_AMBIENTES, TABELA_ANIMAIS, TABELA_AROMAS, TABELA_CROMOTERAPIA, TABELA_FOGO, TABELA_GEOMETRIA, TABELA_SUSTENTABILIDADE } from "./tabelas-eco";

// Expand only existing citations; never rewrite or persist the saved analysis.
const fontes = [TABELA_CROMOTERAPIA, TABELA_AMBIENTES, TABELA_GEOMETRIA, TABELA_ANIMAIS, TABELA_AROMAS, TABELA_SUSTENTABILIDADE, TABELA_FOGO];
const secoes = new Map<number, string[][]>();
for (const fonte of fontes) {
  for (const bloco of fonte.split(/(?=TABELA \d+)/)) {
    const numero = bloco.match(/^TABELA (\d+)/)?.[1];
    if (!numero) continue;
    const linhas = bloco.split("\n").filter(linha => linha.startsWith("|")).map(linha => linha.split("|").slice(1, -1).map(celula => celula.trim()));
    secoes.set(Number(numero), linhas.filter(linha => !["Elemento", "Ambiente", "Geometria"].includes(linha[0] ?? "")));
  }
}

const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const elementos = ["terra", "agua", "fogo", "ar", "eter"];

function conteudo(numero: number, contexto: string): string {
  const linhas = secoes.get(numero);
  if (!linhas?.length) return "usar uma solução específica da metodologia, adequada ao ambiente";
  const texto = normalizar(contexto);
  const elemento = elementos.find(item => new RegExp(`\\b${item}\\b`).test(texto));
  const porElemento = [2, 5, 7, 8].includes(numero) && elemento
    ? linhas.filter(linha => normalizar((numero === 8 ? linha[3] : linha[0]) ?? "") === elemento)
    : [];
  const porItem = linhas.filter(linha => texto.includes(normalizar(linha[0] ?? "")));
  const selecionadas = porElemento.length ? porElemento : porItem.length ? porItem : linhas;
  return selecionadas.map(linha => {
    switch (numero) {
      case 2: return `${linha[0]}: cores ${linha[1]}; aplicação: ${linha[5]}`;
      case 3: return `${linha[0]}: cores ${linha[2]}; aplicação: ${linha[3]}`;
      case 4: return `${linha[0]}: aplicação em ${linha[2]}`;
      case 5: return `${linha[0]}: geometria ${linha[1]}`;
      case 6: return `${linha[0]}: representação em ${linha[2]}`;
      case 7: return `${linha[0]}: símbolos ${linha[1]}; materiais e decoração: ${linha[2]}`;
      case 8: return `aromas de ${linha[1]} para ${linha[3]}, em ${linha[2]}`;
      case 9: return `${linha[0]}: aromas de ${linha[1]}`;
      case 10: return `${linha[0]}: ${linha[1]}`;
      case 11: return `${linha[0]}: ${linha[linha.length - 1]}`;
      default: return linha.join(": ");
    }
  }).join("; ");
}

export function expandirReferencias(texto: string, contexto = ""): string {
  return texto.replace(/(?:\b(?:conforme|segundo|consulte|consultar|veja|ver)\s+(?:a\s+)?)?tabelas?\s*(?:n[º°o.]?\s*)?(\d+(?:\s*(?:,|e|\/|–|-)\s*\d+)*)/gi, (_citacao, numeros: string) => {
    const solucoes = numeros.match(/\d+/g)?.map(numero => conteudo(Number(numero), `${contexto} ${texto}`)) ?? [];
    return solucoes.join("; ");
  });
}

export function prepararSolucoesDossie(resultado: ResultadoDiagnostico): ResultadoDiagnostico {
  function transformar(valor: unknown, contexto = ""): unknown {
    if (typeof valor === "string") return expandirReferencias(valor, contexto);
    if (Array.isArray(valor)) return valor.map(item => transformar(item, contexto));
    if (valor && typeof valor === "object") {
      const objeto = valor as Record<string, unknown>;
      const contextoLocal = `${contexto} ${Object.values(objeto).filter(item => typeof item === "string").join(" ")}`;
      return Object.fromEntries(Object.entries(objeto).map(([chave, item]) => [chave, chave === "imagemTransformadaUrl" ? item : transformar(item, `${contextoLocal} ${chave}`)]));
    }
    return valor;
  }
  return transformar(resultado) as ResultadoDiagnostico;
}