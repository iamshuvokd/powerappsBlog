import { Hono } from "hono";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { requireAdmin, type AppEnv } from "../auth";
import { calculateReadTime } from "../lib/read-time";
import {
  buildTagCreateData,
  ensureUniqueSlug,
  postInclude,
  serializePost,
} from "../lib/post-service";
import {
  createPostSchema,
  listPostsQuerySchema,
  updatePostSchema,
  type Content,
} from "../validation";

export const postsRouter = new Hono<AppEnv>();

// GET /api/posts — public list of published posts (?tag=&page=&pageSize=)
postsRouter.get("/", async (c) => {
  const parsed = listPostsQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json({ error: "Invalid query", details: parsed.error.flatten() }, 400);
  }
  const { tag, page, pageSize } = parsed.data;

  const where: Prisma.PostWhereInput = {
    status: "PUBLISHED",
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
  };

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      include: postInclude,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return c.json({
    posts: posts.map(serializePost),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

// GET /api/posts/:slug — public single post, increments viewCount
postsRouter.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const post = await prisma.post.findUnique({ where: { slug }, include: postInclude });
  if (!post || post.status !== "PUBLISHED") {
    return c.json({ error: "Not found" }, 404);
  }

  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  });

  return c.json({ post: serializePost({ ...post, viewCount: post.viewCount + 1 }) });
});

// POST /api/posts — create (admin)
postsRouter.post("/", requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }
  const input = parsed.data;
  const user = c.get("user");

  const slug = await ensureUniqueSlug(input.slug ?? input.title);
  const status = input.status ?? "DRAFT";
  const content = input.content as Content;
  const readTime = calculateReadTime(content);
  const publishedAt = input.publishedAt
    ? new Date(input.publishedAt)
    : status === "PUBLISHED"
      ? new Date()
      : null;

  const post = await prisma.post.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: content as unknown as Prisma.InputJsonValue,
      coverImage: input.coverImage ?? null,
      status,
      publishedAt,
      readTime,
      author: { connect: { id: user.id } },
      tags: { create: input.tags ? await buildTagCreateData(input.tags) : [] },
    },
    include: postInclude,
  });

  return c.json({ post: serializePost(post) }, 201);
});

// PUT /api/posts/:id — update (admin)
postsRouter.put("/:id", requireAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json({ error: "Invalid id" }, 400);

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  const body = await c.req.json().catch(() => null);
  const parsed = updatePostSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }
  const input = parsed.data;

  const data: Prisma.PostUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.slug !== undefined) data.slug = await ensureUniqueSlug(input.slug, id);
  if (input.excerpt !== undefined) data.excerpt = input.excerpt;
  if (input.content !== undefined) {
    data.content = input.content as unknown as Prisma.InputJsonValue;
    data.readTime = calculateReadTime(input.content as Content);
  }
  if (input.coverImage !== undefined) data.coverImage = input.coverImage;
  if (input.status !== undefined) {
    data.status = input.status;
    if (input.status === "PUBLISHED" && !existing.publishedAt && input.publishedAt === undefined) {
      data.publishedAt = new Date();
    }
  }
  if (input.publishedAt !== undefined) {
    data.publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
  }
  if (input.tags !== undefined) {
    data.tags = { deleteMany: {}, create: await buildTagCreateData(input.tags) };
  }

  const post = await prisma.post.update({ where: { id }, data, include: postInclude });
  return c.json({ post: serializePost(post) });
});

// DELETE /api/posts/:id — delete (admin)
postsRouter.delete("/:id", requireAdmin, async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json({ error: "Invalid id" }, 400);

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  await prisma.post.delete({ where: { id } });
  return c.json({ ok: true });
});
