import { ArrowRight, Mail } from "lucide-react";

export function Newsletter() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto container-px">
        <div className="relative rounded-3xl p-10 lg:p-16 overflow-hidden border border-border/70">
          <div className="absolute inset-0 gradient-primary opacity-90" />
          <div className="absolute inset-0 grid-bg opacity-25 mix-blend-overlay" />
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />

          <div className="relative grid lg:grid-cols-2 gap-10 items-center text-primary-foreground">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-80">Newsletter</p>
              <h2 className="mt-3 text-3xl lg:text-4xl font-semibold tracking-tight">
                Get Weekly Power Platform Insights
              </h2>
              <p className="mt-3 opacity-90 max-w-md">
                One concise email every Tuesday — new tutorials, enterprise patterns and AI workflow ideas.
              </p>
            </div>

            <form className="space-y-3">
              <div className="flex items-center gap-2 h-12 px-3 rounded-xl bg-white/15 border border-white/25 backdrop-blur">
                <Mail className="h-4 w-4 opacity-80" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="flex-1 bg-transparent placeholder:text-white/70 focus:outline-none text-sm"
                />
                <button className="h-9 px-4 rounded-md bg-background text-foreground text-sm font-medium inline-flex items-center gap-1.5 hover:opacity-90">
                  Subscribe <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs opacity-75">Join 95,000+ developers. No spam, unsubscribe anytime.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
