import { Hono } from "hono";
import { prisma } from "../db";
import { requireAdmin, type AppEnv } from "../auth";
import { slugify } from "../lib/slug";
import { createTagSchema } from "../validation";

export const tagsRouter = new Hono<AppEnv>();

// GET /api/tags — public list with post counts
tagsRouter.get("/", async (c) => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return c.json({
    tags: tags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      postCount: t._count.posts,
    })),
  });
});

// POST /api/tags — create (admin)
tagsRouter.post("/", requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createTagSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const name = parsed.data.name;
  const slug = slugify(parsed.data.slug ?? name);
  if (!slug) return c.json({ error: "Invalid tag name" }, 400);

  const existing = await prisma.tag.findUnique({ where: { slug } });
  if (existing) return c.json({ error: "Tag already exists", tag: existing }, 409);

  const tag = await prisma.tag.create({ data: { name, slug } });
  return c.json({ tag }, 201);
});
