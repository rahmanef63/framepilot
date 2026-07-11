"use client";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { CagViewport } from "@/components/CagViewport";
import { EntryView } from "@/state/AppState";

// Live 3D preview of the entry's FIRST frame (pAz/pEl/… precomputed in EntryView).
// WebGL ceiling: browsers cap live WebGL contexts (~16) before evicting the oldest
// and firing context-loss. The grid can hold arbitrarily many entries, so each card
// lazy-mounts ONE viewport only while it is near the viewport (IntersectionObserver,
// 200px margin) and unmounts — freeing its context — when scrolled away. That bounds
// live contexts to the on-screen handful, well under the cap. Off-screen cards show
// the original ds-hatch placeholder.
function CardPreview({ e }: { e: EntryView }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((ents) => setShow(ents[0]?.isIntersecting ?? false), {
      rootMargin: "200px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={show ? undefined : "ds-hatch"}
      style={{
        height: 116,
        flex: "none",
        borderBottom: "var(--border-width) solid var(--border)",
        display: show ? "block" : "grid",
        placeItems: "center",
        position: "relative",
        font: "600 10px var(--font-mono)",
        color: "var(--subtle-foreground)",
      }}
    >
      {show ? (
        <CagViewport
          camview="orbit"
          az={e.pAz}
          el={e.pEl}
          dist={e.pDist}
          lens={e.pLens}
          roll={e.pRoll}
          subj={e.pSubj}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <>[ {e.thumbCaption} ]</>
      )}
    </div>
  );
}

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
            <div style={{ position: "absolute", top: 11, right: 11, zIndex: 2 }}>
              <Badge tone={e.sourceTone}>
                {e.sourceGlyph} {e.sourceLabel}
              </Badge>
            </div>
            <CardPreview e={e} />
            <div style={{ padding: "12px 13px 13px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div style={{ font: "700 14px var(--font-sans)", color: "var(--foreground)" }}>{e.name}</div>
              <div style={{ font: "600 11px var(--font-mono)", color: "var(--muted-foreground)", letterSpacing: ".02em" }}>
                {e.sceneCount} scene · {e.frameCount} shot · {e.when}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 4, flexWrap: "wrap" }}>
                <Button variant="primary" size="sm" icon="◈" onClick={e.onOpenStudio} title="Buka di Studio 3D">
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
