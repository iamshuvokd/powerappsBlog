import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { categories, searchArticles, type Article } from "@/lib/data";
import { useArticles } from "@/lib/queries";
import { Thumb } from "@/components/sections/featured-articles";

type BlogArchiveProps = {
  eyebrow: string;
  title: string;
  description: string;
  category?: Article["category"];
};

const categoryLinks = [
  { to: "/", label: "All Blogs", category: undefined },
  ...categories.map((category) => ({
    to: category.to,
    label: category.name,
    category: category.name,
  })),
];

export function BlogArchive({ eyebrow, title, description, category }: BlogArchiveProps) {
  const [query, setQuery] = useState("");
  const { data: allArticles = [], isPending, isError } = useArticles();

  const source = useMemo(
    () =>
      category
        ? allArticles.filter(
            (article) => article.category === category || article.keywords.includes(category),
          )
        : allArticles,
    [allArticles, category],
  );

  const visible = useMemo(() => searchArticles(query, source), [query, source]);

  return (
    <section id="blogs" className="scroll-mt-24 py-18 lg:py-24">
      <div className="max-w-7xl mx-auto container-px">
        <div className="grid gap-7 lg:grid-cols-[1fr_420px] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p>
          </div>

          <div className="relative flex items-center gap-2 h-12 px-4 rounded-xl bg-card border border-border/70 shadow-[var(--shadow-soft)]">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
              placeholder="Search all blog articles..."
            />
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {categoryLinks.map((link) => {
            const active = category === link.category || (!category && !link.category);
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {isPending ? (
          <ArchiveSkeleton />
        ) : isError ? (
          <div className="mt-10 rounded-xl border border-border/70 bg-card p-8 text-center">
            <p className="font-medium">Couldn't load articles</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Make sure the API server is running on{" "}
              <code className="rounded bg-secondary px-1 py-0.5">{"http://localhost:4000"}</code>.
            </p>
          </div>
        ) : visible.length > 0 ? (
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((article, index) => (
              <ArticleCard key={article.slug} article={article} index={index} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-xl border border-border/70 bg-card p-8 text-center">
            <p className="font-medium">No articles found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Search by title, topic, tool, author or keyword.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ArchiveSkeleton() {
  return (
    <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card"
        >
          <div className="h-44 animate-pulse bg-secondary/70" />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-secondary/70" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-secondary/70" />
            <div className="h-3 w-full animate-pulse rounded bg-secondary/60" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-secondary/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ArticleCard({ article, index }: { article: Article; index: number }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: article.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]"
    >
      <Thumb seed={index} className="h-44" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5">{article.category}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readingTime}
          </span>
        </div>

        <h3 className="mt-3 text-[15px] font-medium leading-snug transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>

        <div className="mt-auto pt-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{article.date}</span>
          <span className="inline-flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Read article <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}
