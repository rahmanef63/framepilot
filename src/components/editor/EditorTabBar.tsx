"use client";
// EditorTabBar.tsx — the concept .tabbar: main tab router (Editor / Full Preview)
// + drag-tool mode Seg + view focus bar (QUAD/CAM/TOP/LEFT/RIGHT/ISO) + keyboard
// hint. Uses editor.css classes for dark-studio fidelity. (The old Guide Belajar
// tab was folded into the /panduan cookbook — Ship B slim.)

import React from "react";
import { useEditor } from "@/state/EditorState";
import { Seg } from "./ui/Seg";
import type { DragMode, MainTab, ViewId } from "./viewport/engineApi";

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: "editor", label: "Editor" },
  { key: "preview", label: "Full Preview" },
];

const DRAG_OPTIONS: { value: DragMode; label: string }[] = [
  { value: "nav", label: "Navigasi" },
  { value: "subject", label: "Subjek" },
  { value: "camera", label: "Kamera" },
];

const VIEWS: { key: ViewId; label: string }[] = [
  { key: "cam", label: "CAM" },
  { key: "top", label: "TOP" },
  { key: "left", label: "LEFT" },
  { key: "right", label: "RIGHT" },
  { key: "iso", label: "ISO" },
];

export function EditorTabBar() {
  const ctx = useEditor();
  const { ui } = ctx;

  return (
    <div className="tabbar">
      <div className="tabs">
        {MAIN_TABS.map((t) => (
          <button
            key={t.key}
            className={ui.mainTab === t.key ? "active" : undefined}
            onClick={() => ctx.setMainTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="modebar" data-tour="drag">
        <span className="mlab">DRAG</span>
        <Seg options={DRAG_OPTIONS} value={ui.dragToolMode} onChange={ctx.setDragMode} />
      </div>

      <div className="viewbar" aria-label="Pilih view">
        <button
          className={ui.focusView === null ? "active" : undefined}
          onClick={() => ctx.setFocusView(null)}
        >
          QUAD
        </button>
        {VIEWS.map((v) => (
          <button
            key={v.key}
            className={ui.focusView === v.key ? "active" : undefined}
            onClick={() => ctx.setFocusView(ui.focusView === v.key ? null : v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="spacer" />
      <span className="hint">
        WASD fly · Q/E turun-naik · Shift cepat · pan klik-kanan · scroll zoom · 1–5 view · Space play · F fokus
      </span>
    </div>
  );
}

export default EditorTabBar;
