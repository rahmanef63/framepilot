import type { Metadata, Viewport } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/convex-provider";
import { RegisterSW } from "@/components/RegisterSW";
import { UpdateToast } from "@/components/UpdateToast";
import { Beacon } from "@/components/Beacon";
import { I18nProvider } from "@/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://frame-pilot.rahmanef.com"),
  applicationName: "Camera Angle Guide Pro",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "CAG Pro" },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  title: "Camera Angle Guide Pro — 3D studio → AI camera prompts",
  description:
    "Compose camera angles in a 3D studio, then export paste-ready camera prompts for 10+ AI video platforms (Runway, Kling, Veo, Luma, …).",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Camera Angle Guide Pro",
    title: "Camera Angle Guide Pro",
    description: "Compose camera angles in a 3D studio → paste-ready camera prompts for AI video.",
    locale: "en_US",
    images: [{ url: "/meta/framepilot-opengraph.webp", width: 1672, height: 941, alt: "Camera Angle Guide Pro" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Camera Angle Guide Pro",
    description: "Compose camera angles in a 3D studio → paste-ready camera prompts for AI video.",
    images: ["/meta/framepilot-twitter-card.webp"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // cover = content extends under the iOS status bar / home indicator so
  // env(safe-area-inset-*) become real values the shells pad back in.
  viewportFit: "cover",
  // tints the mobile browser chrome to match the app background per theme
  // match --background per theme (was #ffffff / #0b0b0c — didn't match the Rupa bg)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0EEE6" },
    { media: "(prefers-color-scheme: dark)", color: "#262624" },
  ],
};

// Anti-FOUC: runs BEFORE first paint. Reads the saved theme mode
// ("framepilot:theme-mode", default "system") and stamps
// data-theme="dark|light" on <html> so there is no light→dark flash.
// Self-contained — mirrors resolveDark() in src/lib/theme/theme-mode.ts.
const THEME_MODE_BOOT = `(function(){try{var m=localStorage.getItem("framepilot:theme-mode");if(m!=="light"&&m!=="dark"&&m!=="system")m="system";var d=m==="dark"||(m==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){}})();`;

// Anti-flash for language: if the user picked a locale before, stamp <html lang/dir>
// before first paint so a saved en/es/zh/ar visitor doesn't flash Indonesian.
// (First-time detection happens in I18nProvider; this only honors an explicit choice.)
const LANG_BOOT = `(function(){try{var l=localStorage.getItem("cag.lang");if(["id","en","es","zh","ar"].indexOf(l)<0)return;document.documentElement.lang=l;document.documentElement.dir=(l==="ar")?"rtl":"ltr";}catch(e){}})();`;

// Structured data (schema.org SoftwareApplication) so search engines can render a
// rich result for the app. Static; safe to inline (no user data).
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Camera Angle Guide Pro",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web browser",
  url: "https://frame-pilot.rahmanef.com",
  description:
    "Compose camera angles in an interactive 3D studio, then export paste-ready camera prompts for AI video platforms.",
  inLanguage: ["en", "id", "es", "zh", "ar"],
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "Abdurrahman Fakhrul", url: "https://github.com/rahmanef63" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="id" data-theme="light">
        <head>
          <script dangerouslySetInnerHTML={{ __html: THEME_MODE_BOOT }} />
          <script dangerouslySetInnerHTML={{ __html: LANG_BOOT }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        </head>
        <body>
          <ConvexClientProvider>
            <I18nProvider>
              {children}
              <Beacon />
            </I18nProvider>
          </ConvexClientProvider>
          <RegisterSW />
          <UpdateToast />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
