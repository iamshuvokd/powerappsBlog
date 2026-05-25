import { describe, expect, it } from "vitest";
import { authorName, toArticle } from "./adapters";
import type { ApiPost } from "./api";

function makePost(overrides: Partial<ApiPost> = {}): ApiPost {
  return {
    id: 1,
    title: "T",
    slug: "t",
    excerpt: "e",
    content: [],
    coverImage: null,
    relatedSlugs: [],
    status: "PUBLISHED",
    publishedAt: "2026-05-18T12:00:00.000Z",
    viewCount: 0,
    readTime: 5,
    createdAt: "2026-05-18T12:00:00.000Z",
    updatedAt: "2026-05-18T12:00:00.000Z",
    author: { id: 1, email: "admin@powerapps.blog", name: null, title: null },
    tags: [{ id: 1, name: "Power Apps", slug: "power-apps" }],
    ...overrides,
  };
}

describe("authorName", () => {
  it("derives a display name from the email local-part", () => {
    expect(authorName("admin@powerapps.blog")).toBe("Admin");
    expect(authorName("aarav.mehta@example.com")).toBe("Aarav Mehta");
  });

  it("falls back when email is missing", () => {
    expect(authorName(null)).toBe("PowerApps.blog");
    expect(authorName(undefined)).toBe("PowerApps.blog");
  });
});

describe("toArticle", () => {
  it("maps an API post into the card shape", () => {
    const article = toArticle(makePost());
    expect(article.title).toBe("T");
    expect(article.category).toBe("Power Apps");
    expect(article.readingTime).toBe("5 min");
    expect(article.keywords).toEqual(["Power Apps"]);
    expect(article.author).toBe("Admin");
    expect(article.date).toMatch(/May 1[78], 2026/);
  });

  it("falls back to 'Power Platform' when there are no tags", () => {
    const article = toArticle(makePost({ tags: [] }));
    expect(article.category).toBe("Power Platform");
  });
});
