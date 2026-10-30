import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EnviarFeedbackInput } from "./feedback.functions";

describe("EnviarFeedbackInput", () => {
  it("aceita mensagem válida com nota opcional", () => {
    const parsed = EnviarFeedbackInput.parse({ mensagem: "Amei o dossiê!", nota: 5 });
    assert.equal(parsed.mensagem, "Amei o dossiê!");
    assert.equal(parsed.nota, 5);
  });

  it("rejeita mensagem muito curta", () => {
    assert.throws(() => EnviarFeedbackInput.parse({ mensagem: "ok" }));
  });

  it("rejeita mensagem acima de 2000 caracteres", () => {
    assert.throws(() => EnviarFeedbackInput.parse({ mensagem: "a".repeat(2001) }));
  });

  it("rejeita nota fora de 1 a 5", () => {
    assert.throws(() => EnviarFeedbackInput.parse({ mensagem: "Ótimo!", nota: 9 }));
  });
});
