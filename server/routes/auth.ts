import { Hono } from "hono";
import { prisma } from "../db";
import { signToken, verifyPassword } from "../auth";
import { loginSchema } from "../validation";

export const authRouter = new Hono();

// POST /api/auth/login — returns a JWT on valid credentials
authRouter.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", details: parsed.error.flatten() }, 400);
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return c.json({ error: "Invalid credentials" }, 401);

  const ok = await verifyPassword(password, user.password);
  if (!ok) return c.json({ error: "Invalid credentials" }, 401);

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return c.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// POST /api/auth/logout — stateless JWT; client discards the token
authRouter.post("/logout", (c) => c.json({ ok: true }));
