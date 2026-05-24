import { Hono } from "hono";
import { prisma } from "../db";
import { requireAdmin, type AppEnv } from "../auth";
import { postInclude, serializePost } from "../lib/post-service";

export const adminRouter = new Hono<AppEnv>();

// All admin routes require a valid admin token.
adminRouter.use("*", requireAdmin);

// GET /api/admin/stats — dashboard cards
adminRouter.get("/stats", async (c) => {
  const [totalPosts, published, drafts, views] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.aggregate({ _sum: { viewCount: true } }),
  ]);

  return c.json({
    totalPosts,
    published,
    drafts,
    totalViews: views._sum.viewCount ?? 0,
  });
});

// GET /api/admin/posts — all posts (any status), newest edits first
adminRouter.get("/posts", async (c) => {
  const posts = await prisma.post.findMany({
    include: postInclude,
    orderBy: { updatedAt: "desc" },
  });
  return c.json({ posts: posts.map(serializePost) });
});

// GET /api/admin/posts/:id — single post by id for the editor
adminRouter.get("/posts/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json({ error: "Invalid id" }, 400);

  const post = await prisma.post.findUnique({ where: { id }, include: postInclude });
  if (!post) return c.json({ error: "Not found" }, 404);

  return c.json({ post: serializePost(post) });
});
