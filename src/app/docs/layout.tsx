import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ds/Button";
import { ThemeModeToggle } from "@/components/shell/ThemeModeToggle";

export const metadata: Metadata = {
  title: "Docs — Camera Angle Guide Pro",
  description:
    "Dokumentasi Camera Angle Guide Pro: kenalan, mulai cepat, Prompt Kamera, platform video-AI, dan impor referensi.",
};

// Standalone docs chrome — OUTSIDE the app Shell (no app sidebar). Slim top bar +
// full-width main; the TOC + content two-column lives in page.tsx.
export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--background)",
        color: "var(--foreground)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "calc(12px + env(safe-area-inset-top)) 20px 12px",
          borderBottom: "var(--border-width) solid var(--border)",
          background: "var(--card)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "var(--foreground)",
            minWidth: 0,
          }}
        >
          <span style={{ font: "700 18px var(--font-mono)", color: "var(--primary)", flex: "none" }}>◉</span>
          <span
            style={{
              font: "700 15px var(--font-sans)",
              color: "var(--foreground)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Camera Angle Guide Pro
          </span>
          <span style={{ font: "600 11px var(--font-mono)", color: "var(--muted-foreground)", flex: "none" }}>
            · Docs
          </span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ width: 168 }}>
            <ThemeModeToggle orientation="horizontal" />
          </div>
          <Link href="/panduan" style={{ textDecoration: "none" }}>
            <Button variant="ghost" size="sm">
              Panduan
            </Button>
          </Link>
          <Link href="/" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm">
              Buka Studio →
            </Button>
          </Link>
        </nav>
      </header>

      <main style={{ flex: 1, minHeight: 0 }}>{children}</main>
    </div>
  );
}
