import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Check, MessageSquare, Reply, Send, ShieldX, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  deleteComment,
  getAdminComments,
  replyComment,
  setCommentStatus,
  type AdminComment,
  type CommentStatus,
} from "@/lib/admin-api";

export const Route = createFileRoute("/admin/comments")({
  head: () => ({ meta: [{ title: "Comments - PowerApps.blog Admin" }] }),
  component: CommentsPage,
});

type Filter = CommentStatus | "ALL";

function CommentsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminComment | null>(null);

  const query = useQuery({
    queryKey: ["admin", "comments", filter],
    queryFn: () => getAdminComments(filter === "ALL" ? undefined : filter),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
    void queryClient.invalidateQueries({ queryKey: ["comments"] });
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: CommentStatus }) =>
      setCommentStatus(id, status),
    onSuccess: (_data, vars) => {
      invalidate();
      toast.success(vars.status === "APPROVED" ? "Comment approved" : "Marked as spam");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => deleteComment(id),
    onSuccess: () => {
      invalidate();
      toast.success("Comment deleted");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: string }) => replyComment(id, body),
    onSuccess: () => {
      invalidate();
      toast.success("Reply posted");
      setReplyTo(null);
      setReplyBody("");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Reply failed"),
  });

  const counts = query.data?.counts ?? { all: 0, pending: 0, approved: 0, spam: 0 };
  const comments = query.data?.comments ?? [];

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "ALL", label: "All", count: counts.all },
    { key: "PENDING", label: "Pending", count: counts.pending },
    { key: "APPROVED", label: "Approved", count: counts.approved },
    { key: "SPAM", label: "Spam", count: counts.spam },
  ];

  return (
    <AdminLayout title="Comments">
      <div className="mb-5 flex flex-wrap gap-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {tab.label} <span className="opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {query.isPending ? (
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-border/70 bg-card px-5 py-12 text-center text-sm text-muted-foreground">
          Couldn't load comments. Is the API running?
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 px-5 py-16 text-center">
          <MessageSquare className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No comments here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filter === "PENDING" ? "Nothing awaiting moderation." : "Nothing in this view yet."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-border/70 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{comment.authorName}</span>
                    {comment.isAdminReply ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                        Author
                      </span>
                    ) : null}
                    <StatusBadge status={comment.status} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{comment.authorEmail}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(comment.createdAt)}
                </span>
              </div>

              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{comment.body}</p>

              {comment.post ? (
                <a
                  href={`/blog/${comment.post.slug}#comments`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-muted-foreground hover:text-primary"
                >
                  on “{comment.post.title}”
                </a>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {comment.status !== "APPROVED" ? (
                  <ActionButton
                    onClick={() => statusMutation.mutate({ id: comment.id, status: "APPROVED" })}
                    disabled={statusMutation.isPending}
                    icon={Check}
                    label="Approve"
                    tone="approve"
                  />
                ) : null}
                <ActionButton
                  onClick={() => {
                    setReplyTo(replyTo === comment.id ? null : comment.id);
                    setReplyBody("");
                  }}
                  icon={Reply}
                  label="Reply"
                />
                {comment.status !== "SPAM" ? (
                  <ActionButton
                    onClick={() => statusMutation.mutate({ id: comment.id, status: "SPAM" })}
                    disabled={statusMutation.isPending}
                    icon={ShieldX}
                    label="Spam"
                  />
                ) : null}
                <ActionButton
                  onClick={() => setDeleteTarget(comment)}
                  icon={Trash2}
                  label="Delete"
                  tone="danger"
                />
              </div>

              {replyTo === comment.id ? (
                <div className="mt-3 rounded-lg border border-border/60 bg-background p-3">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={3}
                    placeholder={`Reply to ${comment.authorName}…`}
                    className="w-full resize-y rounded-md border border-border/70 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setReplyTo(null)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={replyMutation.isPending || !replyBody.trim()}
                      onClick={() =>
                        replyMutation.mutate({ id: comment.id, body: replyBody.trim() })
                      }
                      className="gradient-primary text-primary-foreground hover:opacity-90"
                    >
                      {replyMutation.isPending ? (
                        <Spinner size="xs" className="mr-1.5" />
                      ) : (
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Post reply
                    </Button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete comment?"
        description="This permanently deletes the comment and any replies to it. This action cannot be undone."
        confirmLabel="Delete comment"
        loading={removeMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) removeMutation.mutate(deleteTarget.id);
        }}
      />
    </AdminLayout>
  );
}

function ActionButton({
  onClick,
  disabled,
  icon: Icon,
  label,
  tone = "default",
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: typeof Check;
  label: string;
  tone?: "default" | "approve" | "danger";
}) {
  const toneClass =
    tone === "approve"
      ? "text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
      : tone === "danger"
        ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors disabled:opacity-50 ${toneClass}`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function StatusBadge({ status }: { status: CommentStatus }) {
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
