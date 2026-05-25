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
  relatedSlugs?: string[];
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

// ---- Comments (admin) ----
export type CommentStatus = "PENDING" | "APPROVED" | "SPAM";

export interface AdminComment {
  id: number;
  authorName: string;
  authorEmail: string;
  body: string;
  status: CommentStatus;
  isAdminReply: boolean;
  parentId: number | null;
  createdAt: string;
  post: { title: string; slug: string } | null;
}

export interface CommentCounts {
  pending: number;
  approved: number;
  spam: number;
  all: number;
}

export function getAdminComments(
  status?: CommentStatus,
): Promise<{ comments: AdminComment[]; counts: CommentCounts }> {
  const qs = status ? `?status=${status}` : "";
  return adminHttp<{ comments: AdminComment[]; counts: CommentCounts }>(`/api/admin/comments${qs}`);
}

export function replyComment(id: number, body: string): Promise<{ comment: AdminComment }> {
  return adminHttp<{ comment: AdminComment }>(`/api/admin/comments/${id}/reply`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ body }),
  });
}

export function setCommentStatus(
  id: number,
  status: CommentStatus,
): Promise<{ comment: AdminComment }> {
  return adminHttp<{ comment: AdminComment }>(`/api/admin/comments/${id}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ status }),
  });
}

export function deleteComment(id: number): Promise<{ ok: boolean }> {
  return adminHttp<{ ok: boolean }>(`/api/admin/comments/${id}`, { method: "DELETE" });
}

// ---- Subscribers (admin) ----
export interface Subscriber {
  id: number;
  email: string;
  createdAt: string;
}

export function getSubscribers(): Promise<{ subscribers: Subscriber[]; total: number }> {
  return adminHttp<{ subscribers: Subscriber[]; total: number }>("/api/admin/subscribers");
}

export function deleteSubscriber(id: number): Promise<{ ok: boolean }> {
  return adminHttp<{ ok: boolean }>(`/api/admin/subscribers/${id}`, { method: "DELETE" });
}

// ---- Profile (admin) ----
export interface Profile {
  id: number;
  email: string;
  name: string | null;
  title: string | null;
  bio: string | null;
  avatar: string | null;
}

export function getProfile(): Promise<{ profile: Profile }> {
  return adminHttp<{ profile: Profile }>("/api/admin/profile");
}

export function updateProfile(input: {
  name?: string | null;
  title?: string | null;
  bio?: string | null;
  avatar?: string | null;
}): Promise<{ profile: Profile }> {
  return adminHttp<{ profile: Profile }>("/api/admin/profile", {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
}

export function updateAccount(input: {
  currentPassword: string;
  email?: string;
  newPassword?: string;
}): Promise<{ profile: Profile }> {
  return adminHttp<{ profile: Profile }>("/api/admin/account", {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
}

export interface UploadResult {
  id: number;
  url: string;
  publicId: string;
  type: string;
}

// Uploads via XMLHttpRequest (not fetch) so we can report upload progress.
// onProgress receives 0-100 for the browser -> API transfer. Once that hits
// 100, the API is still streaming to Cloudinary, so callers should show a
// "processing" state until the promise resolves.
export function uploadMedia(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  return new Promise<UploadResult>((resolve, reject) => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/upload`);
    xhr.responseType = "json";
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      const body = xhr.response as { error?: string } & Partial<UploadResult>;
      if (xhr.status >= 200 && xhr.status < 300 && body && typeof body.url === "string") {
        resolve(body as UploadResult);
      } else {
        reject(new Error(body?.error ?? `Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload."));
    xhr.ontimeout = () => reject(new Error("Upload timed out."));

    xhr.send(form);
  });
}
