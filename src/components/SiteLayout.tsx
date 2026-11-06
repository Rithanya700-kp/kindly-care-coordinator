import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { CalendarPlus, Cross, Menu, X, MapPin, ShieldAlert } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/departments", label: "Departments" },
  { to: "/doctors", label: "Doctors" },
  { to: "/services", label: "Services" },
  { to: "/dashboard", label: "My Appointments" },
  { to: "/contact", label: "Contact" },
  { to: "/admin", label: "Admin" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-hero text-primary-foreground shadow-glow">
        <Cross className="h-5 w-5" strokeWidth={3} />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-bold text-foreground">SmartCare</span>
        <span className="block text-[11px] font-medium text-muted-foreground">Adichunchanagiri Hospital</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "bg-secondary text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/book" className="btn btn-primary hidden sm:inline-flex">
            <CalendarPlus className="h-4 w-4" /> Book Appointment
          </Link>
          <button aria-label="Menu" className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-card px-4 py-3 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 font-medium hover:bg-secondary">
              {n.label}
            </Link>
          ))}
          <Link to="/book" onClick={() => setOpen(false)} className="btn btn-primary mt-2 w-full">Book Appointment</Link>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="no-print mt-20 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold">SmartCare</p>
          <p className="mt-2 text-sm opacity-75">Hospital Appointment &amp; Queue Management System for Adichunchanagiri Hospital.</p>
          <p className="mt-4 flex items-center gap-2 text-sm opacity-75"><MapPin className="h-4 w-4" /> Bellur Cross, Karnataka</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {NAV.map((n) => <Link key={n.to} to={n.to} className="opacity-75 hover:opacity-100">{n.label}</Link>)}
        </div>
        <div className="rounded-2xl border border-navy-foreground/15 p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" /> Demonstration system</p>
          <p className="mt-2 opacity-75">Doctor names, schedules and appointments are DEMO DATA until verified by the hospital. Data is stored only in this browser. In an emergency, go to the nearest hospital emergency department.</p>
        </div>
      </div>
      <p className="border-t border-navy-foreground/10 py-5 text-center text-xs opacity-60">© {new Date().getFullYear()} SmartCare demo · Not an official hospital website</p>
    </footer>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="no-print bg-hero text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-5xl animate-rise">{title}</h1>
        {children && <div className="mt-3 max-w-2xl opacity-85">{children}</div>}
      </div>
    </section>
  );
}

export function DemoBanner() {
  return (
    <div className="no-print flex items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
      <span className="demo-tag">Demo data</span>
      <span className="text-muted-foreground">Doctor names and schedules are shown for demonstration until verified by the hospital.</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Waiting: "bg-secondary text-primary",
    "In Consultation": "bg-success/15 text-success",
    Completed: "bg-muted text-muted-foreground",
    Cancelled: "bg-destructive/10 text-destructive",
    "No-show": "bg-warning/20 text-foreground",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] ?? ""}`}>{status}</span>;
}
