import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { fetchPost } from "@/lib/api";
import { authorName } from "@/lib/adapters";
import { useArticles } from "@/lib/queries";
import { Thumb } from "@/components/sections/featured-articles";
import { PostContent, buildToc } from "@/components/post-content";
import { ShareButtons } from "@/components/share-buttons";
import { CommentSection } from "@/components/comments/comment-section";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    try {
      const { post } = await fetchPost(params.slug);
      return { post };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.post.title} - PowerApps.blog` },
          { name: "description", content: loaderData.post.excerpt },
          { property: "og:title", content: loaderData.post.title },
          { property: "og:description", content: loaderData.post.excerpt },
          { property: "og:type", content: "article" },
          ...(loaderData.post.coverImage
            ? [{ property: "og:image", content: loaderData.post.coverImage }]
            : []),
        ]
      : [],
  }),
  notFoundComponent: () => <div className="pt-32 text-center">Article not found</div>,
  errorComponent: ({ error }) => <div className="pt-32 text-center">{error.message}</div>,
  component: ArticlePage,
});

function ArticlePage() {
  const { post } = Route.useLoaderData();
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>("");

  const toc = useMemo(() => buildToc(post.content), [post.content]);
  const category = post.tags[0]?.name ?? "Power Platform";
  const author = post.author?.name?.trim() || authorName(post.author?.email);
  const authorTitle = post.author?.title?.trim() || "Power Platform Architect";
  const dateLabel = post.publishedAt ? format(new Date(post.publishedAt), "MMM dd, yyyy") : "";
  const siteUrl = (import.meta.env.VITE_SITE_URL ?? "https://www.powerapps.blog").replace(
    /\/$/,
    "",
  );
  const shareUrl = `${siteUrl}/blog/${post.slug}`;

  const { data: allArticles = [] } = useArticles();
  const related = useMemo(() => {
    const others = allArticles.filter((item) => item.slug !== post.slug);
    // Manual related posts (set in the editor) take priority, in chosen order.
    if (post.relatedSlugs && post.relatedSlugs.length > 0) {
      const picked = post.relatedSlugs
        .map((slug) => others.find((item) => item.slug === slug))
        .filter((item): item is (typeof others)[number] => Boolean(item));
      if (picked.length > 0) return picked.slice(0, 6);
    }
    // Fallback: auto-pick by matching category/keywords.
    const sameTag = others.filter(
      (item) => item.category === category || item.keywords.includes(category),
    );
    return (sameTag.length > 0 ? sameTag : others).slice(0, 3);
  }, [allArticles, post.slug, post.relatedSlugs, category]);

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

  // Highlight the active TOC heading while scrolling.
  useEffect(() => {
    if (toc.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

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
                {category}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.readTime} min
              </span>
              {dateLabel ? (
                <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {dateLabel}
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
            {post.tags.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    to="/tutorials"
                    className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full gradient-primary grid place-items-center text-primary-foreground font-medium text-sm">
                {author
                  .split(" ")
                  .map((name) => name[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-sm font-medium">{author}</p>
                <p className="text-xs text-muted-foreground">{authorTitle}</p>
              </div>
            </div>
          </header>

          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              loading="lazy"
              className="mt-10 h-72 w-full rounded-2xl object-cover sm:h-96"
            />
          ) : (
            <Thumb seed={post.id} className="mt-10 h-72 sm:h-96 rounded-2xl" />
          )}

          <div className="mt-12 grid lg:grid-cols-[1fr_240px] gap-12">
            <div>
              <PostContent blocks={post.content} />

              <div className="mt-10 border-t border-border/60 pt-6">
                <ShareButtons url={shareUrl} title={post.title} />
              </div>

              <CommentSection slug={post.slug} />
            </div>

            {toc.length > 0 ? (
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
                        className={`block text-sm py-1 border-l pl-3 transition-colors ${
                          item.level === 3 ? "pl-6" : ""
                        } ${
                          activeId === item.id
                            ? "border-primary text-foreground"
                            : "border-border/70 text-muted-foreground hover:text-foreground hover:border-primary"
                        }`}
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            ) : null}
          </div>

          {related.length > 0 ? (
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
          ) : null}
        </div>
      </article>
    </>
  );
}
