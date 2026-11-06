// Pure booking logic (no browser APIs) — shared by the store and tests.
export type Status = "Waiting" | "In Consultation" | "Completed" | "Cancelled" | "No-show";

export interface Appointment {
  id: string;
  token: string;
  patientName: string;
  age: number;
  gender: string;
  mobile: string;
  deptId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  reason: string;
  status: Status;
  createdAt: number;
}

export const SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

/** A slot is taken when an active (non-cancelled) appointment exists for the same doctor, date and time. */
export function isSlotTaken(list: Appointment[], doctorId: string, date: string, time: string) {
  return list.some(
    (a) => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== "Cancelled",
  );
}

/** Next token number for a doctor on a date: count of all bookings that day + 1 (cancelled tokens are never reused). */
export function nextToken(list: Appointment[], doctorId: string, date: string, prefix: string) {
  const n = list.filter((a) => a.doctorId === doctorId && a.date === date).length + 1;
  return `${prefix}-${String(n).padStart(3, "0")}`;
}

export function todayISO(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}
