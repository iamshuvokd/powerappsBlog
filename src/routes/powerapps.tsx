import { createFileRoute } from "@tanstack/react-router";
import { BlogArchive } from "@/components/sections/blog-archive";

export const Route = createFileRoute("/powerapps")({
  head: () => ({
    meta: [
      { title: "Power Apps Blog - PowerApps.blog" },
      {
        name: "description",
        content:
          "Power Apps articles for canvas apps, SharePoint forms, Dataverse patterns and app UX.",
      },
      { property: "og:title", content: "Power Apps Blog - PowerApps.blog" },
      {
        property: "og:description",
        content: "Practical Power Apps blog articles and production patterns.",
      },
    ],
  }),
  component: PowerAppsPage,
});

function PowerAppsPage() {
  return (
    <div className="pt-24 pb-8">
      <BlogArchive
        eyebrow="Power Apps"
        title="Power Apps articles"
        description="Canvas app builds, SharePoint forms, delegation fixes, responsive UI and data patterns."
        category="Power Apps"
      />
    </div>
  );
}
