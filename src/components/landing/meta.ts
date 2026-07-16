import type { Metadata } from "next";
import type { Locale } from "@/i18n";
import { LANDING } from "./content";

const BASE = "https://frame-pilot.rahmanef.com";

// hreflang codes for the alternates cluster. Every locale landing advertises the
// full set + x-default, so Google serves the right language per searcher.
const HREFLANG: Record<Locale, string> = {
  en: "en",
  id: "id",
  es: "es",
  zh: "zh-Hans",
  ar: "ar",
};

function languages(): Record<string, string> {
  const out: Record<string, string> = {};
  (Object.keys(HREFLANG) as Locale[]).forEach((l) => {
    out[HREFLANG[l]] = `${BASE}/${l}`;
  });
  out["x-default"] = `${BASE}/en`;
  return out;
}

/** Localized <title>/description/OG + the hreflang alternates cluster for /{locale}. */
export function landingMetadata(locale: Locale): Metadata {
  const c = LANDING[locale];
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: {
      canonical: `${BASE}/${locale}`,
      languages: languages(),
    },
    openGraph: {
      type: "website",
      url: `${BASE}/${locale}`,
      siteName: "Camera Angle Guide Pro",
      title: c.metaTitle,
      description: c.metaDesc,
      locale: c.ogLocale,
      images: [{ url: "/meta/framepilot-opengraph.webp", width: 1672, height: 941, alt: "Camera Angle Guide Pro" }],
    },
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.metaDesc,
      images: ["/meta/framepilot-twitter-card.webp"],
    },
  };
}
