import { ArrowRight } from "lucide-react";
import { services } from "@/lib/data";
import { SectionHeader } from "@/components/section-header";

export function Services() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto container-px">
        <SectionHeader
          eyebrow="Services"
          title="Work with the team"
          description="Enterprise-grade Power Platform engineering, advisory and training."
        />
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <a
              key={s.name}
              href="#"
              className="group p-6 rounded-xl bg-card border border-border/70 hover:border-primary/40 hover:-translate-y-0.5 transition-all"
            >
              <div className="h-10 w-10 rounded-lg grid place-items-center bg-primary/10 text-primary group-hover:gradient-primary group-hover:text-primary-foreground transition-all">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-medium">{s.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="h-3 w-3" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
