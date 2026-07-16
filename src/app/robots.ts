import type { MetadataRoute } from "next";

// robots.txt (served at /robots.txt). Allow crawling the public app, keep the
// private /admin and the API routes out of the index, and point at the sitemap.
export default function robots(): MetadataRoute.Robots {
  const base = "https://frame-pilot.rahmanef.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
