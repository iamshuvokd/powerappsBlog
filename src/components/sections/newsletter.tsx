import { ArrowRight, Mail } from "lucide-react";

export function Newsletter() {
  return (
    <section className="py-16 lg:py-20 bg-surface/50 border-y border-border/60">
      <div className="max-w-7xl mx-auto container-px grid gap-8 lg:grid-cols-[1fr_520px] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Newsletter</p>
          <h2 className="mt-3 text-3xl lg:text-4xl font-semibold tracking-tight">
            Get weekly blog articles
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl">
            A concise email with Power Apps, Power Automate and SharePoint patterns for builders.
          </p>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row">
          <div className="flex min-w-0 flex-1 items-center gap-2 h-12 px-3 rounded-xl bg-card border border-border/70">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="email"
              placeholder="you@company.com"
              className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <button className="h-12 px-5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center gap-1.5 hover:opacity-90">
            Subscribe <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </section>
  );
}
