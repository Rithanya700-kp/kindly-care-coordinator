import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Printer, XCircle, Ticket, Users } from "lucide-react";
import { useHospital, setStatus, dept, doctor } from "@/lib/hospital";
import type { Appointment } from "@/lib/booking";
import { meta } from "@/lib/meta";
import { PageHero, StatusBadge } from "@/components/SiteLayout";
import { Receipt } from "@/components/Receipt";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: meta("My Appointments – SmartCare", "View, search and cancel your appointments and check your live queue status.") }),
  component: Dashboard,
});

function Dashboard() {
  const { appointments, myIds, ready } = useHospital();
  const [q, setQ] = useState("");
  const [found, setFound] = useState<string | null>(null);
  const [printing, setPrinting] = useState<Appointment | null>(null);
  const mine = appointments.filter((a) => myIds.includes(a.id)).sort((a, b) => b.createdAt - a.createdAt);
  const result = found ? appointments.find((a) => a.id === found) : null;

  const doSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = q.trim().toUpperCase();
    if (!id) return toast.error("Enter an appointment ID");
    const a = appointments.find((x) => x.id.toUpperCase() === id);
    if (!a) { setFound(null); return toast.error("No appointment found with that ID"); }
    setFound(a.id);
  };
  const cancel = (a: Appointment) => {
    if (!confirm(`Cancel appointment ${a.id}?`)) return;
    setStatus(a.id, "Cancelled");
    toast.success("Appointment cancelled");
  };
  const print = (a: Appointment) => { setPrinting(a); setTimeout(() => window.print(), 100); };

  const queueInfo = (a: Appointment) => {
    const day = appointments.filter((x) => x.doctorId === a.doctorId && x.date === a.date);
    const serving = day.find((x) => x.status === "In Consultation");
    const ahead = day.filter((x) => x.status === "Waiting" && x.time < a.time).length;
    return { serving: serving?.token ?? "—", ahead };
  };

  const Card = ({ a }: { a: Appointment }) => {
    const qi = queueInfo(a);
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card animate-rise">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-muted-foreground">{a.id}</p>
            <p className="mt-1 text-lg font-bold">{a.patientName}</p>
            <p className="text-sm text-muted-foreground">{doctor(a.doctorId)?.name} · {dept(a.deptId)?.name}</p>
            <p className="text-sm text-muted-foreground">{a.date} at {a.time}</p>
          </div>
          <div className="rounded-xl bg-secondary px-5 py-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Token</p>
            <p className="font-display text-2xl font-extrabold text-primary">{a.token}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge status={a.status} />
          {a.status === "Waiting" && (<>
            <span className="flex items-center gap-1 text-muted-foreground"><Ticket className="h-4 w-4" /> Now serving: <b className="text-foreground">{qi.serving}</b></span>
            <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-4 w-4" /> {qi.ahead} ahead of you</span>
          </>)}
        </div>
        <div className="no-print mt-4 flex flex-wrap gap-2">
          <button onClick={() => print(a)} className="btn btn-outline !py-2"><Printer className="h-4 w-4" /> Receipt</button>
          {a.status === "Waiting" && <button onClick={() => cancel(a)} className="btn btn-danger !py-2"><XCircle className="h-4 w-4" /> Cancel</button>}
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHero eyebrow="Patient dashboard" title="My appointments">Track status and queue tokens, or look up any booking by its appointment ID.</PageHero>
      {printing && <div className="hidden print:block p-6"><Receipt a={printing} /></div>}
      <div className="no-print mx-auto max-w-5xl px-6 py-10">
        <form onSubmit={doSearch} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input aria-label="Appointment ID" className="field !pl-9 font-mono" placeholder="e.g. SC-261110-AB12 (try SC-DEMO01)" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="btn btn-primary">Search</button>
        </form>
        {result && <div className="mt-6"><p className="mb-2 text-sm font-semibold">Search result</p><Card a={result} /></div>}

        <h2 className="mt-10 text-xl font-bold">Booked on this device</h2>
        {ready && mine.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No appointments yet. <Link to="/book" className="font-semibold text-primary">Book one now →</Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">{mine.map((a) => <Card key={a.id} a={a} />)}</div>
        )}
      </div>
    </>
  );
}
