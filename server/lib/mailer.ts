import nodemailer, { type Transporter } from "nodemailer";
import { env, isMailConfigured } from "../env";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!isMailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Notify the admin that a new comment is awaiting moderation. Best-effort:
 * a silent no-op when SMTP isn't configured, and never throws (so a mail
 * failure can't break comment submission).
 */
export async function sendCommentNotification(opts: {
  postTitle: string;
  postSlug: string;
  authorName: string;
  authorEmail: string;
  body: string;
  recipient?: string;
}): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;

  const to = opts.recipient || env.smtp.notifyTo || env.smtp.user;
  if (!to) return;

  const reviewUrl = `${env.siteUrl}/admin/comments`;
  const postUrl = `${env.siteUrl}/blog/${opts.postSlug}`;
  const subject = `New comment awaiting review on “${opts.postTitle}”`;

  const text =
    `${opts.authorName} (${opts.authorEmail}) commented on "${opts.postTitle}":\n\n` +
    `${opts.body}\n\n` +
    `Approve or reply: ${reviewUrl}\n` +
    `View post: ${postUrl}`;

  const html = `
  <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <h2 style="font-size:16px;margin:0 0 4px">New comment awaiting review</h2>
    <p style="margin:0 0 16px;color:#64748b;font-size:13px">on “${escapeHtml(opts.postTitle)}”</p>
    <div style="border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;background:#f8fafc">
      <p style="margin:0 0 6px;font-weight:600;font-size:14px">${escapeHtml(opts.authorName)}
        <span style="font-weight:400;color:#64748b">&lt;${escapeHtml(opts.authorEmail)}&gt;</span>
      </p>
      <p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:1.5">${escapeHtml(opts.body)}</p>
    </div>
    <p style="margin:18px 0 0">
      <a href="${reviewUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:9px 16px;border-radius:8px;font-size:14px;font-weight:600">Review comment</a>
    </p>
    <p style="margin:14px 0 0;font-size:12px;color:#94a3b8">
      <a href="${postUrl}" style="color:#94a3b8">View the post</a>
    </p>
  </div>`;

  try {
    await transport.sendMail({
      from: env.smtp.from,
      to,
      replyTo: opts.authorEmail,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("Comment notification email failed:", err);
  }
}

/**
 * Welcome email sent to a new newsletter subscriber. Best-effort: silent
 * no-op when SMTP isn't configured, and never throws.
 */
export async function sendWelcomeEmail(toEmail: string): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;

  const homeUrl = env.siteUrl;
  const subject = "You're subscribed to PowerApps.blog 🎉";
  const text =
    `Thanks for subscribing to PowerApps.blog!\n\n` +
    `You'll get our latest Power Apps, Power Automate and SharePoint articles in your inbox.\n\n` +
    `Read the blog: ${homeUrl}`;

  const html = `
  <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <h2 style="font-size:18px;margin:0 0 8px">Welcome to PowerApps.blog 🎉</h2>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#334155">
      Thanks for subscribing! You'll get our latest Power Apps, Power Automate and
      SharePoint articles and patterns straight to your inbox.
    </p>
    <p style="margin:0 0 18px">
      <a href="${homeUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:9px 16px;border-radius:8px;font-size:14px;font-weight:600">Read the blog</a>
    </p>
    <p style="margin:0;font-size:12px;color:#94a3b8">You're receiving this because you subscribed at PowerApps.blog.</p>
  </div>`;

  try {
    await transport.sendMail({ from: env.smtp.from, to: toEmail, subject, text, html });
  } catch (err) {
    console.error("Welcome email failed:", err);
  }
}
