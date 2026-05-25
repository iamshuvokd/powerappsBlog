import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, type AdminUser } from "@/lib/auth";
import { getAdminComments } from "@/lib/admin-api";

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
  const [postsOpen, setPostsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const commentsQuery = useQuery({
    queryKey: ["admin", "comments", "ALL"],
    queryFn: () => getAdminComments(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
  const pendingComments = commentsQuery.data?.counts.pending ?? 0;

  useEffect(() => {
    if (ready && !isAuthenticated) {
      void navigate({ to: "/admin/login" });
    }
  }, [ready, isAuthenticated, navigate]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  const onLogout = () => {
    logout();
    void navigate({ to: "/admin/login" });
  };

  if (!ready || !isAuthenticated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const sidebar = (
    <SidebarContent
      path={path}
      postsOpen={postsOpen}
      setPostsOpen={setPostsOpen}
      pendingComments={pendingComments}
      user={user}
      onLogout={onLogout}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border/60 p-4 md:flex">
          {sidebar}
        </aside>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50 animate-in fade-in"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border/60 bg-background p-4 shadow-xl animate-in slide-in-from-left duration-200">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
              {sidebar}
            </aside>
          </div>
        ) : null}

        <main className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4 lg:px-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="grid h-9 w-9 place-items-center rounded-md border border-border/60 md:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
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

function SidebarContent({
  path,
  postsOpen,
  setPostsOpen,
  pendingComments,
  user,
  onLogout,
}: {
  path: string;
  postsOpen: boolean;
  setPostsOpen: (fn: (open: boolean) => boolean) => void;
  pendingComments: number;
  user: AdminUser | null;
  onLogout: () => void;
}) {
  return (
    <>
      <Link to="/admin/dashboard" className="flex items-center gap-2 px-2 py-1 font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="text-[15px]">
          PowerApps<span className="text-primary">.blog</span>
        </span>
      </Link>

      <nav className="mt-6 flex flex-col gap-1">
        <NavLink
          to="/admin/dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
          active={path === "/admin/dashboard"}
        />

        {/* Posts group with submenu (WordPress-style) */}
        <button
          onClick={() => setPostsOpen((open) => !open)}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
            path.startsWith("/admin/posts")
              ? "text-foreground"
              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          Posts
          <ChevronDown
            className={`ml-auto h-3.5 w-3.5 transition-transform ${postsOpen ? "" : "-rotate-90"}`}
          />
        </button>
        {postsOpen ? (
          <div className="ml-4 flex flex-col gap-1 border-l border-border/60 pl-3">
            <NavLink to="/admin/posts" label="All Posts" active={path === "/admin/posts"} compact />
            <NavLink
              to="/admin/posts/new"
              label="Add New"
              active={path === "/admin/posts/new"}
              compact
            />
          </div>
        ) : null}

        <NavLink
          to="/admin/media"
          label="Media"
          icon={ImageIcon}
          active={path.startsWith("/admin/media")}
        />
        <NavLink
          to="/admin/comments"
          label="Comments"
          icon={MessageSquare}
          active={path.startsWith("/admin/comments")}
          badge={pendingComments}
        />
        <NavLink
          to="/admin/subscribers"
          label="Subscribers"
          icon={Mail}
          active={path.startsWith("/admin/subscribers")}
        />
        <NavLink
          to="/admin/settings"
          label="Settings"
          icon={Settings}
          active={path.startsWith("/admin/settings")}
        />
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
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </>
  );
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
  badge,
  compact,
}: {
  to: string;
  label: string;
  icon?: typeof LayoutDashboard;
  active: boolean;
  badge?: number;
  compact?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2.5 rounded-lg px-3 text-sm transition-colors ${
        compact ? "py-1.5" : "py-2"
      } ${
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
      }`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {label}
      {badge && badge > 0 ? (
        <span className="ml-auto grid min-w-[1.25rem] place-items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
