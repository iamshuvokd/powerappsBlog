import {
  Boxes,
  Workflow,
  BarChart3,
  Sparkles,
  Cloud,
  Shield,
  Users,
  FileStack,
  Briefcase,
  GraduationCap,
} from "lucide-react";

export const categories = [
  {
    slug: "powerapps",
    to: "/powerapps",
    name: "Power Apps",
    desc: "Canvas apps, forms, data patterns and app UX",
    icon: Boxes,
    count: 4,
  },
  {
    slug: "power-automate",
    to: "/power-automate",
    name: "Power Automate",
    desc: "Cloud flows, approvals, retries and governance",
    icon: Workflow,
    count: 3,
  },
  {
    slug: "sharepoint",
    to: "/sharepoint",
    name: "SharePoint",
    desc: "Lists, libraries, permissions and content systems",
    icon: FileStack,
    count: 3,
  },
];

export const articles = [
  {
    slug: "build-enterprise-inventory-system-power-apps",
    title: "Build an Enterprise Inventory System in Power Apps",
    excerpt:
      "End-to-end architecture: Dataverse schema, role-based security, barcode scanning, and a modern dashboard UI.",
    category: "Power Apps",
    readingTime: "14 min",
    date: "May 18, 2026",
    tag: "Featured",
    author: "Aarav Mehta",
    keywords: ["inventory", "dataverse", "barcode", "dashboard", "role security"],
  },
  {
    slug: "fix-delegation-warnings-power-apps",
    title: "Fix Delegation Warnings in Power Apps",
    excerpt:
      "A practical playbook for delegable patterns across SharePoint, SQL and Dataverse with real benchmark data.",
    category: "Power Apps",
    readingTime: "9 min",
    date: "May 12, 2026",
    tag: "Trending",
    author: "Aarav Mehta",
    keywords: ["delegation", "filter", "search", "sharepoint", "dataverse"],
  },
  {
    slug: "power-apps-sharepoint-forms-pattern",
    title: "Power Apps Forms for SharePoint Lists",
    excerpt:
      "Replace default SharePoint forms with clean canvas app experiences, validation rules and reusable components.",
    category: "Power Apps",
    readingTime: "10 min",
    date: "May 08, 2026",
    tag: "Popular",
    author: "Aarav Mehta",
    keywords: ["forms", "sharepoint list", "validation", "canvas app", "patch"],
  },
  {
    slug: "modern-power-apps-dashboard-ui",
    title: "Modern Power Apps Dashboard UI",
    excerpt:
      "Design tokens, layout grids and component patterns for business apps that feel fast and polished.",
    category: "Power Apps",
    readingTime: "11 min",
    date: "May 06, 2026",
    tag: "Design",
    author: "Aarav Mehta",
    keywords: ["ui", "ux", "dashboard", "components", "responsive"],
  },
  {
    slug: "build-approval-flow-power-automate-sharepoint",
    title: "Build Approval Flows with Power Automate and SharePoint",
    excerpt:
      "A production-ready approval pattern using SharePoint lists, adaptive cards, escalation branches and audit logs.",
    category: "Power Automate",
    readingTime: "13 min",
    date: "May 01, 2026",
    tag: "Guide",
    author: "Aarav Mehta",
    keywords: ["approval", "adaptive cards", "sharepoint", "audit", "teams"],
  },
  {
    slug: "power-automate-error-handling-retries",
    title: "Power Automate Error Handling and Retry Patterns",
    excerpt:
      "Scopes, run-after branches, retry policies and alerting patterns that keep cloud flows reliable.",
    category: "Power Automate",
    readingTime: "12 min",
    date: "Apr 29, 2026",
    tag: "Reliability",
    author: "Aarav Mehta",
    keywords: ["errors", "retry", "scope", "run after", "monitoring"],
  },
  {
    slug: "ai-integration-power-automate",
    title: "AI Integration with Power Automate",
    excerpt:
      "Use AI Builder, Azure OpenAI and approval checkpoints inside flows without losing control of business data.",
    category: "Power Automate",
    readingTime: "16 min",
    date: "Apr 22, 2026",
    tag: "AI",
    author: "Aarav Mehta",
    keywords: ["ai builder", "azure openai", "copilot", "prompt", "automation"],
  },
  {
    slug: "sharepoint-approval-workflow-architecture",
    title: "SharePoint Approval Workflow Architecture",
    excerpt: "Multi-stage approvals with parallel branches, delegation rules and SLA tracking.",
    category: "SharePoint",
    readingTime: "12 min",
    date: "Apr 18, 2026",
    tag: "Guide",
    author: "Aarav Mehta",
    keywords: ["approval", "workflow", "delegation", "sla", "lists"],
  },
  {
    slug: "sharepoint-lists-governance-for-apps",
    title: "SharePoint Lists Governance for Power Platform Apps",
    excerpt:
      "Naming, permissions, indexed columns and lifecycle rules for lists that support business-critical apps.",
    category: "SharePoint",
    readingTime: "15 min",
    date: "Apr 15, 2026",
    tag: "Governance",
    author: "Aarav Mehta",
    keywords: ["lists", "permissions", "indexed columns", "governance", "lifecycle"],
  },
  {
    slug: "document-library-metadata-power-platform",
    title: "Document Library Metadata for Power Platform Solutions",
    excerpt:
      "Design metadata, content types and document routing patterns that Power Apps and flows can trust.",
    category: "SharePoint",
    readingTime: "11 min",
    date: "Apr 10, 2026",
    tag: "Architecture",
    author: "Aarav Mehta",
    keywords: ["document library", "metadata", "content types", "power apps", "flow"],
  },
];

export type Article = (typeof articles)[number] & {
  coverImage?: string | null;
  tags?: string[]; // all tag names (real posts); cards fall back to [category]
};

export function getArticleSearchText(article: Article) {
  return [
    article.title,
    article.excerpt,
    article.category,
    article.tag,
    article.author,
    article.slug,
    ...article.keywords,
  ]
    .join(" ")
    .toLowerCase();
}

export function searchArticles(query: string, source: Article[] = articles) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return source;
  }

  return source.filter((article) => {
    const text = getArticleSearchText(article);
    return terms.every((term) => text.includes(term));
  });
}

export const solutions = [
  {
    name: "PPE Management System",
    desc: "Track personal protective equipment issuance, returns and compliance audits.",
    stack: ["Power Apps", "Dataverse", "Power BI"],
    icon: Shield,
  },
  {
    name: "HR Management System",
    desc: "Onboarding, leave, performance reviews and employee directory in one workspace.",
    stack: ["Power Apps", "SharePoint", "Automate"],
    icon: Users,
  },
  {
    name: "Visitor Management",
    desc: "QR-based check-in/out with host notifications and security dashboards.",
    stack: ["Power Apps", "Automate", "Teams"],
    icon: Briefcase,
  },
  {
    name: "Audit Tracking Platform",
    desc: "Plan audits, capture findings, assign actions and visualize closure SLAs.",
    stack: ["Dataverse", "Power BI", "Automate"],
    icon: FileStack,
  },
  {
    name: "Inventory Management",
    desc: "Stock, transfers and reorder logic with barcode scanning and analytics.",
    stack: ["Power Apps", "Dataverse", "Power BI"],
    icon: Boxes,
  },
  {
    name: "Approval Workflow System",
    desc: "Configurable multi-stage approvals with delegation and SLA tracking.",
    stack: ["Automate", "SharePoint", "Teams"],
    icon: Workflow,
  },
  {
    name: "Employee Attendance",
    desc: "Geo-fenced punch-in, shift planning and HR-grade reports.",
    stack: ["Power Apps", "Automate", "Power BI"],
    icon: Users,
  },
];

export const services = [
  {
    name: "Power Apps Development",
    desc: "Custom canvas and model-driven apps engineered for scale.",
    icon: Boxes,
  },
  {
    name: "Power Automate Workflows",
    desc: "Resilient cloud flows, RPA and business process automation.",
    icon: Workflow,
  },
  {
    name: "SharePoint Solutions",
    desc: "Architected information systems with governance baked in.",
    icon: FileStack,
  },
  {
    name: "Power BI Dashboards",
    desc: "Semantic models, DAX and executive-ready visuals.",
    icon: BarChart3,
  },
  {
    name: "AI Integration",
    desc: "Azure OpenAI, Copilot Studio and AI Builder in production.",
    icon: Sparkles,
  },
  {
    name: "Microsoft 365 Automation",
    desc: "Teams, Outlook and Graph API automations end-to-end.",
    icon: Cloud,
  },
  {
    name: "Consulting and Training",
    desc: "Hands-on enablement for enterprise Power Platform teams.",
    icon: GraduationCap,
  },
];

export const testimonials = [
  {
    quote: "Cut our approval cycle from 5 days to 4 hours. The architecture is rock solid.",
    name: "Priya Subramanian",
    role: "Head of Operations, Acme Industries",
  },
  {
    quote: "Our internal apps finally look like real SaaS. The team raised the bar across the org.",
    name: "Marcus Reilly",
    role: "Director of IT, Northwind Logistics",
  },
  {
    quote: "The most pragmatic Power Platform content on the internet. We hire from this blog.",
    name: "Sara Klein",
    role: "Solutions Architect, Contoso",
  },
  {
    quote: "Replaced three legacy tools with one Power App. ROI in under a quarter.",
    name: "Daniel Okafor",
    role: "VP Engineering, Fabrikam",
  },
];

export const stats = [
  { label: "Enterprise Projects", value: 120, suffix: "+" },
  { label: "Blog Articles", value: 240, suffix: "+" },
  { label: "Automation Workflows", value: 580, suffix: "+" },
  { label: "Community Readers", value: 95, suffix: "k+" },
];
