import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Printer, LayoutDashboard, CalendarPlus } from "lucide-react";
import { DEPARTMENTS, DOCTORS, bookAppointment, useHospital } from "@/lib/hospital";
import { SLOTS, isSlotTaken, todayISO, type Appointment } from "@/lib/booking";
import { meta } from "@/lib/meta";
import { PageHero, DemoBanner } from "@/components/SiteLayout";
import { Receipt } from "@/components/Receipt";

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { dept?: string | undefined; doctor?: string | undefined } => ({
    dept: typeof s["dept"] === "string" ? s["dept"] : undefined,
    doctor: typeof s["doctor"] === "string" ? s["doctor"] : undefined,
  }),
  head: () => ({ meta: meta("Book Appointment – SmartCare", "Book a doctor appointment at Adichunchanagiri Hospital and get your queue token instantly.") }),
  component: Book,
});

const schema = z.object({
  patientName: z.string().trim().min(2, "Enter the patient's full name").max(80).regex(/^[A-Za-z .'-]+$/, "Use letters only"),
  age: z.coerce.number({ invalid_type_error: "Enter age" }).int("Whole number").min(0, "Invalid age").max(120, "Invalid age"),
  gender: z.enum(["Male", "Female", "Other"], { errorMap: () => ({ message: "Select gender" }) }),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  deptId: z.string().min(1, "Select a department"),
  doctorId: z.string().min(1, "Select a doctor"),
  date: z.string().min(1, "Select a date"),
  time: z.string().min(1, "Select a time slot"),
  reason: z.string().trim().min(3, "Briefly describe the reason").max(300),
});

function Book() {
  const search = Route.useSearch();
  const { appointments, unavailable } = useHospital();
  const today = todayISO();
  const max = todayISO(new Date(Date.now() + 30 * 864e5));
  const [f, setF] = useState({ patientName: "", age: "", gender: "", mobile: "", deptId: search.dept ?? "", doctorId: search.doctor ?? "", date: today, time: "", reason: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Appointment | null>(null);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v, ...(k === "deptId" ? { doctorId: "", time: "" } : {}), ...(k === "doctorId" || k === "date" ? { time: "" } : {}) }));

  useEffect(() => { if (search.doctor) setF((p) => ({ ...p, doctorId: search.doctor!, deptId: search.dept ?? p.deptId })); }, [search.doctor, search.dept]);

  const doctors = DOCTORS.filter((d) => d.deptId === f.deptId);
  const nowHM = new Date().toTimeString().slice(0, 5);
  const slots = useMemo(() => SLOTS.map((t) => ({
    t,
    taken: !!f.doctorId && isSlotTaken(appointments, f.doctorId, f.date, t),
    past: f.date === today && t <= nowHM,
  })), [appointments, f.doctorId, f.date, today, nowHM]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    const errors: Record<string, string> = {};
    if (!r.success) r.error.issues.forEach((i) => { errors[String(i.path[0])] ??= i.message; });
    if (f.date && (f.date < today || f.date > max)) errors["date"] = "Choose a date within the next 30 days";
    if (Object.keys(errors).length || !r.success) { setErr(errors); toast.error("Please fix the highlighted fields"); return; }
    const res = bookAppointment(r.data);
    if (!res.ok) { setErr({ time: res.error }); toast.error(res.error); return; }
    setErr({});
    setDone(res.appt);
    toast.success(`Booked! Your token is ${res.appt.token}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="no-print mb-6 text-center animate-rise">
        <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
        <h1 className="mt-3 text-3xl font-bold">Appointment confirmed</h1>
        <p className="mt-1 text-muted-foreground">Save your appointment ID <b className="font-mono text-foreground">{done.id}</b> to track or cancel later.</p>
      </div>
      <Receipt a={done} />
      <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={() => window.print()} className="btn btn-primary"><Printer className="h-4 w-4" /> Print receipt</button>
        <Link to="/dashboard" className="btn btn-outline"><LayoutDashboard className="h-4 w-4" /> My appointments</Link>
        <button onClick={() => { setDone(null); setF({ ...f, patientName: "", age: "", gender: "", mobile: "", time: "", reason: "" }); }} className="btn btn-outline"><CalendarPlus className="h-4 w-4" /> Book another</button>
      </div>
    </div>
  );

  const E = ({ k }: { k: string }) => err[k] ? <p className="mt-1 text-xs font-medium text-destructive">{err[k]}</p> : null;
  return (
    <>
      <PageHero eyebrow="Appointment" title="Book your visit">Fill in the patient details and pick an open slot. Booked slots are disabled automatically.</PageHero>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <DemoBanner />
        <form onSubmit={submit} noValidate className="mt-6 grid gap-8 rounded-[1.5rem] border border-border bg-card p-6 shadow-card sm:p-10">
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-4 font-display text-lg font-bold">Patient details</legend>
            <div className="sm:col-span-2"><label className="text-sm font-medium">Full name</label><input aria-label="Full name" className="field mt-1" maxLength={80} value={f.patientName} onChange={(e) => set("patientName", e.target.value)} /><E k="patientName" /></div>
            <div><label className="text-sm font-medium">Age</label><input aria-label="Age" type="number" min={0} max={120} className="field mt-1" value={f.age} onChange={(e) => set("age", e.target.value)} /><E k="age" /></div>
            <div><label className="text-sm font-medium">Gender</label>
              <select aria-label="Gender" className="field mt-1" value={f.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
              </select><E k="gender" /></div>
            <div className="sm:col-span-2"><label className="text-sm font-medium">Mobile number</label><input aria-label="Mobile number" inputMode="numeric" maxLength={10} className="field mt-1" placeholder="10-digit mobile" value={f.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, ""))} /><E k="mobile" /></div>
          </fieldset>

          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-4 font-display text-lg font-bold">Doctor &amp; schedule</legend>
            <div><label className="text-sm font-medium">Department</label>
              <select aria-label="Department" className="field mt-1" value={f.deptId} onChange={(e) => set("deptId", e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}{d.sample ? " (sample)" : ""}</option>)}
              </select><E k="deptId" /></div>
            <div><label className="text-sm font-medium">Doctor</label>
              <select aria-label="Doctor" className="field mt-1" value={f.doctorId} disabled={!f.deptId} onChange={(e) => set("doctorId", e.target.value)}>
                <option value="">{f.deptId ? "Select doctor" : "Choose department first"}</option>
                {doctors.map((d) => <option key={d.id} value={d.id} disabled={unavailable.includes(d.id)}>{d.name}{unavailable.includes(d.id) ? " — unavailable" : ""}</option>)}
              </select><E k="doctorId" /></div>
            <div className="sm:col-span-2"><label className="text-sm font-medium">Date</label><input aria-label="Date" type="date" min={today} max={max} className="field mt-1 sm:max-w-xs" value={f.date} onChange={(e) => set("date", e.target.value)} /><E k="date" /></div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium">Time slot</label>
              {!f.doctorId ? <p className="mt-2 text-sm text-muted-foreground">Select a doctor to see available slots.</p> : (
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-7">
                  {slots.map(({ t, taken, past }) => (
                    <button type="button" key={t} disabled={taken || past} onClick={() => set("time", t)}
                      className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition-all ${f.time === t ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-border bg-card hover:border-primary"} disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:line-through`}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
              <E k="time" />
            </div>
            <div className="sm:col-span-2"><label className="text-sm font-medium">Reason for visit</label><textarea aria-label="Reason for visit" maxLength={300} className="field mt-1 min-h-24" value={f.reason} onChange={(e) => set("reason", e.target.value)} /><E k="reason" /></div>
          </fieldset>
          <button className="btn btn-primary !py-3.5 text-base">Confirm appointment</button>
        </form>
      </div>
    </>
  );
}
