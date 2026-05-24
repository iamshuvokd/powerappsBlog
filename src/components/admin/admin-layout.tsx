import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/posts/new", label: "New Post", icon: PlusCircle },
  { to: "/admin/media", label: "Media", icon: ImageIcon },
];

export function AdminLayout({
  children,
  title,
  actions,
}: {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}) {
  const { ready, isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (ready && !isAuthenticated) {
      void navigate({ to: "/admin/login" });
    }
  }, [ready, isAuthenticated, navigate]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 p-4 md:flex">
          <Link to="/admin/dashboard" className="flex items-center gap-2 px-2 py-1 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="text-[15px]">
              PowerApps<span className="text-primary">.blog</span>
            </span>
          </Link>

          <nav className="mt-6 flex flex-col gap-1">
            {navItems.map((item) => {
              const active = path === item.to || path.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 border-t border-border/60 pt-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View site
            </a>
            <div className="px-3 text-xs text-muted-foreground">
              <p className="truncate font-medium text-foreground/80">{user?.email}</p>
              <p>{user?.role}</p>
            </div>
            <button
              onClick={() => {
                logout();
                void navigate({ to: "/admin/login" });
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <Link to="/admin/dashboard" className="md:hidden">
                <Sparkles className="h-5 w-5 text-primary" />
              </Link>
              <h1 className="text-lg font-semibold tracking-tight">{title ?? "Admin"}</h1>
            </div>
            <div className="flex items-center gap-2">{actions}</div>
          </header>
          <div className="p-5 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
