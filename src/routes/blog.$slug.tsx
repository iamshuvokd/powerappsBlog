import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Linkedin,
  Link as LinkIcon,
  Share2,
  Twitter,
} from "lucide-react";
import { articles } from "@/lib/data";
import { Thumb } from "@/components/sections/featured-articles";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const article = articles.find((item) => item.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.article.title} - PowerApps.blog` },
          { name: "description", content: loaderData.article.excerpt },
          { property: "og:title", content: loaderData.article.title },
          { property: "og:description", content: loaderData.article.excerpt },
          { property: "og:type", content: "article" },
        ]
      : [],
  }),
  notFoundComponent: () => <div className="pt-32 text-center">Article not found</div>,
  errorComponent: ({ error }) => <div className="pt-32 text-center">{error.message}</div>,
  component: ArticlePage,
});

const toc = [
  { id: "overview", label: "Overview" },
  { id: "implementation", label: "Implementation" },
  { id: "governance", label: "Governance" },
  { id: "next-steps", label: "Next steps" },
];

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      setProgress(max > 0 ? (root.scrollTop / max) * 100 : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const relatedByCategory = articles
    .filter((item) => item.slug !== article.slug && item.category === article.category)
    .slice(0, 3);
  const related =
    relatedByCategory.length > 0
      ? relatedByCategory
      : articles.filter((item) => item.slug !== article.slug).slice(0, 3);

  return (
    <>
      <div className="fixed top-16 inset-x-0 h-0.5 bg-border/40 z-40">
        <div
          className="h-full gradient-primary transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <article className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto container-px">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to blogs
          </Link>

          <header className="mt-6 max-w-3xl">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {article.category}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {article.readingTime}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {article.date}
              </span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
              {article.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {article.keywords.slice(0, 5).map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-primary grid place-items-center text-primary-foreground font-medium text-sm">
                {article.author
                  .split(" ")
                  .map((name) => name[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-sm font-medium">{article.author}</p>
                <p className="text-xs text-muted-foreground">Power Platform Architect</p>
              </div>
            </div>
          </header>

          <Thumb
            seed={articles.findIndex((item) => item.slug === article.slug)}
            className="mt-10 h-72 sm:h-96 rounded-2xl"
          />

          <div className="mt-12 grid lg:grid-cols-[1fr_240px] gap-12">
            <div className="max-w-2xl text-[15.5px] leading-[1.78] text-foreground/90 space-y-6">
              <Section id="overview" title="Overview">
                <p>
                  This article focuses on the practical decisions behind {article.category}
                  solutions: how to structure the work, avoid common failure points and keep the
                  final result maintainable for the team that owns it.
                </p>
                <p>
                  The goal is not a quick demo. The goal is a repeatable pattern you can adapt to a
                  real business process with real users, permissions, exceptions and reporting
                  needs.
                </p>
              </Section>

              <Section id="implementation" title="Implementation">
                <p>
                  Start by writing down the system boundary, the source of truth and the handoffs
                  between app screens, SharePoint content, flow actions and notification channels.
                  Once those contracts are clear, the build becomes much easier to test.
                </p>
                <ul className="list-disc pl-6 space-y-1.5">
                  {article.keywords.slice(0, 4).map((keyword) => (
                    <li key={keyword}>
                      Use <strong>{keyword}</strong> as an explicit design concern, not an
                      afterthought.
                    </li>
                  ))}
                </ul>
              </Section>

              <Section id="governance" title="Governance">
                <p>
                  Production blog examples should include ownership, permissions, environment
                  strategy, monitoring and a rollback path. Those details are what make Power
                  Platform solutions trustworthy after launch day.
                </p>
              </Section>

              <Section id="next-steps" title="Next steps">
                <p>
                  Turn the pattern into a small checklist for your next build, then refine it as
                  your team discovers edge cases. Good Power Platform architecture is usually the
                  result of many small, deliberate decisions.
                </p>
              </Section>

              <div className="mt-10 pt-6 border-t border-border/60 flex items-center gap-3 text-sm">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Share</span>
                <button
                  aria-label="Share on Twitter"
                  className="h-8 w-8 grid place-items-center rounded-md border border-border/70 hover:bg-secondary"
                >
                  <Twitter className="h-3.5 w-3.5" />
                </button>
                <button
                  aria-label="Share on LinkedIn"
                  className="h-8 w-8 grid place-items-center rounded-md border border-border/70 hover:bg-secondary"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                </button>
                <button
                  aria-label="Copy article link"
                  className="h-8 w-8 grid place-items-center rounded-md border border-border/70 hover:bg-secondary"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  On this page
                </p>
                <nav className="mt-3 space-y-1">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm py-1 text-muted-foreground hover:text-foreground border-l border-border/70 pl-3 hover:border-primary"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          </div>

          <div className="mt-16">
            <h3 className="text-xl font-semibold">Related articles</h3>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item, index) => (
                <Link
                  key={item.slug}
                  to="/blog/$slug"
                  params={{ slug: item.slug }}
                  className="group rounded-xl overflow-hidden border border-border/70 bg-card hover:border-primary/40 transition-all"
                >
                  <Thumb seed={index + 2} className="h-36" />
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">
                      {item.category} - {item.readingTime}
                    </p>
                    <p className="mt-1.5 text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
                      Read article <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-semibold tracking-tight mt-8 mb-3">{title}</h2>
      {children}
    </section>
  );
}
