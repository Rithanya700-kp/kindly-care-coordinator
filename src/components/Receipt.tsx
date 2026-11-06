import { Fragment } from "react";
import { Cross } from "lucide-react";
import type { Appointment } from "@/lib/booking";
import { dept, doctor } from "@/lib/hospital";
import { StatusBadge } from "./SiteLayout";

export function Receipt({ a }: { a: Appointment }) {
  const rows: [string, string][] = [
    ["Patient", a.patientName],
    ["Age / Gender", `${a.age} / ${a.gender}`],
    ["Mobile", a.mobile],
    ["Department", dept(a.deptId)?.name ?? ""],
    ["Doctor", doctor(a.doctorId)?.name ?? ""],
    ["Date", new Date(a.date + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })],
    ["Time", a.time],
    ["Reason", a.reason],
  ];
  return (
    <div id="receipt" className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between bg-hero px-6 py-4 text-primary-foreground">
        <div className="flex items-center gap-2"><Cross className="h-5 w-5" strokeWidth={3} /><span className="font-display font-bold">SmartCare · Adichunchanagiri Hospital</span></div>
        <span className="text-xs opacity-80">Appointment receipt</span>
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto]">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Appointment ID</dt><dd className="font-mono font-bold">{a.id}</dd>
          {rows.map(([k, v]) => (<Fragment key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></Fragment>))}
          <dt className="text-muted-foreground">Status</dt><dd><StatusBadge status={a.status} /></dd>
        </dl>
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/40 bg-secondary px-8 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Queue token</p>
          <p className="mt-1 font-display text-4xl font-extrabold text-primary">{a.token}</p>
        </div>
      </div>
      <p className="border-t border-border px-6 py-3 text-xs text-muted-foreground">Please arrive 15 minutes early with this receipt. DEMO system – details are for demonstration until verified by the hospital.</p>
    </div>
  );
}
