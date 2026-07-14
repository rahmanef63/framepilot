"use client";
// MobileFrameMenu — the long-press context menu for a frame thumbnail (mobile). A
// fixed popover anchored under the held tile: rename (inline), duplicate, move
// left/right, delete (2-tap confirm). Tap the transparent scrim to dismiss. Reuses
// the editor context's existing frame CRUD actions.

import React, { useState } from "react";
import { useEditor } from "@/state/EditorState";
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
      <div className="mfs-menu" style={{ top, left }} role="menu" aria-label={`Aksi frame ${frame.name}`}>
        {renaming ? (
          <form
            className="mfs-menu-rename"
            onSubmit={(e) => {
              e.preventDefault();
              ctx.renameFrame(frame.id, name.trim() || frame.name);
              onClose();
            }}
          >
            <input autoFocus value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-label="Nama frame" />
            <button type="submit">Simpan</button>
          </form>
        ) : (
          <>
            <div className="mfs-menu-head">#{index + 1} · {frame.name}</div>
            <button role="menuitem" onClick={() => run(() => ctx.updateFrameById(frame.id))}>
              ⟳ Perbarui (kamera kini)
            </button>
            <button role="menuitem" onClick={() => setRenaming(true)}>✎ Ganti nama</button>
            <button role="menuitem" onClick={() => run(() => ctx.dupFrame(frame.id))}>⧉ Duplikat</button>
            <button role="menuitem" disabled={index === 0} onClick={() => run(() => ctx.moveFrame(frame.id, -1))}>
              ← Geser kiri
            </button>
            <button role="menuitem" disabled={index === total - 1} onClick={() => run(() => ctx.moveFrame(frame.id, 1))}>
              Geser kanan →
            </button>
            <button
              role="menuitem"
              className={"mfs-menu-del" + (confirmDel ? " armed" : "")}
              onClick={() => (confirmDel ? run(() => ctx.delFrame(frame.id)) : setConfirmDel(true))}
            >
              {confirmDel ? "Yakin hapus?" : "🗑 Hapus"}
            </button>
          </>
        )}
      </div>
    </>
  );
}
