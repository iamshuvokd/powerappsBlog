import { z } from "zod";

// Block-based content. Mirrors the editor block types (Phase 4 admin editor).
export const blockSchema = z.discriminatedUnion("type", [
  z.object({ id: z.string().optional(), type: z.literal("paragraph"), text: z.string() }),
  z.object({
    id: z.string().optional(),
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text: z.string(),
  }),
  z.object({
    id: z.string().optional(),
    type: z.literal("code"),
    language: z.string().default("text"),
    code: z.string(),
  }),
  z.object({
    id: z.string().optional(),
    type: z.literal("image"),
    url: z.string().url(),
    alt: z.string().optional(),
  }),
  z.object({
    id: z.string().optional(),
    type: z.literal("video"),
    provider: z.enum(["youtube", "vimeo", "file"]),
    url: z.string().url(),
  }),
  z.object({
    id: z.string().optional(),
    type: z.literal("list"),
    ordered: z.boolean().default(false),
    items: z.array(z.string()),
  }),
  z.object({ id: z.string().optional(), type: z.literal("quote"), text: z.string() }),
]);

export const contentSchema = z.array(blockSchema);

export type Block = z.infer<typeof blockSchema>;
export type Content = z.infer<typeof contentSchema>;

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(220).optional(),
  excerpt: z.string().min(1).max(500),
  content: contentSchema,
  coverImage: z.string().url().nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  tags: z.array(z.string().min(1)).optional(), // tag names
  relatedSlugs: z.array(z.string().min(1)).max(12).optional(), // manual related posts
  publishedAt: z.string().datetime().nullable().optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const createTagSchema = z.object({
  name: z.string().min(1).max(60),
  slug: z.string().min(1).max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const listPostsQuerySchema = z.object({
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(6),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;

// ---- Comments ----
export const createCommentSchema = z.object({
  authorName: z.string().min(1).max(80),
  authorEmail: z.string().email().max(160),
  body: z.string().min(1).max(3000),
  parentId: z.coerce.number().int().positive().optional(),
  // Honeypot: real users never see this field, so it must stay empty.
  website: z.string().max(0).optional(),
});

export const adminReplySchema = z.object({
  body: z.string().min(1).max(3000),
});

export const updateCommentStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "SPAM"]),
});

export const listCommentsQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "SPAM"]).optional(),
});

// ---- Admin profile ----
export const updateProfileSchema = z.object({
  name: z.string().max(80).nullable().optional(),
  title: z.string().max(120).nullable().optional(),
  bio: z.string().max(800).nullable().optional(),
  avatar: z.string().url().nullable().optional(),
});

// ---- Admin account (login credentials) ----
export const updateAccountSchema = z
  .object({
    currentPassword: z.string().min(1),
    email: z.string().email().max(160).optional(),
    newPassword: z.string().min(8).max(200).optional(),
  })
  .refine((d) => d.email !== undefined || d.newPassword !== undefined, {
    message: "Provide a new email or a new password.",
  });

// ---- Newsletter subscribers ----
export const subscribeSchema = z.object({
  email: z.string().email().max(160),
  // Honeypot: real users never fill this.
  website: z.string().max(0).optional(),
});
