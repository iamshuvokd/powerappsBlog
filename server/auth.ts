import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { MiddlewareHandler } from "hono";
import { env } from "./env";

export interface AuthUser {
  id: number;
  email: string;
  role: string;
}

// Shared Hono environment so `c.get("user")` is typed in protected routes.
export type AppEnv = { Variables: { user: AuthUser } };

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: AuthUser): string {
  const options: jwt.SignOptions = {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, options);
}

export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
  return {
    id: Number(payload.sub),
    email: String(payload.email ?? ""),
    role: String(payload.role ?? ""),
  };
}

// Require a valid admin Bearer token. Attaches the decoded user to context.
export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const header = c.req.header("Authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const user = verifyToken(token);
    if (user.role !== "ADMIN") {
      return c.json({ error: "Forbidden" }, 403);
    }
    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
};
