"use client";
import React from "react";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { EntryView } from "@/state/AppState";

// Compact table view over the same EntryView list the grid renders. Adapted to
// the current EntryView shape (no bulk-select / source-filter) — the only actions
// are open-in-Studio and delete, matching the grid card.
const COLS = "2fr 132px 1.2fr 200px";

export function TableView({ entries }: { entries: EntryView[] }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "18px 20px 36px" }}>
      <div
        style={{
          border: "var(--border-width) solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background: "var(--card)",
          minWidth: 720,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COLS,
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            background: "var(--muted)",
            font: "700 9.5px var(--font-mono)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}
        >
          <span>Nama · Name</span>
          <span>Sumber</span>
          <span>Diperbarui</span>
          <span style={{ textAlign: "right" }}>Aksi</span>
        </div>
        {entries.map((e) => (
          <div
            key={e.id}
            style={{
              display: "grid",
              gridTemplateColumns: COLS,
              alignItems: "center",
              gap: 12,
              padding: "11px 16px",
              borderTop: "var(--border-width) solid var(--border)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  font: "700 13px var(--font-sans)",
                  color: "var(--foreground)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {e.name}
              </div>
              <div style={{ font: "500 10px var(--font-mono)", color: "var(--muted-foreground)" }}>
                {e.sceneCount} scene · {e.frameCount} shot
              </div>
            </div>
            <Badge tone={e.sourceTone}>
              {e.sourceGlyph} {e.sourceLabel}
            </Badge>
            <span style={{ font: "600 11px var(--font-mono)", color: "var(--muted-foreground)" }}>{e.when}</span>
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <Button variant="primary" size="sm" icon="◈" onClick={e.onOpenStudio} title="Buka di Studio 3D">
                Studio 3D
              </Button>
              <Button variant="ghost" size="sm" onClick={e.onDelete} title="Hapus · Delete">
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
