import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Lock, LogOut, Megaphone, RotateCcw, Users, CalendarCheck, Clock, CheckCircle2, Search } from "lucide-react";
import { DEPARTMENTS, DOCTORS, dept, doctor, useHospital, setStatus, toggleAvailability, callNext, resetDemo } from "@/lib/hospital";
import { todayISO, type Status } from "@/lib/booking";
import { meta } from "@/lib/meta";
import { PageHero, StatusBadge } from "@/components/SiteLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [...meta("Admin Dashboard – SmartCare", "Manage appointments, doctor availability and the live patient queue."), { name: "robots", content: "noindex" }] }),
  component: Admin,
});

const AUTH = "smartcare-admin";
const STATUSES: Status[] = ["Waiting", "In Consultation", "Completed", "Cancelled", "No-show"];

function Admin() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { setAuthed(sessionStorage.getItem(AUTH) === "1"); }, []);
  if (!authed) return <Login onOk={() => { sessionStorage.setItem(AUTH, "1"); setAuthed(true); }} />;
  return <Panel onLogout={() => { sessionStorage.removeItem(AUTH); setAuthed(false); }} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [e, setE] = useState("");
  return (
    <div className="bg-soft px-6 py-20">
      <form onSubmit={(ev) => { ev.preventDefault(); if (u === "admin" && p === "admin123") onOk(); else setE("Invalid username or password"); }}
        className="mx-auto max-w-sm rounded-[1.5rem] border border-border bg-card p-8 shadow-card animate-rise">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-hero text-primary-foreground"><Lock className="h-5 w-5" /></span>
        <h1 className="mt-4 text-2xl font-bold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Demo credentials: <b>admin</b> / <b>admin123</b></p>
        <input aria-label="Username" className="field mt-6" placeholder="Username" value={u} onChange={(x) => setU(x.target.value)} />
        <input aria-label="Password" type="password" className="field mt-3" placeholder="Password" value={p} onChange={(x) => setP(x.target.value)} />
        {e && <p className="mt-2 text-sm text-destructive">{e}</p>}
        <button className="btn btn-primary mt-5 w-full">Sign in</button>
      </form>
    </div>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const { appointments, unavailable } = useHospital();
  const [tab, setTab] = useState<"queue" | "bookings" | "doctors">("queue");
  const [date, setDate] = useState(todayISO());
  const [qDoc, setQDoc] = useState("gm-1");
  const [fDept, setFDept] = useState(""); const [fStatus, setFStatus] = useState(""); const [q, setQ] = useState("");

  const day = appointments.filter((a) => a.date === date);
  const stats = [
    { icon: CalendarCheck, l: "Appointments", v: day.length },
    { icon: Clock, l: "Waiting", v: day.filter((a) => a.status === "Waiting").length },
    { icon: Users, l: "In consultation", v: day.filter((a) => a.status === "In Consultation").length },
    { icon: CheckCircle2, l: "Completed", v: day.filter((a) => a.status === "Completed").length },
  ];
  const queue = day.filter((a) => a.doctorId === qDoc && a.status !== "Cancelled").sort((a, b) => a.time.localeCompare(b.time));
  const serving = queue.find((a) => a.status === "In Consultation");
  const waiting = queue.filter((a) => a.status === "Waiting");
  const filtered = useMemo(() => appointments
    .filter((a) => (!fDept || a.deptId === fDept) && (!fStatus || a.status === fStatus))
    .filter((a) => !q || `${a.id} ${a.patientName} ${a.mobile} ${a.token}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)), [appointments, fDept, fStatus, q]);

  return (
    <>
      <PageHero eyebrow="Admin" title="Hospital control desk" />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-full bg-secondary p-1">
            {(["queue", "bookings", "doctors"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${tab === t ? "bg-card text-primary shadow-card" : "text-muted-foreground"}`}>
                {t === "queue" ? "Live queue" : t === "bookings" ? "All bookings" : "Doctor availability"}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => { if (confirm("Reset all demo data?")) { resetDemo(); toast.success("Demo data reset"); } }} className="btn btn-outline !py-2"><RotateCcw className="h-4 w-4" /> Reset demo</button>
            <button onClick={onLogout} className="btn btn-outline !py-2"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-5">
              <s.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 font-display text-3xl font-bold">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l} · {date === todayISO() ? "today" : date}</p>
            </div>
          ))}
        </div>

        {tab === "queue" && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="grid gap-3 sm:grid-cols-2">
                <select aria-label="Queue doctor" className="field" value={qDoc} onChange={(e) => setQDoc(e.target.value)}>
                  {DEPARTMENTS.map((d) => <optgroup key={d.id} label={d.name}>{DOCTORS.filter((x) => x.deptId === d.id).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</optgroup>)}
                </select>
                <input aria-label="Queue date" type="date" className="field" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="mt-6 rounded-2xl bg-hero p-8 text-center text-primary-foreground">
                <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Now serving</p>
                <p className="mt-2 font-display text-6xl font-extrabold">{serving?.token ?? "—"}</p>
                <p className="mt-1 text-sm opacity-85">{serving ? serving.patientName : "No patient in consultation"}</p>
              </div>
              <button onClick={() => {
                const n = callNext(qDoc, date);
                n ? toast.success(`Calling token ${n.token} – ${n.patientName}`) : toast.info("No more patients waiting");
              }} className="btn btn-primary mt-5 w-full !py-3.5 text-base"><Megaphone className="h-5 w-5" /> Call next patient</button>
              <p className="mt-2 text-center text-xs text-muted-foreground">Marks the current patient completed and calls the next waiting token.</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold">Waiting queue · {doctor(qDoc)?.name} <span className="text-muted-foreground">({waiting.length})</span></h2>
              <ol className="mt-4 space-y-2">
                {waiting.length === 0 && <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Queue is empty</li>}
                {waiting.map((a, i) => (
                  <li key={a.id} className="flex items-center gap-4 rounded-xl border border-border p-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-sm font-bold text-primary">{i + 1}</span>
                    <div className="flex-1"><p className="font-semibold">{a.token} · {a.patientName}</p><p className="text-xs text-muted-foreground">{a.time} · {a.reason}</p></div>
                    <button onClick={() => setStatus(a.id, "No-show")} className="text-xs font-semibold text-muted-foreground hover:text-destructive">No-show</button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input aria-label="Search bookings" className="field !pl-9" placeholder="ID, name, mobile, token" value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <select aria-label="Filter department" className="field" value={fDept} onChange={(e) => setFDept(e.target.value)}><option value="">All departments</option>{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
              <select aria-label="Filter status" className="field" value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {["ID / Token", "Patient", "Doctor", "Date & time", "Status", "Update"].map((h) => <th key={h} className="px-3 py-3">{h}</th>)}
                </tr></thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-border/60 hover:bg-muted/50">
                      <td className="px-3 py-3"><p className="font-mono text-xs">{a.id}</p><p className="font-bold text-primary">{a.token}</p></td>
                      <td className="px-3 py-3"><p className="font-semibold">{a.patientName}</p><p className="text-xs text-muted-foreground">{a.age} · {a.gender} · {a.mobile}</p></td>
                      <td className="px-3 py-3"><p>{doctor(a.doctorId)?.name}</p><p className="text-xs text-muted-foreground">{dept(a.deptId)?.name}</p></td>
                      <td className="px-3 py-3">{a.date}<br /><span className="text-muted-foreground">{a.time}</span></td>
                      <td className="px-3 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-3 py-3">
                        <select aria-label={`Status for ${a.id}`} className="field !py-1.5 text-xs" value={a.status} onChange={(e) => { setStatus(a.id, e.target.value as Status); toast.success(`${a.id} → ${e.target.value}`); }}>
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No bookings match.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "doctors" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DOCTORS.map((d) => {
              const on = !unavailable.includes(d.id);
              return (
                <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="min-w-0"><p className="truncate font-semibold">{d.name}</p><p className="text-xs text-muted-foreground">{dept(d.deptId)?.name} · {d.days}</p></div>
                  <button role="switch" aria-checked={on} aria-label={`Availability ${d.name}`} onClick={() => { toggleAvailability(d.id); toast.success(`${d.name} marked ${on ? "unavailable" : "available"}`); }}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-success" : "bg-muted-foreground/30"}`}>
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-card transition-all ${on ? "left-6" : "left-1"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
