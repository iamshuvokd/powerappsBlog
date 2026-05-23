import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Flame, TrendingUp } from "lucide-react";
import { articles } from "@/lib/data";
import { SectionHeader } from "@/components/section-header";

function Thumb({ seed, className = "" }: { seed: number; className?: string }) {
  const hues = [220, 235, 200, 245, 215, 230];
  const h = hues[seed % hues.length];
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, oklch(0.55 0.18 ${h}) 0%, oklch(0.72 0.15 ${h - 20}) 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 70%, white 0%, transparent 50%)",
        }}
      />
      <div className="absolute inset-0 grid-bg opacity-40" />
    </div>
  );
}

export function FeaturedArticles() {
  const [featured, ...rest] = articles;
  return (
    <section className="py-20 lg:py-28 bg-surface/40 border-y border-border/60">
      <div className="max-w-7xl mx-auto container-px">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <SectionHeader
            eyebrow="Featured"
            title="Editor's picks"
            description="Production-grade blog articles and architectures from real enterprise projects."
            align="left"
          />
          <Link
            to="/"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          {/* big featured */}
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="lg:col-span-2 group rounded-2xl overflow-hidden border border-border/70 bg-card hover:border-primary/40 transition-all hover:shadow-[var(--shadow-elevated)]"
          >
            <Thumb seed={0} className="h-72 lg:h-80" />
            <div className="p-6 lg:p-8">
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  <Flame className="h-3 w-3" /> Featured
                </span>
                <span className="text-muted-foreground">{featured.category}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {featured.readingTime}
                </span>
              </div>
              <h3 className="mt-4 text-2xl lg:text-3xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                {featured.title}
              </h3>
              <p className="mt-3 text-muted-foreground line-clamp-2">{featured.excerpt}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                {featured.date} · {featured.author}
              </p>
            </div>
          </Link>

          {/* sidebar */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-border/70 bg-card">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary inline-flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Trending now
              </p>
              <div className="mt-4 space-y-4">
                {rest.slice(0, 3).map((a, i) => (
                  <Link
                    key={a.slug}
                    to="/blog/$slug"
                    params={{ slug: a.slug }}
                    className="group flex gap-3"
                  >
                    <span className="text-2xl font-semibold text-muted-foreground/40 w-6">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                        {a.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {a.category} · {a.readingTime}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-border/70 bg-card">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                Latest article
              </p>
              <Link
                to="/blog/$slug"
                params={{ slug: rest[3]?.slug ?? rest[0].slug }}
                className="group block mt-3"
              >
                <Thumb seed={3} className="h-28 rounded-lg" />
                <p className="mt-3 text-sm font-medium group-hover:text-primary transition-colors">
                  {rest[3]?.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{rest[3]?.date}</p>
              </Link>
            </div>
          </div>
        </div>

        {/* secondary grid */}
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.slice(0, 3).map((a, i) => (
            <Link
              key={a.slug}
              to="/blog/$slug"
              params={{ slug: a.slug }}
              className="group rounded-xl overflow-hidden border border-border/70 bg-card hover:border-primary/40 transition-all hover:-translate-y-0.5"
            >
              <Thumb seed={i + 1} className="h-44" />
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full bg-secondary">{a.category}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {a.readingTime}
                  </span>
                </div>
                <h3 className="mt-3 font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">
                  {a.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Thumb };
