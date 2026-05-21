import { SectionHeader } from "@/components/section-header";

export function UIShowcase() {
  return (
    <section className="py-20 lg:py-28 bg-surface/40 border-y border-border/60 relative overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto container-px">
        <SectionHeader
          eyebrow="UI Showcase"
          title="Power Apps that don't look like Power Apps"
          description="Design systems, layout patterns and component libraries inspired by Linear, Microsoft Fabric and modern SaaS."
        />

        <div className="mt-12 grid lg:grid-cols-12 gap-5">
          {/* big dashboard */}
          <div className="lg:col-span-8 rounded-2xl glass-card overflow-hidden p-6 hover:shadow-[var(--shadow-elevated)] transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Operations Overview</p>
                <p className="text-lg font-semibold">Q2 Performance</p>
              </div>
              <div className="flex gap-1.5">
                {["7d","30d","90d","12m"].map((t,i) => (
                  <span key={t} className={`text-[11px] px-2 py-1 rounded-md ${i===1?"bg-primary text-primary-foreground":"bg-secondary text-muted-foreground"}`}>{t}</span>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-4 gap-3">
              {[
                {l:"Revenue",v:"$4.82M",d:"+18.2%"},
                {l:"Active Users",v:"24,180",d:"+9.4%"},
                {l:"Avg Cycle",v:"3.2h",d:"-21%"},
                {l:"NPS",v:"72",d:"+6"},
              ].map(k=>(
                <div key={k.l} className="p-3 rounded-lg bg-background/60 border border-border/60">
                  <p className="text-[10.5px] text-muted-foreground">{k.l}</p>
                  <p className="text-base font-semibold mt-0.5">{k.v}</p>
                  <p className="text-[10.5px] text-primary">{k.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-background/60 border border-border/60 p-4">
              <svg viewBox="0 0 400 120" className="w-full h-32">
                <defs>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.16 235)" stopOpacity="0.45"/>
                    <stop offset="100%" stopColor="oklch(0.7 0.16 235)" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,90 C40,80 70,60 110,65 C160,72 190,30 240,38 C290,46 320,20 400,15 L400,120 L0,120 Z" fill="url(#g2)"/>
                <path d="M0,90 C40,80 70,60 110,65 C160,72 190,30 240,38 C290,46 320,20 400,15" fill="none" stroke="oklch(0.7 0.16 235)" strokeWidth="1.5"/>
              </svg>
            </div>
          </div>

          {/* mobile card */}
          <div className="lg:col-span-4 rounded-2xl glass-card p-6 flex flex-col">
            <p className="text-xs text-muted-foreground">Mobile App</p>
            <p className="text-lg font-semibold">Field Inspection</p>
            <div className="mt-4 mx-auto w-44 rounded-[1.6rem] border-[10px] border-foreground/80 bg-background overflow-hidden shadow-xl">
              <div className="h-3 bg-foreground/80" />
              <div className="p-3 space-y-2">
                <div className="h-2 w-16 rounded-full bg-muted" />
                <div className="h-6 w-full rounded-md gradient-primary" />
                {[0,1,2].map(i=>(
                  <div key={i} className="p-2 rounded-md bg-secondary">
                    <div className="h-1.5 w-12 rounded-full bg-foreground/30" />
                    <div className="mt-1.5 h-1.5 w-20 rounded-full bg-foreground/15" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* table */}
          <div className="lg:col-span-7 rounded-2xl glass-card p-6">
            <p className="text-sm font-medium">Approvals Pipeline</p>
            <div className="mt-4 rounded-lg border border-border/60 overflow-hidden">
              <div className="grid grid-cols-4 px-4 py-2 bg-secondary/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                <span>Request</span><span>Owner</span><span>Stage</span><span className="text-right">SLA</span>
              </div>
              {[
                {r:"INV-2841",o:"P. Khan",s:"Manager Review",sla:"4h",c:"primary"},
                {r:"INV-2840",o:"R. Lopez",s:"Finance",sla:"1d",c:"muted"},
                {r:"INV-2839",o:"M. Chen",s:"Approved",sla:"—",c:"success"},
                {r:"INV-2838",o:"T. Patel",s:"Pending",sla:"6h",c:"muted"},
              ].map(row=>(
                <div key={row.r} className="grid grid-cols-4 px-4 py-2.5 border-t border-border/60 text-sm items-center">
                  <span className="font-mono text-xs">{row.r}</span>
                  <span className="text-muted-foreground">{row.o}</span>
                  <span><span className={`text-[10.5px] px-2 py-0.5 rounded-full ${row.c==="primary"?"bg-primary/15 text-primary":row.c==="success"?"bg-emerald-500/15 text-emerald-500":"bg-secondary text-muted-foreground"}`}>{row.s}</span></span>
                  <span className="text-right text-xs text-muted-foreground">{row.sla}</span>
                </div>
              ))}
            </div>
          </div>

          {/* sidebar nav */}
          <div className="lg:col-span-5 rounded-2xl glass-card p-6">
            <p className="text-sm font-medium">Workspace</p>
            <div className="mt-4 grid grid-cols-[180px_1fr] gap-3 h-56">
              <div className="rounded-lg bg-background/60 border border-border/60 p-2 space-y-1">
                {["Overview","Apps","Flows","Analytics","Settings","Members","Billing"].map((it,i)=>(
                  <div key={it} className={`text-xs px-2.5 py-1.5 rounded-md ${i===1?"bg-primary/15 text-primary":"text-muted-foreground"}`}>{it}</div>
                ))}
              </div>
              <div className="rounded-lg bg-background/60 border border-border/60 p-3 grid grid-cols-2 gap-2">
                {Array.from({length:6}).map((_,i)=>(
                  <div key={i} className="rounded-md bg-gradient-to-br from-primary/15 to-primary-glow/10 border border-border/40" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
