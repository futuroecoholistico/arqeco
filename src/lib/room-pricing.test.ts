// @ts-ignore bun test runner types are not installed
import { describe, expect, it } from "bun:test";
import { includedRooms, roomOversizeCents } from "./room-pricing";

describe("excedente de metragem", () => {
  it("até 25 m² não cobra excedente", () => expect(roomOversizeCents(25)).toBe(0));
  it("26 m² cobra uma faixa de R$ 150", () => expect(roomOversizeCents(26)).toBe(15000));
  it("35 m² ainda é uma faixa", () => expect(roomOversizeCents(35)).toBe(15000));
  it("36 m² cobra duas faixas (R$ 300)", () => expect(roomOversizeCents(36)).toBe(30000));
  it("lê ambientes incluídos do plano", () => expect(includedRooms("4 ambientes")).toBe(4));
});
