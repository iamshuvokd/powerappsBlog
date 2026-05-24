import { serve } from "@hono/node-server";
import { app } from "./app";
import { env } from "./env";

serve({ fetch: app.fetch, port: env.apiPort }, (info) => {
  console.log(`PowerApps.blog API listening on http://localhost:${info.port}`);
});
