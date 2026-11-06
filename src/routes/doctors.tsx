import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, CalendarDays } from "lucide-react";
import { DEPARTMENTS, DOCTORS, dept, useHospital } from "@/lib/hospital";
import { meta } from "@/lib/meta";
import { PageHero, DemoBanner } from "@/components/SiteLayout";

export const Route = createFileRoute("/doctors")({
  validateSearch: (s: Record<string, unknown>): { dept?: string | undefined } => ({ dept: typeof s["dept"] === "string" ? s["dept"] : undefined }),
  head: () => ({ meta: meta("Doctors – SmartCare Adichunchanagiri Hospital", "Browse doctors by department, view OPD schedules and book an appointment.") }),
  component: Doctors,
});

function Doctors() {
  const { dept: sel } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { unavailable } = useHospital();
  const list = DOCTORS.filter((d) => !sel || d.deptId === sel);
  return (
    <>
      <PageHero eyebrow="Our doctors" title="Consultants & OPD schedules" />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <DemoBanner />
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => navigate({ search: { dept: undefined } })} className={`btn !py-2 ${!sel ? "btn-primary" : "btn-outline"}`}>All</button>
          {DEPARTMENTS.map((d) => (
            <button key={d.id} onClick={() => navigate({ search: { dept: d.id } })} className={`btn !py-2 ${sel === d.id ? "btn-primary" : "btn-outline"}`}>{d.name}</button>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => {
            const off = unavailable.includes(d.id);
            return (
              <div key={d.id} className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-card">
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-hero font-display text-lg font-bold text-primary-foreground">{d.name.replace("Dr. ", "").slice(0, 1)}</div>
                  <div className="min-w-0">
                    <p className="font-bold">{d.name}</p>
                    <p className="text-sm text-primary">{dept(d.deptId)?.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="demo-tag">{d.sample ? "Sample doctor" : "Demo schedule"}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${off ? "bg-destructive/10 text-destructive" : "bg-success/15 text-success"}`}>{off ? "Unavailable" : "Available"}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {d.days}</p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {d.hours}</p>
                </div>
                {off ? (
                  <button disabled className="btn btn-outline mt-5 w-full">Not taking bookings</button>
                ) : (
                  <Link to="/book" search={{ dept: d.deptId, doctor: d.id }} className="btn btn-primary mt-5 w-full">Book with doctor</Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
