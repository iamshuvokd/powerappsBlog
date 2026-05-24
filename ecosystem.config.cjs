// PM2 process config for the Hono API server (runs on the VPS).
// Start:   pm2 start ecosystem.config.cjs
// Reload:  pm2 reload powerapps-blog-api
//
// The API is TypeScript run via tsx (no build step). `.env` (DATABASE_URL,
// JWT_SECRET, CLOUDINARY_*, etc.) must exist in cwd and is loaded by the app.
module.exports = {
  apps: [
    {
      name: "powerapps-blog-api",
      script: "./node_modules/.bin/tsx",
      args: "server/index.ts",
      interpreter: "none",
      cwd: "/var/www/powerapps-blog",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
