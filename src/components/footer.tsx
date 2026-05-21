import { Link } from "@tanstack/react-router";
import { Sparkles, Github, Twitter, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface/60">
      <div className="max-w-7xl mx-auto container-px py-16 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center h-8 w-8 rounded-lg gradient-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>PowerApps<span className="text-primary">.blog</span></span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm">
            A modern enterprise Power Platform resource hub — tutorials, architectures and production-grade solutions.
          </p>
          <form className="flex gap-2 max-w-sm">
            <input
              type="email"
              placeholder="you@company.com"
              className="flex-1 h-10 px-3 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="h-10 px-4 rounded-md gradient-primary text-primary-foreground text-sm font-medium">
              Subscribe
            </button>
          </form>
        </div>

        <FooterCol title="Platform" links={[
          { to: "/tutorials", label: "Tutorials" },
          { to: "/enterprise-solutions", label: "Enterprise Solutions" },
          { to: "/ui-showcase", label: "UI Showcase" },
          { to: "/resources", label: "Resources" },
        ]} />

        <FooterCol title="Categories" links={[
          { to: "/tutorials", label: "Power Apps" },
          { to: "/tutorials", label: "Power Automate" },
          { to: "/tutorials", label: "Power BI" },
          { to: "/tutorials", label: "Dataverse" },
        ]} />

        <FooterCol title="Company" links={[
          { to: "/about", label: "About" },
          { to: "/contact", label: "Contact" },
          { to: "/resources", label: "Templates" },
          { to: "/resources", label: "Consulting" },
        ]} />
      </div>

      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto container-px py-6 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} PowerApps.blog. Built for enterprise teams.</p>
          <div className="flex items-center gap-3">
            {[Github, Twitter, Linkedin, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="h-8 w-8 grid place-items-center rounded-md border border-border/60 hover:text-foreground hover:bg-secondary transition-colors">
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((l, i) => (
          <li key={i}><Link to={l.to} className="hover:text-foreground transition-colors">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
