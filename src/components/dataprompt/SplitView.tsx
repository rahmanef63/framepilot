"use client";
import React from "react";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { CagViewport } from "@/components/CagViewport";
import { EntryView } from "@/state/AppState";

const sectionLabel: React.CSSProperties = {
  font: "700 10px var(--font-mono)",
  letterSpacing: ".08em",
  textTransform: "uppercase",
  color: "var(--muted-foreground)",
  margin: "0 0 8px",
};

export function SplitView({
  entries,
  activeEntry,
  onOpen3d,
}: {
  entries: EntryView[];
  activeEntry: EntryView | null;
  onOpen3d: () => void;
}) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
      {/* list */}
      <div
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
        {entries.map((e) => (
          <div
            key={e.id}
            onClick={e.onPick}
            style={{
              cursor: "pointer",
              border: `var(--border-width) solid ${e.listBorder}`,
              borderRadius: "var(--radius-md)",
              padding: "9px 10px",
              background: e.listBg,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={e.selected}
                onChange={e.onToggle}
                onClick={(ev) => ev.stopPropagation()}
                style={{ cursor: "pointer", accentColor: "var(--primary)", width: 14, height: 14, margin: 0 }}
              />
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
            <div
              style={{
                font: "600 9.5px var(--font-mono)",
                color: "var(--muted-foreground)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {e.angle} · {e.shot} · {e.fillText}
            </div>
          </div>
        ))}
      </div>

      {/* inspector */}
      <div style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "22px 26px 40px" }}>
        {activeEntry ? (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ flex: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                <CagViewport
                  camview="orbit"
                  az={activeEntry.pAz}
                  el={activeEntry.pEl}
                  dist={activeEntry.pDist}
                  lens={activeEntry.pLens}
                  roll={activeEntry.pRoll}
                  subj={activeEntry.pSubj}
                  style={{
                    display: "block",
                    width: 212,
                    height: 148,
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
                  <div style={{ font: "800 20px/1.1 var(--font-sans)", color: "var(--foreground)" }}>{activeEntry.name}</div>
                  <Badge tone={activeEntry.sourceTone}>
                    {activeEntry.sourceGlyph} {activeEntry.sourceLabel}
                  </Badge>
                </div>
                <div style={{ font: "400 12px var(--font-sans)", color: "var(--muted-foreground)", marginTop: 3 }}>
                  {activeEntry.en}
                </div>
                <div style={{ font: "500 10px var(--font-mono)", color: "var(--subtle-foreground)", marginTop: 5 }}>
                  {activeEntry.ref} · {activeEntry.when}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flex: "none", flexWrap: "wrap" }}>
                <Button variant="primary" size="sm" onClick={activeEntry.onApply}>
                  Terapkan
                </Button>
                <Button variant="outline" size="sm" icon="◿" onClick={onOpen3d}>
                  Perbesar 3D
                </Button>
                <Button variant="outline" size="sm" onClick={activeEntry.onEdit}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={activeEntry.onDelete}>
                  Hapus
                </Button>
              </div>
            </div>

            <div style={sectionLabel}>Scene &amp; shot</div>
            <div
              style={{
                border: "var(--border-width) solid var(--border)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                marginBottom: 20,
              }}
            >
              {activeEntry.framesFlat.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.3fr 1fr 1fr 60px 1fr",
                    gap: 10,
                    alignItems: "center",
                    padding: "9px 12px",
                    borderTop: "var(--border-width) solid var(--border)",
                    font: "500 11px var(--font-mono)",
                    color: "var(--foreground)",
                  }}
                >
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    <span style={{ color: "var(--subtle-foreground)" }}>{f.scene}</span> · {f.name}
                  </span>
                  <span>{f.angle}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>{f.shot}</span>
                  <span style={{ color: "var(--muted-foreground)" }}>{f.lens}</span>
                  <span style={{ color: "var(--muted-foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {f.movement}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "0 0 8px" }}>
              <div style={{ ...sectionLabel, margin: 0 }}>Field terisi AI vs default</div>
              <span style={{ font: "600 10px var(--font-mono)", color: "var(--primary)" }}>{activeEntry.fillText}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 20 }}>
              {activeEntry.fillRows.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: "var(--border-width) solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "6px 9px",
                  }}
                >
                  <span style={{ font: "600 10px var(--font-mono)", color: "var(--muted-foreground)", width: 74, flex: "none" }}>
                    {r.label}
                  </span>
                  <span
                    style={{
                      font: "500 11px var(--font-sans)",
                      color: "var(--foreground)",
                      flex: 1,
                      minWidth: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.value}
                  </span>
                  <Badge tone={r.tone}>{r.tag}</Badge>
                </div>
              ))}
            </div>

            <div style={sectionLabel}>JSON · camera-angle-guide/v2</div>
            <pre
              style={{
                margin: 0,
                background: "var(--muted)",
                border: "var(--border-width) solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: 14,
                maxHeight: 260,
                overflow: "auto",
                font: "400 11px/1.55 var(--font-mono)",
                color: "var(--foreground)",
                whiteSpace: "pre",
              }}
            >
              {activeEntry.jsonPreview}
            </pre>
          </>
        ) : null}
      </div>
    </div>
  );
}
