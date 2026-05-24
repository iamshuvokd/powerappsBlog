import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../server/lib/slug";
import { calculateReadTime } from "../server/lib/read-time";
import type { Content } from "../server/validation";

const prisma = new PrismaClient();

interface SeedPost {
  title: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  content: Content;
}

const seedPosts: SeedPost[] = [
  {
    title: "Build an Enterprise Inventory System in Power Apps",
    excerpt:
      "End-to-end architecture: Dataverse schema, role-based security, barcode scanning, and a modern dashboard UI.",
    coverImage: null,
    tags: ["Power Apps"],
    content: [
      {
        type: "paragraph",
        text: "A production inventory system is more than a gallery and a form. This guide walks through the data model, security, and UX patterns that make it scale.",
      },
      { type: "heading", level: 2, text: "Designing the Dataverse schema" },
      {
        type: "paragraph",
        text: "Start with three core tables: Items, Locations, and Movements. Keep the Movements table append-only so you always have an auditable history of stock changes.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Items: SKU, name, unit, reorder threshold",
          "Locations: site, bin, capacity",
          "Movements: item, from, to, quantity, timestamp",
        ],
      },
      { type: "heading", level: 2, text: "Delegable stock lookups" },
      {
        type: "code",
        language: "powerfx",
        code: 'Filter(Movements, ItemId = ThisItem.Id && Status = "Posted")',
      },
      {
        type: "quote",
        text: "Tip: index the ItemId and Status columns so large Movements tables stay delegable.",
      },
    ],
  },
  {
    title: "Build Approval Flows with Power Automate and SharePoint",
    excerpt:
      "A production-ready approval pattern using SharePoint lists, adaptive cards, escalation branches and audit logs.",
    coverImage: null,
    tags: ["Power Automate", "SharePoint"],
    content: [
      {
        type: "paragraph",
        text: "Approvals are the most common automation request, and the most commonly done badly. Here is a resilient pattern that survives reassignment, timeouts, and audits.",
      },
      { type: "heading", level: 2, text: "Trigger and state" },
      {
        type: "paragraph",
        text: "Use a SharePoint list as the source of truth for approval state instead of relying on the flow run alone. That makes the process observable and recoverable.",
      },
      {
        type: "code",
        language: "json",
        code: '{\n  "status": "Pending",\n  "stage": 1,\n  "assignedTo": "manager@contoso.com"\n}',
      },
      { type: "heading", level: 3, text: "Escalation branch" },
      {
        type: "list",
        ordered: true,
        items: [
          "Wait for response with a timeout",
          "On timeout, reassign to the backup approver",
          "Log every transition to an audit list",
        ],
      },
      {
        type: "quote",
        text: "Note: store the adaptive card payload so you can re-send the exact same card after a reassignment.",
      },
    ],
  },
  {
    title: "SharePoint Lists Governance for Power Platform Apps",
    excerpt:
      "Naming, permissions, indexed columns and lifecycle rules for lists that support business-critical apps.",
    coverImage: null,
    tags: ["SharePoint"],
    content: [
      {
        type: "paragraph",
        text: "When a SharePoint list backs a Power App, sloppy governance turns into production incidents. These rules keep lists fast, secure, and maintainable.",
      },
      { type: "heading", level: 2, text: "Index before you grow" },
      {
        type: "paragraph",
        text: "Add indexed columns on any field you filter or sort by before the list crosses the 5,000-item view threshold. Retrofitting indexes on a large list is painful.",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "Index Status, Created, and any lookup used in filters",
          "Avoid calculated columns in delegable queries",
          "Use content types for consistent metadata",
        ],
      },
      { type: "heading", level: 2, text: "Permissions" },
      {
        type: "quote",
        text: "Break inheritance sparingly. Per-item permissions at scale are the number one cause of slow lists.",
      },
    ],
  },
];

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@powerapps.blog";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    create: { email, password: hashed, role: "ADMIN" },
    update: {},
  });

  const tagNames = ["Power Apps", "Power Automate", "SharePoint"];
  const tagIdByName: Record<string, number> = {};
  for (const name of tagNames) {
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
    tagIdByName[name] = tag.id;
  }

  for (const post of seedPosts) {
    const slug = slugify(post.title);
    const readTime = calculateReadTime(post.content);
    const content = post.content as unknown as Prisma.InputJsonValue;
    const tagCreate = post.tags.map((name) => ({ tag: { connect: { id: tagIdByName[name] } } }));

    await prisma.post.upsert({
      where: { slug },
      create: {
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content,
        coverImage: post.coverImage,
        status: "PUBLISHED",
        publishedAt: new Date(),
        readTime,
        author: { connect: { id: admin.id } },
        tags: { create: tagCreate },
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content,
        coverImage: post.coverImage,
        status: "PUBLISHED",
        readTime,
        tags: { deleteMany: {}, create: tagCreate },
      },
    });
  }

  console.log(
    `Seeded admin user (${email}), ${tagNames.length} tags, and ${seedPosts.length} posts.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
