"use client";
// MobileFrameMenu — the long-press context menu for a frame thumbnail (mobile). A
// fixed popover anchored under the held tile: rename (inline), duplicate, move
// left/right, delete (2-tap confirm). Tap the transparent scrim to dismiss. Reuses
// the editor context's existing frame CRUD actions.

import React, { useState } from "react";
import { RotateCw, Pencil, Copy, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useEditor } from "@/state/EditorState";
import { useT } from "@/i18n";
import type { EditorFrame } from "@/lib/editorModel";

export function MobileFrameMenu({
  frame,
  index,
  total,
  rect,
  onClose,
}: {
  frame: EditorFrame;
  index: number;
  total: number;
  rect: DOMRect;
  onClose: () => void;
}) {
  const ctx = useEditor();
  const { t } = useT();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(frame.name);
  const [confirmDel, setConfirmDel] = useState(false);

  // anchor below the tile, clamped so the full menu (~272px with the Perbarui row)
  // never runs off the bottom and clips the last action.
  const top = Math.min(rect.bottom + 6, window.innerHeight - 288);
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 184));
  const run = (fn: () => void) => {
    fn();
    onClose();
  };

  return (
    <>
      <div className="mfs-menu-scrim" onClick={onClose} aria-hidden />
      <div className="mfs-menu" style={{ top, left }} role="menu" aria-label={t("editor.frameActionsAria", { name: frame.name })}>
        {renaming ? (
          <form
            className="mfs-menu-rename"
            onSubmit={(e) => {
              e.preventDefault();
              ctx.renameFrame(frame.id, name.trim() || frame.name);
              onClose();
            }}
          >
            <input autoFocus value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-label={t("editor.frameNameAria")} />
            <button type="submit">{t("common.save")}</button>
          </form>
        ) : (
          <>
            <div className="mfs-menu-head">#{index + 1} · {frame.name}</div>
            <button role="menuitem" onClick={() => run(() => ctx.updateFrameById(frame.id))}>
              <RotateCw size={16} aria-hidden /> {t("editor.updateCurrentCamera")}
            </button>
            <button role="menuitem" onClick={() => setRenaming(true)}><Pencil size={16} aria-hidden /> {t("common.rename")}</button>
            <button role="menuitem" onClick={() => run(() => ctx.dupFrame(frame.id))}><Copy size={16} aria-hidden /> {t("common.duplicate")}</button>
            <button role="menuitem" disabled={index === 0} onClick={() => run(() => ctx.moveFrame(frame.id, -1))}>
              <ChevronLeft size={16} aria-hidden /> {t("editor.moveLeft")}
            </button>
            <button role="menuitem" disabled={index === total - 1} onClick={() => run(() => ctx.moveFrame(frame.id, 1))}>
              {t("editor.moveRight")} <ChevronRight size={16} aria-hidden />
            </button>
            <button
              role="menuitem"
              className={"mfs-menu-del" + (confirmDel ? " armed" : "")}
              onClick={() => (confirmDel ? run(() => ctx.delFrame(frame.id)) : setConfirmDel(true))}
            >
              {confirmDel ? t("editor.confirmDelete") : <><Trash2 size={16} aria-hidden /> {t("common.delete")}</>}
            </button>
          </>
        )}
      </div>
    </>
  );
}
