import { Hono } from "hono";
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
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await getCloudinary().uploader.upload(dataUri, {
    folder: "powerapps-blog",
    resource_type: "auto",
  });

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
