// @ts-ignore bun test runner types are not installed
import { test, expect } from "bun:test";
import { isProjectPurchase, canScheduleBooking } from "./booking-flow";

test("project purchase bypasses category selection", () => {
  expect(isProjectPurchase("/contratar?plano=123&opcao=456")).toBe(true);
  expect(isProjectPurchase("/profissional")).toBe(false);
  expect(isProjectPurchase("//external/contratar")).toBe(false);
});
test("meeting is available only after confirmed payment", () => {
  expect(canScheduleBooking({ payment_status: "paid", status: "confirmed" })).toBe(true);
  expect(canScheduleBooking({ payment_status: "pending", status: "payment_processing" })).toBe(false);
  expect(canScheduleBooking({ payment_status: "not_started", status: "awaiting_payment" })).toBe(false);
  expect(canScheduleBooking({ payment_status: "paid", status: "cancelled" })).toBe(false);
});