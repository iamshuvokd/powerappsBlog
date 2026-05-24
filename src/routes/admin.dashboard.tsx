import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Eye,
  FileText,
  Loader2,
  Pencil,
  PlusCircle,
  Trash2,
  Send,
  Undo2,
  CheckCircle2,
  FileEdit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/admin-layout";
import {
  deletePost,
  getAdminPosts,
  getAdminStats,
  updatePost,
  type AdminStats,
} from "@/lib/admin-api";
import type { ApiPost } from "@/lib/api";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - PowerApps.blog Admin" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const statsQuery = useQuery({ queryKey: ["admin", "stats"], queryFn: getAdminStats });
  const postsQuery = useQuery({ queryKey: ["admin", "posts"], queryFn: getAdminPosts });

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
    onSuccess: invalidate,
  });

  const posts = postsQuery.data?.posts ?? [];

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
      <StatsRow stats={statsQuery.data} loading={statsQuery.isPending} />

      <div className="mt-8 overflow-hidden rounded-xl border border-border/70 bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
          <h2 className="text-sm font-semibold">Recent posts</h2>
          <span className="text-xs text-muted-foreground">{posts.length} total</span>
        </div>

        {postsQuery.isPending ? (
          <div className="grid place-items-center py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
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
                          onClick={() => {
                            if (window.confirm(`Delete "${post.title}"? This cannot be undone.`)) {
                              remove.mutate(post.id);
                            }
                          }}
                          disabled={remove.isPending}
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
    </AdminLayout>
  );
}

function StatsRow({ stats, loading }: { stats?: AdminStats; loading: boolean }) {
  const cards = [
    { label: "Total Posts", value: stats?.totalPosts, icon: FileText },
    { label: "Published", value: stats?.published, icon: CheckCircle2 },
    { label: "Drafts", value: stats?.drafts, icon: FileEdit },
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
