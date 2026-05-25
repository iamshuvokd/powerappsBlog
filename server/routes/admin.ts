import { Hono } from "hono";
import { prisma } from "../db";
import { hashPassword, requireAdmin, verifyPassword, type AppEnv } from "../auth";
import { postInclude, serializePost } from "../lib/post-service";
import { updateAccountSchema, updateProfileSchema } from "../validation";

export const adminRouter = new Hono<AppEnv>();

// All admin routes require a valid admin token.
adminRouter.use("*", requireAdmin);

// GET /api/admin/profile — current admin's display profile
adminRouter.get("/profile", async (c) => {
  const user = c.get("user");
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, title: true, bio: true, avatar: true },
  });
  if (!profile) return c.json({ error: "Not found" }, 404);
  return c.json({ profile });
});

// PUT /api/admin/profile — update display name + title
adminRouter.put("/profile", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }
  const data: {
    name?: string | null;
    title?: string | null;
    bio?: string | null;
    avatar?: string | null;
  } = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name?.trim() || null;
  if (parsed.data.title !== undefined) data.title = parsed.data.title?.trim() || null;
  if (parsed.data.bio !== undefined) data.bio = parsed.data.bio?.trim() || null;
  if (parsed.data.avatar !== undefined) data.avatar = parsed.data.avatar || null;

  const profile = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { id: true, email: true, name: true, title: true, bio: true, avatar: true },
  });
  return c.json({ profile });
});

// PUT /api/admin/account — change login email and/or password (needs current password)
adminRouter.put("/account", async (c) => {
  const user = c.get("user");
  const body = await c.req.json().catch(() => null);
  const parsed = updateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }
  const { currentPassword, email, newPassword } = parsed.data;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return c.json({ error: "Not found" }, 404);

  const ok = await verifyPassword(currentPassword, dbUser.password);
  if (!ok) return c.json({ error: "Current password is incorrect." }, 400);

  const data: { email?: string; password?: string } = {};
  if (email && email.toLowerCase() !== dbUser.email.toLowerCase()) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken && taken.id !== user.id) {
      return c.json({ error: "That email is already in use." }, 409);
    }
    data.email = email;
  }
  if (newPassword) {
    data.password = await hashPassword(newPassword);
  }
  if (Object.keys(data).length === 0) {
    return c.json({ error: "Nothing to change." }, 400);
  }

  const profile = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { id: true, email: true, name: true, title: true, bio: true, avatar: true },
  });
  return c.json({ profile });
});

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
