// @ts-ignore bun test runner types are not installed
import { test, expect } from "bun:test";
import { REGISTRATION_OPTIONS, SUPPLIER_OPTION } from "./registration-options";
import { categoryHome } from "./account";

test("hero registration offers the three profiles the site asks for", () => {
  expect(REGISTRATION_OPTIONS.map((o) => o.label)).toEqual([
    "Usuário da plataforma",
    "Profissional de arquitetura ou design",
    "Creator / afiliado",
  ]);
});

test("each offered profile leads to its own panel", () => {
  expect(categoryHome(REGISTRATION_OPTIONS[0].category)).toBe("/painel");
  expect(categoryHome(REGISTRATION_OPTIONS[1].category)).toBe("/profissional");
  expect(categoryHome(REGISTRATION_OPTIONS[2].category)).toBe("/afiliado");
});

test("offered profiles use the auth search values", () => {
  expect(REGISTRATION_OPTIONS.map((o) => o.perfil).sort()).toEqual(["afiliado", "cliente", "profissional"]);
});

test("supplier registration stays reachable", () => {
  expect(SUPPLIER_OPTION.perfil).toBe("fornecedor");
  expect(categoryHome(SUPPLIER_OPTION.category)).toBe("/fornecedor");
});
