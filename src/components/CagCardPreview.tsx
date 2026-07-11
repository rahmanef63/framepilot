"use client";
import React, { useEffect, useRef, useState } from "react";
import { CagViewport } from "@/components/CagViewport";

// Shared lazy 3D card preview. Browsers cap live WebGL contexts (~16) before
// evicting the oldest and firing context-loss; a page can hold arbitrarily many
// previews (library grid, template gallery), so each one mounts ONE CagViewport
// only while it is near the viewport (IntersectionObserver, 200px margin) and
// unmounts — freeing its context — when scrolled away. That bounds live contexts
// to the on-screen handful, well under the cap. Off-screen shows a ds-hatch
// placeholder. Extracted from GridView.CardPreview so the template page reuses
// the SAME context-management instead of eager-mounting every viewport at once.
export interface CagCardPreviewProps {
  az: number;
  el: number;
  dist: number;
  lens: number;
  roll?: number;
  subj?: string;
  /** preview box height in px (default 116) */
  height?: number;
  /** placeholder shown while off-screen */
  fallback?: React.ReactNode;
}

export function CagCardPreview({ az, el, dist, lens, roll = 0, subj = "person", height = 116, fallback }: CagCardPreviewProps) {
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
        height,
        flex: "none",
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
          az={az}
          el={el}
          dist={dist}
          lens={lens}
          roll={roll}
          subj={subj}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        fallback ?? null
      )}
    </div>
  );
}
