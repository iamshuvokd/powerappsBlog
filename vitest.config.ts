import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "server/**/*.test.ts"],
    // Defaults so importing the server app (env.ts requires these) works
    // without a local .env, e.g. in CI.
    env: {
      JWT_SECRET: "test-secret-key-for-vitest",
      JWT_EXPIRES_IN: "7d",
      DATABASE_URL: "mysql://test:test@localhost:3306/test",
    },
  },
});
