import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Thin top loading bar shown during route transitions. While the router is
 * loading, the bar creeps toward 90%; when navigation finishes it snaps to
 * 100% and fades out. With intent-preloading most navigations are instant, so
 * the bar only appears when a route genuinely needs time to load.
 */
export function RouteProgress() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setWidth(8);
      const id = window.setInterval(() => {
        setWidth((w) => (w >= 90 ? w : w + Math.max(0.5, (90 - w) * 0.1)));
      }, 200);
      return () => window.clearInterval(id);
    }
    setWidth(100);
    const id = window.setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 300);
    return () => window.clearTimeout(id);
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-0.5" aria-hidden>
      <div
        className="h-full gradient-primary shadow-[0_0_12px_var(--primary)] transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${width}%`, opacity: width >= 100 ? 0 : 1 }}
      />
    </div>
  );
}
