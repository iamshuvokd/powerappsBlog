import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/lib/data";
import { SectionHeader } from "@/components/section-header";

export function Categories() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto container-px">
        <SectionHeader
          eyebrow="Categories"
          title="Browse by topic"
          description="From fundamentals to enterprise-grade architectures across the Microsoft Power Platform."
        />

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/tutorials"
              className="group relative p-5 rounded-xl bg-card border border-border/70 hover:border-primary/40 transition-all hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5"
            >
              <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg grid place-items-center bg-primary/10 text-primary group-hover:gradient-primary group-hover:text-primary-foreground transition-all">
                  <c.icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="mt-4 text-[15px] font-medium">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{c.desc}</p>
              <p className="mt-3 text-xs text-muted-foreground">{c.count} articles</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
