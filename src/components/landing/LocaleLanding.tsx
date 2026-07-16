// LocaleLanding — the SSR, per-locale marketing/SEO page body. A SERVER component
// (no "use client"): crawlers receive fully translated HTML without running JS.
// Funnels into the app at "/" (which then auto-detects the visitor's language).
import Link from "next/link";
import type { Locale } from "@/i18n";
import { LOCALES, LOCALE_NAMES } from "@/i18n";
import { LANDING, PLATFORMS } from "./content";
import "./landing.css";

export function LocaleLanding({ locale }: { locale: Locale }) {
  const c = LANDING[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <main className="lp" dir={dir}>
      <section className="lp-hero">
        <p className="lp-brand">Camera Angle Guide Pro</p>
        <h1 className="lp-h1">{c.h1}</h1>
        <p className="lp-sub">{c.sub}</p>
        <div className="lp-cta">
          <Link href="/" className="lp-btn lp-btn-primary">{c.ctaPrimary}</Link>
          <Link href="/docs" className="lp-btn lp-btn-ghost">{c.ctaSecondary}</Link>
        </div>
        <ul className="lp-platforms" aria-hidden>
          {PLATFORMS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section className="lp-features">
        {c.features.map((f) => (
          <div key={f.title} className="lp-feature">
            <h2 className="lp-feature-title">{f.title}</h2>
            <p className="lp-feature-desc">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="lp-footer">
        {/* Language links: help crawlers reach every locale + let users switch. */}
        <nav className="lp-langs" aria-label="Language">
          {LOCALES.map((l) => (
            <Link key={l} href={`/${l}`} className={l === locale ? "lp-lang lp-lang-on" : "lp-lang"}>
              {LOCALE_NAMES[l]}
            </Link>
          ))}
        </nav>
        <p className="lp-tagline">{c.footerTagline}</p>
      </footer>
    </main>
  );
}
