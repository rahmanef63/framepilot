import type { MetadataRoute } from "next";

// sitemap.xml — the public, crawlable routes. /admin is private and /template
// permanently redirects to /library, so both are omitted.
const LOCALES = ["en", "id", "es", "zh", "ar"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://frame-pilot.rahmanef.com";
  const routes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    // per-locale SEO landing pages (each cross-links the others via hreflang)
    ...LOCALES.map((l) => ({ path: `/${l}`, priority: 0.9 })),
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
