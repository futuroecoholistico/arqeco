// @ts-ignore bun test runner types are not installed
import { test, expect } from "bun:test";
import { categoryHome, safeDestination } from "./account";
test("clients use only the client panel", () => expect(categoryHome("client")).toBe("/painel"));
test("architects and designers use the professional panel", () => expect(categoryHome("professional")).toBe("/profissional"));
test("suppliers use the supplier panel", () => expect(categoryHome("supplier")).toBe("/fornecedor"));
test("affiliate creators use the affiliate panel", () => expect(categoryHome("affiliate")).toBe("/afiliado"));
test("missing category requires registration completion", () => expect(categoryHome(null)).toBe("/minha-conta"));
test("redirect cannot leave the platform", () => { expect(safeDestination("//evil.example")).toBeNull(); expect(safeDestination("/\\evil.example")).toBeNull(); expect(safeDestination("/diagnostico")).toBe("/diagnostico"); });