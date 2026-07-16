import type { MetadataRoute } from "next";

// sitemap.xml — the public, crawlable routes. /admin is private and /template
// permanently redirects to /library, so both are omitted.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://frame-pilot.rahmanef.com";
  const routes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/library", priority: 0.8 },
    { path: "/panduan", priority: 0.7 },
    { path: "/docs", priority: 0.7 },
  ];
  return routes.map(({ path, priority }) => ({
    url: `${base}${path}`,
    changeFrequency: "weekly",
    priority,
  }));
}
