"use client";
import React from "react";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { CagCardPreview } from "@/shared/viewport3d/CagCardPreview";
import { EntryView } from "@/state/AppState";
import { Camera } from "lucide-react";

export function GridView({ entries }: { entries: EntryView[] }) {
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "18px 20px 36px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(248px,100%),1fr))", gap: 14 }}>
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
            <div style={{ position: "absolute", top: 11, right: 11, zIndex: 2 }}>
              <Badge tone={e.sourceTone}>
                {e.sourceGlyph} {e.sourceLabel}
              </Badge>
            </div>
            <div style={{ borderBottom: "var(--border-width) solid var(--border)" }}>
              <CagCardPreview
                az={e.pAz}
                el={e.pEl}
                dist={e.pDist}
                lens={e.pLens}
                roll={e.pRoll}
                subj={e.pSubj}
                fallback={<>[ {e.thumbCaption} ]</>}
              />
            </div>
            <div style={{ padding: "12px 13px 13px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div style={{ font: "700 14px var(--font-sans)", color: "var(--foreground)" }}>{e.name}</div>
              <div style={{ font: "600 11px var(--font-mono)", color: "var(--muted-foreground)", letterSpacing: ".02em" }}>
                {e.sceneCount} scene · {e.frameCount} shot · {e.when}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 4, flexWrap: "wrap" }}>
                <Button variant="primary" size="sm" icon={<Camera size={14} aria-hidden />} onClick={e.onOpenStudio} title="Buka di Studio 3D">
                  Buka di Studio 3D
                </Button>
                <Button variant="ghost" size="sm" onClick={e.onDelete} title="Hapus · Delete">
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
