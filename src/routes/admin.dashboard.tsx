import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import {
  Check,
  Eye,
  FileText,
  MessageSquare,
  Pencil,
  PlusCircle,
  ShieldX,
  Trash2,
  Send,
  Undo2,
  CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  deletePost,
  getAdminComments,
  getAdminPosts,
  getAdminStats,
  setCommentStatus,
  updatePost,
  type AdminComment,
  type AdminStats,
  type CommentStatus,
} from "@/lib/admin-api";
import type { ApiPost } from "@/lib/api";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - PowerApps.blog Admin" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<ApiPost | null>(null);

  const statsQuery = useQuery({ queryKey: ["admin", "stats"], queryFn: getAdminStats });
  const postsQuery = useQuery({ queryKey: ["admin", "posts"], queryFn: getAdminPosts });
  const commentsQuery = useQuery({
    queryKey: ["admin", "comments", "ALL"],
    queryFn: () => getAdminComments(),
    staleTime: 30_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    void queryClient.invalidateQueries({ queryKey: ["articles"] });
    void queryClient.invalidateQueries({ queryKey: ["comments"] });
  };

  const moderate = useMutation({
    mutationFn: ({ id, status }: { id: number; status: CommentStatus }) =>
      setCommentStatus(id, status),
    onSuccess: (_data, vars) => {
      invalidate();
      toast.success(vars.status === "APPROVED" ? "Comment approved" : "Marked as spam");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  const toggleStatus = useMutation({
    mutationFn: (post: ApiPost) =>
      updatePost(post.id, { status: post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
    onSuccess: (_data, post) => {
      invalidate();
      toast.success(post.status === "PUBLISHED" ? "Moved to draft" : "Post published");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => {
      invalidate();
      toast.success("Post deleted");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const posts = postsQuery.data?.posts ?? [];
  const pendingComments = commentsQuery.data?.counts.pending ?? 0;
  const recentComments = (commentsQuery.data?.comments ?? [])
    .filter((c) => !c.isAdminReply)
    .slice(0, 5);

  return (
    <AdminLayout
      title="Dashboard"
      actions={
        <Button
          onClick={() => void navigate({ to: "/admin/posts/new" })}
          className="gradient-primary text-primary-foreground hover:opacity-90"
        >
          <PlusCircle className="mr-1.5 h-4 w-4" /> New Post
        </Button>
      }
    >
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        At a glance
      </h2>
      <StatsRow
        stats={statsQuery.data}
        pendingComments={pendingComments}
        loading={statsQuery.isPending}
      />

      <div className="mt-8 overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
          <h2 className="text-sm font-semibold">Recent posts</h2>
          <Link to="/admin/posts" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>

        {postsQuery.isPending ? (
          <div className="grid place-items-center py-16">
            <Spinner />
          </div>
        ) : postsQuery.isError ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Couldn't load posts. Is the API running on http://localhost:4000?
          </div>
        ) : posts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium">No posts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first post to get going.
            </p>
            <Button
              onClick={() => void navigate({ to: "/admin/posts/new" })}
              className="mt-4 gradient-primary text-primary-foreground hover:opacity-90"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" /> New Post
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-border/40 last:border-0">
                    <td className="max-w-[320px] px-5 py-3">
                      <Link
                        to="/admin/posts/$id/edit"
                        params={{ id: String(post.id) }}
                        className="line-clamp-1 font-medium hover:text-primary"
                      >
                        {post.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {post.tags.map((t) => t.name).join(", ") || "No tags"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {post.publishedAt
                        ? format(new Date(post.publishedAt), "MMM dd, yyyy")
                        : format(new Date(post.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {post.viewCount}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleStatus.mutate(post)}
                          disabled={toggleStatus.isPending}
                          title={post.status === "PUBLISHED" ? "Switch to draft" : "Publish"}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          {post.status === "PUBLISHED" ? (
                            <Undo2 className="h-4 w-4" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                        <Link
                          to="/admin/posts/$id/edit"
                          params={{ id: String(post.id) }}
                          title="Edit"
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          title="Delete"
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent comments widget */}
      <div className="mt-8 overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
          <h2 className="text-sm font-semibold">Recent comments</h2>
          <Link to="/admin/comments" className="text-xs text-primary hover:underline">
            Manage{pendingComments > 0 ? ` (${pendingComments} pending)` : ""}
          </Link>
        </div>
        {commentsQuery.isPending ? (
          <div className="grid place-items-center py-12">
            <Spinner />
          </div>
        ) : recentComments.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          <ul className="divide-y divide-border/40">
            {recentComments.map((comment) => (
              <li key={comment.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{comment.authorName}</span>
                    <CommentStatusBadge status={comment.status} />
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                    {comment.body}
                  </p>
                  {comment.post ? (
                    <span className="text-xs text-muted-foreground/70">
                      on “{comment.post.title}”
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {comment.status !== "APPROVED" ? (
                    <button
                      onClick={() => moderate.mutate({ id: comment.id, status: "APPROVED" })}
                      disabled={moderate.isPending}
                      title="Approve"
                      className="grid h-8 w-8 place-items-center rounded-md text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : null}
                  {comment.status !== "SPAM" ? (
                    <button
                      onClick={() => moderate.mutate({ id: comment.id, status: "SPAM" })}
                      disabled={moderate.isPending}
                      title="Mark as spam"
                      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <ShieldX className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete post?"
        description={
          <>
            This permanently deletes <strong>“{deleteTarget?.title}”</strong>. This action cannot be
            undone.
          </>
        }
        confirmLabel="Delete post"
        loading={remove.isPending}
        onConfirm={() => {
          if (deleteTarget) remove.mutate(deleteTarget.id);
        }}
      />
    </AdminLayout>
  );
}

function StatsRow({
  stats,
  pendingComments,
  loading,
}: {
  stats?: AdminStats;
  pendingComments: number;
  loading: boolean;
}) {
  const cards = [
    { label: "Total Posts", value: stats?.totalPosts, icon: FileText },
    { label: "Published", value: stats?.published, icon: CheckCircle2 },
    { label: "Pending Comments", value: pendingComments, icon: MessageSquare },
    { label: "Total Views", value: stats?.totalViews, icon: Eye },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.label}</p>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-semibold tracking-tight">
            {loading ? "—" : (card.value ?? 0)}
          </p>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  return status === "PUBLISHED" ? (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      Published
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
      Draft
    </span>
  );
}

function CommentStatusBadge({ status }: { status: CommentStatus }) {
  const map = {
    PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    APPROVED: "bg-primary/10 text-primary",
    SPAM: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${map[status]}`}
    >
      {status.toLowerCase()}
    </span>
  );
}

function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}
