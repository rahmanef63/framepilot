"use client";
import React from "react";
import { Button } from "@/components/ds/Button";
import { useApp } from "@/state/AppState";
import { GridView } from "./GridView";

// The single /library view: one card grid over the SSOT projects store. When the
// store is empty the "Contoh" seed cards act as the empty-state (badged Contoh),
// so there is no separate empty screen — just an always-present Impor entry point.
export function DataPromptScreen() {
  const app = useApp();
  const entries = app.entriesAll;

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* sub-header */}
      <div
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "11px 20px",
          borderBottom: "var(--border-width) solid var(--border)",
          background: "var(--background)",
        }}
      >
        <b style={{ font: "700 15px var(--font-sans)", color: "var(--foreground)" }}>Pustaka data prompt</b>
        <span style={{ font: "500 12px var(--font-mono)", color: "var(--muted-foreground)" }}>{app.entriesCountText}</span>
        <div style={{ flex: 1 }} />
        <Button variant="primary" size="sm" icon="+" onClick={() => app.openImport()}>
          Impor data
        </Button>
      </div>

      {/* content */}
      {entries.length > 0 ? (
        <GridView entries={entries} />
      ) : (
        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "40px 30px" }}>
          <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
            <div style={{ font: "700 17px var(--font-sans)", color: "var(--foreground)", marginBottom: 6 }}>
              Impor data prompt pertama · Import your first
            </div>
            <p style={{ font: "400 13px/1.6 var(--font-sans)", color: "var(--muted-foreground)", margin: "0 auto 18px" }}>
              Kirim foto atau tautan ke AI, minta JSON sesuai skema, lalu impor. · Send a photo or link to your AI, then
              import the JSON.
            </p>
            <Button variant="primary" size="sm" icon="+" onClick={() => app.openImport()}>
              Impor data
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
