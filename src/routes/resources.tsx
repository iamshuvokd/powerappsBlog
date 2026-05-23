import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Box, Sparkles } from "lucide-react";
import { Newsletter } from "@/components/sections/newsletter";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — PowerApps.blog" },
      {
        name: "description",
        content:
          "Templates, design systems, automation packs and downloadable assets for Power Platform teams.",
      },
      { property: "og:title", content: "Resources — PowerApps.blog" },
      {
        property: "og:description",
        content: "Templates and downloadable assets for the Power Platform.",
      },
    ],
  }),
  component: ResourcesPage,
});

const resources = [
  {
    name: "Enterprise Power Apps Design System",
    desc: "Tokens, components and screens — copy-paste ready.",
    type: "Template",
    icon: Box,
    free: true,
  },
  {
    name: "Approval Workflow Pack",
    desc: "5 production-ready Power Automate flows with delegation.",
    type: "Flows",
    icon: Sparkles,
    free: true,
  },
  {
    name: "Dataverse Schema Library",
    desc: "10 starter ERDs for HR, ops and inventory.",
    type: "Schema",
    icon: FileText,
    free: false,
  },
  {
    name: "Power BI Dashboard Pack",
    desc: "Modern dark + light dashboards with DAX measures.",
    type: "Pack",
    icon: Box,
    free: false,
  },
  {
    name: "Mobile UI Kit for Canvas Apps",
    desc: "Beautiful mobile screens for field operations.",
    type: "Template",
    icon: Box,
    free: true,
  },
  {
    name: "AI Prompt Library for Copilot Studio",
    desc: "75+ tested prompts for enterprise scenarios.",
    type: "Prompts",
    icon: Sparkles,
    free: false,
  },
];

function ResourcesPage() {
  return (
    <div className="pt-28 pb-12">
      <div className="max-w-7xl mx-auto container-px">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-primary font-medium">Resources</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight">
            Templates & <span className="gradient-text">downloads</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Ship enterprise apps faster with battle-tested templates and packs.
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((r) => (
            <div
              key={r.name}
              className="group p-6 rounded-2xl bg-card border border-border/70 hover:border-primary/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg grid place-items-center bg-primary/10 text-primary">
                  <r.icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-[10.5px] px-2 py-0.5 rounded-full ${r.free ? "bg-emerald-500/15 text-emerald-500" : "bg-primary/15 text-primary"}`}
                >
                  {r.free ? "Free" : "Premium"}
                </span>
              </div>
              <h3 className="mt-4 font-medium">{r.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.desc}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{r.type}</span>
                <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Newsletter />
    </div>
  );
}
