import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Moon, Sun, Menu, X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Home" },
  { to: "/tutorials", label: "Tutorials" },
  { to: "/enterprise-solutions", label: "Enterprise Solutions" },
  { to: "/ui-showcase", label: "UI Showcase" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [path]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-border/60" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto container-px h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid place-items-center h-8 w-8 rounded-lg gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-[15px]">
            PowerApps<span className="text-primary">.blog</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {nav.map((n) => {
            const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  active
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md bg-secondary/70 border border-border/60 text-muted-foreground text-sm w-56">
            <Search className="h-3.5 w-3.5" />
            <span>Search articles…</span>
            <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-background/70 border border-border/60">⌘K</kbd>
          </div>

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center rounded-md border border-border/60 bg-secondary/50 hover:bg-secondary transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Button asChild size="sm" className="hidden sm:inline-flex gradient-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)]">
            <Link to="/tutorials">Explore Tutorials</Link>
          </Button>

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden h-9 w-9 grid place-items-center rounded-md border border-border/60"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/60 glass">
          <div className="max-w-7xl mx-auto container-px py-3 flex flex-col">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="py-2.5 text-sm text-muted-foreground hover:text-foreground">
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
