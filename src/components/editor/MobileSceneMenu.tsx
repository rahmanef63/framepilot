"use client";
// MobileSceneMenu — the long-press context menu for a scene tile (mobile). A
// fixed popover anchored under the held tile: rename (inline), duplicate, move
// left/right, delete (2-tap confirm). Tap the transparent scrim to dismiss. Reuses
// the editor context's existing scene CRUD actions. Mirrors <MobileFrameMenu/> but
// without the frame-only "Perbarui kamera" row.

import React, { useState } from "react";
import { Pencil, Copy, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useEditor } from "@/state/EditorState";
import type { EditorScene } from "@/lib/editorModel";

export function MobileSceneMenu({
  scene,
  index,
  total,
  rect,
  onClose,
}: {
  scene: EditorScene;
  index: number;
  total: number;
  rect: DOMRect;
  onClose: () => void;
}) {
  const ctx = useEditor();
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(scene.name);
  const [confirmDel, setConfirmDel] = useState(false);

  // anchor below the tile, clamped so the full menu never runs off the bottom and
  // clips the last action.
  const top = Math.min(rect.bottom + 6, window.innerHeight - 260);
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 184));
  const run = (fn: () => void) => {
    fn();
    onClose();
  };

  return (
    <>
      <div className="mfs-menu-scrim" onClick={onClose} aria-hidden />
      <div className="mfs-menu" style={{ top, left }} role="menu" aria-label={`Aksi scene ${scene.name}`}>
        {renaming ? (
          <form
            className="mfs-menu-rename"
            onSubmit={(e) => {
              e.preventDefault();
              ctx.renameScene(scene.id, name.trim() || scene.name);
              onClose();
            }}
          >
            <input autoFocus value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-label="Nama scene" />
            <button type="submit">Simpan</button>
          </form>
        ) : (
          <>
            <div className="mfs-menu-head">{scene.name} · {scene.frames.length} frame</div>
            <button role="menuitem" onClick={() => setRenaming(true)}><Pencil size={16} aria-hidden /> Ganti nama</button>
            <button role="menuitem" onClick={() => run(() => ctx.dupScene(scene.id))}><Copy size={16} aria-hidden /> Duplikat</button>
            <button role="menuitem" disabled={index === 0} onClick={() => run(() => ctx.moveScene(scene.id, -1))}>
              <ChevronLeft size={16} aria-hidden /> Geser kiri
            </button>
            <button role="menuitem" disabled={index === total - 1} onClick={() => run(() => ctx.moveScene(scene.id, 1))}>
              Geser kanan <ChevronRight size={16} aria-hidden />
            </button>
            <button
              role="menuitem"
              className={"mfs-menu-del" + (confirmDel ? " armed" : "")}
              onClick={() => (confirmDel ? run(() => ctx.delScene(scene.id)) : setConfirmDel(true))}
            >
              {confirmDel ? "Yakin hapus?" : <><Trash2 size={16} aria-hidden /> Hapus</>}
            </button>
          </>
        )}
      </div>
    </>
  );
}
