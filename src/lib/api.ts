// Typed client for the PowerApps.blog API (Hono server, default :4000).

const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export interface ApiTag {
  id: number;
  name: string;
  slug: string;
}

export interface ApiAuthor {
  id: number;
  email: string;
}

export type ApiBlock =
  | { type: "paragraph"; text: string; id?: string }
  | { type: "heading"; level: 2 | 3; text: string; id?: string }
  | { type: "code"; language: string; code: string; id?: string }
  | { type: "image"; url: string; alt?: string; id?: string }
  | { type: "video"; provider: "youtube" | "vimeo" | "file"; url: string; id?: string }
  | { type: "list"; ordered: boolean; items: string[]; id?: string }
  | { type: "quote"; text: string; id?: string };

export interface ApiPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: ApiBlock[];
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  viewCount: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
  author: ApiAuthor | null;
  tags: ApiTag[];
}

export interface PostsResponse {
  posts: ApiPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TagsResponse {
  tags: Array<ApiTag & { postCount: number }>;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`API request failed (${res.status}) for ${path}`);
  }
  return res.json() as Promise<T>;
}

export function fetchPosts(params?: {
  tag?: string;
  page?: number;
  pageSize?: number;
}): Promise<PostsResponse> {
  const query = new URLSearchParams();
  if (params?.tag) query.set("tag", params.tag);
  if (params?.page) query.set("page", String(params.page));
  if (params?.pageSize) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  return http<PostsResponse>(`/api/posts${qs ? `?${qs}` : ""}`);
}

export function fetchPost(slug: string): Promise<{ post: ApiPost }> {
  return http<{ post: ApiPost }>(`/api/posts/${encodeURIComponent(slug)}`);
}

export function fetchTags(): Promise<TagsResponse> {
  return http<TagsResponse>("/api/tags");
}

export { API_BASE };
