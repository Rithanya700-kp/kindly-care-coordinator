import { createFileRoute, Link } from "@tanstack/react-router";
import { SERVICES } from "./index";
import { meta } from "@/lib/meta";
import { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: meta("Services – SmartCare Adichunchanagiri Hospital", "Online appointments, smart queue tokens, diagnostics, pharmacy and vaccinations.") }),
  component: Services,
});

function Services() {
  return (
    <>
      <PageHero eyebrow="Services" title="Designed around your visit" />
      <div className="mx-auto grid max-w-7xl gap-5 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <div key={s.title} className="rounded-2xl border border-border bg-card p-7 shadow-card">
            <s.icon className="h-9 w-9 text-primary" />
            <h2 className="mt-4 text-lg font-bold">{s.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
      <div className="text-center"><Link to="/book" className="btn btn-primary">Book Appointment</Link></div>
    </>
  );
}
