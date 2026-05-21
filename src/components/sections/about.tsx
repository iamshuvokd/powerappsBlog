import { Award, Briefcase, Sparkles } from "lucide-react";
import { SectionHeader } from "@/components/section-header";

const skills = ["Power Apps", "Power Automate", "Dataverse", "Power BI", "SharePoint", "Azure OpenAI", "Copilot Studio", "Graph API", "TypeScript", "C#", "DAX", "PCF Controls"];
const timeline = [
  { y: "2019", t: "Started with SharePoint & InfoPath, then Power Platform GA." },
  { y: "2021", t: "Led enterprise rollouts across HR, Operations and Compliance." },
  { y: "2023", t: "Architected AI-augmented workflows with Azure OpenAI." },
  { y: "2026", t: "Today: helping enterprise teams ship production Power Apps." },
];

export function About() {
  return (
    <section className="py-20 lg:py-28 bg-surface/40 border-y border-border/60">
      <div className="max-w-7xl mx-auto container-px grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <SectionHeader
            eyebrow="About"
            title="Enterprise Power Platform engineering, in public."
            description="Hands-on architect with a decade across Microsoft 365, Dataverse, and AI-augmented automation — shipping systems that real businesses depend on."
            align="left"
          />
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[{l:"Years",v:"10+"},{l:"Projects",v:"120+"},{l:"Industries",v:"14"}].map(s=>(
              <div key={s.l} className="p-4 rounded-xl bg-card border border-border/70">
                <p className="text-2xl font-semibold gradient-text">{s.v}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Skills & Technologies</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-md bg-secondary border border-border/60">{s}</span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              {i:Award,t:"MS Certified"},
              {i:Briefcase,t:"Enterprise Architect"},
              {i:Sparkles,t:"AI Specialist"},
            ].map(c=>(
              <div key={c.t} className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border/70">
                <c.i className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium">{c.t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-border to-transparent" />
          <ul className="space-y-6">
            {timeline.map((tl) => (
              <li key={tl.y} className="relative pl-12">
                <span className="absolute left-0 top-1 h-7 w-7 rounded-full gradient-primary text-primary-foreground text-[10px] grid place-items-center font-semibold shadow-[var(--shadow-glow)]">
                  {tl.y}
                </span>
                <div className="p-5 rounded-xl bg-card border border-border/70">
                  <p className="text-sm">{tl.t}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
