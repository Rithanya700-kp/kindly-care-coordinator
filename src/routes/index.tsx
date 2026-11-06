import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarPlus, Clock, Ticket, ShieldCheck, ArrowRight, Users, Search, MapPin,
} from "lucide-react";
import hero from "@/assets/hero-hospital.jpg";
import consult from "@/assets/consultation.jpg";
import { DEPARTMENTS, DOCTORS, dept } from "@/lib/hospital";
import { meta } from "@/lib/meta";
import { DemoBanner } from "@/components/SiteLayout";
import { SERVICES } from "@/lib/services";

export const Route = createFileRoute("/")({
  head: () => ({ meta: meta("SmartCare – Adichunchanagiri Hospital Appointments", "Book a doctor appointment online and track your live queue token at Adichunchanagiri Hospital, Bellur Cross, Karnataka.") }),
  component: Index,
});


function Index() {
  return (
    <>
      <section className="relative overflow-hidden bg-soft">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 lg:grid-cols-2 lg:py-20">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              <MapPin className="h-3.5 w-3.5" /> Adichunchanagiri Hospital · Bellur Cross, Karnataka
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] text-foreground sm:text-6xl">
              Care without the <span className="text-primary">waiting room</span> wait.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              SmartCare lets you book an appointment, receive a queue token and track your turn — so you spend less time waiting and more time getting better.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/book" className="btn btn-primary"><CalendarPlus className="h-4 w-4" /> Book Appointment</Link>
              <Link to="/dashboard" className="btn btn-outline"><Search className="h-4 w-4" /> Track my token</Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[[String(DEPARTMENTS.length), "Departments"], [String(DOCTORS.length), "Doctors"], ["24/7", "Online booking"]].map(([v, l]) => (
                <div key={l}><dt className="font-display text-2xl font-bold text-primary">{v}</dt><dd className="text-xs text-muted-foreground">{l}</dd></div>
              ))}
            </dl>
          </div>
          <div className="relative animate-rise [animation-delay:150ms]">
            <img src={hero} alt="Bright hospital reception with doctor" width={1600} height={1008} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-card" />
            <div className="absolute -bottom-6 left-6 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-success/15 text-success animate-pulse-ring"><Ticket className="h-5 w-5" /></span>
              <div><p className="text-xs text-muted-foreground">Now serving</p><p className="font-display font-bold">Token GM-004</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: CalendarPlus, t: "1. Book online", d: "Choose department, doctor, date and an open time slot." },
            { icon: Ticket, t: "2. Get your token", d: "Receive an appointment ID and queue token instantly." },
            { icon: Clock, t: "3. Arrive on time", d: "Track your status and walk in when your token is called." },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-border bg-card p-6 shadow-card transition-transform hover:-translate-y-1">
              <s.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-soft py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHead eyebrow="Departments" title="Specialist care under one roof" link="/departments" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEPARTMENTS.map((d) => (
              <Link key={d.id} to="/doctors" search={{ dept: d.id }} className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-card">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><d.icon className="h-6 w-6" /></span>
                <h3 className="mt-4 font-bold">{d.name} {d.sample && <span className="demo-tag ml-1">Sample</span>}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionHead eyebrow="Doctors" title="Meet our consultants" link="/doctors" />
        <div className="mt-6"><DemoBanner /></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOCTORS.filter((_, i) => i % 5 === 0).slice(0, 8).map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-hero font-display font-bold text-primary-foreground">{d.name.replace("Dr. ", "").slice(0, 1)}</div>
              <p className="mt-3 font-bold">{d.name}</p>
              <p className="text-sm text-primary">{dept(d.deptId)?.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{d.days} · {d.hours}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-soft py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <img src={consult} alt="Doctor consulting a patient" loading="lazy" width={1200} height={912} className="rounded-[2rem] object-cover shadow-card" />
          <div>
            <SectionHead eyebrow="Services" title="Everything around your visit" link="/services" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <div key={s.title} className="flex gap-3">
                  <s.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div><p className="font-semibold">{s.title}</p><p className="text-sm text-muted-foreground">{s.text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-8 rounded-[2rem] bg-hero p-10 text-primary-foreground md:grid-cols-[1fr_auto] md:p-14">
          <div>
            <h2 className="text-3xl font-bold">Ready to see a doctor?</h2>
            <p className="mt-2 opacity-85">Book now, or reach out to us for directions and general queries.</p>
            <p className="mt-4 flex items-center gap-2 text-sm opacity-85"><ShieldCheck className="h-4 w-4" /> Your details stay in this browser for this demo. <Users className="ml-2 h-4 w-4" /> No account needed.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/book" className="btn btn-light">Book Appointment</Link>
            <Link to="/contact" className="btn btn-ghost-light">Contact</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, link }: { eyebrow: string; title: string; link: "/departments" | "/doctors" | "/services" }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{title}</h2>
      </div>
      <Link to={link} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">View all <ArrowRight className="h-4 w-4" /></Link>
    </div>
  );
}
