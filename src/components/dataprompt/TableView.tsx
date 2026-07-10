"use client";
import React from "react";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { EntryView } from "@/state/AppState";

const COLS = "34px 1.7fr 92px 1.5fr 56px 1fr 92px 156px";

export function TableView({ entries }: { entries: EntryView[] }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "18px 20px 36px" }}>
      <div
        style={{
          border: "var(--border-width) solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background: "var(--card)",
          minWidth: 812,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COLS,
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: "var(--muted)",
            font: "700 9.5px var(--font-mono)",
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}
        >
          <span />
          <span>Nama · Name</span>
          <span>Sumber</span>
          <span>Angle · Shot</span>
          <span>Lens</span>
          <span>Gerakan</span>
          <span>Terisi AI</span>
          <span style={{ textAlign: "right" }}>Aksi</span>
        </div>
        {entries.map((e) => (
          <div
            key={e.id}
            style={{
              display: "grid",
              gridTemplateColumns: COLS,
              alignItems: "center",
              gap: 10,
              padding: "11px 14px",
              borderTop: "var(--border-width) solid var(--border)",
              background: e.rowBg,
            }}
          >
            <input
              type="checkbox"
              checked={e.selected}
              onChange={e.onToggle}
              style={{ cursor: "pointer", accentColor: "var(--primary)", width: 15, height: 15, margin: 0 }}
            />
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
            <span
              style={{
                font: "600 10px var(--font-mono)",
                color: "var(--foreground)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {e.angle} · {e.shot}
            </span>
            <span style={{ font: "600 11px var(--font-mono)", color: "var(--muted-foreground)" }}>{e.lens}</span>
            <span
              style={{
                font: "500 10px var(--font-mono)",
                color: "var(--muted-foreground)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {e.movement}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ flex: 1, height: 5, borderRadius: 999, background: "var(--muted)", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "var(--primary)", width: `${e.fillPct}%` }} />
              </div>
              <span style={{ font: "600 9px var(--font-mono)", color: "var(--muted-foreground)" }}>{e.fillText}</span>
            </div>
            <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
              <Button variant="primary" size="sm" onClick={e.onApply}>
                Terapkan
              </Button>
              <Button variant="outline" size="sm" onClick={e.on3d} title="Pratinjau 3D">
                3D
              </Button>
              <Button variant="ghost" size="sm" onClick={e.onDelete}>
                ✕
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
