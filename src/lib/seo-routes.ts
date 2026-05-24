// Dynamic /robots.txt and /sitemap.xml, served by the Worker entry before the
// TanStack router handles the request.

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://www.powerapps.blog").replace(/\/$/, "");
const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

const STATIC_PATHS = [
  "/",
  "/tutorials",
  "/powerapps",
  "/power-automate",
  "/sharepoint",
  "/resources",
  "/ui-showcase",
  "/enterprise-solutions",
  "/about",
  "/contact",
];

export async function handleSeoRoutes(request: Request): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (pathname === "/robots.txt") return robotsResponse();
  if (pathname === "/sitemap.xml") return sitemapResponse();
  return null;
}

function robotsResponse(): Response {
  const body = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml
`;
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

async function sitemapResponse(): Promise<Response> {
  const locs = new Set(STATIC_PATHS.map((path) => `${SITE_URL}${path === "/" ? "" : path}`));

  try {
    const res = await fetch(`${API_URL}/api/posts?pageSize=100`);
    if (res.ok) {
      const data = (await res.json()) as { posts: Array<{ slug: string }> };
      for (const post of data.posts) locs.add(`${SITE_URL}/blog/${post.slug}`);
    }
  } catch {
    // API unreachable — fall back to static paths only
  }

  const urls = [...locs].map((loc) => `  <url><loc>${loc}</loc></url>`).join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
