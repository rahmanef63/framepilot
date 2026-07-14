import type { MetadataRoute } from "next";

// PWA manifest (Next metadata route → served at /manifest.webmanifest). Makes the
// app installable ("Add to Home Screen") + gives the standalone window its identity.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Camera Angle Guide Pro",
    short_name: "CAG Pro",
    description: "Susun sudut kamera di studio 3D → prompt kamera siap-tempel untuk 10+ platform video AI.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d97757",
    orientation: "any",
    lang: "id",
    categories: ["productivity", "photo", "graphics"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
