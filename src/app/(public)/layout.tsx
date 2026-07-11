import Link from "next/link";
import { Button } from "@/components/ds/Button";
import { ThemeModeToggle } from "@/components/shell/ThemeModeToggle";

/**
 * Public chrome — slim top bar (no Shell/Sidebar/Header, those belong to (app)).
 * Brand mark + wordmark left, theme toggle + Panduan + Buka Aplikasi right.
 * Full-width, token bg, mobile-first (bar wraps on narrow).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "12px 20px",
          borderBottom: "var(--border-width) solid var(--border)",
          background: "var(--background)",
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
          }}
        >
          <span style={{ font: "700 18px var(--font-mono)", color: "var(--primary)" }}>◉</span>
          <span style={{ font: "700 15px var(--font-sans)", color: "var(--foreground)" }}>
            Camera Angle Guide Pro
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
          <Link href="/pustaka" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="sm">
              Buka Aplikasi →
            </Button>
          </Link>
        </nav>
      </header>

      <main style={{ flex: 1, minHeight: 0 }}>{children}</main>

      <footer
        style={{
          borderTop: "var(--border-width) solid var(--border)",
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          font: "400 12px var(--font-sans)",
          color: "var(--subtle-foreground)",
        }}
      >
        <span style={{ font: "700 13px var(--font-mono)", color: "var(--primary)" }}>◉</span>
        <span>Camera Angle Guide Pro — dari ide shot ke prompt AI + Studio 3D.</span>
      </footer>
    </div>
  );
}
