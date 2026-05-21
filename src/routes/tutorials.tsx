import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { articles, categories } from "@/lib/data";
import { Thumb } from "@/components/sections/featured-articles";

export const Route = createFileRoute("/tutorials")({
  head: () => ({
    meta: [
      { title: "Tutorials — PowerApps.blog" },
      { name: "description", content: "Browse enterprise Power Platform tutorials across Power Apps, Power Automate, SharePoint, Power BI, Dataverse and AI." },
      { property: "og:title", content: "Tutorials — PowerApps.blog" },
      { property: "og:description", content: "Enterprise Power Platform tutorials and deep dives." },
    ],
  }),
  component: TutorialsPage,
});

function TutorialsPage() {
  const [active, setActive] = useState("All");
  const tags = ["All", ...categories.map((c) => c.name)];
  const visible = active === "All" ? articles : articles.filter((a) => a.category === active);

  return (
    <div className="pt-28 pb-24">
      <div className="max-w-7xl mx-auto container-px">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium">Tutorials</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
            Learn the Power Platform, <span className="gradient-text">properly</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Production-grade walkthroughs, architectures and patterns from real enterprise deployments.
          </p>
        </div>

        {/* search */}
        <div className="mt-10 max-w-xl mx-auto flex items-center gap-2 h-12 px-4 rounded-xl glass-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input className="flex-1 bg-transparent text-sm focus:outline-none" placeholder="Search tutorials, e.g. delegation, RPA, Dataverse…" />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-secondary border border-border/60">⌘K</kbd>
        </div>

        {/* tags */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                active === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* grid */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((a, i) => (
            <Link
              key={a.slug}
              to="/blog/$slug"
              params={{ slug: a.slug }}
              className="group rounded-xl overflow-hidden border border-border/70 bg-card hover:border-primary/40 hover:-translate-y-0.5 transition-all"
            >
              <Thumb seed={i} className="h-44" />
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full bg-secondary">{a.category}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{a.readingTime}</span>
                </div>
                <h3 className="mt-3 font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
                <p className="mt-4 text-xs text-muted-foreground inline-flex items-center gap-1">{a.date} <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" /></p>
              </div>
            </Link>
          ))}
        </div>

        {/* pagination */}
        <div className="mt-12 flex justify-center items-center gap-1">
          <button className="h-9 w-9 grid place-items-center rounded-md border border-border/70 text-muted-foreground hover:bg-secondary"><ChevronLeft className="h-4 w-4"/></button>
          {[1,2,3,4].map((n)=>(
            <button key={n} className={`h-9 w-9 rounded-md text-sm ${n===1?"gradient-primary text-primary-foreground":"border border-border/70 text-muted-foreground hover:bg-secondary"}`}>{n}</button>
          ))}
          <button className="h-9 w-9 grid place-items-center rounded-md border border-border/70 text-muted-foreground hover:bg-secondary"><ChevronRight className="h-4 w-4"/></button>
        </div>
      </div>
    </div>
  );
}
