import { Quote } from "lucide-react";
import { testimonials } from "@/lib/data";
import { SectionHeader } from "@/components/section-header";

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto container-px">
        <SectionHeader
          eyebrow="Testimonials"
          title="Trusted by enterprise teams"
        />
        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {testimonials.map((t,i)=>(
            <figure key={i} className="p-7 rounded-2xl bg-card border border-border/70 relative overflow-hidden">
              <Quote className="absolute -top-2 -right-2 h-24 w-24 text-primary/5" />
              <blockquote className="text-lg leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-primary grid place-items-center text-primary-foreground font-medium">
                  {t.name.split(" ").map((n: string)=>n[0]).slice(0,2).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
