import { safeDestination } from "./account";

export function isProjectPurchase(next?: string) {
  const path = safeDestination(next);
  return !!path && path.split("?")[0] === "/contratar";
}

export function canScheduleBooking(booking: { payment_status: string; status: string }) {
  return booking.payment_status === "paid" && booking.status === "confirmed";
}