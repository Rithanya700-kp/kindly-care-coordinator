import { useEffect, useState, useCallback } from "react";
import {
  Activity, Baby, Bone, Brain, Ear, HeartPulse, Stethoscope, Sparkles, type LucideIcon,
} from "lucide-react";
import { type Appointment, type Status, isSlotTaken, nextToken, todayISO, SLOTS } from "./booking";

export interface Department {
  id: string;
  name: string;
  prefix: string;
  icon: LucideIcon;
  blurb: string;
  sample?: boolean;
}
export interface Doctor {
  id: string;
  name: string;
  deptId: string;
  days: string;
  hours: string;
  sample?: boolean;
}

export const DEPARTMENTS: Department[] = [
  { id: "gm", name: "General Medicine", prefix: "GM", icon: Stethoscope, blurb: "Diagnosis and care for common and chronic adult illnesses." },
  { id: "gyn", name: "Gynaecology", prefix: "GY", icon: Activity, blurb: "Women's health, pregnancy care and reproductive wellness." },
  { id: "ortho", name: "Orthopaedics", prefix: "OR", icon: Bone, blurb: "Bones, joints, fractures, sports injuries and spine care." },
  { id: "paed", name: "Paediatrics", prefix: "PD", icon: Baby, blurb: "Child health, growth checks, vaccinations and newborn care." },
  { id: "derm", name: "Dermatology", prefix: "DM", icon: Sparkles, blurb: "Skin, hair and nail conditions for all ages." },
  { id: "ent", name: "ENT", prefix: "EN", icon: Ear, blurb: "Ear, nose and throat conditions and hearing care." },
  { id: "cardio", name: "Cardiology", prefix: "CD", icon: HeartPulse, blurb: "Heart health, ECG review and cardiac consultations.", sample: true },
  { id: "neuro", name: "Neurology", prefix: "NE", icon: Brain, blurb: "Brain, nerve and headache consultations.", sample: true },
];

const raw: Record<string, string[]> = {
  gm: ["Dr. Ravi B.N", "Dr. Shiva Kumar K.M", "Dr. Shashikantha", "Dr. Rajashekar H.K", "Dr. Ramesha S.S"],
  gyn: ["Dr. Mahendra G", "Dr. Ravindra S Pukale", "Dr. Mamatha K", "Dr. Ramesh Babu", "Dr. Nirmala Doraiswamy C.K"],
  ortho: ["Dr. Mahesh D.V", "Dr. Harish K", "Dr. Bellad S.H", "Dr. Vishwanath C", "Dr. Shankara K"],
  paed: ["Dr. Mahendrappa K.B", "Dr. C Anitha", "Dr. Sunil Kumar P", "Dr. Prasanna Kumar D.G", "Dr. Madhava Kamath K"],
  derm: ["Dr. Yogesh D", "Dr. Shradha Gurudev", "Dr. Rahul H.V"],
  ent: ["Dr. Ravi K.S", "Dr. Nitha", "Dr. Sushma Nayak", "Dr. Pragathi B.S"],
  cardio: ["Dr. Sample Cardiologist A", "Dr. Sample Cardiologist B"],
  neuro: ["Dr. Sample Neurologist A", "Dr. Sample Neurologist B"],
};
const DAYS = ["Mon – Sat", "Mon, Wed, Fri", "Tue, Thu, Sat", "Mon – Fri"];
const HOURS = ["9:00 AM – 1:00 PM", "9:00 AM – 4:30 PM", "2:00 PM – 4:30 PM"];

export const DOCTORS: Doctor[] = Object.entries(raw).flatMap(([deptId, names]) =>
  names.map((name, i) => ({
    id: `${deptId}-${i + 1}`,
    name,
    deptId,
    days: DAYS[i % DAYS.length]!,
    hours: HOURS[i % HOURS.length]!,
    sample: deptId === "cardio" || deptId === "neuro",
  })),
);

export const dept = (id: string) => DEPARTMENTS.find((d) => d.id === id);
export const doctor = (id: string) => DOCTORS.find((d) => d.id === id);

// ---------- localStorage store ----------
interface State {
  appointments: Appointment[];
  unavailable: string[]; // doctor ids marked unavailable by admin
  myIds: string[]; // ids booked from this browser
}
const KEY = "smartcare-v1";
const EVT = "smartcare-update";

function seed(): State {
  const t = todayISO();
  const list: Appointment[] = [];
  const people = [
    ["Lakshmi N", 42, "Female", "9800000001", "gm-1", "Fever and body ache"],
    ["Manjunath R", 55, "Male", "9800000002", "gm-1", "BP follow-up"],
    ["Kavya S", 29, "Female", "9800000003", "gyn-3", "Routine check-up"],
    ["Raghav P", 8, "Male", "9800000004", "paed-2", "Cough and cold"],
    ["Suresh K", 61, "Male", "9800000005", "ortho-1", "Knee pain"],
    ["Divya M", 34, "Female", "9800000006", "gm-1", "Headache"],
  ] as const;
  people.forEach(([n, age, g, m, docId, reason], i) => {
    const d = doctor(docId)!;
    const time = SLOTS[list.filter((a) => a.doctorId === docId).length]!;
    list.push({
      id: `SC-DEMO${String(i + 1).padStart(2, "0")}`,
      token: nextToken(list, docId, t, dept(d.deptId)!.prefix),
      patientName: n, age, gender: g, mobile: m, deptId: d.deptId, doctorId: docId,
      date: t, time, reason, status: "Waiting", createdAt: Date.now() - (10 - i) * 60000,
    });
  });
  return { appointments: list, unavailable: ["ent-2"], myIds: [] };
}

function read(): State {
  if (typeof window === "undefined") return { appointments: [], unavailable: [], myIds: [] };
  try {
    const s = localStorage.getItem(KEY);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  const s = seed();
  localStorage.setItem(KEY, JSON.stringify(s));
  return s;
}
function write(s: State) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(EVT));
}

export function useHospital() {
  const [state, setState] = useState<State>({ appointments: [], unavailable: [], myIds: [] });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const load = () => setState(read());
    load();
    setReady(true);
    window.addEventListener(EVT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(EVT, load);
      window.removeEventListener("storage", load);
    };
  }, []);
  return { ...state, ready };
}

export type BookingInput = Omit<Appointment, "id" | "token" | "status" | "createdAt">;

export function bookAppointment(input: BookingInput): { ok: true; appt: Appointment } | { ok: false; error: string } {
  const s = read();
  if (s.unavailable.includes(input.doctorId)) return { ok: false, error: "This doctor is currently unavailable." };
  if (isSlotTaken(s.appointments, input.doctorId, input.date, input.time))
    return { ok: false, error: "This time slot is already booked for the selected doctor. Please choose another." };
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const appt: Appointment = {
    ...input,
    id: `SC-${input.date.replace(/-/g, "").slice(2)}-${rand}`,
    token: nextToken(s.appointments, input.doctorId, input.date, dept(input.deptId)!.prefix),
    status: "Waiting",
    createdAt: Date.now(),
  };
  write({ ...s, appointments: [...s.appointments, appt], myIds: [...s.myIds, appt.id] });
  return { ok: true, appt };
}

export function setStatus(id: string, status: Status) {
  const s = read();
  write({ ...s, appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)) });
}

export function toggleAvailability(doctorId: string) {
  const s = read();
  const u = s.unavailable.includes(doctorId)
    ? s.unavailable.filter((x) => x !== doctorId)
    : [...s.unavailable, doctorId];
  write({ ...s, unavailable: u });
}

/** Completes the current patient for the doctor and calls the earliest waiting token. */
export function callNext(doctorId: string, date: string): Appointment | null {
  const s = read();
  const list = s.appointments.map((a) =>
    a.doctorId === doctorId && a.date === date && a.status === "In Consultation" ? { ...a, status: "Completed" as Status } : a,
  );
  const next = list
    .filter((a) => a.doctorId === doctorId && a.date === date && a.status === "Waiting")
    .sort((a, b) => a.time.localeCompare(b.time))[0];
  const final = next ? list.map((a) => (a.id === next.id ? { ...a, status: "In Consultation" as Status } : a)) : list;
  write({ ...s, appointments: final });
  return next ?? null;
}

export function resetDemo() {
  write(seed());
}

export const useSlotsTaken = () => {
  const { appointments } = useHospital();
  return useCallback(
    (doctorId: string, date: string, time: string) => isSlotTaken(appointments, doctorId, date, time),
    [appointments],
  );
};
