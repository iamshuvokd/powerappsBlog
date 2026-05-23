import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/sections/hero";
import { BlogArchive } from "@/components/sections/blog-archive";
import { Newsletter } from "@/components/sections/newsletter";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <BlogArchive
        eyebrow="All blogs"
        title="Latest articles"
        description="Browse every Power Apps, Power Automate and SharePoint article in one place."
      />
      <Newsletter />
    </>
  );
}
