import { test } from "node:test";
import assert from "node:assert/strict";
import { ANAMNESE_RESIDENCIAL, getPerguntas, MOMENTO_VIDA_RESIDENCIAL, perguntaVisivel, prepararRespostasQuestionario } from "./questionario";
import { respostasLegiveis } from "./prompts";

const opcoes = (id: string) => ANAMNESE_RESIDENCIAL.find((p) => p.id === id)?.opcoes ?? [];

test("residencial mantém home office e trabalho", () => {
  assert.ok(opcoes("anam01").includes("Home office"));
  assert.ok(opcoes("anam02").includes("Trabalho e produtividade"));
});

test("residencial remove ambientes comerciais", () => {
  assert.ok(!opcoes("anam01").includes("Escritório corporativo"));
  assert.ok(!opcoes("anam01").includes("Espaço comercial"));
  assert.ok(!opcoes("anam02").includes("Exposição de produtos e vendas"));
  assert.ok(!opcoes("anam06").includes("Imóvel comercial alugado"));
});

test("residencial reduz perguntas sem alterar outras trilhas e mantém os cinco elementos", () => {
  assert.equal(ANAMNESE_RESIDENCIAL.some(p => p.id === "anam08"), false);
  assert.equal(getPerguntas("corporativo").some(p => p.id === "anam08"), true);
  assert.ok(ANAMNESE_RESIDENCIAL.length < getPerguntas("hotelaria").filter(p => p.id.startsWith("anam") || p.id.includes("Janela")).length);
  for (const id of ["anam45", "anam46", "anam47", "anam48", "anam49", "anam34", "anam41", "anam42", "anam43", "anam44"]) assert.ok(ANAMNESE_RESIDENCIAL.some(p => p.id === id));
});

test("momento de vida, emoções, sensações desejadas e áreas são múltipla escolha residencial", () => {
  for (const id of ["mudancasVida", "sentimentosAtuais", "sentimentosDesejados", "areasVida"]) {
    const p = getPerguntas("residencial").find(p => p.id === id);
    assert.equal(p?.tipo, "checkbox");
    assert.equal(getPerguntas("corporativo").some(p => p.id === id), false);
  }
  const areas = MOMENTO_VIDA_RESIDENCIAL.find(p => p.id === "areasVida")?.opcoes;
  for (const area of ["Trabalho", "Carreira", "Amor-próprio e autoestima", "Relacionamento amoroso", "Espiritualidade"]) assert.ok(areas?.includes(area));
});

test("não envia nem interpreta emoções pessoais sem consentimento", () => {
  const respostas = { consentimentoMomentoVida: "Prefiro não compartilhar", sentimentosAtuais: ["Ansioso(a) ou preocupado(a)"], areasVida: ["Carreira"], anam01: "Home office" };
  assert.deepEqual(prepararRespostasQuestionario("residencial", respostas), { consentimentoMomentoVida: "Prefiro não compartilhar", anam01: "Home office" });
  assert.equal(respostasLegiveis("residencial", respostas).includes("Ansioso"), false);
  const p = MOMENTO_VIDA_RESIDENCIAL.find(p => p.id === "sentimentosAtuais");
  assert.ok(p);
  assert.equal(perguntaVisivel(p, respostas), false);
});

test("IA recebe todas as áreas e sentimentos compartilhados com consentimento", () => {
  const respostas = { consentimentoMomentoVida: "Sim, autorizo o uso dessas respostas no meu dossiê", sentimentosAtuais: ["Ansioso(a) ou preocupado(a)"], sentimentosDesejados: ["Calmo(a) e tranquilo(a)"], areasVida: ["Carreira", "Espiritualidade"], mudancasVida: ["Mudança de trabalho ou carreira"] };
  assert.deepEqual(prepararRespostasQuestionario("residencial", respostas), respostas);
  const texto = respostasLegiveis("residencial", respostas);
  for (const valor of ["Carreira; Espiritualidade", "Ansioso(a)", "Calmo(a)", "Mudança de trabalho"]) assert.ok(texto.includes(valor));
});
