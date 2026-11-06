import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { DEPARTMENTS, DOCTORS } from "@/lib/hospital";
import { meta } from "@/lib/meta";
import { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/departments")({
  head: () => ({ meta: meta("Departments – SmartCare Adichunchanagiri Hospital", "General Medicine, Gynaecology, Orthopaedics, Paediatrics, Dermatology, ENT and more.") }),
  component: Departments,
});

function Departments() {
  return (
    <>
      <PageHero eyebrow="Departments" title="Find the right specialist">Choose a department to see its doctors and book a slot.</PageHero>
      <div className="mx-auto grid max-w-7xl gap-5 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENTS.map((d) => (
          <div key={d.id} className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-card">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-primary"><d.icon className="h-7 w-7" /></span>
            <h2 className="mt-5 text-xl font-bold">{d.name} {d.sample && <span className="demo-tag ml-1">Sample dept</span>}</h2>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{d.blurb}</p>
            <p className="mt-4 text-sm font-medium">{DOCTORS.filter((x) => x.deptId === d.id).length} doctors</p>
            <div className="mt-5 flex gap-2">
              <Link to="/doctors" search={{ dept: d.id }} className="btn btn-outline flex-1 !px-3">Doctors</Link>
              <Link to="/book" search={{ dept: d.id }} className="btn btn-primary flex-1 !px-3">Book <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
