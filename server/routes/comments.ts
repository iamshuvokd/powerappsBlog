import { Hono } from "hono";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { requireAdmin, type AppEnv } from "../auth";
import { serializeAdminComment, serializePublicComment } from "../lib/comment-service";
import { sendCommentNotification } from "../lib/mailer";
import { adminReplySchema, createCommentSchema, updateCommentStatusSchema } from "../validation";

// Public comment endpoints, mounted at /api/posts/:slug/comments.
// Hono exposes the parent ":slug" param to this nested router.
export const publicCommentsRouter = new Hono<AppEnv>();

// GET /api/posts/:slug/comments — approved comments (threaded, one level deep)
publicCommentsRouter.get("/", async (c) => {
  const slug = c.req.param("slug");
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") {
    return c.json({ error: "Not found" }, 404);
  }

  const comments = await prisma.comment.findMany({
    where: { postId: post.id, status: "APPROVED", parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      replies: { where: { status: "APPROVED" }, orderBy: { createdAt: "asc" } },
    },
  });

  return c.json({ comments: comments.map(serializePublicComment) });
});

// POST /api/posts/:slug/comments — submit a comment (held for moderation)
publicCommentsRouter.post("/", async (c) => {
  const slug = c.req.param("slug");
  const body = await c.req.json().catch(() => null);
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }
  const input = parsed.data;

  // Honeypot tripped — pretend success so bots don't learn anything.
  if (input.website) {
    return c.json({ pending: true }, 201);
  }

  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") {
    return c.json({ error: "Not found" }, 404);
  }

  // Replies always attach to the top-level ancestor (one-level threads).
  let parentId: number | null = null;
  if (input.parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: input.parentId } });
    if (!parent || parent.postId !== post.id) {
      return c.json({ error: "Invalid parent comment" }, 400);
    }
    parentId = parent.parentId ?? parent.id;
  }

  await prisma.comment.create({
    data: {
      postId: post.id,
      parentId,
      authorName: input.authorName,
      authorEmail: input.authorEmail,
      body: input.body,
      status: "PENDING",
    },
  });

  // Best-effort moderation alert — non-blocking, never throws.
  void sendCommentNotification({
    postTitle: post.title,
    postSlug: post.slug,
    authorName: input.authorName,
    authorEmail: input.authorEmail,
    body: input.body,
  });

  return c.json({ pending: true }, 201);
});

// Admin comment moderation, mounted at /api/admin/comments.
export const adminCommentsRouter = new Hono<AppEnv>();
adminCommentsRouter.use("*", requireAdmin);

// GET /api/admin/comments?status= — all comments + per-status counts
adminCommentsRouter.get("/", async (c) => {
  const status = c.req.query("status");
  const where: Prisma.CommentWhereInput =
    status === "PENDING" || status === "APPROVED" || status === "SPAM" ? { status } : {};

  const [comments, pending, approved, spam] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { post: { select: { title: true, slug: true } } },
    }),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.comment.count({ where: { status: "APPROVED" } }),
    prisma.comment.count({ where: { status: "SPAM" } }),
  ]);

  return c.json({
    comments: comments.map(serializeAdminComment),
    counts: { pending, approved, spam, all: pending + approved + spam },
  });
});

// POST /api/admin/comments/:id/reply — admin reply (auto-approved)
adminCommentsRouter.post("/:id/reply", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json({ error: "Invalid id" }, 400);

  const target = await prisma.comment.findUnique({ where: { id } });
  if (!target) return c.json({ error: "Not found" }, 404);

  const body = await c.req.json().catch(() => null);
  const parsed = adminReplySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const user = c.get("user");
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true, email: true },
  });
  const displayName = dbUser?.name?.trim() || user.email.split("@")[0] || "Admin";
  const reply = await prisma.comment.create({
    data: {
      postId: target.postId,
      parentId: target.parentId ?? target.id,
      authorName: displayName,
      authorEmail: dbUser?.email ?? user.email,
      body: parsed.data.body,
      status: "APPROVED",
      isAdminReply: true,
    },
    include: { post: { select: { title: true, slug: true } } },
  });

  return c.json({ comment: serializeAdminComment(reply) }, 201);
});

// PATCH /api/admin/comments/:id — change status (approve / spam / pending)
adminCommentsRouter.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json({ error: "Invalid id" }, 400);

  const body = await c.req.json().catch(() => null);
  const parsed = updateCommentStatusSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  const comment = await prisma.comment.update({
    where: { id },
    data: { status: parsed.data.status },
    include: { post: { select: { title: true, slug: true } } },
  });
  return c.json({ comment: serializeAdminComment(comment) });
});

// DELETE /api/admin/comments/:id — delete (replies cascade)
adminCommentsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json({ error: "Invalid id" }, 400);

  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  await prisma.comment.delete({ where: { id } });
  return c.json({ ok: true });
});
