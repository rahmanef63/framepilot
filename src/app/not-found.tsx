"use client";
// Root 404 (rr P1 "route boundaries"): unknown routes render a branded page with a
// next/link back to the Studio, instead of Next's default unstyled 404.
import Link from "next/link";
import { useT } from "@/i18n";

export default function NotFound() {
  const { t } = useT();
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "center",
        }}
      >
        <div style={{ font: "800 42px var(--font-mono)", color: "var(--primary)", lineHeight: 1 }}>404</div>
        <div style={{ font: "800 20px var(--font-sans)" }}>{t("chrome.notFoundTitle")}</div>
        <p style={{ font: "400 14px var(--font-sans)", color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0 }}>
          {t("chrome.notFoundDesc")}
        </p>
        <Link
          href="/"
          style={{
            marginTop: 4,
            padding: "10px 18px",
            borderRadius: "var(--radius-pill)",
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            font: "700 13px var(--font-sans)",
            textDecoration: "none",
          }}
        >
          {t("chrome.backToStudio")}
        </Link>
      </div>
    </div>
  );
}
