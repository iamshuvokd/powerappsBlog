import { Link } from "@tanstack/react-router";
import { ArrowRight, Activity, BarChart3, CheckCircle2, Workflow, Zap, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative pt-28 lg:pt-36 pb-20 overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 gradient-radial pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[640px] rounded-full blur-3xl opacity-40 gradient-primary pointer-events-none" />

      <div className="relative max-w-7xl mx-auto container-px grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-7 animate-[slide-up_0.7s_ease-out]">
          <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-border/70 bg-surface/60 text-xs text-muted-foreground glass-card">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            New · Copilot Studio + Azure OpenAI guide
            <ArrowRight className="h-3 w-3" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
            Enterprise Automation with{" "}
            <span className="gradient-text">Power Platform</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
            Learn how to build scalable Power Apps, workflows, dashboards and modern business systems using
            Microsoft technologies and AI-powered automation.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="gradient-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)] h-11">
              <Link to="/tutorials">Explore Tutorials <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 border-border/80 bg-surface/50 backdrop-blur">
              <Link to="/enterprise-solutions">View Enterprise Solutions</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
            {["Microsoft Certified", "Production Patterns", "Real-world Code", "Free Forever"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <DashboardMock />
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <div className="relative h-[480px] lg:h-[540px]">
      {/* main dashboard card */}
      <div className="absolute inset-0 rounded-2xl glass-card overflow-hidden shadow-[var(--shadow-elevated)] border-gradient">
        <div className="h-10 flex items-center gap-1.5 px-4 border-b border-border/60 bg-surface/60">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <span className="ml-3 text-[11px] text-muted-foreground font-mono">app.powerapps.blog / dashboard</span>
        </div>

        <div className="p-5 grid grid-cols-6 gap-3 h-[calc(100%-2.5rem)]">
          {/* sidebar */}
          <div className="col-span-1 space-y-2">
            {[Activity, Workflow, BarChart3, Database, Zap].map((Icon, i) => (
              <div key={i} className={`h-8 rounded-md grid place-items-center ${i === 0 ? "bg-primary/15 text-primary" : "bg-secondary/60 text-muted-foreground"}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            ))}
          </div>

          {/* main */}
          <div className="col-span-5 space-y-3">
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { l: "Active Apps", v: "128", d: "+12%" },
                { l: "Flows Today", v: "1,420", d: "+8%" },
                { l: "Success Rate", v: "99.4%", d: "+0.3%" },
              ].map((k) => (
                <div key={k.l} className="p-3 rounded-lg bg-surface/80 border border-border/60">
                  <p className="text-[10px] text-muted-foreground">{k.l}</p>
                  <p className="text-lg font-semibold mt-0.5">{k.v}</p>
                  <p className="text-[10px] text-primary mt-0.5">{k.d}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-surface/80 border border-border/60 h-44">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium">Workflow Runs · 7d</p>
                <span className="text-[10px] text-muted-foreground">Live</span>
              </div>
              <svg viewBox="0 0 300 100" className="w-full h-28">
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.16 235)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="oklch(0.7 0.16 235)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,70 C30,60 50,40 80,45 C120,52 140,20 180,28 C220,36 240,18 300,12 L300,100 L0,100 Z" fill="url(#g1)" />
                <path d="M0,70 C30,60 50,40 80,45 C120,52 140,20 180,28 C220,36 240,18 300,12" fill="none" stroke="oklch(0.7 0.16 235)" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-surface/80 border border-border/60">
                <p className="text-[10px] text-muted-foreground mb-2">Top Flows</p>
                {["Invoice Approval", "Visitor Check-in", "Audit SLA"].map((f, i) => (
                  <div key={f} className="flex items-center justify-between text-[11px] py-1">
                    <span>{f}</span>
                    <span className="text-muted-foreground">{[420, 312, 198][i]}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-surface/80 border border-border/60">
                <p className="text-[10px] text-muted-foreground mb-2">Connectors</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-md bg-gradient-to-br from-primary/30 to-primary-glow/20 border border-border/40" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating cards */}
      <div className="absolute -left-4 lg:-left-10 top-24 w-56 p-3 rounded-xl glass-card shadow-[var(--shadow-elevated)] animate-[float_6s_ease-in-out_infinite]">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md gradient-primary grid place-items-center text-primary-foreground">
            <Workflow className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-medium">Approval Flow</p>
            <p className="text-[10px] text-muted-foreground">Completed · 2s ago</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-2 lg:-right-6 bottom-12 w-52 p-3 rounded-xl glass-card shadow-[var(--shadow-elevated)] animate-[float_7s_ease-in-out_infinite_-2s]">
        <p className="text-[10px] text-muted-foreground">AI Suggestion</p>
        <p className="text-xs font-medium mt-0.5">Optimize 3 delegable queries</p>
        <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full w-3/4 gradient-primary" />
        </div>
      </div>
    </div>
  );
}
