import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/components/sections/about";
import { Testimonials } from "@/components/sections/testimonials";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PowerApps.blog" },
      {
        name: "description",
        content: "Enterprise Power Platform architect sharing real-world implementation knowledge.",
      },
      { property: "og:title", content: "About — PowerApps.blog" },
      { property: "og:description", content: "Meet the team behind PowerApps.blog." },
    ],
  }),
  component: () => (
    <div className="pt-12">
      <About />
      <Testimonials />
    </div>
  ),
});
