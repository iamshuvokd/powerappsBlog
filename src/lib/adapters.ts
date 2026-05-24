import { format } from "date-fns";
import type { Article } from "@/lib/data";
import type { ApiPost } from "@/lib/api";

// Derive a friendly display name from an email local-part (DB stores only email).
export function authorName(email: string | null | undefined): string {
  if (!email) return "PowerApps.blog";
  const local = email.split("@")[0] ?? "";
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return name || "PowerApps.blog";
}

// Map an API post into the existing Article card shape so the current
// list/card components render unchanged.
export function toArticle(post: ApiPost): Article {
  const category = post.tags[0]?.name ?? "Power Platform";
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category,
    readingTime: `${post.readTime} min`,
    date: post.publishedAt ? format(new Date(post.publishedAt), "MMM dd, yyyy") : "",
    tag: post.tags[0]?.name ?? category,
    author: authorName(post.author?.email),
    keywords: post.tags.map((tag) => tag.name),
  };
}
