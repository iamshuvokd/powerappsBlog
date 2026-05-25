import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Spinner } from "@/components/ui/spinner";
import { PostEditor } from "@/components/admin/post-editor";
import { getAdminPost } from "@/lib/admin-api";

export const Route = createFileRoute("/admin/posts/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Post - PowerApps.blog Admin" }] }),
  component: EditPostPage,
});

function EditPostPage() {
  const { id } = Route.useParams();
  const numericId = Number(id);
  const query = useQuery({
    queryKey: ["admin", "post", id],
    queryFn: () => getAdminPost(numericId),
    enabled: Number.isInteger(numericId),
  });

  if (query.isPending) {
    return (
      <AdminLayout title="Edit post">
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  if (query.isError || !query.data) {
    return (
      <AdminLayout title="Edit post">
        <div className="rounded-xl border border-border/70 bg-card px-5 py-12 text-center text-sm text-muted-foreground">
          Couldn't load this post.
        </div>
      </AdminLayout>
    );
  }

  return <PostEditor key={query.data.post.id} initial={query.data.post} />;
}
