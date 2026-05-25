import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Preload a route's loader as soon as the user shows intent (hover/touch),
    // so by the time they click, the post is already fetched -> instant nav.
    defaultPreload: "intent",
    // Keep preloaded loader data fresh for 30s so the click reuses the hover
    // fetch instead of refetching immediately.
    defaultPreloadStaleTime: 30_000,
    defaultPreloadGcTime: 120_000,
  });

  return router;
};
