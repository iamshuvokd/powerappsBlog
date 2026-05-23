import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare, Calendar } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PowerApps.blog" },
      {
        name: "description",
        content: "Get in touch for consulting, training and enterprise Power Platform engagements.",
      },
      { property: "og:title", content: "Contact — PowerApps.blog" },
      {
        property: "og:description",
        content: "Reach out for consulting and enterprise engagements.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="pt-28 pb-24">
      <div className="max-w-6xl mx-auto container-px grid lg:grid-cols-2 gap-12">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium">Contact</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
            Let's build something <span className="gradient-text">remarkable</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            For consulting, enterprise training, or to discuss a custom Power Platform engagement —
            get in touch.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { i: Mail, l: "Email", v: "hello@powerapps.blog" },
              { i: MessageSquare, l: "Response time", v: "Within 1 business day" },
              { i: Calendar, l: "Book a call", v: "30-minute strategy session" },
            ].map((c) => (
              <div
                key={c.l}
                className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/70"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <c.i className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{c.l}</p>
                  <p className="text-sm font-medium">{c.v}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form className="p-7 rounded-2xl bg-card border border-border/70 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name" placeholder="Jane Doe" />
            <Field label="Company" placeholder="Acme Inc." />
          </div>
          <Field label="Email" type="email" placeholder="jane@acme.com" />
          <Field label="Project budget" placeholder="$10k – $50k" />
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Tell us about your project
            </label>
            <textarea
              rows={5}
              placeholder="A short description of what you're building…"
              className="mt-1.5 w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <button className="w-full h-11 rounded-md gradient-primary text-primary-foreground font-medium shadow-[var(--shadow-glow)]">
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-1.5 w-full h-10 px-3 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
