import type { MetadataRoute } from "next";

// PWA manifest (Next metadata route → served at /manifest.webmanifest). Makes the
// app installable ("Add to Home Screen") + gives the standalone window its identity.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Camera Angle Guide Pro",
    short_name: "CAG Pro",
    description: "Compose camera angles in a 3D studio → paste-ready camera prompts for 10+ AI video platforms.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F0EEE6",
    theme_color: "#d97757",
    orientation: "any",
    lang: "en",
    categories: ["productivity", "photo", "graphics"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
