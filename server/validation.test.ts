import { describe, expect, it } from "vitest";
import { blockSchema, createPostSchema, listPostsQuerySchema, loginSchema } from "./validation";

describe("createPostSchema", () => {
  it("accepts a valid post", () => {
    const result = createPostSchema.safeParse({
      title: "Hello",
      excerpt: "An excerpt",
      content: [{ type: "paragraph", text: "hi" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createPostSchema.safeParse({ title: "", excerpt: "x", content: [] });
    expect(result.success).toBe(false);
  });

  it("rejects an image block without a url", () => {
    const result = createPostSchema.safeParse({
      title: "t",
      excerpt: "x",
      content: [{ type: "image" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("listPostsQuerySchema", () => {
  it("applies defaults", () => {
    const result = listPostsQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(6);
  });

  it("coerces numeric strings", () => {
    const result = listPostsQuerySchema.parse({ page: "2", pageSize: "10" });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
  });

  it("allows pageSize up to 100 but rejects above", () => {
    expect(listPostsQuerySchema.safeParse({ pageSize: "100" }).success).toBe(true);
    expect(listPostsQuerySchema.safeParse({ pageSize: "500" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a valid email", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });
});

describe("blockSchema", () => {
  it("defaults code language to text", () => {
    const result = blockSchema.parse({ type: "code", code: "x" });
    expect(result).toMatchObject({ type: "code", language: "text" });
  });

  it("validates heading level (2 or 3 only)", () => {
    expect(blockSchema.safeParse({ type: "heading", level: 4, text: "x" }).success).toBe(false);
    expect(blockSchema.safeParse({ type: "heading", level: 2, text: "x" }).success).toBe(true);
  });
});
