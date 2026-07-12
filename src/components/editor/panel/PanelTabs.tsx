"use client";
// PanelTabs.tsx — the right-panel sub-tabs (concept .panel-tabs): Kontrol / Prompt.
// Renders ControlPanel for "control"; the "shot" key now hosts ShotPanel = JUST
// the camera prompt + optional brief (the scene/frame outline moved to the left
// OutlineSidebar). Tab key stays "shot" internally; the label reads "Prompt".

import React from "react";
import { useEditor } from "@/state/EditorState";
import { ControlPanel } from "./ControlPanel";
import { ShotPanel } from "./ShotPanel";
import type { EditorUi } from "@/state/EditorState";

const SUB_TABS: { key: EditorUi["panelTab"]; label: string }[] = [
  { key: "control", label: "Kontrol" },
  { key: "shot", label: "Prompt" },
];

export function PanelTabs() {
  const ctx = useEditor();
  const tab = ctx.ui.panelTab;

  return (
    <>
      <div className="panel-tabs">
        {SUB_TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : undefined}
            onClick={() => ctx.setPanelTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "control" ? <ControlPanel /> : null}
      {tab === "shot" ? <ShotPanel /> : null}
    </>
  );
}

export default PanelTabs;
