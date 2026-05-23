import { createFileRoute } from "@tanstack/react-router";
import { UIShowcase } from "@/components/sections/ui-showcase";

export const Route = createFileRoute("/ui-showcase")({
  head: () => ({
    meta: [
      { title: "UI Showcase — PowerApps.blog" },
      {
        name: "description",
        content: "Modern Power Apps UI inspiration — dashboards, mobile, tables and analytics.",
      },
      { property: "og:title", content: "UI Showcase — PowerApps.blog" },
      { property: "og:description", content: "Modern Power Apps interfaces and design patterns." },
    ],
  }),
  component: () => (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto container-px pt-12 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium">UI Showcase</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
          Power Apps, <span className="gradient-text">elevated</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          A library of modern UI patterns inspired by Linear, Microsoft Fabric and the Azure portal.
        </p>
      </div>
      <UIShowcase />
    </div>
  ),
});
