import { Hono } from "hono";
import { prisma } from "../db";
import { requireAdmin, type AppEnv } from "../auth";
import { sendWelcomeEmail } from "../lib/mailer";
import { subscribeSchema } from "../validation";

// POST /api/subscribe — public newsletter sign-up
export const subscribeRouter = new Hono<AppEnv>();

subscribeRouter.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Please enter a valid email address." }, 400);
  }

  // Honeypot tripped — act successful so bots learn nothing.
  if (parsed.data.website) {
    return c.json({ ok: true, alreadySubscribed: false }, 201);
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    return c.json({ ok: true, alreadySubscribed: true });
  }

  await prisma.subscriber.create({ data: { email } });

  // Best-effort welcome email — non-blocking, never throws.
  void sendWelcomeEmail(email);

  return c.json({ ok: true, alreadySubscribed: false }, 201);
});

// /api/admin/subscribers — list + delete (admin)
export const adminSubscribersRouter = new Hono<AppEnv>();
adminSubscribersRouter.use("*", requireAdmin);

adminSubscribersRouter.get("/", async (c) => {
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  return c.json({ subscribers, total: subscribers.length });
});

adminSubscribersRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json({ error: "Invalid id" }, 400);

  const existing = await prisma.subscriber.findUnique({ where: { id } });
  if (!existing) return c.json({ error: "Not found" }, 404);

  await prisma.subscriber.delete({ where: { id } });
  return c.json({ ok: true });
});
