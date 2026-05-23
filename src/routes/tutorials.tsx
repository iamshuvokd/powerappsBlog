import { createFileRoute } from "@tanstack/react-router";
import { BlogArchive } from "@/components/sections/blog-archive";

export const Route = createFileRoute("/tutorials")({
  head: () => ({
    meta: [
      { title: "Blogs - PowerApps.blog" },
      {
        name: "description",
        content:
          "Browse Power Apps, Power Automate and SharePoint blog articles from PowerApps.blog.",
      },
      { property: "og:title", content: "Blogs - PowerApps.blog" },
      {
        property: "og:description",
        content: "Practical Microsoft 365 blog articles for builders.",
      },
    ],
  }),
  component: TutorialsPage,
});

function TutorialsPage() {
  return (
    <div className="pt-24 pb-8">
      <BlogArchive
        eyebrow="All blogs"
        title="Latest articles"
        description="Browse every Power Apps, Power Automate and SharePoint article in one place."
      />
    </div>
  );
}
