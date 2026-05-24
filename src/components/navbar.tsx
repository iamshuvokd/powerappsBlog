import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Search, Sparkles, Sun, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { searchArticles } from "@/lib/data";
import { useArticles } from "@/lib/queries";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Home" },
  { to: "/powerapps", label: "Power Apps" },
  { to: "/power-automate", label: "Power Automate" },
  { to: "/sharepoint", label: "SharePoint" },
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

  useEffect(() => {
    setOpen(false);
  }, [path]);

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

        <nav className="hidden xl:flex items-center gap-1 text-sm">
          {nav.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  active
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <GlobalArticleSearch />

          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center rounded-md border border-border/60 bg-secondary/50 hover:bg-secondary transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex gradient-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)]"
          >
            <a href="/#blogs">Explore Blogs</a>
          </Button>

          <button
            onClick={() => setOpen((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border/60 xl:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 glass xl:hidden">
          <div className="max-w-7xl mx-auto container-px py-3 flex flex-col gap-2">
            <GlobalArticleSearch mobile />
            <div className="flex flex-col pt-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="py-2.5 text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function GlobalArticleSearch({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const trimmed = query.trim();
  const { data: articles = [] } = useArticles();

  const results = useMemo(
    () => (trimmed ? searchArticles(trimmed, articles).slice(0, 6) : []),
    [trimmed, articles],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setQuery("");
    setFocused(false);
  }, [path]);

  const openArticle = (slug: string) => {
    setQuery("");
    setFocused(false);
    void router.navigate({ to: "/blog/$slug", params: { slug } });
  };

  const showResults = focused && trimmed.length > 0;

  return (
    <div className={`relative ${mobile ? "w-full" : "hidden w-64 xl:block"}`}>
      <div className="flex h-9 items-center gap-2 rounded-md border border-border/60 bg-secondary/70 px-3 text-sm text-muted-foreground">
        <Search className="h-3.5 w-3.5 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && results[0]) {
              event.preventDefault();
              openArticle(results[0].slug);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          placeholder="Search articles..."
        />
        {!mobile && (
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-background/70 border border-border/60">
            Ctrl K
          </kbd>
        )}
      </div>

      {showResults && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-border/70 bg-popover shadow-[var(--shadow-elevated)]">
          {results.length > 0 ? (
            results.map((article) => (
              <button
                key={article.slug}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openArticle(article.slug)}
                className="block w-full px-3 py-3 text-left transition-colors hover:bg-secondary/70"
              >
                <span className="block text-sm font-medium leading-snug">{article.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {article.category} - {article.readingTime}
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-muted-foreground">No matching articles</div>
          )}
        </div>
      )}
    </div>
  );
}
