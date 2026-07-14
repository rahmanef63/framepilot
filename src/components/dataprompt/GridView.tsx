"use client";
// GridView — the /library (Pustaka) card layout. Now renders through the SHARED
// CardGallery so the library reads identically to /template: 2-column responsive
// grid + accordion preview (Play spin + detail) on tap. The table/split views are
// unchanged power-user layouts.

import React from "react";
import { EntryView } from "@/state/AppState";
import { Camera } from "lucide-react";
import { CardGallery, type GalleryItem } from "@/components/gallery/CardGallery";

export function GridView({ entries }: { entries: EntryView[] }) {
  const items: GalleryItem[] = entries.map((e) => ({
    id: e.id,
    title: e.name,
    meta: `${e.sceneCount} scene · ${e.frameCount} shot · ${e.when}`,
    badge: { label: `${e.sourceGlyph} ${e.sourceLabel}`.trim(), tone: e.sourceTone },
    filterValue: e.sourceLabel,
    shotCount: e.frameCount,
    preview: { az: e.pAz, el: e.pEl, dist: e.pDist, lens: e.pLens, roll: e.pRoll, subj: e.pSubj },
    thumbCaption: e.thumbCaption,
    actions: [
      {
        label: "Buka di Studio 3D",
        variant: "primary",
        icon: <Camera size={14} aria-hidden />,
        onClick: e.onOpenStudio,
        title: "Buka di Studio 3D",
      },
      { label: "Hapus", variant: "ghost", onClick: e.onDelete, title: "Hapus · Delete" },
    ],
  }));

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "18px 20px 36px" }}>
      <CardGallery
        items={items}
        filterLabel="Semua sumber"
        searchPlaceholder="Cari di pustaka…"
        emptyText="Tidak ada item yang cocok."
      />
    </div>
  );
}
