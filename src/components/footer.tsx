import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Github, Linkedin, Sparkles, Twitter, Youtube } from "lucide-react";
import { useSubscribe } from "@/lib/use-subscribe";
import { Spinner } from "@/components/ui/spinner";

const socials = [
  { icon: Github, href: "https://github.com/iamshuvokd", label: "GitHub" },
  { icon: Twitter, href: "https://x.com/iamshuvokd", label: "X (Twitter)" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/iamshuvokd", label: "LinkedIn" },
  { icon: Youtube, href: "https://www.youtube.com/@iamshuvokd", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface/60">
      <div className="max-w-7xl mx-auto container-px py-16 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center h-8 w-8 rounded-lg gradient-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>
              PowerApps<span className="text-primary">.blog</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm">
            A focused blog for Power Apps, Power Automate and SharePoint builders.
          </p>
          <FooterSubscribe />
        </div>

        <FooterCol
          title="Blog"
          links={[
            { to: "/", label: "All Blogs" },
            { to: "/powerapps", label: "Power Apps" },
            { to: "/power-automate", label: "Power Automate" },
            { to: "/sharepoint", label: "SharePoint" },
          ]}
        />

        <FooterCol
          title="Topics"
          links={[
            { to: "/powerapps", label: "Canvas Apps" },
            { to: "/power-automate", label: "Approval Flows" },
            { to: "/sharepoint", label: "SharePoint Lists" },
            { to: "/sharepoint", label: "Document Libraries" },
          ]}
        />

        <FooterCol
          title="Popular"
          links={[
            { to: "/", label: "Latest Articles" },
            { to: "/powerapps", label: "Delegation" },
            { to: "/power-automate", label: "Error Handling" },
            { to: "/sharepoint", label: "Governance" },
          ]}
        />
      </div>

      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto container-px py-6 flex flex-col sm:flex-row gap-4 items-center justify-between text-xs text-muted-foreground">
          <p>(c) {new Date().getFullYear()} PowerApps.blog. Built for enterprise teams.</p>
          <div className="flex items-center gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.label}
                className="h-8 w-8 grid place-items-center rounded-md border border-border/60 hover:text-foreground hover:bg-secondary transition-colors"
              >
                <social.icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSubscribe() {
  const [email, setEmail] = useState("");
  const { submit, loading } = useSubscribe();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit(email);
    if (ok) setEmail("");
  };

  return (
    <form className="flex gap-2 max-w-sm" onSubmit={onSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        autoComplete="email"
        className="flex-1 h-10 px-3 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="submit"
        disabled={loading}
        className="h-10 px-4 rounded-md gradient-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-70"
      >
        {loading ? <Spinner size="xs" /> : null}
        Subscribe
      </button>
    </form>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <Link to={link.to} className="hover:text-foreground transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
