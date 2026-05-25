import type { Comment, Post } from "@prisma/client";

type CommentWithReplies = Comment & { replies?: CommentWithReplies[] };
type CommentWithPost = Comment & { post?: Pick<Post, "title" | "slug"> | null };

// Public shape: never expose the commenter's email address.
export function serializePublicComment(comment: CommentWithReplies): unknown {
  return {
    id: comment.id,
    authorName: comment.authorName,
    body: comment.body,
    isAdminReply: comment.isAdminReply,
    createdAt: comment.createdAt,
    parentId: comment.parentId,
    replies: (comment.replies ?? []).map(serializePublicComment),
  };
}

// Admin shape: includes email, status and the owning post for moderation.
export function serializeAdminComment(comment: CommentWithPost) {
  return {
    id: comment.id,
    authorName: comment.authorName,
    authorEmail: comment.authorEmail,
    body: comment.body,
    status: comment.status,
    isAdminReply: comment.isAdminReply,
    parentId: comment.parentId,
    createdAt: comment.createdAt,
    post: comment.post ? { title: comment.post.title, slug: comment.post.slug } : null,
  };
}
