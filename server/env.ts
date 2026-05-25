import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "7d"),
  apiPort: Number(optional("API_PORT", "4000")),
  corsOrigins: optional("CORS_ORIGINS", "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  cloudinary: {
    cloudName: optional("CLOUDINARY_CLOUD_NAME"),
    apiKey: optional("CLOUDINARY_API_KEY"),
    apiSecret: optional("CLOUDINARY_API_SECRET"),
  },
  smtp: {
    host: optional("SMTP_HOST"),
    port: Number(optional("SMTP_PORT", "587")),
    secure: optional("SMTP_SECURE", "false") === "true",
    user: optional("SMTP_USER"),
    pass: optional("SMTP_PASS"),
    from: optional("MAIL_FROM", "PowerApps.blog <no-reply@powerapps.blog>"),
    notifyTo: optional("NOTIFY_EMAIL"),
  },
  siteUrl: optional("SITE_URL", "https://www.powerapps.blog").replace(/\/$/, ""),
};

export function isCloudinaryConfigured(): boolean {
  const { cloudName, apiKey, apiSecret } = env.cloudinary;
  return Boolean(cloudName && apiKey && apiSecret);
}

export function isMailConfigured(): boolean {
  const { host, user, pass } = env.smtp;
  return Boolean(host && user && pass);
}
