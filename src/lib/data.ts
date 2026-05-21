import {
  Boxes, Workflow, Database, BarChart3, Sparkles, LayoutDashboard,
  Cloud, Shield, Users, FileStack, Briefcase, GraduationCap,
} from "lucide-react";

export const categories = [
  { slug: "power-apps", name: "Power Apps", desc: "Canvas, model-driven & custom controls", icon: Boxes, count: 42 },
  { slug: "power-automate", name: "Power Automate", desc: "Cloud flows, RPA & approvals", icon: Workflow, count: 31 },
  { slug: "sharepoint", name: "SharePoint", desc: "Lists, libraries & governance", icon: FileStack, count: 28 },
  { slug: "power-bi", name: "Power BI", desc: "DAX, modeling & analytics", icon: BarChart3, count: 24 },
  { slug: "dataverse", name: "Dataverse", desc: "Schema, security & relationships", icon: Database, count: 18 },
  { slug: "ai-automation", name: "AI Automation", desc: "Copilot, AI Builder & GPT flows", icon: Sparkles, count: 16 },
  { slug: "ui-ux", name: "UI / UX", desc: "Modern Power Apps interfaces", icon: LayoutDashboard, count: 22 },
  { slug: "enterprise", name: "Enterprise Solutions", desc: "Production-grade architectures", icon: Briefcase, count: 19 },
];

export const articles = [
  {
    slug: "build-enterprise-inventory-system-power-apps",
    title: "Build an Enterprise Inventory System in Power Apps",
    excerpt: "End-to-end architecture: Dataverse schema, role-based security, barcode scanning, and a modern dashboard UI.",
    category: "Power Apps",
    readingTime: "14 min",
    date: "May 18, 2026",
    tag: "Featured",
    author: "Aarav Mehta",
  },
  {
    slug: "fix-delegation-warnings-power-apps",
    title: "Fix Delegation Warnings in Power Apps",
    excerpt: "A practical playbook for delegable patterns across SharePoint, SQL and Dataverse — with real benchmark data.",
    category: "Power Apps",
    readingTime: "9 min",
    date: "May 12, 2026",
    tag: "Trending",
    author: "Aarav Mehta",
  },
  {
    slug: "modern-power-apps-dashboard-ui",
    title: "Modern Power Apps Dashboard UI",
    excerpt: "Design tokens, layout grids and component patterns inspired by Linear and Microsoft Fabric.",
    category: "UI / UX",
    readingTime: "11 min",
    date: "May 06, 2026",
    tag: "Popular",
    author: "Aarav Mehta",
  },
  {
    slug: "sharepoint-approval-workflow-architecture",
    title: "SharePoint Approval Workflow Architecture",
    excerpt: "Multi-stage approvals with parallel branches, delegation rules and SLA tracking.",
    category: "SharePoint",
    readingTime: "12 min",
    date: "Apr 29, 2026",
    tag: "Guide",
    author: "Aarav Mehta",
  },
  {
    slug: "ai-integration-power-platform",
    title: "AI Integration with Power Platform",
    excerpt: "Wiring Azure OpenAI, AI Builder and Copilot Studio into production Power Apps.",
    category: "AI Automation",
    readingTime: "16 min",
    date: "Apr 22, 2026",
    tag: "New",
    author: "Aarav Mehta",
  },
  {
    slug: "production-power-apps-design-patterns",
    title: "Production-Level Power Apps Design Patterns",
    excerpt: "State management, error boundaries, telemetry and component libraries for enterprise teams.",
    category: "Enterprise",
    readingTime: "18 min",
    date: "Apr 15, 2026",
    tag: "Deep Dive",
    author: "Aarav Mehta",
  },
];

export const solutions = [
  { name: "PPE Management System", desc: "Track personal protective equipment issuance, returns and compliance audits.", stack: ["Power Apps", "Dataverse", "Power BI"], icon: Shield },
  { name: "HR Management System", desc: "Onboarding, leave, performance reviews and employee directory in one workspace.", stack: ["Power Apps", "SharePoint", "Automate"], icon: Users },
  { name: "Visitor Management", desc: "QR-based check-in/out with host notifications and security dashboards.", stack: ["Power Apps", "Automate", "Teams"], icon: Briefcase },
  { name: "Audit Tracking Platform", desc: "Plan audits, capture findings, assign actions and visualize closure SLAs.", stack: ["Dataverse", "Power BI", "Automate"], icon: FileStack },
  { name: "Inventory Management", desc: "Stock, transfers and reorder logic with barcode scanning and analytics.", stack: ["Power Apps", "Dataverse", "Power BI"], icon: Boxes },
  { name: "Approval Workflow System", desc: "Configurable multi-stage approvals with delegation and SLA tracking.", stack: ["Automate", "SharePoint", "Teams"], icon: Workflow },
  { name: "Employee Attendance", desc: "Geo-fenced punch-in, shift planning and HR-grade reports.", stack: ["Power Apps", "Automate", "Power BI"], icon: Users },
];

export const services = [
  { name: "Power Apps Development", desc: "Custom canvas & model-driven apps engineered for scale.", icon: Boxes },
  { name: "Power Automate Workflows", desc: "Resilient cloud flows, RPA and business process automation.", icon: Workflow },
  { name: "SharePoint Solutions", desc: "Architected information systems with governance baked in.", icon: FileStack },
  { name: "Power BI Dashboards", desc: "Semantic models, DAX and executive-ready visuals.", icon: BarChart3 },
  { name: "AI Integration", desc: "Azure OpenAI, Copilot Studio and AI Builder in production.", icon: Sparkles },
  { name: "Microsoft 365 Automation", desc: "Teams, Outlook and Graph API automations end-to-end.", icon: Cloud },
  { name: "Consulting & Training", desc: "Hands-on enablement for enterprise Power Platform teams.", icon: GraduationCap },
];

export const testimonials = [
  { quote: "Cut our approval cycle from 5 days to 4 hours. The architecture is rock solid.", name: "Priya Subramanian", role: "Head of Operations, Acme Industries" },
  { quote: "Our internal apps finally look like real SaaS. The team raised the bar across the org.", name: "Marcus Reilly", role: "Director of IT, Northwind Logistics" },
  { quote: "The most pragmatic Power Platform content on the internet. We hire from this blog.", name: "Sara Klein", role: "Solutions Architect, Contoso" },
  { quote: "Replaced three legacy tools with one Power App. ROI in under a quarter.", name: "Daniel Okafor", role: "VP Engineering, Fabrikam" },
];

export const stats = [
  { label: "Enterprise Projects", value: 120, suffix: "+" },
  { label: "Tutorials Published", value: 240, suffix: "+" },
  { label: "Automation Workflows", value: 580, suffix: "+" },
  { label: "Community Readers", value: 95, suffix: "k+" },
];
