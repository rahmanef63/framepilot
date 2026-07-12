"use client";
// CellViewMenu.tsx — per-slot view dropdown for the reconfigurable quad (Goal B).
// Replaces the .vname chip on the top/left/right cells: a <button> trigger (so the
// cell's onDown `closest("button")` guard blocks drag-start) + a popover to pick a
// fixed ortho preset or a saved custom orbit, and to snapshot the current CAMERA
// orbit as a new custom view. cam + iso cells keep the plain .vname label.

import React, { useEffect, useRef, useState } from "react";
import type { SlotId, OrthoId, ViewKind, SavedView } from "./engineApi";
import "./CellViewMenu.css";

const ORTHO_ORDER: OrthoId[] = ["top", "bottom", "left", "right", "front", "back", "iso"];
const ORTHO_LABELS: Record<OrthoId, string> = {
  top: "Atas",
  bottom: "Bawah",
  left: "Kiri",
  right: "Kanan",
  front: "Depan",
  back: "Belakang",
  iso: "Isometrik",
};

function labelOf(kind: ViewKind, savedViews: SavedView[]): string {
  if (typeof kind === "string" && kind.startsWith("custom:")) {
    const v = savedViews.find((s) => "custom:" + s.id === kind);
    return v ? v.name : "View";
  }
  return ORTHO_LABELS[kind as OrthoId] ?? String(kind);
}

export function CellViewMenu({
  slot,
  current,
  savedViews,
  onPick,
  onSaveCurrent,
  onRename,
  onDelete,
}: {
  slot: SlotId;
  current: ViewKind;
  savedViews: SavedView[];
  onPick: (kind: ViewKind) => void;
  onSaveCurrent: (name: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);

  // Isolate the open popover from the cell's native pointer/wheel handlers so
  // clicking/scrolling the menu never starts a drag or zooms the 3D view.
  useEffect(() => {
    const el = popRef.current;
    if (!el || !open) return;
    const stop = (e: Event) => e.stopPropagation();
    el.addEventListener("pointerdown", stop);
    el.addEventListener("wheel", stop, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", stop);
      el.removeEventListener("wheel", stop);
    };
  }, [open]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setAdding(false);
    setEditId(null);
    setText("");
  }

  function pick(kind: ViewKind) {
    onPick(kind);
    close();
  }

  function commitText() {
    const name = text.trim();
    if (!name) return;
    if (editId && onRename) onRename(editId, name);
    else if (adding) onSaveCurrent(name);
    close();
  }

  return (
    <div className="cell-viewmenu" ref={rootRef}>
      <button
        className="cvm-trigger"
        title="Ganti tampilan sel"
        onClick={() => (open ? close() : setOpen(true))}
      >
        {labelOf(current, savedViews)}
        <span className="cvm-chev">▾</span>
      </button>

      {open ? (
        <div className="cvm-pop" ref={popRef}>
          <div className="cvm-label">Standar</div>
          {ORTHO_ORDER.map((k) => (
            <button
              key={k}
              className="cvm-item"
              data-active={current === k}
              onClick={() => pick(k)}
            >
              <span className="cvm-name">{ORTHO_LABELS[k]}</span>
            </button>
          ))}

          {savedViews.length ? <div className="cvm-label">View custom</div> : null}
          {savedViews.map((v) =>
            editId === v.id ? (
              <div className="cvm-add" key={v.id}>
                <input
                  autoFocus
                  value={text}
                  placeholder="Nama view"
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitText();
                  }}
                />
                <button className="cvm-icon" title="Simpan" onClick={commitText}>
                  ✓
                </button>
              </div>
            ) : (
              <div className="cvm-item" data-active={current === `custom:${v.id}`} key={v.id}>
                <span
                  className="cvm-name"
                  role="button"
                  onClick={() => pick(`custom:${v.id}` as ViewKind)}
                >
                  {v.name}
                </span>
                {onRename ? (
                  <button
                    className="cvm-icon"
                    title="Ubah nama"
                    onClick={() => {
                      setEditId(v.id);
                      setAdding(false);
                      setText(v.name);
                    }}
                  >
                    ✎
                  </button>
                ) : null}
                {onDelete ? (
                  <button className="cvm-icon" title="Hapus view" onClick={() => onDelete(v.id)}>
                    ✕
                  </button>
                ) : null}
              </div>
            )
          )}

          <div className="cvm-sep" />
          {adding ? (
            <div className="cvm-add">
              <input
                autoFocus
                value={text}
                placeholder="Nama view baru"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitText();
                }}
              />
              <button className="cvm-icon" title="Simpan" onClick={commitText}>
                ✓
              </button>
            </div>
          ) : (
            <button
              className="cvm-item"
              onClick={() => {
                setAdding(true);
                setEditId(null);
                setText("");
              }}
            >
              <span className="cvm-name">＋ Simpan view saat ini…</span>
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default CellViewMenu;
