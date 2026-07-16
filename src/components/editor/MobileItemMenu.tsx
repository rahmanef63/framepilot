"use client";
// MobileItemMenu — the long-press context menu for a scene tile OR a frame thumbnail
// (mobile). A fixed popover anchored under the held tile: rename (inline), duplicate,
// move left/right, delete (2-tap confirm). Tap the transparent scrim to dismiss. The
// caller wires the CRUD callbacks; the frame variant passes onUpdateCamera to add the
// extra "update current camera" row (scenes omit it). Rendered by MobileFrameStrip.

import React, { useState } from "react";
import { RotateCw, Pencil, Copy, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useT } from "@/i18n";

export function MobileItemMenu({
  name,
  index,
  total,
  rect,
  onClose,
  head,
  menuAria,
  nameAria,
  clampBottom,
  onRename,
  onDup,
  onMove,
  onDelete,
  onUpdateCamera,
}: {
  name: string;
  index: number;
  total: number;
  rect: DOMRect;
  onClose: () => void;
  head: React.ReactNode;
  menuAria: string;
  nameAria: string;
  clampBottom: number;
  onRename: (name: string) => void;
  onDup: () => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onUpdateCamera?: () => void;
}) {
  const { t } = useT();
  const [renaming, setRenaming] = useState(false);
  const [value, setValue] = useState(name);
  const [confirmDel, setConfirmDel] = useState(false);

  // anchor below the tile, clamped so the full menu never runs off the bottom and
  // clips the last action (frames sit taller — they carry the extra Perbarui row).
  const top = Math.min(rect.bottom + 6, window.innerHeight - clampBottom);
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 184));
  const run = (fn: () => void) => {
    fn();
    onClose();
  };

  return (
    <>
      <div className="mfs-menu-scrim" onClick={onClose} aria-hidden />
      <div className="mfs-menu" style={{ top, left }} role="menu" aria-label={menuAria}>
        {renaming ? (
          <form
            className="mfs-menu-rename"
            onSubmit={(e) => {
              e.preventDefault();
              onRename(value.trim() || name);
              onClose();
            }}
          >
            <input autoFocus value={value} maxLength={60} onChange={(e) => setValue(e.target.value)} aria-label={nameAria} />
            <button type="submit">{t("common.save")}</button>
          </form>
        ) : (
          <>
            <div className="mfs-menu-head">{head}</div>
            {onUpdateCamera ? (
              <button role="menuitem" onClick={() => run(onUpdateCamera)}>
                <RotateCw size={16} aria-hidden /> {t("editor.updateCurrentCamera")}
              </button>
            ) : null}
            <button role="menuitem" onClick={() => setRenaming(true)}><Pencil size={16} aria-hidden /> {t("common.rename")}</button>
            <button role="menuitem" onClick={() => run(onDup)}><Copy size={16} aria-hidden /> {t("common.duplicate")}</button>
            <button role="menuitem" disabled={index === 0} onClick={() => run(() => onMove(-1))}>
              <ChevronLeft size={16} aria-hidden /> {t("editor.moveLeft")}
            </button>
            <button role="menuitem" disabled={index === total - 1} onClick={() => run(() => onMove(1))}>
              {t("editor.moveRight")} <ChevronRight size={16} aria-hidden />
            </button>
            <button
              role="menuitem"
              className={"mfs-menu-del" + (confirmDel ? " armed" : "")}
              onClick={() => (confirmDel ? run(onDelete) : setConfirmDel(true))}
            >
              {confirmDel ? t("editor.confirmDelete") : <><Trash2 size={16} aria-hidden /> {t("common.delete")}</>}
            </button>
          </>
        )}
      </div>
    </>
  );
}
