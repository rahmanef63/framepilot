import type { Metadata, Viewport } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/convex-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://frame-pilot.rahmanef.com"),
  applicationName: "Camera Angle Guide Pro",
  title: "Camera Angle Guide Pro — studio 3D → prompt kamera AI",
  description:
    "Susun sudut kamera di studio 3D lalu ekspor prompt kamera siap-tempel untuk 10+ platform video AI (Runway, Kling, Veo, Sora, Luma, …).",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Camera Angle Guide Pro",
    title: "Camera Angle Guide Pro",
    description: "Susun sudut kamera di studio 3D → prompt kamera siap-tempel untuk video AI.",
    locale: "id_ID",
    images: [{ url: "/meta/framepilot-opengraph.webp", width: 1672, height: 941, alt: "Camera Angle Guide Pro" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Camera Angle Guide Pro",
    description: "Susun sudut kamera di studio 3D → prompt kamera siap-tempel untuk video AI.",
    images: ["/meta/framepilot-twitter-card.webp"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // cover = content extends under the iOS status bar / home indicator so
  // env(safe-area-inset-*) become real values the shells pad back in.
  viewportFit: "cover",
};

// Anti-FOUC: runs BEFORE first paint. Reads the saved theme mode
// ("framepilot:theme-mode", default "system") and stamps
// data-theme="dark|light" on <html> so there is no light→dark flash.
// Self-contained — mirrors resolveDark() in src/lib/theme/theme-mode.ts.
const THEME_MODE_BOOT = `(function(){try{var m=localStorage.getItem("framepilot:theme-mode");if(m!=="light"&&m!=="dark"&&m!=="system")m="system";var d=m==="dark"||(m==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="id" data-preset="rupa" data-theme="light">
        <head>
          <script dangerouslySetInnerHTML={{ __html: THEME_MODE_BOOT }} />
        </head>
        <body>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
