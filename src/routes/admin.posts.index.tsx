import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Eye, MessageSquare, Pencil, PlusCircle, Search, Send, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AdminLayout } from "@/components/admin/admin-layout";
import { deletePost, getAdminComments, getAdminPosts, updatePost } from "@/lib/admin-api";
import type { ApiPost } from "@/lib/api";

export const Route = createFileRoute("/admin/posts/")({
  head: () => ({ meta: [{ title: "All Posts - PowerApps.blog Admin" }] }),
  component: AllPostsPage,
});

type Filter = "ALL" | "PUBLISHED" | "DRAFT";

function AllPostsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ApiPost | null>(null);

  const postsQuery = useQuery({ queryKey: ["admin", "posts"], queryFn: getAdminPosts });
  const commentsQuery = useQuery({
    queryKey: ["admin", "comments", "ALL"],
    queryFn: () => getAdminComments(),
    staleTime: 30_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    void queryClient.invalidateQueries({ queryKey: ["articles"] });
  };

  const toggleStatus = useMutation({
    mutationFn: (post: ApiPost) =>
      updatePost(post.id, { status: post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
    },
  });

  const posts = postsQuery.data?.posts ?? [];

  // Approved-comment counts per post slug, from the cached comments query.
  const commentCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of commentsQuery.data?.comments ?? []) {
      if (c.status === "APPROVED" && c.post) {
        map.set(c.post.slug, (map.get(c.post.slug) ?? 0) + 1);
      }
    }
    return map;
  }, [commentsQuery.data]);

  const counts = {
    all: posts.length,
    published: posts.filter((p) => p.status === "PUBLISHED").length,
    draft: posts.filter((p) => p.status === "DRAFT").length,
  };

  const visible = posts
    .filter((p) => (filter === "ALL" ? true : p.status === filter))
    .filter((p) => p.title.toLowerCase().includes(search.trim().toLowerCase()));

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "ALL", label: "All", count: counts.all },
    { key: "PUBLISHED", label: "Published", count: counts.published },
    { key: "DRAFT", label: "Drafts", count: counts.draft },
  ];

  return (
    <AdminLayout
      title="Posts"
      actions={
        <Button
          onClick={() => void navigate({ to: "/admin/posts/new" })}
          className="gradient-primary text-primary-foreground hover:opacity-90"
        >
          <PlusCircle className="mr-1.5 h-4 w-4" /> Add New
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
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
        <div className="flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-card px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="w-44 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
        {postsQuery.isPending ? (
          <div className="grid place-items-center py-16">
            <Spinner />
          </div>
        ) : postsQuery.isError ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            Couldn't load posts. Is the API running?
          </div>
        ) : visible.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted-foreground">
            No posts match this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Comments</th>
                  <th className="px-3 py-3 font-medium">Views</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((post) => (
                  <tr key={post.id} className="group border-b border-border/40 last:border-0">
                    <td className="max-w-[360px] px-5 py-3">
                      <Link
                        to="/admin/posts/$id/edit"
                        params={{ id: String(post.id) }}
                        className="line-clamp-1 font-medium hover:text-primary"
                      >
                        {post.title}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="line-clamp-1">
                          {post.tags.map((t) => t.name).join(", ") || "No tags"}
                        </span>
                      </div>
                      {/* WordPress-style row actions (reveal on hover) */}
                      <div className="mt-1 flex items-center gap-3 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          to="/admin/posts/$id/edit"
                          params={{ id: String(post.id) }}
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Link>
                        <button
                          onClick={() => toggleStatus.mutate(post)}
                          disabled={toggleStatus.isPending}
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                        >
                          {post.status === "PUBLISHED" ? (
                            <>
                              <Undo2 className="h-3 w-3" /> Unpublish
                            </>
                          ) : (
                            <>
                              <Send className="h-3 w-3" /> Publish
                            </>
                          )}
                        </button>
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
                        >
                          <Eye className="h-3 w-3" /> View
                        </a>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" /> Trash
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {commentCounts.get(post.slug) ?? 0}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {post.viewCount}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {format(new Date(post.publishedAt ?? post.createdAt), "MMM dd, yyyy")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Move post to trash?"
        description={
          <>
            This permanently deletes <strong>“{deleteTarget?.title}”</strong> and its comments. This
            action cannot be undone.
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
