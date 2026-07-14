"use client";
// CardGallery.tsx — the ONE shared card gallery used by BOTH /template and the
// /library (Pustaka) grid, so the two read identically. A responsive 2-column
// grid (2 cols on mobile too) with a built-in search / sort / ratio-or-source
// filter toolbar. Tapping a card opens an ACCORDION: a full-width panel drops in
// right below that card's row (grid-column: 1 / -1, so the grid keeps flowing in
// 2 columns beneath it) holding a bigger 3D preview with a Play spin + the item's
// detail/description + its actions. One card open at a time.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, ChevronDown, Film, Image } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ds/Badge";
import { Button, type ButtonVariant } from "@/components/ds/Button";
import { CagCardPreview } from "@/shared/viewport3d/CagCardPreview";
import { CagViewport } from "@/shared/viewport3d/CagViewport";
import "./CardGallery.css";

export interface GalleryFrame {
  az: number;
  el: number;
  dist: number;
  lens: number;
  roll?: number;
  subj?: string;
  name?: string;
}
export interface GalleryAction {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  title?: string;
}
export interface GalleryItem {
  id: string;
  title: string;
  meta: string; // "1 scene · 3 shot · 2h"
  badge?: { label: string; tone?: BadgeTone };
  filterValue: string; // aspectRatio (template) / source (library) — drives the filter select
  shotCount: number; // for the shot-count sort
  preview: GalleryFrame; // representative frame shown in the card + expand preview
  frames?: GalleryFrame[]; // full ordered shot list (>1 = a "video" that plays through)
  description?: string;
  thumbCaption?: string; // off-screen placeholder for the lazy preview
  actions: GalleryAction[];
}

type SortKey = "name" | "shots-desc" | "shots-asc";

export function CardGallery({
  items,
  filterLabel = "Semua",
  searchPlaceholder = "Cari…",
  emptyText = "Tidak ada yang cocok.",
  cameraViewOnPlay = false,
}: {
  items: GalleryItem[];
  filterLabel?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** when true, playing switches the preview from the ISO/orbit view to the
   *  camera POV (what the shot camera sees) — used by the template gallery. */
  cameraViewOnPlay?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const read = () => {
      const n = getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length;
      setCols(n || 2);
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const filters = useMemo(
    () => Array.from(new Set(items.map((i) => i.filterValue).filter(Boolean))).sort(),
    [items],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = items.filter((it) => {
      if (filter !== "all" && it.filterValue !== filter) return false;
      if (!q) return true;
      return (it.title + " " + (it.description || "")).toLowerCase().includes(q);
    });
    const sorted = [...list];
    if (sort === "name") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "shots-desc") sorted.sort((a, b) => b.shotCount - a.shotCount);
    else sorted.sort((a, b) => a.shotCount - b.shotCount);
    return sorted;
  }, [items, query, sort, filter]);

  const toggle = (id: string) => {
    setOpenId((cur) => (cur === id ? null : id));
    setPlaying(false);
  };

  const openIdx = openId ? visible.findIndex((x) => x.id === openId) : -1;

  return (
    <div className="cg">
      <div className="cg-toolbar">
        <input
          className="cg-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Cari"
        />
        <select className="cg-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Urutkan">
          <option value="name">Nama (A–Z)</option>
          <option value="shots-desc">Shot terbanyak</option>
          <option value="shots-asc">Shot paling sedikit</option>
        </select>
        {filters.length > 1 ? (
          <select className="cg-select" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label={filterLabel}>
            <option value="all">{filterLabel}</option>
            {filters.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div className="cg-grid" ref={gridRef}>
        {visible.length === 0 ? (
          <div className="cg-empty">{emptyText}</div>
        ) : (
          visible.map((it, i) => {
            const rowEnd = i % cols === cols - 1 || i === visible.length - 1;
            const showPanel = openIdx >= 0 && rowEnd && Math.floor(openIdx / cols) === Math.floor(i / cols);
            return (
              <React.Fragment key={it.id}>
                <div
                  className={"cg-card" + (openId === it.id ? " open" : "")}
                  role="button"
                  tabIndex={0}
                  aria-expanded={openId === it.id}
                  onClick={() => toggle(it.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(it.id);
                    }
                  }}
                >
                  <div className="cg-card-media">
                    <CagCardPreview
                      az={it.preview.az}
                      el={it.preview.el}
                      dist={it.preview.dist}
                      lens={it.preview.lens}
                      roll={it.preview.roll}
                      subj={it.preview.subj}
                      height={150}
                      fallback={it.thumbCaption ? <>[ {it.thumbCaption} ]</> : null}
                    />
                    {it.badge ? (
                      <span className="cg-card-badge">
                        <Badge tone={it.badge.tone}>{it.badge.label}</Badge>
                      </span>
                    ) : null}
                    {(() => {
                      const isVideo = (it.frames?.length ?? 1) > 1;
                      return (
                        <div className={"cg-card-tag" + (isVideo ? " video" : "")}>
                          {isVideo ? (
                            <>
                              <Film size={12} aria-hidden /> Video
                            </>
                          ) : (
                            <>
                              <Image size={12} aria-hidden /> 1 frame
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div className="cg-card-body">
                    <div className="cg-card-title">{it.title}</div>
                    <div className="cg-card-meta">{it.meta}</div>
                  </div>
                  <ChevronDown size={16} className="cg-card-chev" aria-hidden />
                </div>

                {showPanel ? (
                  <ExpandPanel
                    item={visible[openIdx]}
                    playing={playing}
                    onPlay={() => setPlaying((p) => !p)}
                    cameraViewOnPlay={cameraViewOnPlay}
                  />
                ) : null}
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}

function ExpandPanel({
  item,
  playing,
  onPlay,
  cameraViewOnPlay,
}: {
  item: GalleryItem;
  playing: boolean;
  onPlay: () => void;
  cameraViewOnPlay: boolean;
}) {
  // A multi-shot template is a "video": playing PLAYS THROUGH the shot sequence
  // (cutting between frames). A single-frame item just spins the camera as before.
  const frames = item.frames && item.frames.length ? item.frames : [item.preview];
  const isVideo = frames.length > 1;
  const [idx, setIdx] = useState(0);

  // Template preview: while playing, swap the ISO/orbit view for the camera POV
  // (what the shot camera actually sees), so you watch the shots through the lens.
  const camview = playing && cameraViewOnPlay ? "pov" : "orbit";

  // Advance through the shot list while playing a "video".
  useEffect(() => {
    if (!playing || !isVideo) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % frames.length), 1100);
    return () => clearInterval(t);
  }, [playing, isVideo, frames.length]);

  // Reset to the first shot whenever we pause.
  useEffect(() => {
    if (!playing) setIdx(0);
  }, [playing]);

  const cur = frames[Math.min(idx, frames.length - 1)];

  return (
    <div className="cg-expand">
      <div className="cg-expand-preview">
        {/* keyed by id so switching cards mounts a fresh viewport (frees the old WebGL context) */}
        <CagViewport
          key={item.id}
          az={cur.az}
          el={cur.el}
          dist={cur.dist}
          lens={cur.lens}
          roll={cur.roll ?? 0}
          subj={cur.subj ?? "person"}
          camview={camview}
          autoRotate={playing && !isVideo && camview === "orbit"}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div className="cg-expand-info">
        <div className="cg-expand-head">
          <h3 className="cg-expand-title">{item.title}</h3>
          <button type="button" className="cg-play" aria-pressed={playing} onClick={onPlay}>
            {playing ? (
              <>
                <Pause size={14} aria-hidden /> Jeda
              </>
            ) : isVideo ? (
              <>
                <Play size={14} aria-hidden /> Putar animasi
              </>
            ) : (
              <>
                <Play size={14} aria-hidden /> Putar preview
              </>
            )}
          </button>
        </div>
        {isVideo ? (
          <span className="cg-shotind">
            Shot {Math.min(idx, frames.length - 1) + 1}/{frames.length}
            {cur.name ? " · " + cur.name : ""}
          </span>
        ) : null}
        {item.description ? <p className="cg-expand-desc">{item.description}</p> : null}
        <div className="cg-readout">
          <span>AZ {Math.round(cur.az)}°</span>
          <span>EL {Math.round(cur.el)}°</span>
          <span>JARAK {cur.dist.toFixed(1)}m</span>
          <span>LENSA {Math.round(cur.lens)}mm</span>
          {cur.roll ? <span>ROLL {Math.round(cur.roll)}°</span> : null}
        </div>
        <div className="cg-actions">
          {item.actions.map((a, ai) => (
            <Button key={ai} variant={a.variant || "outline"} size="sm" icon={a.icon} onClick={a.onClick} title={a.title}>
              {a.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
