import { test } from "node:test";
import assert from "node:assert/strict";
import { montarMoodboard } from "./moodboard-dossie";
import type { ResultadoDiagnostico } from "@/domain/types";

const base = { recomendacoesPrioritarias: [], leituraElemental: [] } as unknown as ResultadoDiagnostico;

test("extrai itens e paleta do conteúdo do dossiê", () => {
  const r = { ...base, especificacoesImagem: [{ item: "Drusa de quartzo branco", cor: "branco", material: "", localizacao: "aparador", observacao: "" }],
    camposAmbiente: [{ campo: "aromas", necessidade: "", orientacoes: ["Difusor com aroma de alecrim", "Manta terracota no sofá"] }] } as ResultadoDiagnostico;
  const m = montarMoodboard(r);
  const nomes = m.itens.map(i => i.nome);
  assert.ok(nomes.includes("Quartzo branco"));
  assert.ok(nomes.includes("Aroma de alecrim"));
  assert.ok(nomes.includes("Têxteis naturais"));
  assert.ok(m.paleta.some(p => p.nome === "Terracota"));
});

test("dossiê sem indicações não inventa moodboard", () => {
  const m = montarMoodboard(base);
  assert.equal(m.itens.length, 0);
  assert.equal(m.paleta.length, 0);
});
