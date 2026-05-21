import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Calendar, Share2, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
import { articles } from "@/lib/data";
import { Thumb } from "@/components/sections/featured-articles";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const article = articles.find((a) => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.article.title} — PowerApps.blog` },
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
  { id: "introduction", label: "Introduction" },
  { id: "architecture", label: "Architecture overview" },
  { id: "data-model", label: "Data model" },
  { id: "ui-layer", label: "UI layer" },
  { id: "automation", label: "Automation" },
  { id: "security", label: "Security & governance" },
  { id: "conclusion", label: "Conclusion" },
];

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (scrolled / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      {/* reading progress */}
      <div className="fixed top-16 inset-x-0 h-0.5 bg-border/40 z-40">
        <div className="h-full gradient-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <article className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto container-px">
          <Link to="/tutorials" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Back to tutorials
          </Link>

          <header className="mt-6 max-w-3xl">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{article.category}</span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {article.readingTime}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {article.date}
              </span>
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">{article.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-primary grid place-items-center text-primary-foreground font-medium text-sm">
                {article.author.split(" ").map((n: string)=>n[0]).slice(0,2).join("")}
              </div>
              <div>
                <p className="text-sm font-medium">{article.author}</p>
                <p className="text-xs text-muted-foreground">Power Platform Architect</p>
              </div>
            </div>
          </header>

          <Thumb seed={2} className="mt-10 h-72 sm:h-96 rounded-2xl" />

          <div className="mt-12 grid lg:grid-cols-[1fr_240px] gap-12">
            <div className="prose-content max-w-2xl text-[15.5px] leading-[1.78] text-foreground/90 space-y-6">
              <Section id="introduction" title="Introduction">
                <p>
                  Building enterprise systems in the Power Platform is a different sport from quick canvas apps. You're committing to data
                  contracts, role-based access, telemetry, and a UX that won't embarrass you in a board demo.
                </p>
                <p>
                  In this walkthrough we'll cover the architecture, the data model, the UI patterns we use to keep things fast, and the
                  automations that quietly do the heavy lifting in the background.
                </p>
              </Section>

              <Section id="architecture" title="Architecture overview">
                <p>
                  The system separates four concerns: data (Dataverse), interactions (Power Apps), automation (Power Automate + Azure
                  Functions), and analytics (Power BI). Each can evolve independently.
                </p>
                <CodeBlock>{`// Tech stack
- Frontend:    Power Apps (Canvas + PCF controls)
- Data:        Dataverse with row-level security
- Automation:  Power Automate, Azure Functions
- Analytics:   Power BI (DirectQuery)
- Identity:    Entra ID (RBAC + Conditional Access)`}</CodeBlock>
              </Section>

              <Section id="data-model" title="Data model">
                <p>
                  Start with the entities and their relationships before opening the maker portal. A clean ERD will save weeks downstream.
                </p>
                <ul className="list-disc pl-6 space-y-1.5">
                  <li><strong>Item</strong> — SKU, category, unit, reorder threshold</li>
                  <li><strong>Location</strong> — warehouse, bin, capacity</li>
                  <li><strong>Movement</strong> — in/out, source, destination, actor</li>
                  <li><strong>Audit</strong> — append-only log of state transitions</li>
                </ul>
              </Section>

              <Section id="ui-layer" title="UI layer">
                <p>
                  We design with tokens — radii, spacing, typography, and color — defined once and referenced everywhere. Components
                  compose from primitives so the look stays consistent as the app grows.
                </p>
                <CodeBlock>{`Set(theme, {
  brand:   ColorValue("#0078D4"),
  surface: ColorValue("#0F172A"),
  text:    ColorValue("#F8FAFC"),
  radius:  12,
  space:   {sm: 8, md: 16, lg: 24}
});`}</CodeBlock>
              </Section>

              <Section id="automation" title="Automation">
                <p>
                  Cloud flows handle approvals, notifications, and integrations. Heavier work — like generating PDFs at scale — moves to
                  Azure Functions called via custom connectors.
                </p>
              </Section>

              <Section id="security" title="Security & governance">
                <p>
                  Row-level security in Dataverse paired with Entra ID groups gives us least privilege out of the box. DLP policies prevent
                  data exfiltration between connectors.
                </p>
              </Section>

              <Section id="conclusion" title="Conclusion">
                <p>
                  Treat your Power Platform apps like real software. Tokens, tests, telemetry, and discipline beat clever formulas every time.
                </p>
              </Section>

              <div className="mt-10 pt-6 border-t border-border/60 flex items-center gap-3 text-sm">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Share</span>
                <button className="h-8 w-8 grid place-items-center rounded-md border border-border/70 hover:bg-secondary"><Twitter className="h-3.5 w-3.5" /></button>
                <button className="h-8 w-8 grid place-items-center rounded-md border border-border/70 hover:bg-secondary"><Linkedin className="h-3.5 w-3.5" /></button>
                <button className="h-8 w-8 grid place-items-center rounded-md border border-border/70 hover:bg-secondary"><LinkIcon className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">On this page</p>
                <nav className="mt-3 space-y-1">
                  {toc.map((t) => (
                    <a key={t.id} href={`#${t.id}`} className="block text-sm py-1 text-muted-foreground hover:text-foreground border-l border-border/70 pl-3 hover:border-primary">
                      {t.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          </div>

          {/* author */}
          <div className="mt-16 p-6 rounded-2xl bg-card border border-border/70 flex flex-col sm:flex-row gap-5 items-start">
            <div className="h-14 w-14 rounded-full gradient-primary grid place-items-center text-primary-foreground font-semibold">
              {article.author.split(" ").map((n: string)=>n[0]).slice(0,2).join("")}
            </div>
            <div className="flex-1">
              <p className="font-medium">{article.author}</p>
              <p className="text-xs text-muted-foreground">Enterprise Power Platform Architect · 10+ yrs in Microsoft 365</p>
              <p className="mt-2 text-sm text-muted-foreground">Writes about production-grade Power Platform engineering, AI automation, and enterprise UX.</p>
            </div>
            <button className="text-sm px-4 py-2 rounded-md gradient-primary text-primary-foreground">Follow</button>
          </div>

          {/* related */}
          <div className="mt-16">
            <h3 className="text-xl font-semibold">Related articles</h3>
            <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((a, i) => (
                <Link key={a.slug} to="/blog/$slug" params={{ slug: a.slug }} className="group rounded-xl overflow-hidden border border-border/70 bg-card hover:border-primary/40 transition-all">
                  <Thumb seed={i + 2} className="h-36" />
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground">{a.category} · {a.readingTime}</p>
                    <p className="mt-1.5 text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">{a.title}</p>
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

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-semibold tracking-tight mt-8 mb-3">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-xl bg-surface border border-border/70 p-4 overflow-x-auto text-[13px] font-mono leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}
