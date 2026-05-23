import { ArrowUpRight } from "lucide-react";
import { solutions } from "@/lib/data";
import { SectionHeader } from "@/components/section-header";

export function EnterpriseSolutions() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto container-px">
        <SectionHeader
          eyebrow="Enterprise Solutions"
          title="Production systems, ready to study"
          description="Real implementations powering operations, HR, compliance and beyond — with full architecture breakdowns."
        />

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {solutions.map((s, i) => (
            <article
              key={s.name}
              className="group relative p-6 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all hover:shadow-[var(--shadow-elevated)] overflow-hidden"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full gradient-primary opacity-[0.08] group-hover:opacity-20 transition-opacity blur-2xl" />

              {/* preview */}
              <div className="relative h-28 rounded-lg bg-surface border border-border/60 overflow-hidden mb-5">
                <div className="absolute inset-x-0 top-0 h-5 border-b border-border/60 bg-background/60 flex items-center gap-1 px-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                </div>
                <div className="absolute inset-0 pt-6 px-2 grid grid-cols-3 gap-1.5">
                  {[0, 1, 2].map((j) => (
                    <div
                      key={j}
                      className="rounded bg-gradient-to-br from-primary/20 to-primary-glow/10 border border-border/40"
                    />
                  ))}
                  <div className="col-span-3 rounded bg-gradient-to-r from-primary/15 to-transparent border border-border/40" />
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="h-9 w-9 rounded-lg grid place-items-center bg-primary/10 text-primary">
                  <s.icon className="h-4.5 w-4.5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="mt-4 font-medium">{s.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{s.desc}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {s.stack.map((t) => (
                  <span
                    key={t}
                    className="text-[10.5px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
