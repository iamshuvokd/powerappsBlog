import { Hono } from "hono";
import type { UploadApiResponse } from "cloudinary";
import { prisma } from "../db";
import { requireAdmin, type AppEnv } from "../auth";
import { getCloudinary, isCloudinaryConfigured } from "../lib/cloudinary";

// POST /api/upload — upload an image/video to Cloudinary (admin)
export const uploadRouter = new Hono<AppEnv>();

uploadRouter.post("/", requireAdmin, async (c) => {
  if (!isCloudinaryConfigured()) {
    return c.json(
      { error: "Cloudinary is not configured. Set CLOUDINARY_* environment variables." },
      501,
    );
  }

  const body = await c.req.parseBody();
  const file = body["file"];
  if (!(file instanceof File)) {
    return c.json({ error: "No file provided (expected multipart field 'file')." }, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Stream the buffer to Cloudinary instead of building a base64 data URI.
  // This avoids the 100MB data-URI limit and the ~33% base64 memory overhead,
  // which matters for video uploads (and the pm2 memory cap in production).
  let result: UploadApiResponse;
  try {
    result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = getCloudinary().uploader.upload_stream(
        { folder: "powerapps-blog", resource_type: "auto", chunk_size: 6_000_000 },
        (error, uploaded) => {
          if (error) reject(error);
          else if (uploaded) resolve(uploaded);
          else reject(new Error("Cloudinary returned no result."));
        },
      );
      stream.end(buffer);
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload to Cloudinary failed.";
    return c.json({ error: message }, 502);
  }

  const type = result.resource_type === "video" ? ("VIDEO" as const) : ("IMAGE" as const);
  const asset = await prisma.mediaAsset.create({
    data: { url: result.secure_url, publicId: result.public_id, type },
  });

  return c.json({ id: asset.id, url: result.secure_url, publicId: result.public_id, type }, 201);
});

// /api/media — list + delete uploaded assets (admin)
export const mediaRouter = new Hono<AppEnv>();

mediaRouter.use("*", requireAdmin);

mediaRouter.get("/", async (c) => {
  const media = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });
  return c.json({ media });
});

mediaRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (!Number.isInteger(id)) return c.json({ error: "Invalid id" }, 400);

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return c.json({ error: "Not found" }, 404);

  if (asset.publicId && isCloudinaryConfigured()) {
    try {
      await getCloudinary().uploader.destroy(asset.publicId, {
        resource_type: asset.type === "VIDEO" ? "video" : "image",
      });
    } catch (err) {
      console.error("Cloudinary destroy failed", err);
    }
  }

  await prisma.mediaAsset.delete({ where: { id } });
  return c.json({ ok: true });
});
