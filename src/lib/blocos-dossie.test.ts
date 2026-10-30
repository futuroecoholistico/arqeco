import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { organizarBlocosDossie } from "./blocos-dossie";
import type { ResultadoDiagnostico } from "@/domain/types";

const resultado = { recomendacoesPrioritarias: [], dimensoes: {}, leituraElemental: [], planoAcao: {} } as unknown as ResultadoDiagnostico;
describe("Campos de soluções do dossiê", () => {
  test("não usa o plano de ação como conteúdo dos blocos", () => {
    const leitura = { ...resultado, planoAcao: { sete_dias: [{ acao: "Adicionar ametista e lavanda", descricao: "Ajustar iluminação" }], trinta_dias: [], noventa_dias: [] } };
    assert.equal(organizarBlocosDossie(leitura).every(c => c.itens.length === 0), true);
  });
  test("separa os oito campos solicitados", () => {
    assert.deepEqual(organizarBlocosDossie(resultado).map(c => c.id), ["iluminacao", "ventilacao", "cores", "aromas", "cristais", "frequencias", "biofilia", "rituais"]);
  });
  test("cristais e aromas preservam a aplicação concreta registrada", () => {
    const leitura = { ...resultado, leituraElemental: [{ elemento: "Éter", pontuacao: 30, interpretacao: "", impacto: "", sugestoesEquilibrio: ["Colocar ametista na prateleira do canto de meditação.", "Aroma de lavanda no quarto, se tolerado."] }] };
    assert.equal(organizarBlocosDossie(leitura).find(c => c.id === "cristais")?.itens[0].texto, "Colocar ametista na prateleira do canto de meditação.");
    assert.equal(organizarBlocosDossie(leitura).find(c => c.id === "aromas")?.itens[0].texto, "Aroma de lavanda no quarto, se tolerado.");
  });
  test("não inventa recomendações para campo sem dados e não modifica a análise", () => {
    const copia = JSON.stringify(resultado);
    assert.equal(organizarBlocosDossie(resultado).every(c => c.itens.length === 0), true);
    assert.equal(JSON.stringify(resultado), copia);
  });
});