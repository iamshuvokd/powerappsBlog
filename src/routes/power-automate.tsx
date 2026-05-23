import { createFileRoute } from "@tanstack/react-router";
import { BlogArchive } from "@/components/sections/blog-archive";

export const Route = createFileRoute("/power-automate")({
  head: () => ({
    meta: [
      { title: "Power Automate Blog - PowerApps.blog" },
      {
        name: "description",
        content:
          "Power Automate articles for approval workflows, error handling, AI integration and cloud flow governance.",
      },
      { property: "og:title", content: "Power Automate Blog - PowerApps.blog" },
      {
        property: "og:description",
        content: "Practical Power Automate blog articles and production flow patterns.",
      },
    ],
  }),
  component: PowerAutomatePage,
});

function PowerAutomatePage() {
  return (
    <div className="pt-24 pb-8">
      <BlogArchive
        eyebrow="Power Automate"
        title="Power Automate articles"
        description="Cloud flows, approvals, retries, error handling, AI steps and automation governance."
        category="Power Automate"
      />
    </div>
  );
}
