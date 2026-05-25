import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { slugify } from "./slug";

export const postInclude = {
  tags: { include: { tag: true } },
  author: { select: { id: true, email: true, name: true, title: true } },
} satisfies Prisma.PostInclude;

type PostWithRelations = Prisma.PostGetPayload<{ include: typeof postInclude }>;

export function serializePost(post: PostWithRelations) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    relatedSlugs: Array.isArray(post.relatedSlugs) ? (post.relatedSlugs as string[]) : [],
    status: post.status,
    publishedAt: post.publishedAt,
    viewCount: post.viewCount,
    readTime: post.readTime,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author
      ? {
          id: post.author.id,
          email: post.author.email,
          name: post.author.name,
          title: post.author.title,
        }
      : null,
    tags: post.tags.map((pt) => ({ id: pt.tag.id, name: pt.tag.name, slug: pt.tag.slug })),
  };
}

// Guarantee a unique post slug, appending -2, -3, ... on collision.
export async function ensureUniqueSlug(base: string, excludeId?: number): Promise<string> {
  const root = slugify(base) || "post";
  let slug = root;
  let n = 1;
  while (n < 1000) {
    const existing = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${root}-${n}`;
  }
  return `${root}-${Date.now()}`;
}

// Upsert tags by slug and produce nested PostTag create data.
export async function buildTagCreateData(
  tagNames: string[],
): Promise<Prisma.PostTagCreateWithoutPostInput[]> {
  const data: Prisma.PostTagCreateWithoutPostInput[] = [];
  for (const name of tagNames) {
    const slug = slugify(name);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
    data.push({ tag: { connect: { id: tag.id } } });
  }
  return data;
}
