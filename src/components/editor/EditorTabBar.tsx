"use client";
// EditorTabBar.tsx — the concept .tabbar: main tab router (Editor / Full Preview)
// + drag-tool mode Seg + view focus bar (QUAD/CAM/TOP/LEFT/RIGHT/ISO) + keyboard
// hint. Uses editor.css classes for dark-studio fidelity. (The old Guide Belajar
// tab was folded into the /panduan cookbook — Ship B slim.)

import React, { useState } from "react";
import { Menu, GraduationCap, Settings, ChevronDown } from "lucide-react";
import { useEditor } from "@/state/EditorState";
import { useApp } from "@/state/AppState";
import { useT } from "@/i18n";
import { Seg } from "./ui/Seg";
import type { DragMode, MainTab, ViewId } from "@/lib/editor/engineApi";

const MAIN_TABS: { key: MainTab; labelKey: string }[] = [
  { key: "editor", labelKey: "editor.tabEditor" },
  { key: "preview", labelKey: "editor.tabFullPreview" },
];

const DRAG_OPTIONS: { value: DragMode; labelKey: string }[] = [
  { value: "nav", labelKey: "editor.dragNav" },
  { value: "subject", labelKey: "editor.dragSubject" },
  { value: "camera", labelKey: "editor.camera" },
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
  const app = useApp();
  const { t } = useT();
  const { ui } = ctx;
  // Mobile only: the DRAG-mode + View bars collapse behind this "Alat" toggle so
  // the tabbar is one row (button hidden on desktop, tools show inline there). When
  // opened on mobile the tools panel splits in-flow below (canvas shrinks while open).
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <div className="tabbar">
      {/* Mobile only (CSS): the app header is hidden on the editor, so the drawer
          trigger lives here — the tabbar IS the top bar (☰ · tabs · Alat). */}
      <button
        type="button"
        className="tabbar-burger"
        onClick={app.toggleSidebar}
        aria-label={t("editor.openMenu")}
        aria-controls="fp-sidebar"
      >
        <Menu size={18} aria-hidden />
      </button>
      <div className="tabs">
        {MAIN_TABS.map((mt) => (
          <button
            key={mt.key}
            className={ui.mainTab === mt.key ? "active" : undefined}
            onClick={() => ctx.setMainTab(mt.key)}
          >
            {t(mt.labelKey)}
          </button>
        ))}
      </div>

      {/* Mobile top-bar actions grouped to the right (desktop: display:contents +
          the help button hidden, so this collapses to just the inline tools). Tur
          replays the onboarding coach-marks. */}
      <div className="tabbar-help">
        <button
          type="button"
          className="tabbar-helpbtn"
          onClick={() => window.dispatchEvent(new Event("cag:start-tour"))}
          aria-label={t("editor.tourAria")}
          title={t("editor.tourTitle")}
        >
          <GraduationCap size={16} aria-hidden />
        </button>
        <button
          type="button"
          className={"tabbar-alat" + (toolsOpen ? " open" : "")}
          aria-expanded={toolsOpen}
          aria-controls="tabbar-tools"
          aria-label={t("editor.toolsAria")}
          title={t("editor.toolsAria")}
          onClick={() => setToolsOpen((v) => !v)}
        >
          <Settings size={16} aria-hidden />
          <ChevronDown size={14} className="tabbar-alat-chev" aria-hidden />
        </button>
      </div>

      <div id="tabbar-tools" className={"tabbar-tools" + (toolsOpen ? " open" : "")}>
        <div className="modebar" data-tour="drag">
          <span className="mlab">DRAG</span>
          <Seg
            options={DRAG_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            value={ui.dragToolMode}
            onChange={ctx.setDragMode}
          />
        </div>

        <div className="viewbar" aria-label={t("editor.selectView")}>
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
      </div>

      <div className="spacer" />
      <span className="hint">{t("editor.tabbarHint")}</span>
    </div>
  );
}
