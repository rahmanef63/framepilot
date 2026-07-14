"use client";
// CamPresetMenu.tsx — the camera-BRAND picker chip on the CAM viewport cell, the
// direct-from-preview equivalent of the ortho cells' view dropdown (CellViewMenu):
// a .cvm-trigger button + popover, with the same pointer/wheel isolation so opening
// it never starts a canvas drag or zoom. Sets the per-frame camera, or the PROJECT
// camera when the global-camera toggle is on. Reuses CellViewMenu.css.

import React, { useEffect, useRef, useState } from "react";
import { useEditor } from "@/state/EditorState";
import { CAMERAS, cameraById } from "@/lib/cameras";
import "./CellViewMenu.css";

export function CamPresetMenu() {
  const ctx = useEditor();
  const settings = ctx.project.settings;
  const current = ctx.currentFrame();
  const global = settings.globalCamera;
  const value = global ? settings.camera : current?.camera ?? "";
  const disabled = !global && !current;
  const label = value ? cameraById(value)?.label ?? "Kamera" : "Kamera";

  const [open, setOpen] = useState(false);
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

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (id: string) => {
    if (global) ctx.setProjectCamera(id);
    else if (current) ctx.setFrameCamera(current.id, id);
    setOpen(false);
  };

  return (
    <div className="cell-viewmenu" ref={rootRef}>
      <button
        className="cvm-trigger"
        title={global ? "Kamera global — berlaku ke semua frame" : "Pilih kamera brand untuk frame ini"}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        ◉ {label}
        <span className="cvm-chev">▾</span>
      </button>

      {open ? (
        <div className="cvm-pop" ref={popRef}>
          <div className="cvm-label">{global ? "Kamera global (semua frame)" : "Kamera frame ini"}</div>
          {CAMERAS.map((c) => (
            <button key={c.id} className="cvm-item" data-active={value === c.id} onClick={() => pick(c.id)}>
              <span className="cvm-name">{c.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default CamPresetMenu;
