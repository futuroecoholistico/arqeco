// @ts-ignore bun test runner types are not installed
import { describe, expect, it } from "bun:test";
import { addBusinessDays, journeyStates, nextAction } from "./project-journey";

describe("prazo em dias úteis", () => {
  it("15 dias úteis a partir de segunda 02/11/2026 caem em segunda 23/11/2026", () => {
    expect(addBusinessDays(new Date("2026-11-02T00:00:00Z"), 15).toISOString().slice(0, 10)).toBe("2026-11-23");
  });
  it("pula feriados cadastrados", () => {
    expect(addBusinessDays(new Date("2026-11-02T00:00:00Z"), 15, ["2026-11-20"]).toISOString().slice(0, 10)).toBe("2026-11-24");
  });
  it("pula sábados e domingos", () => {
    expect(addBusinessDays(new Date("2026-11-06T00:00:00Z"), 1).toISOString().slice(0, 10)).toBe("2026-11-09");
  });
});

describe("próxima ação", () => {
  it("pede agendamento antes de tudo", () => {
    expect(nextAction({ status: "BRIEFING_PENDING", hasMeeting: false, briefingSubmitted: false, meetingDone: false })).toMatch(/Agende/);
  });
  it("só entra em desenvolvimento após a reunião realizada", () => {
    const p = { status: "BRIEFING_COMPLETED", hasMeeting: true, briefingSubmitted: true, meetingDone: false };
    expect(nextAction(p)).toMatch(/Prepare-se/);
    expect(journeyStates(p)[4]).toBe("pending");
    expect(journeyStates({ ...p, meetingDone: true })[4]).toBe("in_progress");
  });
});
