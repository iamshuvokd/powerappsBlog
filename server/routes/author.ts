import { Hono } from "hono";
import { prisma } from "../db";
import type { AppEnv } from "../auth";

// GET /api/author — public profile of the primary author (admin).
// Exposes only display fields; never the email.
export const authorRouter = new Hono<AppEnv>();

authorRouter.get("/", async (c) => {
  const author = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { id: "asc" },
    select: { name: true, title: true, bio: true, avatar: true },
  });
  return c.json({ author });
});
