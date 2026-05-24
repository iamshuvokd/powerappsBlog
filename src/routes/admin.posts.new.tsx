import { createFileRoute } from "@tanstack/react-router";
import { PostEditor } from "@/components/admin/post-editor";

export const Route = createFileRoute("/admin/posts/new")({
  head: () => ({ meta: [{ title: "New Post - PowerApps.blog Admin" }] }),
  component: () => <PostEditor />,
});
