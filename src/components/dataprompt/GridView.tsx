"use client";
import React from "react";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { EntryView } from "@/state/AppState";

const chip: React.CSSProperties = {
  font: "600 10px var(--font-mono)",
  color: "var(--muted-foreground)",
  background: "var(--muted)",
  borderRadius: "var(--radius-sm)",
  padding: "2px 7px",
};

export function GridView({ entries }: { entries: EntryView[] }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "18px 20px 36px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(248px,1fr))", gap: 14 }}>
        {entries.map((e) => (
          <div
            key={e.id}
            style={{
              position: "relative",
              background: "var(--card)",
              border: "var(--border-width) solid var(--border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <label
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                zIndex: 2,
                display: "grid",
                placeItems: "center",
                width: 26,
                height: 26,
                background: "var(--card)",
                border: "var(--border-width) solid var(--border)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={e.selected}
                onChange={e.onToggle}
                style={{ cursor: "pointer", accentColor: "var(--primary)", width: 15, height: 15, margin: 0 }}
              />
            </label>
            <div style={{ position: "absolute", top: 11, right: 11, zIndex: 2 }}>
              <Badge tone={e.sourceTone}>
                {e.sourceGlyph} {e.sourceLabel}
              </Badge>
            </div>
            <div
              className="ds-hatch"
              style={{
                height: 116,
                flex: "none",
                borderBottom: "var(--border-width) solid var(--border)",
                display: "grid",
                placeItems: "center",
                font: "600 10px var(--font-mono)",
                color: "var(--subtle-foreground)",
              }}
            >
              [ {e.thumbCaption} ]
            </div>
            <div style={{ padding: "12px 13px 13px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div>
                <div style={{ font: "700 14px var(--font-sans)", color: "var(--foreground)" }}>{e.name}</div>
                <div style={{ font: "400 11px var(--font-sans)", color: "var(--muted-foreground)" }}>{e.en}</div>
              </div>
              <div style={{ font: "600 10px var(--font-mono)", color: "var(--muted-foreground)", letterSpacing: ".02em" }}>
                {e.angle} · {e.shot} · {e.lens}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={chip}>{e.sceneCount} scene</span>
                <span style={chip}>{e.frameCount} shot</span>
                <span style={chip}>{e.movement}</span>
              </div>
              <div style={{ marginTop: 2 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    font: "600 10px var(--font-mono)",
                    color: "var(--muted-foreground)",
                    marginBottom: 4,
                  }}
                >
                  <span>Terisi AI · AI-filled</span>
                  <span>{e.fillText}</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "var(--muted)", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--primary)", width: `${e.fillPct}%` }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 4, flexWrap: "wrap" }}>
                <Button variant="primary" size="sm" onClick={e.onApply}>
                  Terapkan
                </Button>
                <Button variant="outline" size="sm" icon="◿" onClick={e.on3d}>
                  3D
                </Button>
                <Button variant="outline" size="sm" onClick={e.onEdit}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={e.onDelete} title="Hapus · Delete">
                  ✕
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
