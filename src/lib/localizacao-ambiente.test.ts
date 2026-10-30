import { test } from "node:test";
import assert from "node:assert/strict";
import { dadosLocalizacao, confortoAmbientalSchema } from "./localizacao-ambiente";
import { getPerguntas, perguntaVisivel } from "./questionario";

test("endereço do prédio e rua da janela permanecem separados", () => {
  assert.deepEqual(dadosLocalizacao({ enderecoImovel: " Rua A, 10, Curitiba ", ruaJanela: " Rua B ", consultaLocalizacao: "Sim, autorizo a consulta" }), { endereco: "Rua A, 10, Curitiba", ruaJanela: "Rua B", consultar: true });
});
test("não consulta endereço sem autorização", () => {
  assert.equal(dadosLocalizacao({ enderecoImovel: "Rua A" }).consultar, false);
});
test("todas as trilhas perguntam a rua da janela quando diferente do endereço", () => {
  for (const tipo of ["residencial", "corporativo", "comercial", "hotelaria", "terapeutico"] as const) {
    const pergunta = getPerguntas(tipo).find(p => p.id === "ruaJanela");
    assert.ok(pergunta);
    assert.equal(perguntaVisivel(pergunta, { destinoJanela: "Para outra rua" }), true);
    assert.equal(perguntaVisivel(pergunta, { destinoJanela: "Não há janela externa" }), false);
  }
});
test("análise ambiental requer luz natural, ventilação e conforto térmico", () => {
  assert.equal(confortoAmbientalSchema.safeParse({ iluminacaoNatural: "Luz indireta", orientacoesInternas: [], limitacoes: [] }).success, false);
  assert.equal(confortoAmbientalSchema.safeParse({ iluminacaoNatural: "Luz indireta", ventilacaoNatural: "Uma abertura", confortoTermico: "Calor relatado", orientacoesInternas: ["Não bloquear a janela"], limitacoes: ["Direção não confirmada"] }).success, true);
});