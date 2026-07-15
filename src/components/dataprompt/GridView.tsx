"use client";
// GridView — the /library (Pustaka) card layout. Now renders through the SHARED
// CardGallery so the library reads identically to /template: 2-column responsive
// grid + accordion preview (Play spin + detail) on tap. The table/split views are
// unchanged power-user layouts.

import React from "react";
import { EntryView } from "@/state/AppState";
import { Camera } from "lucide-react";
import { CardGallery, type GalleryItem, type GalleryAction } from "@/components/gallery/CardGallery";
import { useT } from "@/i18n";

export function GridView({ entries }: { entries: EntryView[] }) {
  const { t } = useT();
  const items: GalleryItem[] = entries.map((e) => {
    // Preset (Template) cards get the single "Gunakan Template" action; real
    // library entries keep the "Buka di Studio 3D" + "Hapus" pair (Hapus only
    // when a delete handler exists — presets are read-only).
    const actions: GalleryAction[] = e.preset
      ? [
          {
            label: t("lib.useTemplate"),
            variant: "primary",
            icon: <Camera size={14} aria-hidden />,
            onClick: e.onOpenStudio,
            title: t("lib.createFromPreset"),
          },
        ]
      : [
          {
            label: t("lib.openInStudio"),
            variant: "primary",
            icon: <Camera size={14} aria-hidden />,
            onClick: e.onOpenStudio,
            title: t("lib.openInStudio"),
          },
          ...(e.onDelete
            ? [{ label: t("common.delete"), variant: "ghost", onClick: e.onDelete, title: t("common.delete") } as GalleryAction]
            : []),
        ];
    return {
      id: e.id,
      title: e.name,
      meta: `${t("lib.sceneCount", { n: e.sceneCount })} · ${t("lib.shotCount", { n: e.frameCount })} · ${e.when}`,
      badge: { label: `${e.sourceGlyph} ${e.sourceLabel}`.trim(), tone: e.sourceTone },
      filterValue: e.sourceLabel,
      shotCount: e.frameCount,
      preview: { az: e.pAz, el: e.pEl, dist: e.pDist, lens: e.pLens, roll: e.pRoll, subj: e.pSubj },
      frames: e.frames,
      thumbCaption: e.thumbCaption,
      actions,
    };
  });

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "18px 20px 36px" }}>
      <CardGallery
        items={items}
        filterLabel={t("lib.allSources")}
        searchPlaceholder={t("lib.searchLibrary")}
        emptyText={t("lib.emptyMatch")}
      />
    </div>
  );
}
