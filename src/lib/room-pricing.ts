// Mirrors prepare_service_booking_rooms (server is the source of truth for charged totals).
export type ContractedRoom = { id: string; key: string; name: string; area_m2: number };

export const DEFAULT_AREA_LIMIT_M2 = 25;
export const DEFAULT_STEP_M2 = 10;
export const DEFAULT_STEP_CENTS = 15000;

export function roomOversizeCents(area: number, limit = DEFAULT_AREA_LIMIT_M2, step = DEFAULT_STEP_M2, stepCents = DEFAULT_STEP_CENTS): number {
  if (!Number.isFinite(area) || area <= limit) return 0;
  return Math.ceil((area - limit) / step) * stepCents;
}

export function includedRooms(roomsLabel: string | null | undefined): number {
  const m = roomsLabel?.match(/\d+/);
  return m ? Number(m[0]) : 1;
}
