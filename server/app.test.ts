import { describe, expect, it } from "vitest";
import { app } from "./app";

// These exercise routing, validation and auth guards — all of which run before
// any database access, so they need no DB connection.
describe("API app (no DB)", () => {
  it("GET /health returns ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it("POST /api/posts without a token is 401", async () => {
    const res = await app.request("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    expect(res.status).toBe(401);
  });

  it("POST /api/tags without a token is 401", async () => {
    const res = await app.request("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    expect(res.status).toBe(401);
  });

  it("GET /api/admin/stats without a token is 401", async () => {
    const res = await app.request("/api/admin/stats");
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/login with an invalid body is 400", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });
    expect(res.status).toBe(400);
  });

  it("unknown route is 404", async () => {
    const res = await app.request("/api/nope");
    expect(res.status).toBe(404);
  });
});
