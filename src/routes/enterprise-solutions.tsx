import { createFileRoute } from "@tanstack/react-router";
import { EnterpriseSolutions } from "@/components/sections/enterprise-solutions";
import { Newsletter } from "@/components/sections/newsletter";

export const Route = createFileRoute("/enterprise-solutions")({
  head: () => ({
    meta: [
      { title: "Enterprise Solutions — PowerApps.blog" },
      { name: "description", content: "Production Power Platform systems for HR, operations, compliance and inventory." },
      { property: "og:title", content: "Enterprise Solutions — PowerApps.blog" },
      { property: "og:description", content: "Real enterprise Power Platform implementations." },
    ],
  }),
  component: () => (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto container-px pt-12 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium">Enterprise</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
          Real systems, <span className="gradient-text">real outcomes</span>
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          A catalogue of production Power Platform solutions deployed across operations, HR, compliance and more.
        </p>
      </div>
      <EnterpriseSolutions />
      <Newsletter />
    </div>
  ),
});
