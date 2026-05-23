import { createFileRoute } from "@tanstack/react-router";
import { BlogArchive } from "@/components/sections/blog-archive";

export const Route = createFileRoute("/sharepoint")({
  head: () => ({
    meta: [
      { title: "SharePoint Blog - PowerApps.blog" },
      {
        name: "description",
        content:
          "SharePoint articles for lists, libraries, metadata, permissions and Power Platform-backed content systems.",
      },
      { property: "og:title", content: "SharePoint Blog - PowerApps.blog" },
      {
        property: "og:description",
        content: "Practical SharePoint blog articles for Power Platform builders.",
      },
    ],
  }),
  component: SharePointPage,
});

function SharePointPage() {
  return (
    <div className="pt-24 pb-8">
      <BlogArchive
        eyebrow="SharePoint"
        title="SharePoint articles"
        description="Lists, libraries, permissions, metadata, governance and Power Platform-ready architecture."
        category="SharePoint"
      />
    </div>
  );
}
