// @ts-ignore bun test runner types are not installed
import { describe, expect, it } from "bun:test";
import { affiliateSchema, maskPhone } from "@/components/PartnerApplication";

const base = { display_name: "Ana Souza", phone: "(11) 99999-9999", role: "Afiliado(a)", other: "", website: "" };

describe("cadastro de afiliado", () => {
  it("aceita só nome, WhatsApp e função, sem CPF", () => expect(affiliateSchema.safeParse(base).success).toBe(true));
  it("exige WhatsApp com DDD", () => expect(affiliateSchema.safeParse({ ...base, phone: "99999-9999" }).success).toBe(false));
  it("exige função", () => expect(affiliateSchema.safeParse({ ...base, role: "" }).success).toBe(false));
  it("exige 'Qual?' quando a função é Outro", () => {
    expect(affiliateSchema.safeParse({ ...base, role: "Outro" }).success).toBe(false);
    expect(affiliateSchema.safeParse({ ...base, role: "Outro", other: "Paisagista" }).success).toBe(true);
  });
  it("aplica a máscara do WhatsApp", () => expect(maskPhone("11999999999")).toBe("(11) 99999-9999"));
});
