import { API_BASE, type ApiBlock, type ApiPost, type ApiTag } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface RequestOptions extends RequestInit {
  auth?: boolean; // default true
}

async function adminHttp<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...((headers as Record<string, string>) ?? {}),
  };
  if (auth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore non-JSON error bodies
    }
    const error = new Error(message) as Error & { status?: number };
    error.status = res.status;
    throw error;
  }
  return res.json() as Promise<T>;
}

const jsonHeaders = { "Content-Type": "application/json" } as const;

// ---- Auth ----
export interface LoginResponse {
  token: string;
  user: { id: number; email: string; role: string };
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return adminHttp<LoginResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    headers: jsonHeaders,
    body: JSON.stringify({ email, password }),
  });
}

// ---- Stats / posts ----
export interface AdminStats {
  totalPosts: number;
  published: number;
  drafts: number;
  totalViews: number;
}

export function getAdminStats(): Promise<AdminStats> {
  return adminHttp<AdminStats>("/api/admin/stats");
}

export function getAdminPosts(): Promise<{ posts: ApiPost[] }> {
  return adminHttp<{ posts: ApiPost[] }>("/api/admin/posts");
}

export function getAdminPost(id: number): Promise<{ post: ApiPost }> {
  return adminHttp<{ post: ApiPost }>(`/api/admin/posts/${id}`);
}

export interface PostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: ApiBlock[];
  coverImage?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  tags?: string[];
  publishedAt?: string | null;
}

export function createPost(input: PostInput): Promise<{ post: ApiPost }> {
  return adminHttp<{ post: ApiPost }>("/api/posts", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
}

export function updatePost(id: number, input: Partial<PostInput>): Promise<{ post: ApiPost }> {
  return adminHttp<{ post: ApiPost }>(`/api/posts/${id}`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
}

export function deletePost(id: number): Promise<{ ok: boolean }> {
  return adminHttp<{ ok: boolean }>(`/api/posts/${id}`, { method: "DELETE" });
}

// ---- Tags ----
export function getAllTags(): Promise<{ tags: Array<ApiTag & { postCount: number }> }> {
  return adminHttp<{ tags: Array<ApiTag & { postCount: number }> }>("/api/tags", { auth: false });
}

export function createTag(name: string): Promise<{ tag: ApiTag }> {
  return adminHttp<{ tag: ApiTag }>("/api/tags", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ name }),
  });
}

// ---- Media ----
export interface MediaAsset {
  id: number;
  url: string;
  type: "IMAGE" | "VIDEO";
  publicId: string | null;
  createdAt: string;
}

export function listMedia(): Promise<{ media: MediaAsset[] }> {
  return adminHttp<{ media: MediaAsset[] }>("/api/media");
}

export function deleteMedia(id: number): Promise<{ ok: boolean }> {
  return adminHttp<{ ok: boolean }>(`/api/media/${id}`, { method: "DELETE" });
}

export async function uploadMedia(
  file: File,
): Promise<{ id: number; url: string; publicId: string; type: string }> {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json() as Promise<{ id: number; url: string; publicId: string; type: string }>;
}
