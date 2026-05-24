import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./env";
import type { AppEnv } from "./auth";
import { postsRouter } from "./routes/posts";
import { adminRouter } from "./routes/admin";
import { tagsRouter } from "./routes/tags";
import { authRouter } from "./routes/auth";
import { uploadRouter, mediaRouter } from "./routes/media";

const isProd = process.env.NODE_ENV === "production";
const localhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export const app = new Hono<AppEnv>();

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return env.corsOrigins[0] ?? "*";
      if (env.corsOrigins.includes(origin)) return origin;
      // In dev, allow any localhost port (Vite may pick 5173/5174/5175).
      if (!isProd && localhostOrigin.test(origin)) return origin;
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.get("/health", (c) => c.json({ ok: true, service: "powerapps-blog-api" }));

app.route("/api/posts", postsRouter);
app.route("/api/admin", adminRouter);
app.route("/api/tags", tagsRouter);
app.route("/api/auth", authRouter);
app.route("/api/upload", uploadRouter);
app.route("/api/media", mediaRouter);

app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});
