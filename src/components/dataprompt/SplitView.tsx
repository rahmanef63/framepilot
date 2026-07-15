"use client";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { CagViewport } from "@/shared/viewport3d/CagViewport";
import { EntryView } from "@/state/AppState";
import { Camera } from "lucide-react";

// Split view: a narrow list on the left + a live-3D inspector on the right.
// Adapted to the current EntryView shape (no bulk-select / edit / json fields):
// selection is local state here (AppState holds no active id), and the inspector
// shows the first-frame 3D preview plus the same open/delete actions as the grid.
const sectionLabel: React.CSSProperties = {
  font: "700 10px var(--font-mono)",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "var(--muted-foreground)",
  margin: "0 0 8px",
};

export function SplitView({ entries }: { entries: EntryView[] }) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);
  // Keep a valid selection as the list changes (delete/import).
  useEffect(() => {
    if (!entries.some((e) => e.id === activeId)) setActiveId(entries[0]?.id ?? null);
  }, [entries, activeId]);
  const active = entries.find((e) => e.id === activeId) ?? null;

  return (
    <div className="fp-split" style={{ flex: 1, minHeight: 0, display: "flex" }}>
      {/* list */}
      <div
        className="fp-split-list"
        style={{
          width: 288,
          flex: "none",
          borderRight: "var(--border-width) solid var(--border)",
          overflow: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 7,
          background: "var(--card)",
        }}
      >
        {entries.map((e) => {
          const on = e.id === activeId;
          return (
            <div
              key={e.id}
              onClick={() => setActiveId(e.id)}
              style={{
                cursor: "pointer",
                border: `var(--border-width) solid ${on ? "var(--primary)" : "var(--border)"}`,
                borderRadius: "var(--radius-md)",
                padding: "9px 10px",
                background: on ? "var(--muted)" : "var(--card)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    font: "700 12px var(--font-sans)",
                    color: "var(--foreground)",
                    flex: 1,
                    minWidth: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {e.name}
                </div>
                <Badge tone={e.sourceTone}>{e.sourceGlyph}</Badge>
              </div>
              <div style={{ font: "600 9.5px var(--font-mono)", color: "var(--muted-foreground)" }}>
                {e.sceneCount} scene · {e.frameCount} shot · {e.when}
              </div>
            </div>
          );
        })}
      </div>

      {/* inspector */}
      <div className="fp-split-main" style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "22px 26px 40px" }}>
        {active ? (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                <CagViewport
                  camview="orbit"
                  az={active.pAz}
                  el={active.pEl}
                  dist={active.pDist}
                  lens={active.pLens}
                  roll={active.pRoll}
                  subj={active.pSubj}
                  style={{
                    display: "block",
                    width: 240,
                    height: 160,
                    border: "var(--border-width) solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    background: "var(--muted)",
                  }}
                />
                <span style={{ font: "500 9px var(--font-mono)", color: "var(--subtle-foreground)", textAlign: "center" }}>
                  seret untuk putar · drag to orbit
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 190 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ font: "800 20px/1.1 var(--font-sans)", color: "var(--foreground)" }}>{active.name}</div>
                  <Badge tone={active.sourceTone}>
                    {active.sourceGlyph} {active.sourceLabel}
                  </Badge>
                </div>
                <div style={{ font: "500 11px var(--font-mono)", color: "var(--muted-foreground)", marginTop: 6 }}>
                  {active.sceneCount} scene · {active.frameCount} shot · {active.when}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                  <Button variant="primary" size="sm" icon={<Camera size={14} aria-hidden />} onClick={active.onOpenStudio}>
                    Buka di Studio 3D
                  </Button>
                  {!active.preset && (
                    <Button variant="ghost" size="sm" onClick={active.onDelete}>
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div style={sectionLabel}>Frame pertama · First frame</div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(120px, 100%), 1fr))",
                gap: 8,
              }}
            >
              {[
                ["Azimuth", `${Math.round(active.pAz)}°`],
                ["Elevasi", `${Math.round(active.pEl)}°`],
                ["Jarak", `${active.pDist}`],
                ["Lensa", `${active.pLens}mm`],
                ["Roll", `${Math.round(active.pRoll)}°`],
                ["Subjek", active.pSubj],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    border: "var(--border-width) solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 10px",
                  }}
                >
                  <div style={{ font: "600 9px var(--font-mono)", color: "var(--muted-foreground)", letterSpacing: ".06em", textTransform: "uppercase" }}>
                    {label}
                  </div>
                  <div style={{ font: "600 13px var(--font-mono)", color: "var(--foreground)", marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
