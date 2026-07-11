"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ds/Button";
import { useApp } from "@/state/AppState";

const SCREEN_NAMES: Record<string, string> = {
  "/library": "Pustaka",
  "/editor": "Studio 3D · Prompt Kamera",
  "/panduan": "Panduan · Guide",
};

export function Header() {
  const app = useApp();
  const pathname = usePathname();
  // On /editor the Studio supplies its own single consolidated header
  // (EditorHeaderBar), so the app shell header suppresses itself to avoid a
  // double-stacked bar. Every other route keeps this header.
  if (pathname === "/editor") return null;
  const crumb = SCREEN_NAMES[pathname] || "Studio 3D · Prompt Kamera";
  const onData = pathname === "/library";

  return (
    <header
      style={{
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 20px",
        borderBottom: "var(--border-width) solid var(--border)",
        background: "var(--card)",
      }}
    >
      <button
        onClick={app.toggleSidebar}
        title="Buka/tutup sidebar"
        style={{
          flex: "none",
          width: 34,
          height: 34,
          border: "var(--border-width) solid var(--border)",
          borderRadius: "var(--radius-md)",
          background: "var(--card)",
          color: "var(--muted-foreground)",
          cursor: "pointer",
          font: "700 14px var(--font-mono)",
          display: "grid",
          placeItems: "center",
        }}
      >
        ☰
      </button>
      <span
        style={{
          font: "500 12px var(--font-mono)",
          color: "var(--muted-foreground)",
          whiteSpace: "nowrap",
          flex: "none",
        }}
      >
        Camera Angle Guide Pro
      </span>
      <span style={{ color: "var(--subtle-foreground)", flex: "none" }}>›</span>
      <b style={{ font: "700 14px var(--font-sans)", color: "var(--foreground)", whiteSpace: "nowrap", flex: "none" }}>
        {crumb}
      </b>
      <div style={{ flex: 1 }} />
      {onData ? (
        <>
          <span
            style={{
              font: "600 11px var(--font-mono)",
              color: "var(--muted-foreground)",
              border: "var(--border-width) solid var(--border)",
              borderRadius: "var(--radius-pill)",
              padding: "5px 11px",
              whiteSpace: "nowrap",
            }}
          >
            {app.projStats}
          </span>
          <Button variant="outline" size="sm" icon="{ }" onClick={app.openSchema}>
            Skema
          </Button>
          <Button variant="outline" size="sm" onClick={app.exportProject}>
            Ekspor proyek
          </Button>
          <Button variant="primary" size="sm" icon="+" onClick={() => app.openImport("paste")}>
            Impor
          </Button>
        </>
      ) : (
        <Button variant="primary" size="sm" icon="+" onClick={() => app.openImport("paste")}>
          Impor
        </Button>
      )}
    </header>
  );
}
