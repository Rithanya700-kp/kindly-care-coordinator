import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Info } from "lucide-react";
import { meta } from "@/lib/meta";
import { PageHero } from "@/components/SiteLayout";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: meta("Contact – SmartCare Adichunchanagiri Hospital", "Location and enquiry form for Adichunchanagiri Hospital, Bellur Cross, Karnataka.") }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  message: z.string().trim().min(5, "Message is too short").max(1000),
});

function Contact() {
  const [f, setF] = useState({ name: "", mobile: "", message: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(f);
    if (!r.success) {
      setErr(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    const prev = JSON.parse(localStorage.getItem("smartcare-enquiries") || "[]");
    localStorage.setItem("smartcare-enquiries", JSON.stringify([...prev, { ...r.data, at: Date.now() }]));
    setErr({});
    setF({ name: "", mobile: "", message: "" });
    toast.success("Enquiry saved (demo – stored in this browser only).");
  };
  return (
    <>
      <PageHero eyebrow="Contact" title="Visit or reach us" />
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="flex items-center gap-2 font-bold"><MapPin className="h-5 w-5 text-primary" /> Location</p>
            <p className="mt-2 text-muted-foreground">Adichunchanagiri Hospital, Bellur Cross, Karnataka</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="flex items-center gap-2 font-bold"><Phone className="h-5 w-5 text-primary" /> Phone &amp; <Mail className="h-5 w-5 text-primary" /> Email</p>
            <p className="mt-2 text-muted-foreground">Official contact details will be added once verified by the hospital.</p>
          </div>
          <div className="flex gap-3 rounded-2xl bg-secondary p-5 text-sm text-secondary-foreground">
            <Info className="h-5 w-5 shrink-0" /> In a medical emergency, please go directly to the nearest emergency department.
          </div>
          <iframe title="Map" className="h-64 w-full rounded-2xl border border-border" loading="lazy" src="https://www.google.com/maps?q=Adichunchanagiri+Hospital+Bellur+Cross&output=embed" />
        </div>
        <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl border border-border bg-card p-7 shadow-card">
          <h2 className="text-xl font-bold">Send an enquiry</h2>
          {(["name", "mobile"] as const).map((k) => (
            <div key={k}>
              <label className="text-sm font-medium capitalize">{k}</label>
              <input className="field mt-1" value={f[k]} maxLength={k === "mobile" ? 10 : 100} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
              {err[k] && <p className="mt-1 text-xs text-destructive">{err[k]}</p>}
            </div>
          ))}
          <div>
            <label className="text-sm font-medium">Message</label>
            <textarea className="field mt-1 min-h-32" maxLength={1000} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
            {err["message"] && <p className="mt-1 text-xs text-destructive">{err["message"]}</p>}
          </div>
          <button className="btn btn-primary w-full">Send enquiry</button>
        </form>
      </div>
    </>
  );
}
