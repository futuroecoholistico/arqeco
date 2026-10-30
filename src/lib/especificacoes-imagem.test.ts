import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEspecificacoesImagem } from "./especificacoes-imagem";

test("preserva item, cor e localização da especificação visual", () => {
  const itens = parseEspecificacoesImagem(JSON.stringify({ itens: [{ item: "Almofada", cor: "Azul turquesa", material: "Tecido de composição não identificável", localizacao: "No sofá à direita", observacao: "Inserida no Depois" }] }));
  assert.deepEqual(itens[0], { item: "Almofada", cor: "Azul turquesa", material: "Tecido de composição não identificável", localizacao: "No sofá à direita", observacao: "Inserida no Depois" });
});
test("rejeita inventário sem localização em vez de salvar especificação incompleta", () => {
  assert.throws(() => parseEspecificacoesImagem('{"itens":[{"item":"Drusa de ametista","cor":"Roxo","material":"Cristal","observacao":""}]}'));
});