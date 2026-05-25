import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { CornerDownRight, MessageCircle, Reply, Send, X } from "lucide-react";
import { toast } from "sonner";
import { fetchComments, postComment, type ApiComment } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

function countComments(comments: ApiComment[]): number {
  return comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
}

export function CommentSection({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useQuery({
    queryKey: ["comments", slug],
    queryFn: () => fetchComments(slug),
  });

  const [form, setForm] = useState({ authorName: "", authorEmail: "", body: "", website: "" });
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Remember the commenter so replies / future comments don't re-ask name + email.
  useEffect(() => {
    const name = localStorage.getItem("pab_commenter_name") ?? "";
    const email = localStorage.getItem("pab_commenter_email") ?? "";
    if (name || email) {
      setForm((f) => ({ ...f, authorName: name, authorEmail: email }));
    }
  }, []);

  const mutation = useMutation({
    mutationFn: () =>
      postComment(slug, {
        authorName: form.authorName.trim(),
        authorEmail: form.authorEmail.trim(),
        body: form.body.trim(),
        parentId: replyTo?.id,
        website: form.website,
      }),
    onSuccess: () => {
      toast.success("Comment submitted — it'll appear once approved.");
      // Remember the commenter for next time (so replies don't re-ask).
      localStorage.setItem("pab_commenter_name", form.authorName.trim());
      localStorage.setItem("pab_commenter_email", form.authorEmail.trim());
      setForm((f) => ({ ...f, body: "", website: "" }));
      setReplyTo(null);
      void queryClient.invalidateQueries({ queryKey: ["comments", slug] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't post comment"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.authorName.trim() || !form.authorEmail.trim() || !form.body.trim()) {
      toast.error("Please add your name, email and a comment.");
      return;
    }
    mutation.mutate();
  };

  const startReply = (comment: ApiComment) => {
    setReplyTo({ id: comment.id, name: comment.authorName });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const comments = data?.comments ?? [];
  const total = countComments(comments);
  const inputClass =
    "w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

  return (
    <section id="comments" className="mt-16 border-t border-border/60 pt-10">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <MessageCircle className="h-5 w-5 text-primary" />
        Comments {total > 0 ? <span className="text-muted-foreground">({total})</span> : null}
      </h2>

      {/* Comment form */}
      <form
        ref={formRef}
        onSubmit={submit}
        className="mt-6 rounded-xl border border-border/70 bg-card p-4"
      >
        {replyTo ? (
          <div className="mb-3 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-1.5 text-xs text-primary">
            <span className="inline-flex items-center gap-1.5">
              <CornerDownRight className="h-3.5 w-3.5" /> Replying to {replyTo.name}
            </span>
            <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancel reply">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <p className="mb-3 text-sm font-medium">Leave a comment</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.authorName}
            onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
            placeholder="Your name"
            className={inputClass}
            autoComplete="name"
          />
          <input
            value={form.authorEmail}
            onChange={(e) => setForm((f) => ({ ...f, authorEmail: e.target.value }))}
            placeholder="Your email (not published)"
            type="email"
            className={inputClass}
            autoComplete="email"
          />
        </div>
        <textarea
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          placeholder="Share your thoughts…"
          rows={4}
          className={`${inputClass} mt-3 resize-y`}
        />
        {/* Honeypot: hidden from real users */}
        <input
          value={form.website}
          onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Comments are reviewed before they appear.</p>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="gradient-primary text-primary-foreground hover:opacity-90"
          >
            {mutation.isPending ? (
              <Spinner size="xs" className="mr-1.5" />
            ) : (
              <Send className="mr-1.5 h-4 w-4" />
            )}
            {replyTo ? "Post reply" : "Post comment"}
          </Button>
        </div>
      </form>

      {/* Comment list */}
      <div className="mt-8">
        {isPending ? (
          <div className="grid place-items-center py-10">
            <Spinner />
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Couldn't load comments.</p>
        ) : comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No comments yet — be the first to share your thoughts.
          </p>
        ) : (
          <ul className="space-y-6">
            {comments.map((comment) => (
              <li key={comment.id}>
                <CommentItem comment={comment} onReply={startReply} />
                {comment.replies.length > 0 ? (
                  <ul className="mt-4 space-y-4 border-l border-border/60 pl-4 sm:pl-6">
                    {comment.replies.map((reply) => (
                      <li key={reply.id}>
                        <CommentItem comment={reply} onReply={startReply} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  onReply,
}: {
  comment: ApiComment;
  onReply: (comment: ApiComment) => void;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${
          comment.isAdminReply
            ? "gradient-primary text-primary-foreground"
            : "bg-secondary text-foreground"
        }`}
      >
        {initials(comment.authorName)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{comment.authorName}</span>
          {comment.isAdminReply ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              Author
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {comment.body}
        </p>
        <button
          onClick={() => onReply(comment)}
          className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <Reply className="h-3 w-3" /> Reply
        </button>
      </div>
    </div>
  );
}
